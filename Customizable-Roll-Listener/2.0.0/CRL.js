/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Customizable Roll Listener
 * Script: CRL.js
 * Version: 2.0.0
 * Built: 2026-10-29T22:04:48.494Z
 */
const CustomizableRollListenerMod = (() => {
  'use strict';

  /**
   * Returns true when a value is a plain non-null, non-array object.
   *
   * @param {*} value Value to test.
   * @returns {boolean} True when the value is a record.
   */
  function isRecord(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Converts a value to trimmed text, treating null and undefined as empty.
   *
   * @param {*} value Value to convert.
   * @returns {string} Trimmed string.
   */
  function toText(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  /**
   * Escapes text for an HTML attribute, such as a button's command. Roll20
   * syntax is left alone so ?{queries} in buttons still work.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeAttr(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  /**
   * Escapes text for display. Roll20 syntax characters are encoded too:
   * sendChat resolves @{...} and %{...} and rolls [[...]] even in a mod's
   * whispers, and drops the whole message when a reference cannot be found.
   *
   * @param {*} text Text to escape.
   * @returns {string} Escaped text.
   */
  function escapeHtml(text) {
    return escapeAttr(text)
      .replaceAll('@', '&#64;')
      .replaceAll('%', '&#37;')
      .replaceAll('[', '&#91;')
      .replaceAll(']', '&#93;')
      .replaceAll('{', '&#123;')
      .replaceAll('}', '&#125;');
  }

  /**
   * Escapes text for use inside a regular expression.
   *
   * @param {string} text Literal text.
   * @returns {string} Escaped pattern.
   */
  function escapeRegExp(text) {
    return String(text).replaceAll(/[\\^$.*+?()[\]{}|]/g, '\\$&');
  }

  /**
   * Decodes the handful of HTML entities Roll20 puts into chat content.
   *
   * @param {string} text Text with entities.
   * @returns {string} Decoded text.
   */
  function decodeEntities(text) {
    return String(text)
      .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      .replaceAll(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
      .replaceAll('&quot;', '"')
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&nbsp;', ' ')
      .replaceAll('&amp;', '&');
  }

  /**
   * Parses a whole number, rejecting anything that is not entirely digits
   * (with an optional leading minus sign).
   *
   * @param {*} raw Raw input.
   * @returns {number|null} Parsed integer, or null when invalid.
   */
  function parseStrictInt(raw) {
    const text = toText(raw);
    return /^-?\d+$/.test(text) ? Number(text) : null;
  }

  /**
   * Parses a yes/no style value.
   *
   * @param {*} raw Raw input.
   * @returns {boolean|null} Parsed boolean, or null when not recognised.
   */
  function parseBoolean(raw) {
    if (typeof raw === 'boolean') {
      return raw;
    }
    const text = toText(raw).toLowerCase();
    if (['on', 'true', 'yes', '1', 'regex'].includes(text)) {
      return true;
    }
    if (['off', 'false', 'no', '0', 'plain', 'text'].includes(text)) {
      return false;
    }
    return null;
  }

  /**
   * Splits a list typed by the GM on commas or whitespace, dropping blanks
   * and duplicates.
   *
   * @param {*} raw Raw input.
   * @param {RegExp} [separator] Separator pattern.
   * @returns {string[]} Items.
   */
  function splitList(raw, separator = /[\s,]+/) {
    return [
      ...new Set(
        toText(raw)
          .split(separator)
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];
  }

  /**
   * Returns the IDs of every GM in the game.
   *
   * @returns {string[]} GM player IDs.
   */
  function getGmPlayerIds() {
    return findObjs({ _type: 'player' })
      .filter((player) => playerIsGM(player.id))
      .map((player) => player.id);
  }

  /**
   * Removes the " (GM)" suffix Roll20 adds to the speaker name of GM messages.
   *
   * @param {*} who Speaker name.
   * @returns {string} Name without the suffix.
   */
  function stripGmSuffix(who) {
    return toText(who).replace(/\s*\(GM\)$/, '');
  }

  // Reads the roll cards Beacon sheets (such as D&D 2024) post to chat. They
  // arrive as 'advancedroll' messages whose content is HTML inside a
  // <rolltemplate class="..."> element, with no inline rolls and no roll
  // template name, so the rolls are read from the HTML itself. Pure functions
  // only.

  /**
   * Returns the text inside the first element carrying a class.
   *
   * @param {string} html HTML.
   * @param {string} className Class name.
   * @returns {string} Text, or an empty string.
   */
  function textOfClass(html, className) {
    const pattern = new RegExp(
      `<([a-z0-9]+)[^>]*class="[^"]*\\b${className}\\b[^"]*"[^>]*>([\\s\\S]*?)</\\1>`,
      'i'
    );
    const match = pattern.exec(html);
    return match ? cleanText(match[2]) : '';
  }

  /**
   * Strips tags and collapses whitespace.
   *
   * @param {string} html HTML fragment.
   * @returns {string} Text.
   */
  function cleanText(html) {
    return decodeEntities(String(html).replaceAll(/<[^>]*>/g, ' '))
      .replaceAll(/\s+/g, ' ')
      .trim();
  }

  /**
   * Returns the single die a formula rolls and keeps, such as 1d20, d20 or
   * 2d20kh1, or null when it rolls several (2d6) or none.
   *
   * @param {string} formula Roll formula.
   * @returns {number|null} Die size.
   */
  function singleDie(formula) {
    const terms = [...String(formula).matchAll(/(\d*)d(\d+)(k[hl]?(\d+))?/gi)];
    if (terms.length !== 1) {
      return null;
    }
    const [, count, sides, keep, kept] = terms[0];
    const rolled = Number(count || 1);
    return (keep ? Number(kept || 1) : rolled) === 1 ? Number(sides) : null;
  }

  /**
   * Returns true when content is a Beacon roll card.
   *
   * @param {string} content Message content.
   * @returns {boolean} True for <rolltemplate class="..."> HTML.
   */
  function isBeaconCard(content) {
    return /<rolltemplate\s[^>]*class="/i.test(String(content));
  }

  /**
   * Reads a Beacon roll card.
   *
   * @param {string} content Message content.
   * @returns {{template: string, character: string, fields: object, rolls: object[]}}
   *          What the card shows.
   */
  function parseBeaconCard(content) {
    const html = String(content);
    const classes = toText(/<rolltemplate\s[^>]*class="([^"]*)"/i.exec(html)?.[1]).split(/\s+/);
    const fields = {};
    const title = textOfClass(html, 'header__title');
    if (title) {
      fields.title = title;
    }
    const subcategory = /data-rollsubcategory="([^"]*)"/i.exec(html)?.[1];
    if (subcategory) {
      fields.subcategory = decodeEntities(subcategory).trim();
    }
    const mode = /result__mode-indicator--([A-Za-z]+)/.exec(html)?.[1];
    if (mode) {
      fields.mode = mode;
    }

    // The card's headline result (the total, including bonuses).
    const headline = /die__total--preferred[^>]*data-result="(-?\d+)"/.exec(html);
    const rolls = [];
    for (const block of html.split(/<div class="rt-formula"/i).slice(1)) {
      const expression = textOfClass(block, 'rt-formula__raw');
      const values = [
        ...block.matchAll(/class="rt-formula__evaluated-string[^"]*"([^>]*)>([\s\S]*?)<\/span>/gi),
      ];
      for (const [, attrs, inner] of values) {
        const name = /data-rollname="([^"]*)"/i.exec(attrs)?.[1] || '';
        const value = Number(cleanText(inner));
        if (!Number.isFinite(value)) {
          continue;
        }
        const sides = singleDie(expression);
        const isBase = name.toLowerCase() === 'base';
        const total = isBase && headline ? Number(headline[1]) : value;
        if (name) {
          fields[name.toLowerCase()] = String(total);
        }
        rolls.push({
          index: rolls.length,
          expression,
          total,
          dice: sides
            ? [{ sides, value, crit: value === sides, fumble: value === 1, success: null }]
            : [],
          tableItems: [],
          hasTarget: false,
          name,
        });
      }
    }
    return {
      template: classes[0] || '',
      character: textOfClass(html, 'meta__character-name'),
      fields,
      rolls,
    };
  }

  // Turns a Roll20 chat message into a plain description of what it contains:
  // who sent it, its roll template and fields, its text, and every roll with
  // its dice. Pure functions only, so the matcher and tests need no Roll20.

  // Marker Roll20 leaves in message content where each inline roll was.
  const INLINE_MARKER = /\$\[\[(\d+)\]\]/g;

  // Roll message types whose content is a JSON description of a /roll.
  const ROLL_RESULT_TYPES = new Set([
    'rollresult',
    'gmrollresult',
    'secretrollresult',
    'supersecretrollresult',
  ]);

  // Message properties every chat message may carry; anything else is shown
  // by the inspector as extra data.
  const STANDARD_KEYS = new Set([
    'who',
    'playerid',
    'type',
    'content',
    'origRoll',
    'inlinerolls',
    'rolltemplate',
    'target',
    'target_name',
    'selected',
    'avatar',
  ]);

  // Template fields that hold the rolling character's name on common sheets.
  const CHARACTER_FIELDS = ['charname', 'character_name', 'character', 'actor'];

  /**
   * Compares two numbers with a Roll20 comparison operator.
   *
   * @param {number} value Value to test.
   * @param {string} comp Operator ('>=', '<=', '==', '=', '>', '<').
   * @param {number} point Value to compare against.
   * @returns {boolean} Result.
   */
  function compare(value, comp, point) {
    switch (comp) {
      case '>=':
        return value >= point;
      case '<=':
        return value <= point;
      case '>':
        return value > point;
      case '<':
        return value < point;
      case '=':
      case '==':
        return value === point;
      default:
        return false;
    }
  }

  /**
   * Returns true when a value meets any of Roll20's custom crit/fumble ranges.
   *
   * @param {number} value Die value.
   * @param {*} ranges Roll20 ranges ([{comp, point}]).
   * @returns {boolean} True when it meets one.
   */
  function meetsAny(value, ranges) {
    return Array.isArray(ranges) && ranges.some((r) => compare(value, r?.comp, Number(r?.point)));
  }

  /**
   * Collects the dice and table results of one roll part, recursing into groups.
   *
   * @param {object} part Roll20 roll part (type R, G, M, C or L).
   * @param {object} out Accumulator: {dice, tableItems, targets}.
   * @returns {void}
   */
  function collectPart(part, out) {
    if (!isRecord(part)) {
      return;
    }
    if (part.type === 'G' && Array.isArray(part.rolls)) {
      for (const group of part.rolls) {
        for (const inner of Array.isArray(group) ? group : [group]) {
          collectPart(inner, out);
        }
      }
      return;
    }
    if (part.type !== 'R' || !Array.isArray(part.results)) {
      return;
    }
    const mods = isRecord(part.mods) ? part.mods : {};
    if (part.table) {
      for (const result of part.results) {
        const name = toText(result?.tableItem?.name);
        if (name && !result.d) {
          out.tableItems.push(name);
        }
      }
      return;
    }
    const sides = Number(part.sides);
    // Fate dice and other non-numeric dice have no crit or fumble face.
    const numeric = Number.isFinite(sides) && sides > 1 && !part.fate;
    const success = isRecord(mods.success) ? mods.success : null;
    if (success) {
      out.targets.push({ comp: success.comp, point: Number(success.point) });
    }
    for (const result of part.results) {
      // Dropped (kh/kl, d) and rerolled dice no longer count.
      if (!isRecord(result) || result.d || result.r) {
        continue;
      }
      const value = Number(result.v);
      if (!Number.isFinite(value)) {
        continue;
      }
      out.dice.push({
        sides: numeric ? sides : null,
        value,
        // Beacon rolls mark crits and fumbles themselves.
        crit:
          typeof result.isCrit === 'boolean'
            ? result.isCrit
            : numeric
              ? mods.customCrit
                ? meetsAny(value, mods.customCrit)
                : value === sides
              : false,
        fumble:
          typeof result.isFumble === 'boolean'
            ? result.isFumble
            : numeric
              ? mods.customFumble
                ? meetsAny(value, mods.customFumble)
                : value === 1
              : false,
        success: success ? compare(value, success.comp, Number(success.point)) : null,
      });
    }
  }

  /**
   * Describes one Roll20 roll result object.
   *
   * @param {number} index Inline roll index (0 for /roll messages).
   * @param {string} expression Roll expression as typed.
   * @param {object} results Roll20 results object ({total, rolls}).
   * @returns {object} Roll description.
   */
  function describeRoll(index, expression, results) {
    const out = { dice: [], tableItems: [], targets: [] };
    for (const part of Array.isArray(results?.rolls) ? results.rolls : []) {
      collectPart(part, out);
    }
    const total = Number(results?.total);
    return {
      index,
      expression: toText(expression),
      total: Number.isFinite(total) ? total : null,
      dice: out.dice,
      tableItems: out.tableItems,
      hasTarget: out.targets.length > 0,
    };
  }

  /**
   * Parses the {{key=value}} fields of a roll template message.
   *
   * @param {string} content Message content.
   * @returns {object} Fields keyed by lower-case name.
   */
  function parseTemplateFields(content) {
    const fields = {};
    for (const match of String(content).matchAll(/\{\{\s*([^=}]+?)\s*(?:=([\s\S]*?))?\}\}/g)) {
      const key = match[1].toLowerCase();
      if (!(key in fields)) {
        fields[key] = toText(match[2]);
      }
    }
    return fields;
  }

  /**
   * Replaces inline roll markers with each roll's visible result: table item
   * names for table rolls, otherwise the total.
   *
   * @param {string} text Text with $[[n]] markers.
   * @param {object[]} rolls Roll descriptions.
   * @returns {string} Text with results.
   */
  function expandMarkers(text, rolls) {
    return String(text).replaceAll(INLINE_MARKER, (marker, index) => {
      const roll = rolls.find((r) => r.index === Number(index));
      if (!roll) {
        return marker;
      }
      if (roll.tableItems.length > 0) {
        return roll.tableItems.join(', ');
      }
      return roll.total === null ? marker : String(roll.total);
    });
  }

  /**
   * Converts message HTML to searchable plain text.
   *
   * @param {string} text Content.
   * @returns {string} Plain text.
   */
  function toPlainText(text) {
    return decodeEntities(
      String(text)
        .replaceAll(/<br\s*\/?>/gi, '\n')
        .replaceAll(/<[^>]*>/g, ' ')
    )
      .replaceAll(/[ \t]*\n\s*/g, '\n')
      .replaceAll(/[ \t]+/g, ' ')
      .trim();
  }

  /**
   * Describes a chat message.
   *
   * @param {object} msg Roll20 chat message.
   * @param {object} [extra] Facts only Roll20 can supply.
   * @param {string} [extra.playerName] Display name of the sending player.
   * @returns {object} Message description.
   */
  function analyseMessage(msg, extra = {}) {
    const type = toText(msg?.type);
    const content = typeof msg?.content === 'string' ? msg.content : '';
    let rolls = [];
    let raw = content;

    if (ROLL_RESULT_TYPES.has(type)) {
      let parsed = null;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = null;
      }
      if (isRecord(parsed)) {
        rolls = [describeRoll(0, msg.origRoll, parsed)];
        raw = `${toText(msg.origRoll)} = $[[0]]`;
      }
    } else if (Array.isArray(msg?.inlinerolls)) {
      rolls = msg.inlinerolls.map((roll, index) =>
        describeRoll(index, roll?.expression, roll?.results)
      );
    }

    let template = toText(msg?.rolltemplate);
    let fields = template ? parseTemplateFields(content) : {};
    const who = stripGmSuffix(msg?.who);
    const characterField = CHARACTER_FIELDS.map((key) => fields[key]).find(Boolean);
    let character = characterField ? toPlainText(expandMarkers(characterField, rolls)) : who;

    // Beacon sheets send their dice as msg.rolls, keyed by roll name.
    if (rolls.length === 0 && isRecord(msg?.rolls)) {
      rolls = Object.values(msg.rolls)
        .filter(isRecord)
        .map((roll, index) => ({
          ...describeRoll(index, roll.expression, roll.results),
          name: toText(roll.rollName),
        }));
    }
    // Beacon sheets say what was rolled, e.g. {action: 'repeating_attack', args: [id, 'attack', 'dmg']}.
    if (isRecord(msg?.action)) {
      fields.action = toText(msg.action.action);
      if (Array.isArray(msg.action.args)) {
        fields.args = msg.action.args.map(toText).join(' ');
      }
    }
    if (isBeaconCard(content)) {
      const card = parseBeaconCard(content);
      template = template || card.template;
      fields = { ...card.fields, ...fields };
      character = card.character || character;
      if (rolls.length === 0) {
        rolls = card.rolls;
      } else {
        // The card's headline result includes the sheet's bonuses; the Base
        // roll's own total is only the dice.
        const base = card.rolls.find((r) => r.name.toLowerCase() === 'base');
        for (const roll of rolls) {
          if (base && roll.name.toLowerCase() === 'base') {
            roll.total = base.total;
          }
        }
      }
    }

    return {
      type,
      who,
      playerId: toText(msg?.playerid),
      playerName: toText(extra.playerName),
      characterId: toText(msg?.characterId || msg?.rolledByCharacterId),
      character,
      template,
      fields,
      // Content with $[[n]] markers, used to find which rolls a text matched.
      raw,
      // Readable text: markers replaced by results, HTML removed.
      text: toPlainText(expandMarkers(raw, rolls)),
      rolls,
      // Every property Roll20 sent, so the inspector can show unexpected ones.
      keys: Object.keys(msg || {}).sort(),
      // Properties beyond the classic ones (Beacon sends rolls, action, …), for the inspector.
      extras: Object.fromEntries(
        Object.entries(msg || {}).filter(([key]) => !STANDARD_KEYS.has(key))
      ),
    };
  }

  // Build-time placeholders replaced by rollup.config.js inject-build-metadata plugin.
  const SCRIPT_NAME = 'Customizable Roll Listener';
  const SCRIPT_VERSION = '2.0.0';
  const SCRIPT_LAST_UPDATED = '2026-10-29T22:04:48.494Z';

  const DEFAULT_LOCALE$1 = 'en-US';

  const STATE_KEY = 'CRL';
  const SCHEMA_VERSION = 2;
  const COMMAND = '!crl';

  // Name listener commands are sent as when they are not sent as the roller.
  // Version 1 used the same name, so existing macros and filters still see it.
  const CRL_SPEAKER = 'CRL';

  // The character whose abilities hold each listener's commands. Version 1
  // created it with this name, so existing games keep the same character.
  const STORE_CHARACTER_NAME = 'Customizable Roll Listener';

  const HANDOUT_HELP_NAME = 'Customizable Roll Listener - Help';
  const HANDOUT_DECK_NAME = 'Customizable Roll Listener - Command Deck';

  const AUTHOR_LINKS = {
    original: {
      name: 'Scott C.',
      profile: 'https://app.roll20.net/users/459831',
      wiki: 'https://wiki.roll20.net/CRL',
    },
    maintainer: {
      name: 'MidNiteShadow7',
      profile: 'https://app.roll20.net/users/16506286/midniteshadow7',
      github: 'https://github.com/steverobertsuk',
    },
  };

  // Where to read about roll templates and find a sheet's template names.
  const TEMPLATE_LINKS = {
    builtIn: 'https://help.roll20.net/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates',
    dnd5e2014: 'https://help.roll20.net/hc/en-us/articles/360037257834-D-D-5e-OGL-Roll-Templates',
    sheets: 'https://github.com/Roll20/roll20-character-sheets',
  };

  // Template names of common sheets, shown in the Help handout.
  const COMMON_TEMPLATES = [
    { sheet: 'Any game (built in)', names: 'default' },
    {
      sheet: 'D&D 5E by Roll20 (2014)',
      names: 'simple, atk, dmg, atkdmg, spell, desc, npcaction, npcfullatk, npcatk, npcdmg',
    },
    { sheet: 'D&D 2024 by Roll20 (Beacon)', names: 'dnd-2024' },
  ];

  // Marks a v2 listener's rules when they are mirrored into its ability description.
  const RULES_MARKER = 'crl';

  // Other names accepted for roll results, including the ones version 1 used.
  const RESULT_ALIASES = {
    crit: 'crit',
    critical: 'crit',
    criticals: 'crit',
    fumble: 'fumble',
    fumbles: 'fumble',
    success: 'success',
    successes: 'success',
    fail: 'fail',
    failure: 'fail',
    failures: 'fail',
  };

  // Chat message types. Listeners ignore 'api' messages unless they ask for them.
  // Beacon sheets (such as D&D 2024) post their rolls as 'advancedroll'.
  const MESSAGE_TYPES = [
    'general',
    'rollresult',
    'gmrollresult',
    'emote',
    'whisper',
    'desc',
    'advancedroll',
    'api',
  ];

  // Template value that matches messages without a roll template.
  const TEMPLATE_NONE = 'none';

  const SPEAKER_OPTIONS = ['crl', 'roller'];
  const LISTENER_SPEAKER_OPTIONS = ['default', 'crl', 'roller'];

  // Default configuration for new installs.
  const DEFAULT_CONFIG = {
    language: DEFAULT_LOCALE$1,
    enabled: true,
    speaker: 'crl',
    listenToMods: true,
  };

  // A new listener matches everything until filters are added.
  const DEFAULT_LISTENER = {
    name: '',
    enabled: true,
    templates: [],
    types: [],
    text: [],
    regex: false,
    who: [],
    players: [],
    results: [],
    total: '',
    natural: '',
    dice: 'auto',
    cooldown: 0,
    stop: false,
    speaker: 'default',
  };

  // Limits on what a listener may hold.
  const MAX_NAME_LENGTH = 60;
  const MAX_COOLDOWN_SECONDS = 3600;
  const MAX_TEXT_TERMS = 20;
  const MAX_LIST_ITEMS = 50;

  // Loop protection: a listener that fires this many times within the window
  // is switched off, because it is almost certainly triggering itself.
  const LOOP_LIMIT = 20;
  const LOOP_WINDOW_MS = 10000;

  // The inspector shows at most this many characters of a message's content.
  const INSPECT_CONTENT_LIMIT = 3000;

  // Colour palette for chat cards and handouts.
  const COLOR_HEADER_BG = '#1a1f36';
  const COLOR_HEADER_TEXT = '#e6e9f5';
  const COLOR_CARD_BG_TOP = '#252c4c';
  const COLOR_CARD_BG_BOTTOM = '#161b30';
  const COLOR_BORDER = '#3b4675';
  const COLOR_TEXT = '#e3e6f2';
  const COLOR_MUTED = '#9aa3c2';
  const COLOR_ACCENT = '#f2b134';
  const COLOR_BUTTON_BG = '#2f6fd6';
  const COLOR_BUTTON_TEXT = '#ffffff';
  const COLOR_BUTTON_DARK_BG = '#2a3255';
  const COLOR_BUTTON_DARK_BORDER = '#4a5688';
  const COLOR_OK = '#7bd389';
  const COLOR_OFF = '#e07a7a';
  const COLOR_WARNING_BG = '#fef3c7';
  const COLOR_WARNING_BORDER = '#92400e';
  const COLOR_WARNING_TEXT = '#92400e';
  const COLOR_ERROR_BG = '#fee2e2';
  const COLOR_ERROR_BORDER = '#991b1b';
  const COLOR_ERROR_TEXT = '#991b1b';

  const CHAT_CARD_STYLE = [
    'width:100%',
    'border-radius:4px',
    'box-shadow:1px 1px 3px rgba(0,0,0,0.4)',
    'text-align:left',
    'margin:2px auto',
    `border:1px solid ${COLOR_BORDER}`,
    `color:${COLOR_TEXT}`,
    `background-image:-webkit-linear-gradient(135deg,${COLOR_CARD_BG_TOP} 0%,${COLOR_CARD_BG_BOTTOM} 100%)`,
    `background-color:${COLOR_CARD_BG_BOTTOM}`,
    'overflow:hidden',
  ].join(';');

  const CHAT_HEADER_STYLE = [
    `background:${COLOR_HEADER_BG}`,
    `color:${COLOR_HEADER_TEXT}`,
    'padding:4px 8px',
    `border-bottom:2px solid ${COLOR_ACCENT}`,
    'font-variant:small-caps',
    'font-weight:bold',
    'font-size:1.05em',
    'text-align:center',
    'letter-spacing:0.05em',
  ].join(';');

  const CHAT_CONTENT_STYLE = 'padding:5px 8px;line-height:1.5';

  const BUTTON_STYLE = [
    `background:${COLOR_BUTTON_BG}`,
    `color:${COLOR_BUTTON_TEXT}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const BUTTON_SECONDARY_STYLE = [
    `background:${COLOR_BUTTON_DARK_BG}`,
    `color:${COLOR_TEXT}`,
    `border:1px solid ${COLOR_BUTTON_DARK_BORDER}`,
    'padding:2px 7px',
    'border-radius:3px',
    'text-decoration:none',
    'font-size:0.9em',
    'display:inline-block',
    'margin:1px 2px',
  ].join(';');

  const SECTION_LABEL_STYLE = [
    `color:${COLOR_MUTED}`,
    'font-size:0.8em',
    'text-transform:uppercase',
    'letter-spacing:0.08em',
    'margin-top:4px',
    'margin-bottom:2px',
  ].join(';');

  const DIVIDER_STYLE = `border:none;border-top:1px solid ${COLOR_BORDER};margin:4px 0`;

  /**
   * Returns the whisper target for a player, falling back to all GMs.
   *
   * Double quotes are stripped so the name is safe inside /w "name".
   *
   * @param {string} [playerId] Roll20 player ID.
   * @returns {string} Whisper target text.
   */
  function whisperTarget(playerId) {
    const player = playerId ? getObj('player', playerId) : null;
    if (!player) {
      return 'gm';
    }
    return `"${String(player.get('displayname') || playerId).replaceAll('"', '')}"`;
  }

  /**
   * Keeps chat HTML on one line. Roll20 only whispers the first line of a
   * message and posts the rest publicly, so a stray line break would leak
   * the end of a GM card to the players.
   *
   * @param {string} html Chat HTML.
   * @returns {string} The same HTML without line breaks.
   */
  function oneLine(html) {
    return String(html).replaceAll(/\r?\n/g, ' ');
  }

  /**
   * Sends a styled card whispered to a player, or to every GM when no player is given.
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @returns {void}
   */
  function whisper(playerId, title, content) {
    const body = Array.isArray(content) ? content.join('') : content;
    sendChat(
      SCRIPT_NAME,
      `/w ${whisperTarget(playerId)} ${oneLine(buildCard(title, body))}`,
      null,
      {
        noarchive: true,
      }
    );
  }

  /**
   * Sends a warning whispered to a player (or every GM).
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} message Warning text.
   * @returns {void}
   */
  function whisperWarning(playerId, message) {
    const style = [
      `background:${COLOR_WARNING_BG}`,
      `color:${COLOR_WARNING_TEXT}`,
      `border:1px solid ${COLOR_WARNING_BORDER}`,
      'padding:4px 8px',
      'border-radius:4px',
      'font-size:0.95em',
    ].join(';');
    const html = `<div style="${style}">${escapeHtml(message)}</div>`;
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${oneLine(html)}`, null, {
      noarchive: true,
    });
  }

  /**
   * Sends an error whispered to a player (or every GM).
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} message What went wrong.
   * @param {string} [hint] How to fix it.
   * @returns {void}
   */
  function whisperError(playerId, message, hint) {
    const style = [
      `background:${COLOR_ERROR_BG}`,
      `color:${COLOR_ERROR_TEXT}`,
      `border:1px solid ${COLOR_ERROR_BORDER}`,
      'padding:4px 8px',
      'border-radius:4px',
      'font-size:0.95em',
    ].join(';');
    const hintHtml = hint
      ? `<div style="margin-top:3px;font-size:0.9em">${escapeHtml(hint)}</div>`
      : '';
    const html = `<div style="${style}"><strong>${escapeHtml(message)}</strong>${hintHtml}</div>`;
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${oneLine(html)}`, null, {
      noarchive: true,
    });
  }

  /**
   * Builds a styled chat card.
   *
   * @param {string} title Header text (escaped).
   * @param {string} body Body HTML (trusted).
   * @returns {string} HTML string.
   */
  function buildCard(title, body) {
    return [
      `<div style="${CHAT_CARD_STYLE}">`,
      `<div style="${CHAT_HEADER_STYLE}">${escapeHtml(title)}</div>`,
      `<div style="${CHAT_CONTENT_STYLE}">${body}</div>`,
      '</div>',
    ].join('');
  }

  /**
   * Builds a primary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildButton(label, command) {
    return `<a href="${escapeAttr(command)}" style="${BUTTON_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a secondary action button.
   *
   * @param {string} label Button label.
   * @param {string} command Chat command the button runs.
   * @returns {string} HTML anchor.
   */
  function buildSecondaryButton(label, command) {
    return `<a href="${escapeAttr(command)}" style="${BUTTON_SECONDARY_STYLE}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a section label.
   *
   * @param {string} text Label text.
   * @returns {string} HTML string.
   */
  function buildSectionLabel(text) {
    return `<div style="${SECTION_LABEL_STYLE}">${escapeHtml(text)}</div>`;
  }

  /**
   * Builds a horizontal divider.
   *
   * @returns {string} HTML string.
   */
  function buildDivider() {
    return `<hr style="${DIVIDER_STYLE}">`;
  }

  /**
   * Builds a label/value row. The value may be trusted HTML (e.g. a button).
   *
   * @param {string} label Label text (escaped).
   * @param {string} valueHtml Value HTML.
   * @returns {string} HTML string.
   */
  function buildRow(label, valueHtml) {
    return [
      '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
      `<td style="color:${COLOR_MUTED};width:50%;font-size:0.9em">${escapeHtml(label)}</td>`,
      `<td style="text-align:right;width:50%">${valueHtml}</td>`,
      '</tr></table>',
    ].join('');
  }

  /**
   * Builds a block of monospace text, keeping line breaks.
   *
   * @param {string} text Text (escaped here).
   * @returns {string} HTML string.
   */
  function buildCode(text) {
    const style =
      'font-family:monospace;font-size:0.85em;white-space:pre-wrap;word-break:break-word;background:rgba(0,0,0,0.25);padding:3px 5px;border-radius:3px;margin:2px 0';
    return `<div style="${style}">${escapeHtml(text).replaceAll(/\r?\n/g, '<br>')}</div>`;
  }

  // Runs a matched listener's commands: fills in placeholders, works out who
  // to send them as, applies cooldowns and stops runaway loops.

  // Last time each listener fired, and its recent firing times for loop protection.
  const lastFired = new Map();
  const recentFires = new Map();

  /**
   * Builds the values placeholders are replaced with.
   *
   * @param {object} message Analysed message.
   * @param {object} verdict Match verdict ({roll, result}).
   * @param {string} listenerName Listener name.
   * @returns {object} Placeholder values.
   */
  function buildPlaceholderValues(message, verdict, listenerName) {
    const roll = verdict.roll || message.rolls[0] || null;
    const natural = roll?.dice.find((d) => d.sides === 20) || roll?.dice[0];
    return {
      who: message.who,
      character: message.character,
      player: message.playerName,
      template: message.template,
      total: roll?.total ?? '',
      natural: natural?.value ?? '',
      expression: roll?.expression ?? '',
      result: verdict.result || '',
      table: roll?.tableItems.join(', ') ?? '',
      listener: listenerName,
      fields: message.fields,
      rolls: message.rolls,
    };
  }

  /**
   * Replaces ${name} and ${field:key} placeholders in a command. Unknown
   * placeholders are left alone, so roll template text is never changed.
   *
   * @param {string} command Command text.
   * @param {object} values Placeholder values.
   * @returns {string} Command with values filled in.
   */
  function fillPlaceholders(command, values) {
    const clean = (value) => toText(value).replaceAll(/[\r\n]+/g, ' ');
    return String(command).replaceAll(/\$\{(\w+)(?::([^}]*))?\}/g, (match, name, arg) => {
      const key = name.toLowerCase();
      if (key === 'field') {
        const field = values.fields?.[toText(arg).toLowerCase()];
        return field === undefined ? '' : clean(expandMarkers(field, values.rolls || []));
      }
      if (arg !== undefined || !(key in values) || key === 'fields' || key === 'rolls') {
        return match;
      }
      return clean(values[key]);
    });
  }

  /**
   * Splits an ability's commands into chat messages. Each line is a message,
   * except that lines inside an unclosed {{ }} block (a multi-line roll
   * template or ScriptCards script) stay together, as they do in a macro.
   *
   * @param {string} commands Commands.
   * @returns {string[]} Messages.
   */
  function splitCommands(commands) {
    const messages = [];
    let current = [];
    let depth = 0;
    for (const line of String(commands).split(/\r?\n/)) {
      if (current.length === 0 && !line.trim()) {
        continue;
      }
      current.push(line.trim());
      depth += (line.match(/\{\{/g) || []).length - (line.match(/\}\}/g) || []).length;
      if (depth <= 0) {
        depth = 0;
        const joiner = current[0].startsWith('!') ? '\n' : ' ';
        messages.push(current.filter(Boolean).join(joiner));
        current = [];
      }
    }
    if (current.length > 0) {
      messages.push(current.filter(Boolean).join(current[0].startsWith('!') ? '\n' : ' '));
    }
    return messages.filter(Boolean);
  }

  /**
   * Works out who a listener's commands are sent as.
   *
   * @param {string} mode 'crl' or 'roller'.
   * @param {object} message Analysed message.
   * @returns {string} sendChat speaker.
   */
  function resolveSpeaker(mode, message) {
    if (mode !== 'roller') {
      return CRL_SPEAKER;
    }
    if (message.characterId && getObj('character', message.characterId)) {
      return `character|${message.characterId}`;
    }
    for (const name of [message.character, message.who]) {
      const character = name ? findObjs({ _type: 'character', name })[0] : null;
      if (character) {
        return `character|${character.id}`;
      }
    }
    if (message.playerId && message.playerId !== 'API') {
      return `player|${message.playerId}`;
    }
    return CRL_SPEAKER;
  }

  /**
   * Returns true when a listener is still cooling down.
   *
   * @param {string} id Listener ID.
   * @param {number} cooldown Cooldown in seconds.
   * @param {number} now Current time in milliseconds.
   * @returns {boolean} True when it must wait.
   */
  function isCoolingDown(id, cooldown, now) {
    const last = lastFired.get(id);
    return cooldown > 0 && last !== undefined && now - last < cooldown * 1000;
  }

  /**
   * Records that a listener fired and reports whether it is looping.
   *
   * @param {string} id Listener ID.
   * @param {number} now Current time in milliseconds.
   * @returns {boolean} True when it has fired too often to be anything but a loop.
   */
  function recordFire(id, now) {
    lastFired.set(id, now);
    const times = (recentFires.get(id) || []).filter((time) => now - time < LOOP_WINDOW_MS);
    times.push(now);
    recentFires.set(id, times);
    return times.length > LOOP_LIMIT;
  }

  /**
   * Forgets a listener's firing history.
   *
   * @param {string} id Listener ID.
   * @returns {void}
   */
  function resetFires(id) {
    lastFired.delete(id);
    recentFires.delete(id);
  }

  /**
   * Sends a listener's commands.
   *
   * @param {string} commands Commands from the listener's ability.
   * @param {string} speaker sendChat speaker.
   * @param {object} values Placeholder values.
   * @returns {number} Number of messages sent.
   */
  function runCommands(commands, speaker, values) {
    const messages = splitCommands(commands);
    for (const text of messages) {
      sendChat(speaker, fillPlaceholders(text, values));
    }
    return messages.length;
  }

  const TRANSLATION$m = {
    titles: {
      ready: 'Customizable Roll Listener is gereed.',
      settings: 'CRL-instellings',
      languages: "Kies 'n taal",
      help: 'CRL-bevele',
      confirm: 'Bevestig asseblief',
      inspect: 'CRL-inspekteur',
      listener: 'Luisteraar: {name}',
      listenerCommands: 'Bevele: {name}',
    },
    menu: {
      listening: 'Luister',
      listeners: 'Luisteraars (in hierdie volgorde nagegaan)',
      noListeners: 'Nog geen luisteraars nie. Klik Nuwe luisteraar om een te maak.',
      noCommands: 'Nog geen bevele nie.',
      commandsHint:
        'Skei reëls met \\\\ wanneer jy bevele in die klets tik. Vir @{...}- of %{...}-verwysings, wysig eerder die vermoë in die Joernaal, want die klets vervang hulle voordat CRL hulle sien.',
    },
    buttons: {
      back: 'Terug',
      change: 'Verander',
      confirmDelete: 'Ja, skrap dit',
      delete: 'Skrap',
      edit: 'Wysig',
      help: 'Hulp',
      inspect: 'Inspekteer volgende boodskap',
      inspectOff: 'Stop inspeksie',
      new: 'Nuwe luisteraar',
      openJournal: 'Open in Joernaal',
      rebuildJournal: 'Herbou uitdeelstukke',
      rename: 'Hernoem',
      setCommands: 'Stel bevele',
      settings: 'Instellings',
      test: 'Toets',
      enable: 'Skakel aan',
      disable: 'Skakel af',
      menu: 'Luisteraars',
      turnOn: 'Luister aan',
      turnOff: 'Luister af',
    },
    prompts: {
      newName: 'Naam vir die nuwe luisteraar',
      name: 'Nuwe naam',
      target: 'Luisteraar se naam',
      commands: 'Bevele - skei reëls met twee trustrepe',
      templates:
        "Rolsjablone geskei deur spasies - none vir geen sjabloon - leeg vir enige - Inspekteer wys 'n rol se sjabloon",
      types: 'Boodskaptipes geskei deur spasies - leeg vir enige behalwe api',
      text: 'Teks om na te soek - sien die Hulp-uitdeelstuk - leeg vir enige',
      regex: 'Hoe om die teks te lees',
      who: 'Spreker- of karaktername geskei deur kommas - leeg vir enigiemand',
      players: 'Spelername geskei deur kommas - leeg vir enigiemand',
      results: 'Rolresultaat',
      total: 'Roltotaal soos 15 of 19-20 - sien die Hulp-uitdeelstuk - leeg vir enige',
      natural: 'Natuurlike dobbelsteenresultaat soos 20 of 1-2 - leeg vir enige',
      dice: 'Watter dobbelstene die toetse nagaan',
      cooldown: 'Sekondes om te wag voordat dit weer afgaan - 0 vir geen',
      speaker: 'Stuur bevele as',
    },
    choices: {
      critOrFumble: 'Kritiek of flater',
    },
    values: {
      on: 'Aan',
      off: 'Af',
      none: 'Geen',
      any: 'Enige',
      allButApi: 'Enige (nie API-bevele nie)',
      plain: 'Gewone teks',
      regex: 'Gereelde uitdrukking',
      diceAuto: "Outo (d20's indien gegooi)",
      diceAny: 'Enige dobbelsteen',
      seconds: '{seconds} s',
      speaker: {
        default: 'Verstekinstelling',
        crl: 'CRL',
        roller: 'Die gooier',
      },
    },
    results: {
      crit: 'Kritiek',
      fumble: 'Flater',
      success: 'Sukses',
      fail: 'Mislukking',
    },
    fields: {
      enabled: 'Aan',
      templates: 'Rolsjablone',
      types: 'Boodskaptipes',
      text: 'Teks',
      regex: 'Teks is',
      who: 'Sprekers / karakters',
      players: 'Spelers',
      results: 'Rolresultaat',
      total: 'Roltotaal',
      natural: 'Natuurlike dobbelsteen',
      dice: 'Dobbelstene nagegaan',
      cooldown: 'Afkoeltyd',
      stop: 'Stop ná hierdie een',
      speaker: 'Stuur as',
      commands: 'Bevele',
    },
    settings: {
      enabled: {
        label: 'Luister',
        desc: 'Skakel elke luisteraar gelyk aan of af.',
      },
      speaker: {
        label: 'Stuur bevele as',
        desc: "As wie luisteraarbevele gestuur word, tensy 'n luisteraar anders sê: CRL, of die karakter (of speler) wie se boodskap dit laat afgaan het.",
      },
      listenToMods: {
        label: 'Luister na ander mods',
        desc: 'Of klets wat deur ander mods gestuur word luisteraars kan laat afgaan. CRL reageer nooit op sy eie boodskappe nie.',
      },
      language: {
        label: 'Taal',
        desc: 'Taal vir kieslyste, boodskappe en uitdeelstukke.',
      },
    },
    inspect: {
      type: 'Tipe',
      who: 'Spreker',
      character: 'Karakter',
      player: 'Speler',
      template: 'Rolsjabloon',
      keys: 'Boodskap-eienskappe',
      extras: 'Ekstra boodskapdata',
      fields: 'Sjabloonvelde',
      rolls: 'Rolle',
      dice: 'dobbelstene',
      table: 'tabel',
      target: "het 'n suksesteiken",
      crit: 'kritiek',
      fumble: 'flater',
      text: 'Teks (soos luisteraars dit lees)',
      raw: 'Rou inhoud',
      listeners: 'Luisteraars',
      matched: 'sou afgaan: {result}',
      reasons: {
        disabled: 'afgeskakel',
        type: 'boodskaptipe pas nie',
        template: 'rolsjabloon pas nie',
        who: 'spreker of karakter pas nie',
        player: 'speler pas nie',
        text: 'teks nie gevind nie',
        roll: 'geen rol voldoen aan die rolvoorwaardes nie',
      },
    },
    messages: {
      upgraded:
        'Opgegradeer vanaf weergawe 1. {count} luisteraar(s) is omgeskakel en hul bevele is behou.',
      restored: '{count} luisteraar(s) vanaf die stoorkarakter herstel.',
      adopted:
        '{count} vermoë(ns) sonder luisteraarreëls op die stoorkarakter gevind. Hulle is afgeskakel bygevoeg; stel hulle vanuit die kieslys op.',
      removed: '{count} luisteraar(s) verwyder waarvan die vermoë geskrap is.',
      listeningOff: 'Luister is afgeskakel. Tik !crl on om dit aan te skakel.',
      readyHint: '{count} luisteraar(s). Tik !crl vir die kieslys of !crl help vir elke bevel.',
      loopStopped:
        'Die luisteraar "{name}" het te dikwels in \'n kort tyd afgegaan, waarskynlik omdat sy bevele dit weer laat afgaan, en is dus afgeskakel.',
      noCommands: 'Die luisteraar "{name}" het geen bevele om uit te voer nie.',
      tested: 'Die bevele van "{name}" is uitgevoer ({count} boodskap(pe)).',
      confirmDelete:
        'Skrap die luisteraar "{name}" en sy bevele? Dit kan nie ongedaan gemaak word nie.',
      deleted: 'Die luisteraar "{name}" is geskrap.',
      inspectOn:
        'Die volgende kletsboodskap sal geïnspekteer word en die resultaat sal vir jou gefluister word.',
      inspectOff: 'Die inspekteur is afgeskakel.',
      journalRebuilt: 'Die uitdeelstukke "{help}" en "{deck}" is herbou.',
    },
    errors: {
      gmOnly: "Slegs 'n GM kan Customizable Roll Listener-bevele gebruik.",
      unexpected: 'Iets het skeefgeloop: {message}',
      unknownCommand: 'Onbekende bevel "{command}".',
      badOption: 'Onbekende opsie --{option}.',
      notFound: 'Daar is geen luisteraar genaamd "{name}" nie.',
      nameRequired: "Gee asseblief 'n luisteraarnaam.",
      nameInvalid: 'Die naam "{name}" kan nie gebruik word nie.',
      nameTaken: 'Daar is reeds \'n luisteraar genaamd "{name}".',
      badOnOff: 'Die waarde "{value}" is nie geldig vir --{option} nie.',
      badType: 'Onbekende boodskaptipe(s): {value}.',
      badRegex: 'Die gereelde uitdrukking "{term}" is nie geldig nie: {error}',
      tooManyTerms: "'n Luisteraar kan na hoogstens {max} stukke teks soek.",
      badResult: 'Onbekende rolresultaat/-resultate: {value}.',
      badComparison: 'Die waarde "{value}" is nie geldig vir --{option} nie.',
      badDice: 'Die waarde "{value}" is nie geldig vir --dice nie.',
      badCooldown: 'Die waarde "{value}" is nie geldig vir --cooldown nie.',
      badSpeaker: 'Die waarde "{value}" is nie geldig vir --speaker nie.',
      noStore: 'Die stoorkarakter kon nie geskep word nie.',
      badSetting: 'Onbekende instelling "{key}".',
      badSettingValue: 'Die waarde "{value}" is nie geldig vir {key} nie.',
    },
    hints: {
      gmOnly: 'Vra jou GM om luisteraars vir jou op te stel.',
      unknownCommand: 'Tik !crl help om elke bevel te sien.',
      badOption:
        'Opsies is --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name en --commands.',
      notFound: 'Tik !crl om die lys luisteraars te sien.',
      nameInvalid:
        'Gebruik hoogstens {max} karakters, sonder hierdie: | { } [ ] \\ @ % # ? ~ of "--", en moenie met "-" begin nie.',
      badOnOff: 'Gebruik on of off.',
      badType: 'Boodskaptipes is: {types}.',
      badResult: 'Gebruik crit, fumble, success of fail.',
      badComparison: "Gebruik 'n getal, 'n vergelyking soos >=15 of <3, of 'n reeks soos 19-20.",
      badDice: "Gebruik auto, any, of 'n dobbelsteengrootte soos 20 of d20.",
      badCooldown: "Gebruik 'n heelgetal sekondes van 0 tot 3600.",
      badSpeaker: 'Gebruik default, crl of roller.',
      badSetting: 'Instellings is: {keys}.',
      noStore: 'Kyk in die API-konsole vir foute en herbegin dan die sandbox.',
    },
    help: {
      menu: 'Wys die lys luisteraars.',
      new: "Maak 'n luisteraar. Opsies kan dadelik bygevoeg word.",
      show: "Wys 'n luisteraar en sy instellings, met knoppies om hulle te verander.",
      edit: "Verander 'n luisteraar. Laat 'n waarde leeg (of gebruik -) om dit skoon te maak.",
      commands:
        "Vervang 'n luisteraar se bevele. Alles ná --commands word gebruik, so sit dit laaste.",
      enable: "Skakel 'n luisteraar aan of af.",
      move: "Skuif 'n luisteraar vroeër of later in die volgorde waarin luisteraars nagegaan word.",
      test: "Voer 'n luisteraar se bevele nou uit, asof 'n natuurlike 20 gegooi is.",
      delete: "Skrap 'n luisteraar en sy bevele (vra eers).",
      inspect:
        "Fluister 'n ontleding van die volgende kletsboodskap en watter luisteraars dit sou laat afgaan.",
      inspectOff: "Hou op wag vir 'n boodskap om te inspekteer.",
      onOff: 'Skakel alle luister aan of af.',
      config: 'Wys of verander die algemene instellings.',
      journal: 'Herbou die Hulp- en Bevelpaneel-uitdeelstukke.',
      help: 'Wys hierdie lys.',
      optionsTitle: 'Opsies',
      options:
        "Opsies: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name en --commands. Name kan in plaas van ID's gebruik word.",
      placeholders:
        'Bevele kan ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} en ${field:name} gebruik.',
      handouts:
        'Die uitdeelstuk "{help}" verduidelik alles; die uitdeelstuk "{deck}" het knoppies.',
    },
    store: {
      bio: 'Hierdie karakter behoort aan die Customizable Roll Listener-mod. Elke vermoë is een luisteraar: die vermoë bevat die bevele om uit te voer, en sy beskrywing bevat die luisteraar se reëls.',
      bioHelp:
        "Jy kan die bevele hier wysig. Verander die reëls met !crl of vanuit die Bevelpaneel-uitdeelstuk. As jy 'n vermoë skrap, word sy luisteraar ook geskrap.",
    },
    deck: {
      subtitle: 'Bevelpaneel',
      listeners: 'Luisteraars',
      listenersDesc: 'Sien, maak, verander en toets luisteraars.',
      listening: 'Luister',
      listeningDesc: 'Skakel elke luisteraar gelyk aan of af.',
      tools: 'Gereedskap',
      toolsDesc:
        "Inspekteer 'n kletsboodskap, verander instellings, herbou die uitdeelstukke of lees die hulp.",
      footer: 'Alle bevele is slegs vir die GM. Sien die uitdeelstuk "{help}" vir besonderhede.',
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'Hoor die dobbelstene, hoor die aksie',
      footer: 'Knoppies vir elke bevel is in die uitdeelstuk "{deck}".',
      overview: {
        heading: 'Oorsig',
        body: "Customizable Roll Listener (CRL) hou die klets dop en voer bevele van jou keuse uit wanneer 'n boodskap by 'n luisteraar pas. 'n Luisteraar kan kyk na die rolsjabloon, die teks, wie die boodskap gestuur het, en die rolle daarin: kritieke treffers, flaters, suksesse, mislukkings, totale en natuurlike dobbelsteenresultate. Bevele kan enigiets wees wat jy in die klets kan tik, insluitend ander mods se bevele, so CRL kan klanke speel, op tabelle rol, emotes plaas, statusmerkers toepas en meer.",
      },
      quickStart: {
        heading: 'Vinnige begin',
        steps: [
          'Tik !crl in die klets (of klik Luisteraars in die Bevelpaneel-uitdeelstuk).',
          "Klik Nuwe luisteraar en gee dit 'n naam, soos Kritieke Klank.",
          'Klik Verander langs Rolresultaat en kies Kritiek.',
          'Klik Stel bevele en voer in wat uitgevoer moet word, byvoorbeeld !roll20AM --audio,play|Crit.',
          "Klik Toets om die bevele na te gaan en gooi dan 'n aanval. Gebruik Inspekteer volgende boodskap as dit nie afgaan nie.",
        ],
      },
      examples: {
        heading: 'Voorbeelde',
        points: [
          'Klank by enige kritieke treffer, van enige blad: --results crit',
          "Flatertabel by 'n natuurlike 1 in die D&D 5e 2014-aanvalsjabloon: --templates atkdmg atk --natural 1",
          "Reageer op 'n rolbare tabel se resultaat: --text Geveg",
          'Slegs vir een karakter: --who Alice',
          '\'n Totaal van 20 of meer op die eerste inlyn-rol van \'n "Krag"-rol: --text Krag && ## --total >=20',
        ],
        code: [
          '!crl new Kritieke Klank --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Flater --natural 1 --dice 20 --commands /em flater! \\\\ /roll 1t[Flaters]',
          "!crl new Verteller --results crit fumble --speaker crl --commands /desc ${who} het 'n ${result} gegooi!",
        ],
      },
      matching: {
        heading: "Wat 'n luisteraar nagaan",
        points: [
          "'n Luisteraar gaan af wanneer elke filter wat dit het, pas. Leë filters pas by alles.",
          'Rolsjablone: die sjabloonnaam, soos atkdmg of simple. "none" pas by boodskappe sonder \'n sjabloon. Verskeie name beteken enigeen daarvan.',
          'Boodskaptipes: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon-blaaie) en api. Wanneer leeg, word elke tipe behalwe api-bevele nagegaan.',
          'Teks: een of meer stukke teks, geskei deur &&, wat almal moet voorkom. Hoof- en kleinletters word geïgnoreer. Teks word ook in roltotale en rolbare tabelresultate gevind.',
          "## in die teks staan vir 'n inlyn-rol; die roltoetse kyk dan net na die rolle wat daar gevind word. Sonder ## word elke rol in die boodskap nagegaan.",
          "Teks kan 'n gereelde uitdrukking wees in plaas van gewone teks (--regex on).",
          'Sprekers / karakters: die naam wat in die klets gewys word, of die karakternaam in die rolsjabloon. Spelers: die speler se vertoonnaam.',
        ],
      },
      templates: {
        heading: 'Rolsjabloonname',
        points: [
          "'n Rolsjabloon is die uitleg wat 'n blad vir sy rolkaarte gebruik. Sy naam is die deel ná template: in 'n makro, so &{template:atkdmg} is die atkdmg-sjabloon. Elke blad het sy eie name.",
          "Die vinnigste manier om 'n naam te vind: klik Inspekteer volgende boodskap, gooi die rol vanaf die blad, en lees die Rolsjabloon-reël wat CRL terugfluister.",
          'Jy kan die naam ook in \'n bladknoppie se makro lees, of in die blad se bronkode op GitHub, waar elke sjabloon \'n <rolltemplate class="sheet-rolltemplate-NAME"> is.',
          'Sjablone van algemene blaaie:',
        ],
        colSheet: 'Blad',
        colNames: 'Sjabloonname',
        links: 'Meer oor rolsjablone:',
        builtIn: 'Roll20: ingeboude rolsjablone',
        dnd5e2014: 'Roll20: D&D 5e (2014) rolsjablone',
        sheets: 'Roll20 karakterblad-bronkode',
      },
      rolls: {
        heading: 'Roltoetse',
        points: [
          "Rolresultaat: kritiek (die dobbelsteen se hoogste kant, of die cs-reeks), flater ('n 1, of die cf-reeks), sukses (minstens een dobbelsteen haal 'n teiken soos 1d20>15), mislukking ('n teikenrol sonder suksesse). Verskeie resultate beteken enigeen daarvan.",
          "Roltotaal: 'n getal, 'n vergelyking soos >=15, of 'n reeks soos 19-20.",
          "Natuurlike dobbelsteen: die kant waarop 'n dobbelsteen geland het, soos 20, of <=2.",
          "Dobbelstene nagegaan: auto kyk net na d20's wanneer een gegooi is, sodat skadedobbelstene wat hul hoogste kant gooi nie as kritiek tel nie. Kies any (enige dobbelsteen), of 'n grootte soos d100, om dit te verander.",
          'Weggelate dobbelstene (voordeel en nadeel) en hergooide dobbelstene word geïgnoreer.',
          "Die D&D 5E by Roll20 (2014)-blad gooi voordeel en nadeel as twee aparte d20-rolle (r1 en r2), so CRL gaan albei na: met voordeel tel 'n 1 op die laer dobbelsteen steeds as 'n flater, en met nadeel tel 'n 20 op die hoër dobbelsteen steeds as 'n kritiek.",
          "'n Luisteraar gaan af wanneer minstens een rol aan elke roltoets voldoen.",
        ],
      },
      commands: {
        heading: 'Kletsbevele',
        intro: "Elke bevel is slegs vir die GM. 'n Luisteraar kan by sy naam of sy ID genoem word.",
        colCommand: 'Bevel',
        colDesc: 'Wat dit doen',
      },
      options: {
        heading: 'Luisteraaropsies',
        intro:
          "Voeg hierdie by !crl new of !crl edit. Laat 'n waarde leeg, of gebruik -, om dit skoon te maak. --commands moet laaste kom.",
        colOption: 'Opsie',
        colDesc: 'Betekenis',
        templates:
          'Rolsjabloonname, geskei deur spasies. none = geen sjabloon. Sien Rolsjabloonname hierbo.',
        types: 'Boodskaptipes, geskei deur spasies: {types}.',
        text: "Teks om te vind. Skei stukke met &&. ## merk 'n inlyn-rol.",
        regex: 'on om die teks as gereelde uitdrukkings te lees, off vir gewone teks.',
        who: 'Spreker- of karaktername, geskei deur kommas.',
        players: 'Spelers se vertoonname, geskei deur kommas.',
        results: 'crit, fumble, success en/of fail.',
        total: 'Roltotaal: 15, >=15, <5 of 19-20.',
        natural: 'Natuurlike dobbelsteenkant: 20, <=2 of 19-20.',
        dice: "auto, any, of 'n dobbelsteengrootte soos 20.",
        cooldown: 'Sekondes voordat die luisteraar weer kan afgaan.',
        stop: 'on om op te hou om latere luisteraars na te gaan sodra hierdie een afgaan.',
        speaker: 'default, crl of roller.',
        enabled: 'on of off.',
        name: 'Hernoem die luisteraar.',
        commands: 'Die bevele om uit te voer. Skei reëls met \\\\.',
      },
      placeholders: {
        heading: 'Plekhouers',
        intro: "Hierdie word in 'n luisteraar se bevele vervang wanneer dit afgaan.",
        colName: 'Plekhouer',
        colDesc: 'Vervang met',
        who: 'Die naam wat in die klets gewys word.',
        character: 'Die karakternaam uit die rolsjabloon, of die naam wat in die klets gewys word.',
        player: 'Die speler se vertoonnaam.',
        template: 'Die rolsjabloon se naam.',
        total: 'Die totaal van die rol wat gepas het (of die eerste rol).',
        natural: 'Die natuurlike d20 (of eerste dobbelsteen) van daardie rol.',
        result: 'crit, fumble, success of fail, wanneer een gevra is.',
        expression: 'Die roluitdrukking, soos 1d20+5.',
        table: 'Rolbare tabelresultate van daardie rol.',
        listener: 'Die luisteraar se naam.',
        field: "'n Rolsjabloonveld, soos ${field:rname} (inlyn-rolle word as hul totale gewys).",
      },
      running: {
        heading: 'Hoe bevele uitgevoer word',
        points: [
          "Elke reël word as sy eie kletsboodskap gestuur, behalwe dat 'n {{ … }}-blok oor verskeie reëls ('n rolsjabloon of ScriptCards-skrip) bymekaar gehou word.",
          'Bevele word as CRL gestuur, of as die karakter wat gegooi het, soos per luisteraar of in die instellings gestel. Ander mods sien bevele wat deur CRL gestuur word asof dit van die API kom.',
          'Bevele kan inlyn-rolle, rolsjablone, @{Character|attribute} en %{Character|ability} gebruik. Verwysings na geselekteerde tekens (@{selected|…}) en navrae (?{…}) werk nie, want daar is niemand om te vra nie.',
          "Luisteraars word in volgorde nagegaan. 'n Luisteraar wat op Stop ná hierdie een gestel is, keer dat latere luisteraars op dieselfde boodskap afgaan.",
          "'n Afkoeltyd keer dat 'n luisteraar vir soveel sekondes weer afgaan.",
          "CRL ignoreer sy eie boodskappe. As 'n luisteraar steeds meer as 20 keer in 10 sekondes afgaan, word dit afgeskakel en die GM word ingelig.",
        ],
      },
      inspector: {
        heading: 'Die inspekteur',
        points: [
          'Klik Inspekteer volgende boodskap en gooi dan die rol. CRL fluister wat dit gesien het: die boodskaptipe, spreker, karakter, sjabloon en sy velde, elke rol met sy dobbelstene, die teks wat luisteraars deursoek, en waarom elke luisteraar wel of nie afgegaan het nie.',
          "Gebruik dit om 'n blad se sjabloonnaam te vind, of om te sien wat 'n Beacon-blad (soos D&D 2024) stuur.",
          "Beacon-blaaie plaas rolkaarte in plaas van rolsjablone. CRL lees hulle: die sjabloon is die kaart se eerste klas (dnd-2024 vir D&D 2024), die karakter, titel (soos Dexterity Check) en subkategorie word velde, en elke rol in die ontleding is 'n rol, so kritiek-, flater-, totaal- en natuurlike-dobbelsteentoetse werk.",
        ],
      },
      settings: {
        heading: 'Instellings',
        intro:
          'Verander hierdie met !crl config of die Instellings-knoppie. Sommige kan ook in die mod se One-Click-opsies gestel word.',
        colKey: 'Instelling',
        colName: 'Naam',
        colDesc: 'Beskrywing',
      },
      storage: {
        heading: 'Waar luisteraars gehou word',
        body: "Elke luisteraar is 'n vermoë op die geargiveerde karakter \"{character}\". Die vermoë bevat die bevele, so jy kan hulle in die Joernaal met die volle makroredigeerder wysig. Sy beskrywing bevat die luisteraar se reëls, wat luisteraars ook laat oorleef wanneer die speletjie gekopieer word. As jy 'n vermoë skrap, word sy luisteraar ook geskrap; 'n vermoë wat met die hand bygevoeg is, verskyn afgeskakel in die kieslys.",
      },
      upgrading: {
        heading: 'Opgradering vanaf weergawe 1',
        points: [
          'Weergawe 1-luisteraars word met die eerste begin omgeskakel en behou hul bevele.',
          "Teks wat net gewone karakters bevat, word gewone teks en ignoreer nou hoof- en kleinletters. Teks wat simbole van gereelde uitdrukkings gebruik, bly 'n gereelde uitdrukking.",
          'Luisteraars met \'n rolresultaat maar sonder ## het vroeër met "not parseable" misluk; hulle gaan nou elke rol in die boodskap na.',
          "Mislukking beteken nou 'n teikenrol sonder suksesse; 'n rol presies op die teiken is 'n sukses.",
          'Die weergawe 1-bevele werk steeds:',
        ],
        colV1: 'Weergawe 1',
        colV2: 'Weergawe 2',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Niks gebeur nie: maak seker Luister is aan en die luisteraar is aan, en gebruik dan die inspekteur om te sien watter filter misluk.',
          "'n Blad se rolle word nie herken nie: inspekteer een; die sjabloonnaam en velde wat dit wys, is waarop jy moet filter.",
          'Beacon-blaaie (soos D&D 2024) het die Experimental Mod-sandbox nodig sodat mods hul rolle kan sien.',
          'Bevele wat @{…} of %{…} gebruik, verloor hulle wanneer hulle in !crl getik word; wysig eerder die vermoë in die Joernaal.',
          'Skadedobbelstene wat as kritiek tel: stel Dobbelstene nagegaan op d20.',
          'Foute word na die API-konsole geskryf met die voorvoegsel "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Tale',
        body: "Kies 'n taal met !crl config language of die Taal-opsie in One-Click. Ondersteunde tale:",
        colCode: 'Kode',
        colName: 'Taal',
        colNative: 'Inheemse naam',
      },
      credits: {
        heading: 'Erkennings',
        original: 'Oorspronklike mod deur',
        maintainer: 'Weergawe 2 deur',
        support: 'Rapporteer probleme op die Roll20-forums of die GitHub-bewaarplek.',
        wiki: 'Weergawe 1-wikibladsy',
      },
    },
  };

  const TRANSLATION$l = {
    titles: {
      ready: 'Customizable Roll Listener està a punt.',
      settings: 'Configuració de CRL',
      languages: 'Tria un idioma',
      help: 'Ordres de CRL',
      confirm: 'Confirma-ho',
      inspect: 'Inspector de CRL',
      listener: 'Oient: {name}',
      listenerCommands: 'Ordres: {name}',
    },
    menu: {
      listening: 'Escolta',
      listeners: 'Oients (es comproven en aquest ordre)',
      noListeners: 'Encara no hi ha oients. Fes clic a Oient nou per crear-ne un.',
      noCommands: 'Encara no hi ha ordres.',
      commandsHint:
        'Separa les línies amb \\\\ quan escriguis ordres al xat. Per a referències @{...} o %{...}, edita l’habilitat al Diari, perquè el xat les substitueix abans que CRL les vegi.',
    },
    buttons: {
      back: 'Enrere',
      change: 'Canvia',
      confirmDelete: 'Sí, esborra’l',
      delete: 'Esborra',
      edit: 'Edita',
      help: 'Ajuda',
      inspect: 'Inspecciona el missatge següent',
      inspectOff: 'Deixa d’inspeccionar',
      new: 'Oient nou',
      openJournal: 'Obre al Diari',
      rebuildJournal: 'Reconstrueix els documents',
      rename: 'Canvia el nom',
      setCommands: 'Defineix les ordres',
      settings: 'Configuració',
      test: 'Prova',
      enable: 'Activa',
      disable: 'Desactiva',
      menu: 'Oients',
      turnOn: 'Escolta activada',
      turnOff: 'Escolta desactivada',
    },
    prompts: {
      newName: 'Nom del nou oient',
      name: 'Nom nou',
      target: 'Nom de l’oient',
      commands: 'Ordres - separa les línies amb dues barres inverses',
      templates:
        'Plantilles de tirada separades per espais - none per a cap plantilla - buit per a qualsevol - Inspecciona mostra la plantilla d’una tirada',
      types: 'Tipus de missatge separats per espais - buit per a qualsevol excepte api',
      text: 'Text a cercar - vegeu el document d’Ajuda - buit per a qualsevol',
      regex: 'Com s’ha de llegir el text',
      who: 'Noms de parlants o personatges separats per comes - buit per a tothom',
      players: 'Noms de jugadors separats per comes - buit per a tothom',
      results: 'Resultat de la tirada',
      total:
        'Total de la tirada, com ara 15 o 19-20 - vegeu el document d’Ajuda - buit per a qualsevol',
      natural: 'Resultat natural del dau, com ara 20 o 1-2 - buit per a qualsevol',
      dice: 'Quins daus miren les comprovacions',
      cooldown: 'Segons d’espera abans de tornar a activar-se - 0 per a cap',
      speaker: 'Envia les ordres com a',
    },
    choices: {
      critOrFumble: 'Crític o pifia',
    },
    values: {
      on: 'Activat',
      off: 'Desactivat',
      none: 'Cap',
      any: 'Qualsevol',
      allButApi: 'Qualsevol (no ordres d’API)',
      plain: 'Text normal',
      regex: 'Expressió regular',
      diceAuto: 'Auto (d20 si se n’han tirat)',
      diceAny: 'Qualsevol dau',
      seconds: '{seconds} s',
      speaker: {
        default: 'Configuració per defecte',
        crl: 'CRL',
        roller: 'Qui tira',
      },
    },
    results: {
      crit: 'Crític',
      fumble: 'Pifia',
      success: 'Èxit',
      fail: 'Fracàs',
    },
    fields: {
      enabled: 'Activat',
      templates: 'Plantilles de tirada',
      types: 'Tipus de missatge',
      text: 'Text',
      regex: 'El text és',
      who: 'Parlants / personatges',
      players: 'Jugadors',
      results: 'Resultat de la tirada',
      total: 'Total de la tirada',
      natural: 'Dau natural',
      dice: 'Daus comprovats',
      cooldown: 'Temps de recàrrega',
      stop: 'Atura’t després d’aquest',
      speaker: 'Envia com a',
      commands: 'Ordres',
    },
    settings: {
      enabled: {
        label: 'Escolta',
        desc: 'Activa o desactiva tots els oients alhora.',
      },
      speaker: {
        label: 'Envia les ordres com a',
        desc: 'Com s’envien les ordres dels oients, llevat que un oient indiqui el contrari: com a CRL, o com el personatge (o jugador) el missatge del qual l’ha activat.',
      },
      listenToMods: {
        label: 'Escolta altres mods',
        desc: 'Si el xat enviat per altres mods pot activar oients. CRL mai no reacciona als seus propis missatges.',
      },
      language: {
        label: 'Idioma',
        desc: 'Idioma dels menús, missatges i documents.',
      },
    },
    inspect: {
      type: 'Tipus',
      who: 'Parlant',
      character: 'Personatge',
      player: 'Jugador',
      template: 'Plantilla de tirada',
      keys: 'Propietats del missatge',
      extras: 'Dades addicionals del missatge',
      fields: 'Camps de la plantilla',
      rolls: 'Tirades',
      dice: 'daus',
      table: 'taula',
      target: 'té un objectiu d’èxit',
      crit: 'crític',
      fumble: 'pifia',
      text: 'Text (tal com el llegeixen els oients)',
      raw: 'Contingut en brut',
      listeners: 'Oients',
      matched: 's’activaria: {result}',
      reasons: {
        disabled: 'desactivat',
        type: 'el tipus de missatge no coincideix',
        template: 'la plantilla de tirada no coincideix',
        who: 'el parlant o personatge no coincideix',
        player: 'el jugador no coincideix',
        text: 'no s’ha trobat el text',
        roll: 'cap tirada no compleix les condicions de tirada',
      },
    },
    messages: {
      upgraded:
        'Actualitzat des de la versió 1. S’han convertit {count} oient(s) i se n’han conservat les ordres.',
      restored: 'S’han restaurat {count} oient(s) des del personatge magatzem.',
      adopted:
        'S’han trobat {count} habilitat(s) al personatge magatzem sense regles d’oient. S’han afegit desactivades; configura-les des del menú.',
      removed: 'S’han eliminat {count} oient(s) l’habilitat dels quals s’havia esborrat.',
      listeningOff: 'L’escolta està desactivada. Escriu !crl on per activar-la.',
      readyHint:
        '{count} oient(s). Escriu !crl per al menú o !crl help per veure totes les ordres.',
      loopStopped:
        'L’oient "{name}" s’ha activat massa vegades en poc temps, probablement perquè les seves ordres el tornen a activar, així que s’ha desactivat.',
      noCommands: 'L’oient "{name}" no té ordres per executar.',
      tested: 'S’han executat les ordres de "{name}" ({count} missatge(s)).',
      confirmDelete: 'Vols esborrar l’oient "{name}" i les seves ordres? No es pot desfer.',
      deleted: 'S’ha esborrat l’oient "{name}".',
      inspectOn: 'S’inspeccionarà el missatge següent del xat i se’t xiuxiuejarà el resultat.',
      inspectOff: 'S’ha desactivat l’inspector.',
      journalRebuilt: 'S’han reconstruït els documents "{help}" i "{deck}".',
    },
    errors: {
      gmOnly: 'Només un DJ pot fer servir les ordres de Customizable Roll Listener.',
      unexpected: 'Alguna cosa ha anat malament: {message}',
      unknownCommand: 'Ordre desconeguda "{command}".',
      badOption: 'Opció desconeguda --{option}.',
      notFound: 'No hi ha cap oient anomenat "{name}".',
      nameRequired: 'Indica el nom d’un oient.',
      nameInvalid: 'No es pot fer servir el nom "{name}".',
      nameTaken: 'Ja hi ha un oient anomenat "{name}".',
      badOnOff: 'El valor "{value}" no és vàlid per a --{option}.',
      badType: 'Tipus de missatge desconegut(s): {value}.',
      badRegex: 'L’expressió regular "{term}" no és vàlida: {error}',
      tooManyTerms: 'Un oient pot cercar com a màxim {max} fragments de text.',
      badResult: 'Resultat(s) de tirada desconegut(s): {value}.',
      badComparison: 'El valor "{value}" no és vàlid per a --{option}.',
      badDice: 'El valor "{value}" no és vàlid per a --dice.',
      badCooldown: 'El valor "{value}" no és vàlid per a --cooldown.',
      badSpeaker: 'El valor "{value}" no és vàlid per a --speaker.',
      noStore: 'No s’ha pogut crear el personatge magatzem.',
      badSetting: 'Paràmetre desconegut "{key}".',
      badSettingValue: 'El valor "{value}" no és vàlid per a {key}.',
    },
    hints: {
      gmOnly: 'Demana al teu DJ que et configuri els oients.',
      unknownCommand: 'Escriu !crl help per veure totes les ordres.',
      badOption:
        'Les opcions són --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name i --commands.',
      notFound: 'Escriu !crl per veure la llista d’oients.',
      nameInvalid:
        'Fes servir fins a {max} caràcters, sense aquests: | { } [ ] \\ @ % # ? ~ o "--", i no comencis amb "-".',
      badOnOff: 'Fes servir on o off.',
      badType: 'Els tipus de missatge són: {types}.',
      badResult: 'Fes servir crit, fumble, success o fail.',
      badComparison:
        'Fes servir un nombre, una comparació com ara >=15 o <3, o un interval com ara 19-20.',
      badDice: 'Fes servir auto, any o una mida de dau com ara 20 o d20.',
      badCooldown: 'Fes servir un nombre enter de segons de 0 a 3600.',
      badSpeaker: 'Fes servir default, crl o roller.',
      badSetting: 'Els paràmetres són: {keys}.',
      noStore: 'Revisa si hi ha errors a la consola de l’API i després reinicia el sandbox.',
    },
    help: {
      menu: 'Mostra la llista d’oients.',
      new: 'Crea un oient. Les opcions es poden afegir de seguida.',
      show: 'Mostra un oient i la seva configuració, amb botons per canviar-la.',
      edit: 'Canvia un oient. Deixa un valor buit (o fes servir -) per esborrar-lo.',
      commands:
        'Substitueix les ordres d’un oient. S’utilitza tot el que hi ha després de --commands, així que posa-ho al final.',
      enable: 'Activa o desactiva un oient.',
      move: 'Mou un oient abans o després en l’ordre en què es comproven els oients.',
      test: 'Executa ara les ordres d’un oient, com si s’hagués tret un 20 natural.',
      delete: 'Esborra un oient i les seves ordres (primer ho pregunta).',
      inspect: 'Xiuxiueja un desglossament del missatge següent del xat i quins oients activaria.',
      inspectOff: 'Deixa d’esperar un missatge per inspeccionar.',
      onOff: 'Activa o desactiva tota l’escolta.',
      config: 'Mostra o canvia la configuració global.',
      journal: 'Reconstrueix els documents d’Ajuda i del Tauler d’ordres.',
      help: 'Mostra aquesta llista.',
      optionsTitle: 'Opcions',
      options:
        'Opcions: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name i --commands. Es poden fer servir noms en lloc d’ID.',
      placeholders:
        'Les ordres poden fer servir ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} i ${field:name}.',
      handouts: 'El document "{help}" ho explica tot; el document "{deck}" té botons.',
    },
    store: {
      bio: 'Aquest personatge pertany al mod Customizable Roll Listener. Cada habilitat és un oient: l’habilitat conté les ordres que s’executen i la seva descripció conté les regles de l’oient.',
      bioHelp:
        'Pots editar les ordres aquí. Canvia les regles amb !crl o des del document Tauler d’ordres. Si esborres una habilitat, també n’esborres l’oient.',
    },
    deck: {
      subtitle: 'Tauler d’ordres',
      listeners: 'Oients',
      listenersDesc: 'Consulta, crea, canvia i prova oients.',
      listening: 'Escolta',
      listeningDesc: 'Activa o desactiva tots els oients alhora.',
      tools: 'Eines',
      toolsDesc:
        'Inspecciona un missatge del xat, canvia la configuració, reconstrueix els documents o llegeix l’ajuda.',
      footer:
        'Totes les ordres són només per al DJ. Consulta el document "{help}" per a més detalls.',
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: 'Escolta els daus, escolta l’acció',
      footer: 'Els botons de totes les ordres són al document "{deck}".',
      overview: {
        heading: 'Visió general',
        body: 'Customizable Roll Listener (CRL) vigila el xat i executa les ordres que triïs quan un missatge coincideix amb un oient. Un oient pot mirar la plantilla de tirada, el text, qui ha enviat el missatge i les tirades que conté: crítics, pifies, èxits, fracassos, totals i resultats naturals dels daus. Les ordres poden ser qualsevol cosa que puguis escriure al xat, incloses les ordres d’altres mods, de manera que CRL pot reproduir sons, tirar en taules, publicar emotes, aplicar marcadors d’estat i molt més.',
      },
      quickStart: {
        heading: 'Inici ràpid',
        steps: [
          'Escriu !crl al xat (o fes clic a Oients al document Tauler d’ordres).',
          'Fes clic a Oient nou i posa-li un nom, com ara So de crític.',
          'Fes clic a Canvia al costat de Resultat de la tirada i tria Crític.',
          'Fes clic a Defineix les ordres i introdueix què s’ha d’executar, per exemple !roll20AM --audio,play|Crit.',
          'Fes clic a Prova per comprovar les ordres i després fes una tirada d’atac. Fes servir Inspecciona el missatge següent si no s’activa.',
        ],
      },
      examples: {
        heading: 'Exemples',
        points: [
          'So en qualsevol crític, des de qualsevol full: --results crit',
          'Taula de pifies amb un 1 natural a la plantilla d’atac de D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reacciona al resultat d’una taula aleatòria: --text Combat',
          'Només per a un personatge: --who Alice',
          'Un total de 20 o més a la primera tirada en línia d’una tirada de "Força": --text Força && ## --total >=20',
        ],
        code: [
          '!crl new So de crític --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Pifia --natural 1 --dice 20 --commands /em fa una pifia! \\\\ /roll 1t[Pifies]',
          '!crl new Narrador --results crit fumble --speaker crl --commands /desc ${who} ha tret un ${result}!',
        ],
      },
      matching: {
        heading: 'Què comprova un oient',
        points: [
          'Un oient s’activa quan coincideixen tots els filtres que té. Els filtres buits coincideixen amb tot.',
          'Plantilles de tirada: el nom de la plantilla, com ara atkdmg o simple. "none" coincideix amb els missatges sense plantilla. Diversos noms volen dir qualsevol d’ells.',
          'Tipus de missatge: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (fulls Beacon) i api. Si és buit, es comproven tots els tipus excepte les ordres api.',
          'Text: un o més fragments de text, separats per &&, que han d’aparèixer tots. No es distingeix entre majúscules i minúscules. El text també es troba als totals de tirada i als resultats de taules aleatòries.',
          '## al text representa una tirada en línia; aleshores les comprovacions de tirada només miren les tirades que s’hi troben. Sense ##, es comprova cada tirada del missatge.',
          'El text pot ser una expressió regular en lloc de text normal (--regex on).',
          'Parlants / personatges: el nom que es mostra al xat, o el nom del personatge a la plantilla de tirada. Jugadors: el nom visible del jugador.',
        ],
      },
      templates: {
        heading: 'Noms de plantilles de tirada',
        points: [
          'Una plantilla de tirada és el disseny que fa servir un full per a les seves targetes de tirada. El seu nom és la part que va després de template: en una macro, així que &{template:atkdmg} és la plantilla atkdmg. Cada full té els seus propis noms.',
          'La manera més ràpida de trobar un nom: fes clic a Inspecciona el missatge següent, fes la tirada des del full i llegeix la línia Plantilla de tirada que CRL et xiuxiueja.',
          'També pots llegir el nom a la macro d’un botó del full, o al codi font del full a GitHub, on cada plantilla és un <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Plantilles dels fulls més habituals:',
        ],
        colSheet: 'Full',
        colNames: 'Noms de plantilla',
        links: 'Més informació sobre les plantilles de tirada:',
        builtIn: 'Roll20: plantilles de tirada integrades',
        dnd5e2014: 'Roll20: plantilles de tirada de D&D 5e (2014)',
        sheets: 'Codi font dels fulls de personatge de Roll20',
      },
      rolls: {
        heading: 'Comprovacions de tirada',
        points: [
          'Resultat de la tirada: crític (la cara més alta del dau, o l’interval cs), pifia (un 1, o l’interval cf), èxit (almenys un dau assoleix un objectiu com ara 1d20>15), fracàs (una tirada amb objectiu sense cap èxit). Diversos resultats volen dir qualsevol d’ells.',
          'Total de la tirada: un nombre, una comparació com ara >=15, o un interval com ara 19-20.',
          'Dau natural: la cara en què ha caigut un dau, com ara 20, o <=2.',
          'Daus comprovats: auto només mira els d20 quan se n’ha tirat un, de manera que els daus de dany que treuen la cara més alta no compten com a crítics. Tria any (qualsevol dau), o una mida com ara d100, per canviar-ho.',
          'Els daus descartats (avantatge i desavantatge) i els daus tornats a tirar s’ignoren.',
          'El full D&D 5E by Roll20 (2014) tira l’avantatge i el desavantatge com dues tirades de d20 separades (r1 i r2), així que CRL comprova totes dues: amb avantatge, un 1 al dau més baix encara compta com a pifia, i amb desavantatge, un 20 al dau més alt encara compta com a crític.',
          'Un oient s’activa quan almenys una tirada compleix totes les comprovacions de tirada.',
        ],
      },
      commands: {
        heading: 'Ordres de xat',
        intro:
          'Totes les ordres són només per al DJ. Un oient es pot indicar pel seu nom o pel seu ID.',
        colCommand: 'Ordre',
        colDesc: 'Què fa',
      },
      options: {
        heading: 'Opcions dels oients',
        intro:
          'Afegeix-les a !crl new o !crl edit. Deixa un valor buit, o fes servir -, per esborrar-lo. --commands ha d’anar al final.',
        colOption: 'Opció',
        colDesc: 'Significat',
        templates:
          'Noms de plantilles de tirada, separats per espais. none = cap plantilla. Vegeu Noms de plantilles de tirada més amunt.',
        types: 'Tipus de missatge, separats per espais: {types}.',
        text: 'Text a cercar. Separa els fragments amb &&. ## marca una tirada en línia.',
        regex: 'on per llegir el text com a expressions regulars, off per a text normal.',
        who: 'Noms de parlants o personatges, separats per comes.',
        players: 'Noms visibles dels jugadors, separats per comes.',
        results: 'crit, fumble, success i/o fail.',
        total: 'Total de la tirada: 15, >=15, <5 o 19-20.',
        natural: 'Cara natural del dau: 20, <=2 o 19-20.',
        dice: 'auto, any o una mida de dau com ara 20.',
        cooldown: 'Segons abans que l’oient es pugui tornar a activar.',
        stop: 'on per deixar de comprovar els oients posteriors un cop aquest s’activa.',
        speaker: 'default, crl o roller.',
        enabled: 'on o off.',
        name: 'Canvia el nom de l’oient.',
        commands: 'Les ordres a executar. Separa les línies amb \\\\.',
      },
      placeholders: {
        heading: 'Variables',
        intro: 'Se substitueixen a les ordres d’un oient quan s’activa.',
        colName: 'Variable',
        colDesc: 'Se substitueix per',
        who: 'El nom que es mostra al xat.',
        character:
          'El nom del personatge de la plantilla de tirada, o el nom que es mostra al xat.',
        player: 'El nom visible del jugador.',
        template: 'El nom de la plantilla de tirada.',
        total: 'El total de la tirada que ha coincidit (o de la primera tirada).',
        natural: 'El d20 natural (o el primer dau) d’aquella tirada.',
        result: 'crit, fumble, success o fail, quan se n’ha demanat un.',
        expression: 'L’expressió de la tirada, com ara 1d20+5.',
        table: 'Resultats de taules aleatòries d’aquella tirada.',
        listener: 'El nom de l’oient.',
        field:
          'Un camp de la plantilla de tirada, com ara ${field:rname} (les tirades en línia es mostren com els seus totals).',
      },
      running: {
        heading: 'Com s’executen les ordres',
        points: [
          'Cada línia s’envia com un missatge de xat independent, excepte que un bloc {{ … }} repartit en diverses línies (una plantilla de tirada o un script de ScriptCards) es manté junt.',
          'Les ordres s’envien com a CRL, o com el personatge que ha tirat, segons el que s’hagi definit per a cada oient o a la configuració. Els altres mods veuen les ordres enviades per CRL com si vinguessin de l’API.',
          'Les ordres poden fer servir tirades en línia, plantilles de tirada, @{Character|attribute} i %{Character|ability}. Les referències a fitxes seleccionades (@{selected|…}) i les consultes (?{…}) no funcionen, perquè no hi ha ningú a qui preguntar.',
          'Els oients es comproven en ordre. Un oient amb Atura’t després d’aquest activat impedeix que els oients posteriors s’activin amb el mateix missatge.',
          'Un temps de recàrrega impedeix que un oient es torni a activar durant aquests segons.',
          'CRL ignora els seus propis missatges. Si un oient encara s’activa més de 20 vegades en 10 segons, es desactiva i s’avisa el DJ.',
        ],
      },
      inspector: {
        heading: 'L’inspector',
        points: [
          'Fes clic a Inspecciona el missatge següent i després fes la tirada. CRL et xiuxiueja el que ha vist: el tipus de missatge, el parlant, el personatge, la plantilla i els seus camps, cada tirada amb els seus daus, el text que cerquen els oients i per què cada oient s’ha activat o no.',
          'Fes-lo servir per trobar el nom de la plantilla d’un full, o per veure què envia un full Beacon (com ara D&D 2024).',
          'Els fulls Beacon publiquen targetes de tirada en lloc de plantilles de tirada. CRL les llegeix: la plantilla és la primera classe de la targeta (dnd-2024 per a D&D 2024), el personatge, el títol (com ara Dexterity Check) i la subcategoria es converteixen en camps, i cada tirada del desglossament és una tirada, de manera que funcionen les comprovacions de crític, pifia, total i dau natural.',
        ],
      },
      settings: {
        heading: 'Configuració',
        intro:
          'Canvia-ho amb !crl config o el botó Configuració. Alguns paràmetres també es poden definir a les opcions One-Click del mod.',
        colKey: 'Paràmetre',
        colName: 'Nom',
        colDesc: 'Descripció',
      },
      storage: {
        heading: 'On es desen els oients',
        body: 'Cada oient és una habilitat del personatge arxivat "{character}". L’habilitat conté les ordres, de manera que les pots editar al Diari amb l’editor de macros complet. La seva descripció conté les regles de l’oient, cosa que també permet que els oients sobrevisquin quan es copia la partida. Si esborres una habilitat, també n’esborres l’oient; una habilitat afegida a mà apareix desactivada al menú.',
      },
      upgrading: {
        heading: 'Actualització des de la versió 1',
        points: [
          'Els oients de la versió 1 es converteixen en el primer inici i conserven les seves ordres.',
          'El text que només conté caràcters normals passa a ser text normal i ara no distingeix entre majúscules i minúscules. El text que fa servir símbols d’expressions regulars continua sent una expressió regular.',
          'Els oients amb un resultat de tirada però sense ## fallaven amb "not parseable"; ara comproven cada tirada del missatge.',
          'Fracàs ara vol dir una tirada amb objectiu sense cap èxit; una tirada exactament igual a l’objectiu és un èxit.',
          'Les ordres de la versió 1 encara funcionen:',
        ],
        colV1: 'Versió 1',
        colV2: 'Versió 2',
      },
      troubleshooting: {
        heading: 'Resolució de problemes',
        points: [
          'No passa res: comprova que l’Escolta està activada i que l’oient està activat, i després fes servir l’inspector per veure quin filtre falla.',
          'No es reconeixen les tirades d’un full: inspecciona’n una; el nom de la plantilla i els camps que mostra són el que cal filtrar.',
          'Els fulls Beacon (com ara D&D 2024) necessiten el sandbox Experimental Mod perquè els mods en vegin les tirades.',
          'Les ordres que fan servir @{…} o %{…} les perden quan s’escriuen a !crl; edita l’habilitat al Diari.',
          'Daus de dany comptats com a crítics: posa Daus comprovats a d20.',
          'Els errors s’escriuen a la consola de l’API amb el prefix "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Idiomes',
        body: 'Tria un idioma amb !crl config language o l’opció One-Click Idioma. Idiomes disponibles:',
        colCode: 'Codi',
        colName: 'Idioma',
        colNative: 'Nom natiu',
      },
      credits: {
        heading: 'Crèdits',
        original: 'Mod original de',
        maintainer: 'Versió 2 de',
        support: 'Informa dels problemes als fòrums de Roll20 o al repositori de GitHub.',
        wiki: 'Pàgina wiki de la versió 1',
      },
    },
  };

  const TRANSLATION$k = {
    titles: {
      ready: 'Customizable Roll Listener 已就緒。',
      settings: 'CRL 設定',
      languages: '選擇語言',
      help: 'CRL 指令',
      confirm: '請確認',
      inspect: 'CRL 檢查器',
      listener: '監聽器：{name}',
      listenerCommands: '指令：{name}',
    },
    menu: {
      listening: '監聽',
      listeners: '監聽器（依此順序檢查）',
      noListeners: '尚無監聽器。點選「新增監聽器」來建立一個。',
      noCommands: '尚無指令。',
      commandsHint:
        '在聊天中輸入指令時，請用 \\\\ 分隔各行。若要使用 @{...} 或 %{...} 參照，請改在日誌（Journal）中編輯能力，因為聊天會在 CRL 看到之前就把它們替換掉。',
    },
    buttons: {
      back: '返回',
      change: '變更',
      confirmDelete: '是，刪除',
      delete: '刪除',
      edit: '編輯',
      help: '說明',
      inspect: '檢查下一則訊息',
      inspectOff: '停止檢查',
      new: '新增監聽器',
      openJournal: '在日誌中開啟',
      rebuildJournal: '重建講義',
      rename: '重新命名',
      setCommands: '設定指令',
      settings: '設定',
      test: '測試',
      enable: '開啟',
      disable: '關閉',
      menu: '監聽器',
      turnOn: '開啟監聽',
      turnOff: '關閉監聽',
    },
    prompts: {
      newName: '新監聽器的名稱',
      name: '新名稱',
      target: '監聽器名稱',
      commands: '指令 - 用兩個反斜線分隔各行',
      templates:
        '擲骰模板，以空格分隔 - none 表示無模板 - 留空表示任何模板 - 「檢查」可顯示擲骰所用的模板',
      types: '訊息類型，以空格分隔 - 留空表示除 api 外的任何類型',
      text: '要尋找的文字 - 請見說明講義 - 留空表示任何文字',
      regex: '如何解讀文字',
      who: '發言者或角色名稱，以逗號分隔 - 留空表示任何人',
      players: '玩家名稱，以逗號分隔 - 留空表示任何人',
      results: '擲骰結果',
      total: '擲骰總值，例如 15 或 19-20 - 請見說明講義 - 留空表示任何值',
      natural: '原始骰值，例如 20 或 1-2 - 留空表示任何值',
      dice: '檢查要看哪些骰子',
      cooldown: '再次觸發前要等待的秒數 - 0 表示不等待',
      speaker: '指令發送身分',
    },

    choices: {
      critOrFumble: '爆擊或大失敗',
    },
    values: {
      on: '開',
      off: '關',
      none: '無',
      any: '任何',
      allButApi: '任何（API 指令除外）',
      plain: '純文字',
      regex: '正規表達式',
      diceAuto: '自動（有擲 d20 時看 d20）',
      diceAny: '任何骰子',
      seconds: '{seconds} 秒',
      speaker: {
        default: '預設設定',
        crl: 'CRL',
        roller: '擲骰者',
      },
    },
    results: {
      crit: '爆擊',
      fumble: '大失敗',
      success: '成功',
      fail: '失敗',
    },
    fields: {
      enabled: '開啟',
      templates: '擲骰模板',
      types: '訊息類型',
      text: '文字',
      regex: '文字類型',
      who: '發言者／角色',
      players: '玩家',
      results: '擲骰結果',
      total: '擲骰總值',
      natural: '原始骰值',
      dice: '檢查的骰子',
      cooldown: '冷卻時間',
      stop: '觸發後停止',
      speaker: '發送身分',
      commands: '指令',
    },
    settings: {
      enabled: {
        label: '監聽',
        desc: '一次開啟或關閉所有監聽器。',
      },
      speaker: {
        label: '指令發送身分',
        desc: '監聽器指令以誰的身分發送（除非監聽器另有設定）：CRL，或觸發它的訊息所屬的角色（或玩家）。',
      },
      listenToMods: {
        label: '監聽其他模組',
        desc: '其他模組發送的聊天訊息是否能觸發監聽器。CRL 永遠不會回應自己的訊息。',
      },
      language: {
        label: '語言',
        desc: '選單、訊息和講義使用的語言。',
      },
    },
    inspect: {
      type: '類型',
      who: '發言者',
      character: '角色',
      player: '玩家',
      template: '擲骰模板',
      keys: '訊息屬性',
      extras: '額外訊息資料',
      fields: '模板欄位',
      rolls: '擲骰',
      dice: '骰子',
      table: '表格',
      target: '有成功目標值',
      crit: '爆擊',
      fumble: '大失敗',
      text: '文字（監聽器讀取的樣子）',
      raw: '原始內容',
      listeners: '監聽器',
      matched: '會觸發 {result}',
      reasons: {
        disabled: '已關閉',
        type: '訊息類型不符',
        template: '擲骰模板不符',
        who: '發言者或角色不符',
        player: '玩家不符',
        text: '找不到文字',
        roll: '沒有擲骰符合擲骰條件',
      },
    },
    messages: {
      upgraded: '已從第 1 版升級。已轉換 {count} 個監聽器，並保留其指令。',
      restored: '已從儲存角色還原 {count} 個監聽器。',
      adopted:
        '在儲存角色上找到 {count} 個沒有監聽器規則的能力。它們已以關閉狀態加入；請從選單設定。',
      removed: '已移除 {count} 個能力已被刪除的監聽器。',
      listeningOff: '監聽已關閉。輸入 !crl on 即可開啟。',
      readyHint: '{count} 個監聽器。輸入 !crl 開啟選單，或輸入 !crl help 查看所有指令。',
      loopStopped:
        '監聽器「{name}」在短時間內觸發太多次，可能是它的指令又觸發了自己，因此已將它關閉。',
      noCommands: '監聽器「{name}」沒有可執行的指令。',
      tested: '已執行「{name}」的指令（{count} 則訊息）。',
      confirmDelete: '要刪除監聽器「{name}」及其指令嗎？此操作無法復原。',
      deleted: '已刪除監聽器「{name}」。',
      inspectOn: '將檢查下一則聊天訊息，並把結果密語給你。',
      inspectOff: '檢查器已關閉。',
      journalRebuilt: '已重建「{help}」和「{deck}」講義。',
    },
    errors: {
      gmOnly: '只有 GM 能使用 Customizable Roll Listener 的指令。',
      unexpected: '發生錯誤：{message}',
      unknownCommand: '未知的指令「{command}」。',
      badOption: '未知的選項 --{option}。',
      notFound: '沒有名為「{name}」的監聽器。',
      nameRequired: '請提供監聽器名稱。',
      nameInvalid: '無法使用名稱「{name}」。',
      nameTaken: '已經有名為「{name}」的監聽器。',
      badOnOff: '值「{value}」不適用於 --{option}。',
      badType: '未知的訊息類型：{value}。',
      badRegex: '正規表達式「{term}」無效：{error}',
      tooManyTerms: '一個監聽器最多只能尋找 {max} 段文字。',
      badResult: '未知的擲骰結果：{value}。',
      badComparison: '值「{value}」不適用於 --{option}。',
      badDice: '值「{value}」不適用於 --dice。',
      badCooldown: '值「{value}」不適用於 --cooldown。',
      badSpeaker: '值「{value}」不適用於 --speaker。',
      noStore: '無法建立儲存角色。',
      badSetting: '未知的設定「{key}」。',
      badSettingValue: '值「{value}」不適用於 {key}。',
    },
    hints: {
      gmOnly: '請 GM 幫你設定監聽器。',
      unknownCommand: '輸入 !crl help 查看所有指令。',
      badOption:
        '可用選項：--templates、--types、--text、--regex、--who、--players、--results、--total、--natural、--dice、--cooldown、--stop、--speaker、--enabled、--name 和 --commands。',
      notFound: '輸入 !crl 查看監聽器列表。',
      nameInvalid:
        '最多使用 {max} 個字元，不可包含以下字元：| { } [ ] \\ @ % # ? ~ 或 "--"，且不可以 "-" 開頭。',
      badOnOff: '請使用 on 或 off。',
      badType: '訊息類型有：{types}。',
      badResult: '請使用 crit、fumble、success 或 fail。',
      badComparison: '請使用數字、比較式（例如 >=15 或 <3）或範圍（例如 19-20）。',
      badDice: '請使用 auto、any，或骰子面數（例如 20 或 d20）。',
      badCooldown: '請使用 0 到 3600 之間的整數秒數。',
      badSpeaker: '請使用 default、crl 或 roller。',
      badSetting: '可用設定：{keys}。',
      noStore: '請檢查 API 主控台中的錯誤，然後重新啟動沙箱。',
    },
    help: {
      menu: '顯示監聽器列表。',
      new: '建立監聽器。可以同時加上選項。',
      show: '顯示監聽器及其設定，並附有變更按鈕。',
      edit: '變更監聽器。將值留空（或使用 -）即可清除。',
      commands: '取代監聽器的指令。--commands 之後的所有內容都會被使用，所以請放在最後。',
      enable: '開啟或關閉監聽器。',
      move: '調整監聽器在檢查順序中的位置。',
      test: '立即執行監聽器的指令，如同擲出原始 20。',
      delete: '刪除監聽器及其指令（會先詢問）。',
      inspect: '密語下一則聊天訊息的分析，以及它會觸發哪些監聽器。',
      inspectOff: '停止等待要檢查的訊息。',
      onOff: '開啟或關閉所有監聽。',
      config: '顯示或變更全域設定。',
      journal: '重建說明和 Command Deck 講義。',
      help: '顯示此列表。',
      optionsTitle: '選項',
      options:
        '選項：--templates、--types、--text、--regex、--who、--players、--results、--total、--natural、--dice、--cooldown、--stop、--speaker、--enabled、--name 和 --commands。可用名稱代替 ID。',
      placeholders:
        '指令中可使用 ${who}、${character}、${player}、${template}、${total}、${natural}、${result}、${expression}、${table}、${listener} 和 ${field:name}。',
      handouts: '「{help}」講義說明了一切；「{deck}」講義提供按鈕。',
    },
    store: {
      bio: '此角色屬於 Customizable Roll Listener 模組。每個能力就是一個監聽器：能力存放要執行的指令，其描述存放監聽器的規則。',
      bioHelp:
        '你可以在這裡編輯指令。規則請用 !crl 或從 Command Deck 講義變更。刪除能力會一併刪除其監聽器。',
    },
    deck: {
      subtitle: '指令面板',
      listeners: '監聽器',
      listenersDesc: '查看、建立、變更和測試監聽器。',
      listening: '監聽',
      listeningDesc: '一次開啟或關閉所有監聽器。',
      tools: '工具',
      toolsDesc: '檢查聊天訊息、變更設定、重建講義或閱讀說明。',
      footer: '所有指令僅限 GM 使用。詳情請見「{help}」講義。',
    },
    handout: {
      versionLabel: '版本',
      subtitle: '聽見骰子，聽見行動',
      footer: '所有指令的按鈕都在「{deck}」講義中。',
      overview: {
        heading: '概覽',
        body: 'Customizable Roll Listener（CRL）會監看聊天，當訊息符合某個監聽器時，執行你所選擇的指令。監聽器可以檢查擲骰模板、文字、訊息發送者，以及其中的擲骰：爆擊、大失敗、成功、失敗、總值和原始骰值。指令可以是任何你能在聊天中輸入的內容，包括其他模組的指令，因此 CRL 可以播放音效、在表格上擲骰、發送表情動作、套用狀態標記等等。',
      },
      quickStart: {
        heading: '快速入門',
        steps: [
          '在聊天中輸入 !crl（或在 Command Deck 講義中點選「監聽器」）。',
          '點選「新增監聽器」並為它命名，例如 Crit Sound。',
          '點選「擲骰結果」旁的「變更」，並選擇「爆擊」。',
          '點選「設定指令」並輸入要執行的內容，例如 !roll20AM --audio,play|Crit。',
          '點選「測試」檢查指令，然後擲一次攻擊。若沒有觸發，請使用「檢查下一則訊息」。',
        ],
      },
      examples: {
        heading: '範例',
        points: [
          '任何角色卡的任何爆擊都播放音效：--results crit',
          '在 D&D 5e 2014 攻擊模板中擲出原始 1 時擲大失敗表：--templates atkdmg atk --natural 1',
          '回應可擲表格的結果：--text Combat',
          '僅限單一角色：--who Alice',
          '在「Strength」擲骰的第一個行內擲骰中總值達 20 以上：--text Strength && ## --total >=20',
        ],
        code: [
          '!crl new Crit Sound --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new 大失敗 --natural 1 --dice 20 --commands /em 大失敗了！ \\\\ /roll 1t[Fumbles]',
          '!crl new 旁白 --results crit fumble --speaker crl --commands /desc ${who} 擲出了 ${result}！',
        ],
      },
      matching: {
        heading: '監聽器檢查的內容',
        points: [
          '當監聽器的所有篩選條件都符合時就會觸發。空的篩選條件符合一切。',
          '擲骰模板：模板名稱，例如 atkdmg 或 simple。"none" 符合沒有模板的訊息。多個名稱表示符合其中任一即可。',
          '訊息類型：general、rollresult、gmrollresult、emote、whisper、desc、advancedroll（Beacon 角色卡）和 api。留空時，會檢查除 api 指令外的所有類型。',
          '文字：一段或多段文字，以 && 分隔，必須全部出現。比對時不分大小寫。擲骰總值和可擲表格的結果中也能找到文字。',
          '文字中的 ## 代表一個行內擲骰；擲骰檢查此時只看該處的擲骰。沒有 ## 時，會檢查訊息中的每一次擲骰。',
          '文字可以是正規表達式而非純文字（--regex on）。',
          '發言者／角色：聊天中顯示的名稱，或擲骰模板中的角色名稱。玩家：玩家的顯示名稱。',
        ],
      },
      templates: {
        heading: '擲骰模板名稱',
        points: [
          '擲骰模板是角色卡用於擲骰卡片的版面。它的名稱是巨集中 template: 之後的部分，所以 &{template:atkdmg} 就是 atkdmg 模板。每張角色卡都有自己的名稱。',
          '找出名稱最快的方法：點選「檢查下一則訊息」，從角色卡擲骰，然後閱讀 CRL 密語回來的「擲骰模板」那一行。',
          '你也可以在角色卡按鈕的巨集中，或在 GitHub 上的角色卡原始碼中找到名稱，每個模板都是一個 <rolltemplate class="sheet-rolltemplate-NAME">。',
          '常見角色卡的模板：',
        ],
        colSheet: '角色卡',
        colNames: '模板名稱',
        links: '更多關於擲骰模板的資訊：',
        builtIn: 'Roll20：內建擲骰模板',
        dnd5e2014: 'Roll20：D&D 5e（2014）擲骰模板',
        sheets: 'Roll20 角色卡原始碼',
      },
      rolls: {
        heading: '擲骰檢查',
        points: [
          '擲骰結果：爆擊（骰子的最大面，或 cs 範圍）、大失敗（1，或 cf 範圍）、成功（至少一顆骰子達到目標值，例如 1d20>15）、失敗（有目標值但沒有任何成功的擲骰）。多個結果表示符合其中任一即可。',
          '擲骰總值：數字、比較式（例如 >=15）或範圍（例如 19-20）。',
          '原始骰值：骰子擲出的面，例如 20 或 <=2。',
          '檢查的骰子：auto 在有擲 d20 時只看 d20，因此傷害骰擲出最大面不會算作爆擊。選擇「任何骰子」或某個面數（例如 d100）即可改變此行為。',
          '被捨棄的骰子（優勢與劣勢）和重擲的骰子會被忽略。',
          'D&D 5E by Roll20（2014）角色卡會把優勢與劣勢擲成兩次獨立的 d20 擲骰（r1 和 r2），因此 CRL 會同時檢查兩者：有優勢時，較低那顆骰出 1 仍算大失敗；有劣勢時，較高那顆骰出 20 仍算爆擊。',
          '當至少一次擲骰符合所有擲骰檢查時，監聽器就會觸發。',
        ],
      },
      commands: {
        heading: '聊天指令',
        intro: '所有指令僅限 GM 使用。可用名稱或 ID 指定監聽器。',
        colCommand: '指令',
        colDesc: '作用',
      },
      options: {
        heading: '監聽器選項',
        intro:
          '將這些加在 !crl new 或 !crl edit 後面。將值留空或使用 - 即可清除。--commands 必須放在最後。',
        colOption: '選項',
        colDesc: '意義',
        templates: '擲骰模板名稱，以空格分隔。none = 無模板。請見上方的「擲骰模板名稱」。',
        types: '訊息類型，以空格分隔：{types}。',
        text: '要尋找的文字。用 && 分隔各段。## 標示一個行內擲骰。',
        regex: 'on 表示將文字視為正規表達式，off 表示純文字。',
        who: '發言者或角色名稱，以逗號分隔。',
        players: '玩家顯示名稱，以逗號分隔。',
        results: 'crit、fumble、success 和／或 fail。',
        total: '擲骰總值：15、>=15、<5 或 19-20。',
        natural: '原始骰值：20、<=2 或 19-20。',
        dice: 'auto、any，或骰子面數，例如 20。',
        cooldown: '監聽器可再次觸發前的秒數。',
        stop: 'on 表示此監聽器觸發後，不再檢查後面的監聽器。',
        speaker: 'default、crl 或 roller。',
        enabled: 'on 或 off。',
        name: '重新命名監聽器。',
        commands: '要執行的指令。用 \\\\ 分隔各行。',
      },
      placeholders: {
        heading: '佔位符',
        intro: '監聽器觸發時，這些會在其指令中被替換。',
        colName: '佔位符',
        colDesc: '替換為',
        who: '聊天中顯示的名稱。',
        character: '擲骰模板中的角色名稱，或聊天中顯示的名稱。',
        player: '玩家的顯示名稱。',
        template: '擲骰模板名稱。',
        total: '符合條件的擲骰（或第一次擲骰）的總值。',
        natural: '該次擲骰的原始 d20（或第一顆骰子）。',
        result: 'crit、fumble、success 或 fail（有指定時）。',
        expression: '擲骰算式，例如 1d20+5。',
        table: '該次擲骰的可擲表格結果。',
        listener: '監聽器的名稱。',
        field: '擲骰模板欄位，例如 ${field:rname}（行內擲骰會顯示為其總值）。',
      },
      running: {
        heading: '指令如何執行',
        points: [
          '每一行都會作為獨立的聊天訊息發送，但跨越多行的 {{ … }} 區塊（擲骰模板或 ScriptCards 腳本）會保持在一起。',
          '指令會以 CRL 或擲骰角色的身分發送，依各監聽器或設定而定。其他模組會將 CRL 發送的指令視為來自 API。',
          '指令可以使用行內擲骰、擲骰模板、@{Character|attribute} 和 %{Character|ability}。選取 token 的參照（@{selected|…}）和詢問（?{…}）無法使用，因為沒有人可以回答。',
          '監聽器依順序檢查。設定了「觸發後停止」的監聽器會阻止後面的監聽器對同一則訊息觸發。',
          '冷卻時間會讓監聽器在該秒數內不再觸發。',
          'CRL 會忽略自己的訊息。若某個監聽器仍在 10 秒內觸發超過 20 次，它會被關閉並通知 GM。',
        ],
      },
      inspector: {
        heading: '檢查器',
        points: [
          '點選「檢查下一則訊息」，然後擲骰。CRL 會密語它看到的內容：訊息類型、發言者、角色、模板及其欄位、每次擲骰及其骰子、監聽器搜尋的文字，以及每個監聽器為何觸發或未觸發。',
          '用它來找出角色卡的模板名稱，或查看 Beacon 角色卡（例如 D&D 2024）發送了什麼。',
          'Beacon 角色卡發送的是擲骰卡片而非擲骰模板。CRL 會讀取它們：模板是卡片的第一個 class（D&D 2024 為 dnd-2024），角色、標題（例如 Dexterity Check）和子類別會成為欄位，分解中的每次擲骰都是一次擲骰，因此爆擊、大失敗、總值和原始骰值檢查都能運作。',
        ],
      },
      settings: {
        heading: '設定',
        intro: '用 !crl config 或「設定」按鈕變更這些。部分設定也能在模組的 One-Click 選項中設定。',
        colKey: '設定',
        colName: '名稱',
        colDesc: '說明',
      },
      storage: {
        heading: '監聽器存放位置',
        body: '每個監聽器都是已封存角色「{character}」上的一個能力。能力存放指令，所以你可以在日誌中用完整的巨集編輯器編輯它們。其描述存放監聽器的規則，這也讓監聽器在複製遊戲後得以保留。刪除能力會一併刪除其監聽器；手動新增的能力會以關閉狀態出現在選單中。',
      },
      upgrading: {
        heading: '從第 1 版升級',
        points: [
          '第 1 版的監聽器會在首次啟動時轉換，並保留其指令。',
          '只含一般字元的文字會變成純文字，現在比對時不分大小寫。使用正規表達式符號的文字仍維持為正規表達式。',
          '有擲骰結果但沒有 ## 的監聽器以前會因 "not parseable" 而失敗；現在它們會檢查訊息中的每一次擲骰。',
          'Fail 現在表示有目標值但沒有任何成功的擲骰；剛好等於目標值的擲骰算成功。',
          '第 1 版的指令仍然可用：',
        ],
        colV1: '第 1 版',
        colV2: '第 2 版',
      },
      troubleshooting: {
        heading: '疑難排解',
        points: [
          '沒有任何反應：確認「監聽」已開啟且監聽器已開啟，然後使用檢查器查看是哪個篩選條件不符。',
          '無法辨識某張角色卡的擲骰：檢查其中一次；它顯示的模板名稱和欄位就是要篩選的對象。',
          'Beacon 角色卡（例如 D&D 2024）需要使用 Experimental Mod 沙箱，模組才能看到它們的擲骰。',
          '在 !crl 中輸入含有 @{…} 或 %{…} 的指令時，它們會遺失；請改在日誌中編輯能力。',
          '傷害骰被算作爆擊：將「檢查的骰子」設為 d20。',
          '錯誤會寫入 API 主控台，並帶有前綴 "Customizable Roll Listener"。',
        ],
      },
      languages: {
        heading: '語言',
        body: '用 !crl config language 或 Language One-Click 選項選擇語言。支援的語言：',
        colCode: '代碼',
        colName: '語言',
        colNative: '原文名稱',
      },
      credits: {
        heading: '致謝',
        original: '原始模組作者',
        maintainer: '第 2 版作者',
        support: '請在 Roll20 論壇或 GitHub 儲存庫回報問題。',
        wiki: '第 1 版 Wiki 頁面',
      },
    },
  };

  const TRANSLATION$j = {
    titles: {
      ready: 'Customizable Roll Listener je připraven.',
      settings: 'Nastavení CRL',
      languages: 'Vyberte jazyk',
      help: 'Příkazy CRL',
      confirm: 'Potvrďte prosím',
      inspect: 'Inspektor CRL',
      listener: 'Posluchač: {name}',
      listenerCommands: 'Příkazy: {name}',
    },
    menu: {
      listening: 'Naslouchání',
      listeners: 'Posluchači (kontrolují se v tomto pořadí)',
      noListeners: 'Zatím žádní posluchači. Vytvořte ho kliknutím na Nový posluchač.',
      noCommands: 'Zatím žádné příkazy.',
      commandsHint:
        'Při psaní příkazů do chatu oddělujte řádky pomocí \\\\. Pro odkazy @{...} nebo %{...} raději upravte schopnost v deníku, protože chat je nahradí dřív, než je CRL uvidí.',
    },
    buttons: {
      back: 'Zpět',
      change: 'Změnit',
      confirmDelete: 'Ano, smazat',
      delete: 'Smazat',
      edit: 'Upravit',
      help: 'Nápověda',
      inspect: 'Prozkoumat další zprávu',
      inspectOff: 'Ukončit zkoumání',
      new: 'Nový posluchač',
      openJournal: 'Otevřít v deníku',
      rebuildJournal: 'Obnovit podklady',
      rename: 'Přejmenovat',
      setCommands: 'Nastavit příkazy',
      settings: 'Nastavení',
      test: 'Vyzkoušet',
      enable: 'Zapnout',
      disable: 'Vypnout',
      menu: 'Posluchači',
      turnOn: 'Naslouchání zapnuto',
      turnOff: 'Naslouchání vypnuto',
    },
    prompts: {
      newName: 'Název nového posluchače',
      name: 'Nový název',
      target: 'Název posluchače',
      commands: 'Příkazy – řádky oddělte dvěma zpětnými lomítky',
      templates:
        'Šablony hodů oddělené mezerami – none pro žádnou šablonu – prázdné pro jakoukoli – Prozkoumat ukáže šablonu hodu',
      types: 'Typy zpráv oddělené mezerami – prázdné pro jakýkoli kromě api',
      text: 'Hledaný text – viz podklad Nápověda – prázdné pro jakýkoli',
      regex: 'Jak číst text',
      who: 'Jména mluvčích nebo postav oddělená čárkami – prázdné pro kohokoli',
      players: 'Jména hráčů oddělená čárkami – prázdné pro kohokoli',
      results: 'Výsledek hodu',
      total: 'Součet hodu, např. 15 nebo 19-20 – viz podklad Nápověda – prázdné pro jakýkoli',
      natural: 'Přirozený výsledek kostky, např. 20 nebo 1-2 – prázdné pro jakýkoli',
      dice: 'Které kostky kontroly sledují',
      cooldown: 'Sekundy čekání před dalším spuštěním – 0 pro žádné',
      speaker: 'Odesílat příkazy jako',
    },
    choices: {
      critOrFumble: 'Kritický zásah nebo kritické selhání',
    },
    values: {
      on: 'Zapnuto',
      off: 'Vypnuto',
      none: 'Žádné',
      any: 'Jakékoli',
      allButApi: 'Jakékoli (kromě příkazů API)',
      plain: 'Prostý text',
      regex: 'Regulární výraz',
      diceAuto: 'Automaticky (d20, pokud se házela)',
      diceAny: 'Jakákoli kostka',
      seconds: '{seconds} s',
      speaker: {
        default: 'Výchozí nastavení',
        crl: 'CRL',
        roller: 'Házející',
      },
    },
    results: {
      crit: 'Kritický zásah',
      fumble: 'Kritické selhání',
      success: 'Úspěch',
      fail: 'Neúspěch',
    },
    fields: {
      enabled: 'Zapnuto',
      templates: 'Šablony hodů',
      types: 'Typy zpráv',
      text: 'Text',
      regex: 'Text je',
      who: 'Mluvčí / postavy',
      players: 'Hráči',
      results: 'Výsledek hodu',
      total: 'Součet hodu',
      natural: 'Přirozená kostka',
      dice: 'Kontrolované kostky',
      cooldown: 'Prodleva',
      stop: 'Zastavit po tomto',
      speaker: 'Odesílat jako',
      commands: 'Příkazy',
    },
    settings: {
      enabled: {
        label: 'Naslouchání',
        desc: 'Zapne nebo vypne všechny posluchače najednou.',
      },
      speaker: {
        label: 'Odesílat příkazy jako',
        desc: 'Za koho se příkazy posluchačů odesílají, pokud posluchač neurčí jinak: CRL, nebo postava (či hráč), jejíž zpráva ho spustila.',
      },
      listenToMods: {
        label: 'Naslouchat jiným modům',
        desc: 'Zda mohou posluchače spustit zprávy v chatu od jiných modů. CRL nikdy nereaguje na vlastní zprávy.',
      },
      language: {
        label: 'Jazyk',
        desc: 'Jazyk nabídek, zpráv a podkladů.',
      },
    },
    inspect: {
      type: 'Typ',
      who: 'Mluvčí',
      character: 'Postava',
      player: 'Hráč',
      template: 'Šablona hodu',
      keys: 'Vlastnosti zprávy',
      extras: 'Další data zprávy',
      fields: 'Pole šablony',
      rolls: 'Hody',
      dice: 'kostky',
      table: 'tabulka',
      target: 'má cíl úspěchu',
      crit: 'krit',
      fumble: 'selhání',
      text: 'Text (jak ho čtou posluchači)',
      raw: 'Surový obsah',
      listeners: 'Posluchači',
      matched: 'spustil by se: {result}',
      reasons: {
        disabled: 'vypnutý',
        type: 'typ zprávy neodpovídá',
        template: 'šablona hodu neodpovídá',
        who: 'mluvčí nebo postava neodpovídá',
        player: 'hráč neodpovídá',
        text: 'text nenalezen',
        roll: 'žádný hod nesplňuje podmínky hodu',
      },
    },
    messages: {
      upgraded:
        'Aktualizováno z verze 1. Převedení posluchači: {count}; jejich příkazy zůstaly zachovány.',
      restored: 'Obnovení posluchači z úložné postavy: {count}.',
      adopted:
        'Schopnosti bez pravidel posluchače nalezené na úložné postavě: {count}. Byly přidány jako vypnuté; nastavte je v nabídce.',
      removed: 'Odebraní posluchači, jejichž schopnost byla smazána: {count}.',
      listeningOff: 'Naslouchání je vypnuté. Zapnete ho příkazem !crl on.',
      readyHint:
        'Posluchači: {count}. Napište !crl pro nabídku nebo !crl help pro všechny příkazy.',
      loopStopped:
        'Posluchač „{name}“ se v krátké době spustil příliš často, nejspíš proto, že ho jeho vlastní příkazy spouštějí znovu, a byl proto vypnut.',
      noCommands: 'Posluchač „{name}“ nemá žádné příkazy ke spuštění.',
      tested: 'Spuštěny příkazy posluchače „{name}“ (zprávy: {count}).',
      confirmDelete: 'Smazat posluchače „{name}“ a jeho příkazy? Tuto akci nelze vrátit.',
      deleted: 'Posluchač „{name}“ byl smazán.',
      inspectOn: 'Další zpráva v chatu bude prozkoumána a výsledek vám bude pošeptán.',
      inspectOff: 'Inspektor byl vypnut.',
      journalRebuilt: 'Podklady „{help}“ a „{deck}“ byly obnoveny.',
    },
    errors: {
      gmOnly: 'Příkazy Customizable Roll Listener může používat jen GM.',
      unexpected: 'Něco se pokazilo: {message}',
      unknownCommand: 'Neznámý příkaz „{command}“.',
      badOption: 'Neznámá volba --{option}.',
      notFound: 'Posluchač „{name}“ neexistuje.',
      nameRequired: 'Zadejte prosím název posluchače.',
      nameInvalid: 'Název „{name}“ nelze použít.',
      nameTaken: 'Posluchač „{name}“ už existuje.',
      badOnOff: 'Hodnota „{value}“ není platná pro --{option}.',
      badType: 'Neznámé typy zpráv: {value}.',
      badRegex: 'Regulární výraz „{term}“ není platný: {error}',
      tooManyTerms: 'Posluchač může hledat nejvýše {max} částí textu.',
      badResult: 'Neznámé výsledky hodu: {value}.',
      badComparison: 'Hodnota „{value}“ není platná pro --{option}.',
      badDice: 'Hodnota „{value}“ není platná pro --dice.',
      badCooldown: 'Hodnota „{value}“ není platná pro --cooldown.',
      badSpeaker: 'Hodnota „{value}“ není platná pro --speaker.',
      noStore: 'Úložnou postavu se nepodařilo vytvořit.',
      badSetting: 'Neznámé nastavení „{key}“.',
      badSettingValue: 'Hodnota „{value}“ není platná pro {key}.',
    },
    hints: {
      gmOnly: 'Požádejte svého GM, aby vám posluchače nastavil.',
      unknownCommand: 'Napište !crl help a uvidíte všechny příkazy.',
      badOption:
        'Volby jsou --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name a --commands.',
      notFound: 'Napište !crl a uvidíte seznam posluchačů.',
      nameInvalid:
        'Použijte nejvýše {max} znaků, bez těchto: | { } [ ] \\ @ % # ? ~ ani "--", a nezačínejte znakem "-".',
      badOnOff: 'Použijte on nebo off.',
      badType: 'Typy zpráv jsou: {types}.',
      badResult: 'Použijte crit, fumble, success nebo fail.',
      badComparison: 'Použijte číslo, porovnání jako >=15 nebo <3, nebo rozsah jako 19-20.',
      badDice: 'Použijte auto, any, nebo velikost kostky jako 20 či d20.',
      badCooldown: 'Použijte celý počet sekund od 0 do 3600.',
      badSpeaker: 'Použijte default, crl nebo roller.',
      badSetting: 'Nastavení jsou: {keys}.',
      noStore: 'Zkontrolujte chyby v konzoli API a pak restartujte sandbox.',
    },
    help: {
      menu: 'Zobrazit seznam posluchačů.',
      new: 'Vytvořit posluchače. Volby lze přidat rovnou.',
      show: 'Zobrazit posluchače a jeho nastavení s tlačítky pro jejich změnu.',
      edit: 'Změnit posluchače. Hodnotu vymažete tak, že ji necháte prázdnou (nebo použijete -).',
      commands:
        'Nahradit příkazy posluchače. Použije se vše za --commands, proto tuto volbu dejte na konec.',
      enable: 'Zapnout nebo vypnout posluchače.',
      move: 'Posunout posluchače dopředu nebo dozadu v pořadí, v jakém se posluchači kontrolují.',
      test: 'Spustit příkazy posluchače hned, jako by padla přirozená 20.',
      delete: 'Smazat posluchače a jeho příkazy (nejprve se zeptá).',
      inspect: 'Pošeptat rozbor další zprávy v chatu a které posluchače by spustila.',
      inspectOff: 'Přestat čekat na zprávu ke zkoumání.',
      onOff: 'Zapnout nebo vypnout veškeré naslouchání.',
      config: 'Zobrazit nebo změnit globální nastavení.',
      journal: 'Obnovit podklady Nápověda a Panel příkazů.',
      help: 'Zobrazit tento seznam.',
      optionsTitle: 'Volby',
      options:
        'Volby: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name a --commands. Místo ID lze používat názvy.',
      placeholders:
        'Příkazy mohou používat ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} a ${field:name}.',
      handouts: 'Podklad „{help}“ vše vysvětluje; podklad „{deck}“ obsahuje tlačítka.',
    },
    store: {
      bio: 'Tato postava patří k modu Customizable Roll Listener. Každá schopnost je jeden posluchač: schopnost obsahuje příkazy ke spuštění a její popis obsahuje pravidla posluchače.',
      bioHelp:
        'Příkazy můžete upravovat zde. Pravidla měňte pomocí !crl nebo z podkladu Panel příkazů. Smazáním schopnosti smažete i jejího posluchače.',
    },
    deck: {
      subtitle: 'Panel příkazů',
      listeners: 'Posluchači',
      listenersDesc: 'Prohlížejte, vytvářejte, měňte a zkoušejte posluchače.',
      listening: 'Naslouchání',
      listeningDesc: 'Zapněte nebo vypněte všechny posluchače najednou.',
      tools: 'Nástroje',
      toolsDesc:
        'Prozkoumejte zprávu v chatu, změňte nastavení, obnovte podklady nebo si přečtěte nápovědu.',
      footer: 'Všechny příkazy jsou jen pro GM. Podrobnosti najdete v podkladu „{help}“.',
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Slyš kostky, slyš akci',
      footer: 'Tlačítka pro všechny příkazy najdete v podkladu „{deck}“.',
      overview: {
        heading: 'Přehled',
        body: 'Customizable Roll Listener (CRL) sleduje chat a spouští vámi zvolené příkazy, když zpráva odpovídá některému posluchači. Posluchač může sledovat šablonu hodu, text, odesílatele zprávy a hody v ní: kritické zásahy, kritická selhání, úspěchy, neúspěchy, součty a přirozené výsledky kostek. Příkazem může být cokoli, co byste napsali do chatu, včetně příkazů jiných modů, takže CRL umí přehrávat zvuky, házet na tabulky, posílat emoty, přidávat stavové značky a mnohem víc.',
      },
      quickStart: {
        heading: 'Rychlý start',
        steps: [
          'Napište do chatu !crl (nebo klikněte na Posluchači v podkladu Panel příkazů).',
          'Klikněte na Nový posluchač a pojmenujte ho, třeba Zvuk kritu.',
          'Klikněte na Změnit vedle Výsledek hodu a zvolte Kritický zásah.',
          'Klikněte na Nastavit příkazy a zadejte, co se má spustit, například !roll20AM --audio,play|Crit.',
          'Klikněte na Vyzkoušet pro kontrolu příkazů a pak hoďte útok. Pokud se posluchač nespustí, použijte Prozkoumat další zprávu.',
        ],
      },
      examples: {
        heading: 'Příklady',
        points: [
          'Zvuk při každém kritickém zásahu z jakéhokoli listu: --results crit',
          'Tabulka selhání při přirozené 1 v útočné šabloně D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reakce na výsledek náhodné tabulky: --text Combat',
          'Jen pro jednu postavu: --who Alice',
          'Součet 20 a více u prvního inline hodu v hodu „Strength“: --text Strength && ## --total >=20',
        ],
        code: [
          '!crl new Zvuk kritu --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Selhání --natural 1 --dice 20 --commands /em selhává! \\\\ /roll 1t[Fumbles]',
          '!crl new Vypravěč --results crit fumble --speaker crl --commands /desc ${who} hodil ${result}!',
        ],
      },
      matching: {
        heading: 'Co posluchač kontroluje',
        points: [
          'Posluchač se spustí, když odpovídají všechny jeho filtry. Prázdné filtry odpovídají všemu.',
          'Šablony hodů: název šablony, např. atkdmg nebo simple. „none“ odpovídá zprávám bez šablony. Více názvů znamená kterýkoli z nich.',
          'Typy zpráv: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (listy Beacon) a api. Když je pole prázdné, kontrolují se všechny typy kromě příkazů api.',
          'Text: jedna či více částí textu oddělených &&, které se musí všechny objevit. Porovnání nerozlišuje velká a malá písmena. Text se hledá i v součtech hodů a výsledcích náhodných tabulek.',
          '## v textu zastupuje inline hod; kontroly hodu pak sledují jen hody nalezené na tomto místě. Bez ## se kontroluje každý hod ve zprávě.',
          'Text může být místo prostého textu regulární výraz (--regex on).',
          'Mluvčí / postavy: jméno zobrazené v chatu, nebo jméno postavy v šabloně hodu. Hráči: zobrazované jméno hráče.',
        ],
      },
      templates: {
        heading: 'Názvy šablon hodů',
        points: [
          'Šablona hodu je rozvržení, které list používá pro karty hodů. Její název je část za template: v makru, takže &{template:atkdmg} je šablona atkdmg. Každý list má vlastní názvy.',
          'Nejrychlejší způsob, jak název zjistit: klikněte na Prozkoumat další zprávu, hoďte z listu a přečtěte si řádek Šablona hodu, který vám CRL pošeptá.',
          'Název najdete také v makru tlačítka na listu nebo ve zdrojovém kódu listu na GitHubu, kde je každá šablona <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Šablony běžných listů:',
        ],
        colSheet: 'List',
        colNames: 'Názvy šablon',
        links: 'Více o šablonách hodů:',
        builtIn: 'Roll20: vestavěné šablony hodů',
        dnd5e2014: 'Roll20: šablony hodů D&D 5e (2014)',
        sheets: 'Zdrojový kód listů postav Roll20',
      },
      rolls: {
        heading: 'Kontroly hodu',
        points: [
          'Výsledek hodu: kritický zásah (nejvyšší stěna kostky nebo rozsah cs), kritické selhání (1 nebo rozsah cf), úspěch (aspoň jedna kostka splní cíl, např. 1d20>15), neúspěch (hod na cíl bez úspěchů). Více výsledků znamená kterýkoli z nich.',
          'Součet hodu: číslo, porovnání jako >=15, nebo rozsah jako 19-20.',
          'Přirozená kostka: stěna, na kterou kostka padla, např. 20 nebo <=2.',
          'Kontrolované kostky: auto sleduje jen d20, pokud se házela, takže kostky zranění s nejvyšší stěnou se nepočítají jako kritické zásahy. Chcete-li to změnit, zvolte Jakákoli kostka nebo velikost jako d100.',
          'Zahozené kostky (výhoda a nevýhoda) a přehozené kostky se ignorují.',
          'List D&D 5E by Roll20 (2014) hází výhodu a nevýhodu jako dva samostatné hody d20 (r1 a r2), takže CRL kontroluje oba: při výhodě se 1 na nižší kostce stále počítá jako kritické selhání a při nevýhodě se 20 na vyšší kostce stále počítá jako kritický zásah.',
          'Posluchač se spustí, když aspoň jeden hod splní všechny kontroly hodu.',
        ],
      },
      commands: {
        heading: 'Příkazy chatu',
        intro: 'Každý příkaz je jen pro GM. Posluchače lze označit jeho názvem nebo ID.',
        colCommand: 'Příkaz',
        colDesc: 'Co dělá',
      },
      options: {
        heading: 'Volby posluchače',
        intro:
          'Přidejte je k !crl new nebo !crl edit. Hodnotu vymažete tak, že ji necháte prázdnou nebo použijete -. --commands musí být poslední.',
        colOption: 'Volba',
        colDesc: 'Význam',
        templates:
          'Názvy šablon hodů oddělené mezerami. none = žádná šablona. Viz Názvy šablon hodů výše.',
        types: 'Typy zpráv oddělené mezerami: {types}.',
        text: 'Hledaný text. Části oddělte &&. ## označuje inline hod.',
        regex: 'on pro čtení textu jako regulárních výrazů, off pro prostý text.',
        who: 'Jména mluvčích nebo postav oddělená čárkami.',
        players: 'Zobrazovaná jména hráčů oddělená čárkami.',
        results: 'crit, fumble, success a/nebo fail.',
        total: 'Součet hodu: 15, >=15, <5 nebo 19-20.',
        natural: 'Stěna přirozené kostky: 20, <=2 nebo 19-20.',
        dice: 'auto, any, nebo velikost kostky jako 20.',
        cooldown: 'Počet sekund, než se posluchač může znovu spustit.',
        stop: 'on zastaví kontrolu dalších posluchačů, jakmile se tento spustí.',
        speaker: 'default, crl nebo roller.',
        enabled: 'on nebo off.',
        name: 'Přejmenuje posluchače.',
        commands: 'Příkazy ke spuštění. Řádky oddělte pomocí \\\\.',
      },
      placeholders: {
        heading: 'Zástupné symboly',
        intro: 'Tyto symboly se při spuštění posluchače nahradí v jeho příkazech.',
        colName: 'Zástupný symbol',
        colDesc: 'Nahradí se',
        who: 'Jméno zobrazené v chatu.',
        character: 'Jméno postavy ze šablony hodu, nebo jméno zobrazené v chatu.',
        player: 'Zobrazované jméno hráče.',
        template: 'Název šablony hodu.',
        total: 'Součet hodu, který odpovídal (nebo prvního hodu).',
        natural: 'Přirozená d20 (nebo první kostka) tohoto hodu.',
        result: 'crit, fumble, success nebo fail, pokud byl některý požadován.',
        expression: 'Výraz hodu, např. 1d20+5.',
        table: 'Výsledky náhodných tabulek tohoto hodu.',
        listener: 'Název posluchače.',
        field:
          'Pole šablony hodu, např. ${field:rname} (inline hody se zobrazí jako jejich součty).',
      },
      running: {
        heading: 'Jak se příkazy spouštějí',
        points: [
          'Každý řádek se odešle jako samostatná zpráva v chatu, kromě bloku {{ … }} rozloženého na více řádků (šablona hodu nebo skript ScriptCards), který zůstane pohromadě.',
          'Příkazy se odesílají jako CRL, nebo jako postava, která házela, podle nastavení posluchače nebo globálního nastavení. Jiné mody vidí příkazy odeslané CRL, jako by přišly z API.',
          'Příkazy mohou používat inline hody, šablony hodů, @{Character|attribute} a %{Character|ability}. Odkazy na vybraný token (@{selected|…}) a dotazy (?{…}) nefungují, protože není koho se zeptat.',
          'Posluchači se kontrolují postupně. Posluchač s volbou Zastavit po tomto zabrání, aby se na stejnou zprávu spustili další posluchači.',
          'Prodleva zabrání posluchači, aby se po daný počet sekund znovu spustil.',
          'CRL ignoruje své vlastní zprávy. Pokud se posluchač přesto spustí více než 20krát za 10 sekund, vypne se a GM dostane zprávu.',
        ],
      },
      inspector: {
        heading: 'Inspektor',
        points: [
          'Klikněte na Prozkoumat další zprávu a pak hoďte. CRL pošeptá, co viděl: typ zprávy, mluvčího, postavu, šablonu a její pole, každý hod s jeho kostkami, text, ve kterém posluchači hledají, a proč se který posluchač spustil či nespustil.',
          'Použijte ho ke zjištění názvu šablony listu nebo k zobrazení toho, co posílá list Beacon (např. D&D 2024).',
          'Listy Beacon posílají místo šablon hodů karty hodů. CRL je umí číst: šablonou je první třída karty (dnd-2024 pro D&D 2024), postava, titulek (např. Dexterity Check) a podkategorie se stanou poli a každý hod v rozpisu je hod, takže kontroly crit, fumble, total a natural fungují.',
        ],
      },
      settings: {
        heading: 'Nastavení',
        intro:
          'Měňte je pomocí !crl config nebo tlačítkem Nastavení. Některá lze nastavit i ve volbách One-Click modu.',
        colKey: 'Nastavení',
        colName: 'Název',
        colDesc: 'Popis',
      },
      storage: {
        heading: 'Kde jsou posluchači uloženi',
        body: 'Každý posluchač je schopnost archivované postavy „{character}“. Schopnost obsahuje příkazy, takže je můžete upravovat v deníku v plném editoru maker. Její popis obsahuje pravidla posluchače, díky čemuž posluchači přežijí i kopírování hry. Smazáním schopnosti smažete i jejího posluchače; ručně přidaná schopnost se v nabídce objeví jako vypnutá.',
      },
      upgrading: {
        heading: 'Přechod z verze 1',
        points: [
          'Posluchači z verze 1 se při prvním spuštění převedou a zachovají si své příkazy.',
          'Text obsahující jen běžné znaky se stane prostým textem a nově nerozlišuje velká a malá písmena. Text se symboly regulárních výrazů zůstane regulárním výrazem.',
          'Posluchači s výsledkem hodu, ale bez ##, dříve selhávali s chybou „not parseable“; nyní kontrolují každý hod ve zprávě.',
          'Fail nyní znamená hod na cíl bez úspěchů; hod přesně na cíl je úspěch.',
          'Příkazy verze 1 stále fungují:',
        ],
        colV1: 'Verze 1',
        colV2: 'Verze 2',
      },
      troubleshooting: {
        heading: 'Řešení problémů',
        points: [
          'Nic se neděje: ověřte, že je zapnuté Naslouchání i posluchač, a pak pomocí inspektoru zjistěte, který filtr selhává.',
          'Hody listu nejsou rozpoznány: jeden prozkoumejte; filtrujte podle názvu šablony a polí, které ukáže.',
          'Listy Beacon (např. D&D 2024) vyžadují sandbox Experimental Mod, aby mody viděly jejich hody.',
          'Příkazy s @{…} nebo %{…} o ně při psaní do !crl přijdou; upravte raději schopnost v deníku.',
          'Kostky zranění se počítají jako kritické zásahy: nastavte Kontrolované kostky na d20.',
          'Chyby se zapisují do konzole API s předponou „Customizable Roll Listener“.',
        ],
      },
      languages: {
        heading: 'Jazyky',
        body: 'Jazyk zvolte pomocí !crl config language nebo volby One-Click Language. Podporované jazyky:',
        colCode: 'Kód',
        colName: 'Jazyk',
        colNative: 'Původní název',
      },
      credits: {
        heading: 'Poděkování',
        original: 'Původní mod od',
        maintainer: 'Verze 2 od',
        support: 'Problémy hlaste na fórech Roll20 nebo v repozitáři na GitHubu.',
        wiki: 'Wiki stránka verze 1',
      },
    },
  };

  const TRANSLATION$i = {
    titles: {
      ready: 'Customizable Roll Listener er klar.',
      settings: 'CRL-indstillinger',
      languages: 'Vælg et sprog',
      help: 'CRL-kommandoer',
      confirm: 'Bekræft venligst',
      inspect: 'CRL-inspektør',
      listener: 'Lytter: {name}',
      listenerCommands: 'Kommandoer: {name}',
    },
    menu: {
      listening: 'Lytning',
      listeners: 'Lyttere (tjekkes i denne rækkefølge)',
      noListeners: 'Ingen lyttere endnu. Klik på Ny lytter for at oprette en.',
      noCommands: 'Ingen kommandoer endnu.',
      commandsHint:
        'Adskil linjer med \\\\, når du skriver kommandoer i chatten. Til @{...}- eller %{...}-referencer skal du i stedet redigere evnen i Journal, fordi chatten erstatter dem, før CRL ser dem.',
    },
    buttons: {
      back: 'Tilbage',
      change: 'Skift',
      confirmDelete: 'Ja, slet den',
      delete: 'Slet',
      edit: 'Rediger',
      help: 'Hjælp',
      inspect: 'Inspicér næste besked',
      inspectOff: 'Stop inspektion',
      new: 'Ny lytter',
      openJournal: 'Åbn i Journal',
      rebuildJournal: 'Genopbyg handouts',
      rename: 'Omdøb',
      setCommands: 'Angiv kommandoer',
      settings: 'Indstillinger',
      test: 'Test',
      enable: 'Slå til',
      disable: 'Slå fra',
      menu: 'Lyttere',
      turnOn: 'Lytning til',
      turnOff: 'Lytning fra',
    },
    prompts: {
      newName: 'Navn på den nye lytter',
      name: 'Nyt navn',
      target: 'Lytterens navn',
      commands: 'Kommandoer – adskil linjer med to omvendte skråstreger',
      templates:
        'Slagskabeloner adskilt af mellemrum – none for ingen skabelon – tom for alle – Inspicér viser et slags skabelon',
      types: 'Beskedtyper adskilt af mellemrum – tom for alle undtagen api',
      text: 'Tekst at søge efter – se Hjælp-handoutet – tom for alle',
      regex: 'Hvordan teksten skal læses',
      who: 'Navne på talere eller figurer adskilt af kommaer – tom for alle',
      players: 'Spillernavne adskilt af kommaer – tom for alle',
      results: 'Slagresultat',
      total: 'Slagtotal som 15 eller 19-20 – se Hjælp-handoutet – tom for alle',
      natural: 'Naturligt terningresultat som 20 eller 1-2 – tom for alle',
      dice: 'Hvilke terninger tjekkene ser på',
      cooldown: 'Sekunder før den kan udløses igen – 0 for ingen',
      speaker: 'Send kommandoer som',
    },
    choices: {
      critOrFumble: 'Kritisk eller fumle',
    },
    values: {
      on: 'Til',
      off: 'Fra',
      none: 'Ingen',
      any: 'Alle',
      allButApi: 'Alle (ikke API-kommandoer)',
      plain: 'Almindelig tekst',
      regex: 'Regulært udtryk',
      diceAuto: 'Auto (d20’ere hvis slået)',
      diceAny: 'Enhver terning',
      seconds: '{seconds} s',
      speaker: {
        default: 'Standardindstilling',
        crl: 'CRL',
        roller: 'Den der slog',
      },
    },
    results: {
      crit: 'Kritisk',
      fumble: 'Fumle',
      success: 'Succes',
      fail: 'Fiasko',
    },
    fields: {
      enabled: 'Til',
      templates: 'Slagskabeloner',
      types: 'Beskedtyper',
      text: 'Tekst',
      regex: 'Teksten er',
      who: 'Talere / figurer',
      players: 'Spillere',
      results: 'Slagresultat',
      total: 'Slagtotal',
      natural: 'Naturlig terning',
      dice: 'Tjekkede terninger',
      cooldown: 'Ventetid',
      stop: 'Stop efter denne',
      speaker: 'Send som',
      commands: 'Kommandoer',
    },
    settings: {
      enabled: {
        label: 'Lytning',
        desc: 'Slår alle lyttere til eller fra på én gang.',
      },
      speaker: {
        label: 'Send kommandoer som',
        desc: 'Hvem lytterkommandoer sendes som, medmindre en lytter siger andet: CRL eller den figur (eller spiller), hvis besked udløste den.',
      },
      listenToMods: {
        label: 'Lyt til andre mods',
        desc: 'Om chatbeskeder fra andre mods kan udløse lyttere. CRL reagerer aldrig på sine egne beskeder.',
      },
      language: {
        label: 'Sprog',
        desc: 'Sprog for menuer, beskeder og handouts.',
      },
    },
    inspect: {
      type: 'Type',
      who: 'Taler',
      character: 'Figur',
      player: 'Spiller',
      template: 'Slagskabelon',
      keys: 'Beskedegenskaber',
      extras: 'Ekstra beskeddata',
      fields: 'Skabelonfelter',
      rolls: 'Slag',
      dice: 'terninger',
      table: 'tabel',
      target: 'har et succesmål',
      crit: 'krit',
      fumble: 'fumle',
      text: 'Tekst (som lyttere læser den)',
      raw: 'Råt indhold',
      listeners: 'Lyttere',
      matched: 'ville udløse {result}',
      reasons: {
        disabled: 'slået fra',
        type: 'beskedtypen passer ikke',
        template: 'slagskabelonen passer ikke',
        who: 'taler eller figur passer ikke',
        player: 'spilleren passer ikke',
        text: 'teksten blev ikke fundet',
        roll: 'intet slag opfylder slagbetingelserne',
      },
    },
    messages: {
      upgraded:
        'Opgraderet fra version 1. {count} lytter(e) blev konverteret, og deres kommandoer er bevaret.',
      restored: 'Gendannede {count} lytter(e) fra lagerfiguren.',
      adopted:
        'Fandt {count} evne(r) på lagerfiguren uden lytterregler. De er tilføjet slået fra; opsæt dem fra menuen.',
      removed: 'Fjernede {count} lytter(e), hvis evne var slettet.',
      listeningOff: 'Lytning er slået fra. Skriv !crl on for at slå den til.',
      readyHint: '{count} lytter(e). Skriv !crl for menuen eller !crl help for alle kommandoer.',
      loopStopped:
        'Lytteren "{name}" blev udløst for ofte på kort tid, sandsynligvis fordi dens kommandoer udløser den igen, så den er slået fra.',
      noCommands: 'Lytteren "{name}" har ingen kommandoer at køre.',
      tested: 'Kørte kommandoerne for "{name}" ({count} besked(er)).',
      confirmDelete: 'Slet lytteren "{name}" og dens kommandoer? Dette kan ikke fortrydes.',
      deleted: 'Slettede lytteren "{name}".',
      inspectOn: 'Den næste chatbesked bliver inspiceret, og resultatet hvisket til dig.',
      inspectOff: 'Inspektøren er slået fra.',
      journalRebuilt: 'Genopbyggede handoutsene "{help}" og "{deck}".',
    },
    errors: {
      gmOnly: 'Kun en GM kan bruge Customizable Roll Listener-kommandoer.',
      unexpected: 'Noget gik galt: {message}',
      unknownCommand: 'Ukendt kommando "{command}".',
      badOption: 'Ukendt valgmulighed --{option}.',
      notFound: 'Der er ingen lytter ved navn "{name}".',
      nameRequired: 'Angiv venligst et lytternavn.',
      nameInvalid: 'Navnet "{name}" kan ikke bruges.',
      nameTaken: 'Der findes allerede en lytter ved navn "{name}".',
      badOnOff: 'Værdien "{value}" er ikke gyldig for --{option}.',
      badType: 'Ukendt(e) beskedtype(r): {value}.',
      badRegex: 'Det regulære udtryk "{term}" er ikke gyldigt: {error}',
      tooManyTerms: 'En lytter kan højst søge efter {max} tekststykker.',
      badResult: 'Ukendt(e) slagresultat(er): {value}.',
      badComparison: 'Værdien "{value}" er ikke gyldig for --{option}.',
      badDice: 'Værdien "{value}" er ikke gyldig for --dice.',
      badCooldown: 'Værdien "{value}" er ikke gyldig for --cooldown.',
      badSpeaker: 'Værdien "{value}" er ikke gyldig for --speaker.',
      noStore: 'Lagerfiguren kunne ikke oprettes.',
      badSetting: 'Ukendt indstilling "{key}".',
      badSettingValue: 'Værdien "{value}" er ikke gyldig for {key}.',
    },
    hints: {
      gmOnly: 'Bed din GM om at opsætte lyttere for dig.',
      unknownCommand: 'Skriv !crl help for at se alle kommandoer.',
      badOption:
        'Valgmulighederne er --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name og --commands.',
      notFound: 'Skriv !crl for at se listen over lyttere.',
      nameInvalid:
        'Brug op til {max} tegn, uden disse: | { } [ ] \\ @ % # ? ~ eller "--", og start ikke med "-".',
      badOnOff: 'Brug on eller off.',
      badType: 'Beskedtyper er: {types}.',
      badResult: 'Brug crit, fumble, success eller fail.',
      badComparison:
        'Brug et tal, en sammenligning som >=15 eller <3, eller et interval som 19-20.',
      badDice: 'Brug auto, any eller en terningstørrelse som 20 eller d20.',
      badCooldown: 'Brug et helt antal sekunder fra 0 til 3600.',
      badSpeaker: 'Brug default, crl eller roller.',
      badSetting: 'Indstillinger er: {keys}.',
      noStore: 'Tjek API-konsollen for fejl, og genstart derefter sandboxen.',
    },
    help: {
      menu: 'Vis listen over lyttere.',
      new: 'Opret en lytter. Valgmuligheder kan tilføjes med det samme.',
      show: 'Vis en lytter og dens indstillinger med knapper til at ændre dem.',
      edit: 'Ændr en lytter. Lad en værdi være tom (eller brug -) for at rydde den.',
      commands: 'Erstat en lytters kommandoer. Alt efter --commands bruges, så sæt det sidst.',
      enable: 'Slå en lytter til eller fra.',
      move: 'Flyt en lytter frem eller tilbage i den rækkefølge, lyttere tjekkes i.',
      test: 'Kør en lytters kommandoer nu, som om der var slået en naturlig 20.',
      delete: 'Slet en lytter og dens kommandoer (spørger først).',
      inspect: 'Hvisk en gennemgang af den næste chatbesked, og hvilke lyttere den ville udløse.',
      inspectOff: 'Stop med at vente på en besked at inspicere.',
      onOff: 'Slå al lytning til eller fra.',
      config: 'Vis eller ændr de globale indstillinger.',
      journal: 'Genopbyg handoutsene Hjælp og Kommandopanel.',
      help: 'Vis denne liste.',
      optionsTitle: 'Valgmuligheder',
      options:
        'Valgmuligheder: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name og --commands. Navne kan bruges i stedet for ID’er.',
      placeholders:
        'Kommandoer kan bruge ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} og ${field:name}.',
      handouts: 'Handoutet "{help}" forklarer alt; handoutet "{deck}" har knapper.',
    },
    store: {
      bio: 'Denne figur tilhører modden Customizable Roll Listener. Hver evne er én lytter: evnen indeholder kommandoerne, der skal køres, og dens beskrivelse indeholder lytterens regler.',
      bioHelp:
        'Du kan redigere kommandoerne her. Ændr reglerne med !crl eller fra handoutet Kommandopanel. Sletter du en evne, slettes dens lytter.',
    },
    deck: {
      subtitle: 'Kommandopanel',
      listeners: 'Lyttere',
      listenersDesc: 'Se, opret, ændr og test lyttere.',
      listening: 'Lytning',
      listeningDesc: 'Slå alle lyttere til eller fra på én gang.',
      tools: 'Værktøjer',
      toolsDesc: 'Inspicér en chatbesked, ændr indstillinger, genopbyg handouts eller læs hjælpen.',
      footer: 'Alle kommandoer er kun for GM. Se handoutet "{help}" for detaljer.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hør terningerne, hør handlingen',
      footer: 'Knapper til alle kommandoer findes i handoutet "{deck}".',
      overview: {
        heading: 'Overblik',
        body: 'Customizable Roll Listener (CRL) holder øje med chatten og kører kommandoer efter dit valg, når en besked matcher en lytter. En lytter kan se på slagskabelonen, teksten, hvem der sendte beskeden, og slagene i den: kritiske slag, fumler, succeser, fiaskoer, totaler og naturlige terningresultater. Kommandoer kan være alt, hvad du kunne skrive i chatten, også andre mods’ kommandoer, så CRL kan afspille lyde, slå på tabeller, sende emotes, sætte statusmarkører og meget mere.',
      },
      quickStart: {
        heading: 'Hurtig start',
        steps: [
          'Skriv !crl i chatten (eller klik på Lyttere i handoutet Kommandopanel).',
          'Klik på Ny lytter, og giv den et navn, f.eks. Kritlyd.',
          'Klik på Skift ud for Slagresultat, og vælg Kritisk.',
          'Klik på Angiv kommandoer, og skriv, hvad der skal køres, f.eks. !roll20AM --audio,play|Crit.',
          'Klik på Test for at tjekke kommandoerne, og slå derefter et angreb. Brug Inspicér næste besked, hvis den ikke udløses.',
        ],
      },
      examples: {
        heading: 'Eksempler',
        points: [
          'Lyd ved ethvert kritisk slag fra ethvert ark: --results crit',
          'Fumletabel ved en naturlig 1 i angrebsskabelonen til D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reagér på et resultat fra en slagtabel: --text Combat',
          'Kun for én figur: --who Alice',
          'En total på 20 eller mere på det første inline-slag i et "Strength"-slag: --text Strength && ## --total >=20',
        ],
        code: [
          '!crl new Kritlyd --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Fumle --natural 1 --dice 20 --commands /em fumler! \\\\ /roll 1t[Fumbles]',
          '!crl new Fortæller --results crit fumble --speaker crl --commands /desc ${who} slog ${result}!',
        ],
      },
      matching: {
        heading: 'Hvad en lytter tjekker',
        points: [
          'En lytter udløses, når alle dens filtre matcher. Tomme filtre matcher alt.',
          'Slagskabeloner: skabelonens navn, f.eks. atkdmg eller simple. "none" matcher beskeder uden skabelon. Flere navne betyder et hvilket som helst af dem.',
          'Beskedtyper: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon-ark) og api. Når feltet er tomt, tjekkes alle typer undtagen api-kommandoer.',
          'Tekst: et eller flere tekststykker, adskilt af &&, som alle skal forekomme. Der skelnes ikke mellem store og små bogstaver. Tekst findes også i slagtotaler og resultater fra slagtabeller.',
          '## i teksten står for et inline-slag; slagtjekkene ser så kun på de slag, der findes dér. Uden ## tjekkes alle slag i beskeden.',
          'Teksten kan være et regulært udtryk i stedet for almindelig tekst (--regex on).',
          'Talere / figurer: navnet vist i chatten eller figurnavnet i slagskabelonen. Spillere: spillerens visningsnavn.',
        ],
      },
      templates: {
        heading: 'Navne på slagskabeloner',
        points: [
          'En slagskabelon er det layout, et ark bruger til sine slagkort. Dens navn er delen efter template: i en makro, så &{template:atkdmg} er skabelonen atkdmg. Hvert ark har sine egne navne.',
          'Den hurtigste måde at finde et navn på: klik på Inspicér næste besked, slå slaget fra arket, og læs linjen Slagskabelon, som CRL hvisker tilbage.',
          'Du kan også læse navnet i makroen bag en knap på arket eller i arkets kildekode på GitHub, hvor hver skabelon er en <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Skabeloner for almindelige ark:',
        ],
        colSheet: 'Ark',
        colNames: 'Skabelonnavne',
        links: 'Mere om slagskabeloner:',
        builtIn: 'Roll20: indbyggede slagskabeloner',
        dnd5e2014: 'Roll20: slagskabeloner til D&D 5e (2014)',
        sheets: 'Kildekode til Roll20-figurark',
      },
      rolls: {
        heading: 'Slagtjek',
        points: [
          'Slagresultat: kritisk (terningens højeste side eller cs-intervallet), fumle (en 1’er eller cf-intervallet), succes (mindst én terning når et mål som 1d20>15), fiasko (et slag mod et mål uden succeser). Flere resultater betyder et hvilket som helst af dem.',
          'Slagtotal: et tal, en sammenligning som >=15 eller et interval som 19-20.',
          'Naturlig terning: den side, en terning landede på, f.eks. 20 eller <=2.',
          'Tjekkede terninger: auto ser kun på d20’ere, når der blev slået en, så skadesterninger, der slår deres højeste side, tæller ikke som kritiske slag. Vælg Enhver terning eller en størrelse som d100 for at ændre det.',
          'Fravalgte terninger (fordel og ulempe) og omslåede terninger ignoreres.',
          'Arket D&D 5E by Roll20 (2014) slår fordel og ulempe som to separate d20-slag (r1 og r2), så CRL tjekker begge: med fordel tæller en 1’er på den laveste terning stadig som fumle, og med ulempe tæller en 20 på den højeste terning stadig som kritisk.',
          'En lytter udløses, når mindst ét slag opfylder alle slagtjek.',
        ],
      },
      commands: {
        heading: 'Chatkommandoer',
        intro: 'Alle kommandoer er kun for GM. En lytter kan angives med sit navn eller sit ID.',
        colCommand: 'Kommando',
        colDesc: 'Hvad den gør',
      },
      options: {
        heading: 'Lytterindstillinger',
        intro:
          'Tilføj disse til !crl new eller !crl edit. Lad en værdi være tom, eller brug -, for at rydde den. --commands skal komme sidst.',
        colOption: 'Valgmulighed',
        colDesc: 'Betydning',
        templates:
          'Navne på slagskabeloner adskilt af mellemrum. none = ingen skabelon. Se Navne på slagskabeloner ovenfor.',
        types: 'Beskedtyper adskilt af mellemrum: {types}.',
        text: 'Tekst at finde. Adskil stykker med &&. ## markerer et inline-slag.',
        regex: 'on for at læse teksten som regulære udtryk, off for almindelig tekst.',
        who: 'Navne på talere eller figurer adskilt af kommaer.',
        players: 'Spilleres visningsnavne adskilt af kommaer.',
        results: 'crit, fumble, success og/eller fail.',
        total: 'Slagtotal: 15, >=15, <5 eller 19-20.',
        natural: 'Naturlig terningside: 20, <=2 eller 19-20.',
        dice: 'auto, any eller en terningstørrelse som 20.',
        cooldown: 'Sekunder, før lytteren kan udløses igen.',
        stop: 'on for at stoppe tjek af senere lyttere, når denne udløses.',
        speaker: 'default, crl eller roller.',
        enabled: 'on eller off.',
        name: 'Omdøber lytteren.',
        commands: 'Kommandoerne, der skal køres. Adskil linjer med \\\\.',
      },
      placeholders: {
        heading: 'Pladsholdere',
        intro: 'Disse erstattes i en lytters kommandoer, når den udløses.',
        colName: 'Pladsholder',
        colDesc: 'Erstattes med',
        who: 'Navnet vist i chatten.',
        character: 'Figurnavnet fra slagskabelonen eller navnet vist i chatten.',
        player: 'Spillerens visningsnavn.',
        template: 'Slagskabelonens navn.',
        total: 'Totalen af det slag, der matchede (eller det første slag).',
        natural: 'Den naturlige d20 (eller første terning) i det slag.',
        result: 'crit, fumble, success eller fail, når der blev bedt om et.',
        expression: 'Slagudtrykket, f.eks. 1d20+5.',
        table: 'Slagtabelresultater fra det slag.',
        listener: 'Lytterens navn.',
        field:
          'Et felt i slagskabelonen, f.eks. ${field:rname} (inline-slag vises som deres totaler).',
      },
      running: {
        heading: 'Sådan køres kommandoer',
        points: [
          'Hver linje sendes som sin egen chatbesked, bortset fra at en {{ … }}-blok fordelt over flere linjer (en slagskabelon eller et ScriptCards-script) holdes samlet.',
          'Kommandoer sendes som CRL eller som den figur, der slog, alt efter hvad der er valgt for lytteren eller i indstillingerne. Andre mods ser kommandoer sendt af CRL, som om de kommer fra API’et.',
          'Kommandoer kan bruge inline-slag, slagskabeloner, @{Character|attribute} og %{Character|ability}. Referencer til valgt token (@{selected|…}) og forespørgsler (?{…}) virker ikke, fordi der ikke er nogen at spørge.',
          'Lyttere tjekkes i rækkefølge. En lytter med Stop efter denne forhindrer senere lyttere i at blive udløst af den samme besked.',
          'En ventetid forhindrer en lytter i at blive udløst igen i så mange sekunder.',
          'CRL ignorerer sine egne beskeder. Hvis en lytter alligevel udløses mere end 20 gange på 10 sekunder, slås den fra, og GM’en får besked.',
        ],
      },
      inspector: {
        heading: 'Inspektøren',
        points: [
          'Klik på Inspicér næste besked, og slå så slaget. CRL hvisker, hvad den så: beskedtypen, taleren, figuren, skabelonen og dens felter, hvert slag med dets terninger, teksten som lyttere søger i, og hvorfor hver lytter blev eller ikke blev udløst.',
          'Brug den til at finde et arks skabelonnavn eller til at se, hvad et Beacon-ark (f.eks. D&D 2024) sender.',
          'Beacon-ark sender slagkort i stedet for slagskabeloner. CRL læser dem: skabelonen er kortets første klasse (dnd-2024 for D&D 2024), figuren, titlen (f.eks. Dexterity Check) og underkategorien bliver til felter, og hvert slag i opgørelsen er et slag, så crit-, fumble-, total- og natural-tjek virker.',
        ],
      },
      settings: {
        heading: 'Indstillinger',
        intro:
          'Ændr dem med !crl config eller knappen Indstillinger. Nogle kan også sættes i moddens One-Click-indstillinger.',
        colKey: 'Indstilling',
        colName: 'Navn',
        colDesc: 'Beskrivelse',
      },
      storage: {
        heading: 'Hvor lyttere gemmes',
        body: 'Hver lytter er en evne på den arkiverede figur "{character}". Evnen indeholder kommandoerne, så du kan redigere dem i Journal med den fulde makroeditor. Dens beskrivelse indeholder lytterens regler, hvilket også gør, at lyttere overlever, når spillet kopieres. Sletter du en evne, slettes dens lytter; en evne tilføjet i hånden vises i menuen som slået fra.',
      },
      upgrading: {
        heading: 'Opgradering fra version 1',
        points: [
          'Lyttere fra version 1 konverteres ved første start og beholder deres kommandoer.',
          'Tekst med kun almindelige tegn bliver almindelig tekst og skelner nu ikke mellem store og små bogstaver. Tekst med symboler fra regulære udtryk forbliver et regulært udtryk.',
          'Lyttere med et slagresultat men uden ## fejlede tidligere med "not parseable"; nu tjekker de alle slag i beskeden.',
          'Fail betyder nu et slag mod et mål uden succeser; et slag præcis på målet er en succes.',
          'Kommandoerne fra version 1 virker stadig:',
        ],
        colV1: 'Version 1',
        colV2: 'Version 2',
      },
      troubleshooting: {
        heading: 'Fejlfinding',
        points: [
          'Der sker intet: tjek, at Lytning er slået til, og at lytteren er slået til, og brug derefter inspektøren til at se, hvilket filter der fejler.',
          'Et arks slag genkendes ikke: inspicér et; skabelonnavnet og felterne, der vises, er dem, du skal filtrere på.',
          'Beacon-ark (f.eks. D&D 2024) kræver sandboxen Experimental Mod, for at mods kan se deres slag.',
          'Kommandoer, der bruger @{…} eller %{…}, mister dem, når de skrives i !crl; rediger i stedet evnen i Journal.',
          'Skadesterninger tælles som kritiske slag: sæt Tjekkede terninger til d20.',
          'Fejl skrives til API-konsollen med præfikset "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Sprog',
        body: 'Vælg et sprog med !crl config language eller One-Click-indstillingen Language. Understøttede sprog:',
        colCode: 'Kode',
        colName: 'Sprog',
        colNative: 'Oprindeligt navn',
      },
      credits: {
        heading: 'Tak til',
        original: 'Oprindelig mod af',
        maintainer: 'Version 2 af',
        support: 'Rapportér problemer på Roll20-forummet eller i GitHub-repositoriet.',
        wiki: 'Wikiside for version 1',
      },
    },
  };

  const TRANSLATION$h = {
    titles: {
      ready: 'Customizable Roll Listener is klaar.',
      settings: 'CRL-instellingen',
      languages: 'Kies een taal',
      help: 'CRL-commando’s',
      confirm: 'Graag bevestigen',
      inspect: 'CRL-inspecteur',
      listener: 'Luisteraar: {name}',
      listenerCommands: 'Commando’s: {name}',
    },
    menu: {
      listening: 'Luisteren',
      listeners: 'Luisteraars (in deze volgorde gecontroleerd)',
      noListeners: 'Nog geen luisteraars. Klik op Nieuwe luisteraar om er een te maken.',
      noCommands: 'Nog geen commando’s.',
      commandsHint:
        'Scheid regels met \\\\ als je commando’s in de chat typt. Bewerk voor @{...}- of %{...}-verwijzingen liever de vaardigheid in het Journal, want de chat vervangt ze voordat CRL ze ziet.',
    },
    buttons: {
      back: 'Terug',
      change: 'Wijzigen',
      confirmDelete: 'Ja, verwijderen',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      help: 'Hulp',
      inspect: 'Volgend bericht inspecteren',
      inspectOff: 'Inspectie stoppen',
      new: 'Nieuwe luisteraar',
      openJournal: 'Openen in Journal',
      rebuildJournal: 'Handouts opnieuw maken',
      rename: 'Hernoemen',
      setCommands: 'Commando’s instellen',
      settings: 'Instellingen',
      test: 'Testen',
      enable: 'Aanzetten',
      disable: 'Uitzetten',
      menu: 'Luisteraars',
      turnOn: 'Luisteren aan',
      turnOff: 'Luisteren uit',
    },
    prompts: {
      newName: 'Naam voor de nieuwe luisteraar',
      name: 'Nieuwe naam',
      target: 'Naam van de luisteraar',
      commands: 'Commando’s - scheid regels met twee backslashes',
      templates:
        'Rolsjablonen gescheiden door spaties - none voor geen sjabloon - leeg voor alle - Inspecteren toont het sjabloon van een worp',
      types: 'Berichttypen gescheiden door spaties - leeg voor alle behalve api',
      text: 'Te zoeken tekst - zie de Help-handout - leeg voor alle',
      regex: 'Hoe de tekst gelezen wordt',
      who: 'Namen van sprekers of personages gescheiden door komma’s - leeg voor iedereen',
      players: 'Spelersnamen gescheiden door komma’s - leeg voor iedereen',
      results: 'Worpresultaat',
      total: 'Worptotaal zoals 15 of 19-20 - zie de Help-handout - leeg voor alle',
      natural: 'Natuurlijke worp zoals 20 of 1-2 - leeg voor alle',
      dice: 'Naar welke dobbelstenen de controles kijken',
      cooldown: 'Seconden wachten voordat hij opnieuw activeert - 0 voor geen',
      speaker: 'Commando’s sturen als',
    },

    choices: {
      critOrFumble: 'Kritiek of blunder',
    },
    values: {
      on: 'Aan',
      off: 'Uit',
      none: 'Geen',
      any: 'Alle',
      allButApi: 'Alle (geen API-commando’s)',
      plain: 'Platte tekst',
      regex: 'Reguliere expressie',
      diceAuto: 'Auto (d20’s indien gegooid)',
      diceAny: 'Elke dobbelsteen',
      seconds: '{seconds} s',
      speaker: {
        default: 'Standaardinstelling',
        crl: 'CRL',
        roller: 'De werper',
      },
    },
    results: {
      crit: 'Kritiek',
      fumble: 'Blunder',
      success: 'Succes',
      fail: 'Mislukt',
    },
    fields: {
      enabled: 'Aan',
      templates: 'Rolsjablonen',
      types: 'Berichttypen',
      text: 'Tekst',
      regex: 'Tekst is',
      who: 'Sprekers / personages',
      players: 'Spelers',
      results: 'Worpresultaat',
      total: 'Worptotaal',
      natural: 'Natuurlijke worp',
      dice: 'Gecontroleerde dobbelstenen',
      cooldown: 'Afkoeltijd',
      stop: 'Hierna stoppen',
      speaker: 'Sturen als',
      commands: 'Commando’s',
    },
    settings: {
      enabled: {
        label: 'Luisteren',
        desc: 'Zet alle luisteraars tegelijk aan of uit.',
      },
      speaker: {
        label: 'Commando’s sturen als',
        desc: 'Als wie de commando’s van luisteraars worden gestuurd, tenzij een luisteraar iets anders zegt: CRL, of het personage (of de speler) wiens bericht hem activeerde.',
      },
      listenToMods: {
        label: 'Luisteren naar andere mods',
        desc: 'Of chatberichten van andere mods luisteraars kunnen activeren. CRL reageert nooit op zijn eigen berichten.',
      },
      language: {
        label: 'Taal',
        desc: 'Taal voor menu’s, berichten en handouts.',
      },
    },
    inspect: {
      type: 'Soort',
      who: 'Spreker',
      character: 'Personage',
      player: 'Speler',
      template: 'Rolsjabloon',
      keys: 'Berichteigenschappen',
      extras: 'Extra berichtgegevens',
      fields: 'Sjabloonvelden',
      rolls: 'Worpen',
      dice: 'dobbelstenen',
      table: 'tabel',
      target: 'heeft een succesdoel',
      crit: 'kritiek',
      fumble: 'blunder',
      text: 'Tekst (zoals luisteraars hem lezen)',
      raw: 'Ruwe inhoud',
      listeners: 'Luisteraars',
      matched: 'zou activeren: {result}',
      reasons: {
        disabled: 'uitgeschakeld',
        type: 'berichttype komt niet overeen',
        template: 'rolsjabloon komt niet overeen',
        who: 'spreker of personage komt niet overeen',
        player: 'speler komt niet overeen',
        text: 'tekst niet gevonden',
        roll: 'geen worp voldoet aan de worpvoorwaarden',
      },
    },
    messages: {
      upgraded:
        'Bijgewerkt vanaf versie 1. {count} luisteraar(s) omgezet, met behoud van hun commando’s.',
      restored: '{count} luisteraar(s) hersteld vanuit het opslagpersonage.',
      adopted:
        '{count} vaardigheid/vaardigheden zonder luisteraarregels gevonden op het opslagpersonage. Ze zijn uitgeschakeld toegevoegd; stel ze in via het menu.',
      removed: '{count} luisteraar(s) verwijderd waarvan de vaardigheid was gewist.',
      listeningOff: 'Luisteren is uitgeschakeld. Typ !crl on om het aan te zetten.',
      readyHint: '{count} luisteraar(s). Typ !crl voor het menu of !crl help voor alle commando’s.',
      loopStopped:
        'De luisteraar "{name}" werd in korte tijd te vaak geactiveerd, waarschijnlijk omdat zijn commando’s hem opnieuw activeren, en is daarom uitgeschakeld.',
      noCommands: 'De luisteraar "{name}" heeft geen commando’s om uit te voeren.',
      tested: 'Commando’s van "{name}" uitgevoerd ({count} bericht(en)).',
      confirmDelete:
        'De luisteraar "{name}" en zijn commando’s verwijderen? Dit kan niet ongedaan worden gemaakt.',
      deleted: 'Luisteraar "{name}" verwijderd.',
      inspectOn:
        'Het volgende chatbericht wordt geïnspecteerd en het resultaat wordt naar je gefluisterd.',
      inspectOff: 'De inspecteur is uitgeschakeld.',
      journalRebuilt: 'De handouts "{help}" en "{deck}" zijn opnieuw gemaakt.',
    },
    errors: {
      gmOnly: 'Alleen een GM kan de commando’s van Customizable Roll Listener gebruiken.',
      unexpected: 'Er ging iets mis: {message}',
      unknownCommand: 'Onbekend commando "{command}".',
      badOption: 'Onbekende optie --{option}.',
      notFound: 'Er is geen luisteraar met de naam "{name}".',
      nameRequired: 'Geef een naam voor de luisteraar op.',
      nameInvalid: 'De naam "{name}" kan niet worden gebruikt.',
      nameTaken: 'Er is al een luisteraar met de naam "{name}".',
      badOnOff: 'De waarde "{value}" is ongeldig voor --{option}.',
      badType: 'Onbekende berichttype(n): {value}.',
      badRegex: 'De reguliere expressie "{term}" is ongeldig: {error}',
      tooManyTerms: 'Een luisteraar kan naar hoogstens {max} tekststukken zoeken.',
      badResult: 'Onbekende worpresultaten: {value}.',
      badComparison: 'De waarde "{value}" is ongeldig voor --{option}.',
      badDice: 'De waarde "{value}" is ongeldig voor --dice.',
      badCooldown: 'De waarde "{value}" is ongeldig voor --cooldown.',
      badSpeaker: 'De waarde "{value}" is ongeldig voor --speaker.',
      noStore: 'Het opslagpersonage kon niet worden aangemaakt.',
      badSetting: 'Onbekende instelling "{key}".',
      badSettingValue: 'De waarde "{value}" is ongeldig voor {key}.',
    },
    hints: {
      gmOnly: 'Vraag je GM om luisteraars voor je in te stellen.',
      unknownCommand: 'Typ !crl help om alle commando’s te zien.',
      badOption:
        'Opties zijn --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name en --commands.',
      notFound: 'Typ !crl om de lijst met luisteraars te zien.',
      nameInvalid:
        'Gebruik maximaal {max} tekens, zonder deze: | { } [ ] \\ @ % # ? ~ of "--", en begin niet met "-".',
      badOnOff: 'Gebruik on of off.',
      badType: 'Berichttypen zijn: {types}.',
      badResult: 'Gebruik crit, fumble, success of fail.',
      badComparison:
        'Gebruik een getal, een vergelijking zoals >=15 of <3, of een bereik zoals 19-20.',
      badDice: 'Gebruik auto, any, of een dobbelsteengrootte zoals 20 of d20.',
      badCooldown: 'Gebruik een geheel aantal seconden van 0 tot 3600.',
      badSpeaker: 'Gebruik default, crl of roller.',
      badSetting: 'Instellingen zijn: {keys}.',
      noStore: 'Controleer de API-console op fouten en herstart daarna de sandbox.',
    },
    help: {
      menu: 'Toon de lijst met luisteraars.',
      new: 'Maak een luisteraar. Opties kunnen meteen worden toegevoegd.',
      show: 'Toon een luisteraar en zijn instellingen, met knoppen om ze te wijzigen.',
      edit: 'Wijzig een luisteraar. Laat een waarde leeg (of gebruik -) om haar te wissen.',
      commands:
        'Vervang de commando’s van een luisteraar. Alles na --commands wordt gebruikt, dus zet het als laatste.',
      enable: 'Zet een luisteraar aan of uit.',
      move: 'Verplaats een luisteraar naar voren of naar achteren in de volgorde waarin luisteraars worden gecontroleerd.',
      test: 'Voer de commando’s van een luisteraar nu uit, alsof er een natuurlijke 20 is gegooid.',
      delete: 'Verwijder een luisteraar en zijn commando’s (vraagt eerst).',
      inspect:
        'Fluister een analyse van het volgende chatbericht en welke luisteraars het zou activeren.',
      inspectOff: 'Stop met wachten op een bericht om te inspecteren.',
      onOff: 'Zet al het luisteren aan of uit.',
      config: 'Toon of wijzig de algemene instellingen.',
      journal: 'Maak de handouts Help en Command Deck opnieuw.',
      help: 'Toon deze lijst.',
      optionsTitle: 'Opties',
      options:
        'Opties: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name en --commands. Namen mogen in plaats van ID’s worden gebruikt.',
      placeholders:
        'Commando’s kunnen ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} en ${field:name} gebruiken.',
      handouts: 'De handout "{help}" legt alles uit; de handout "{deck}" heeft knoppen.',
    },
    store: {
      bio: 'Dit personage hoort bij de mod Customizable Roll Listener. Elke vaardigheid is één luisteraar: de vaardigheid bevat de uit te voeren commando’s en haar beschrijving bevat de regels van de luisteraar.',
      bioHelp:
        'Je kunt de commando’s hier bewerken. Wijzig de regels met !crl of via de handout Command Deck. Een vaardigheid verwijderen verwijdert ook haar luisteraar.',
    },
    deck: {
      subtitle: 'Commandopaneel',
      listeners: 'Luisteraars',
      listenersDesc: 'Bekijk, maak, wijzig en test luisteraars.',
      listening: 'Luisteren',
      listeningDesc: 'Zet alle luisteraars tegelijk aan of uit.',
      tools: 'Hulpmiddelen',
      toolsDesc:
        'Inspecteer een chatbericht, wijzig instellingen, maak de handouts opnieuw of lees de hulp.',
      footer: 'Alle commando’s zijn alleen voor de GM. Zie de handout "{help}" voor details.',
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'Hoor de dobbelstenen, hoor de actie',
      footer: 'Knoppen voor alle commando’s staan in de handout "{deck}".',
      overview: {
        heading: 'Overzicht',
        body: 'Customizable Roll Listener (CRL) houdt de chat in de gaten en voert commando’s naar keuze uit wanneer een bericht overeenkomt met een luisteraar. Een luisteraar kan kijken naar het rolsjabloon, de tekst, wie het bericht stuurde en de worpen erin: kritieke treffers, blunders, successen, mislukkingen, totalen en natuurlijke worpen. Commando’s kunnen alles zijn wat je in de chat kunt typen, ook commando’s van andere mods, dus CRL kan geluiden afspelen, op tabellen gooien, emotes plaatsen, statusmarkeringen toepassen en meer.',
      },
      quickStart: {
        heading: 'Snelstart',
        steps: [
          'Typ !crl in de chat (of klik op Luisteraars in de handout Command Deck).',
          'Klik op Nieuwe luisteraar en geef hem een naam, zoals Crit Sound.',
          'Klik op Wijzigen naast Worpresultaat en kies Kritiek.',
          'Klik op Commando’s instellen en voer in wat er moet gebeuren, bijvoorbeeld !roll20AM --audio,play|Crit.',
          'Klik op Testen om de commando’s te controleren en gooi dan een aanval. Gebruik Volgend bericht inspecteren als hij niet activeert.',
        ],
      },
      examples: {
        heading: 'Voorbeelden',
        points: [
          'Geluid bij elke kritieke treffer, van elk sheet: --results crit',
          'Blundertabel bij een natuurlijke 1 in het aanvalssjabloon van D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reageren op een resultaat van een gooibare tabel: --text Combat',
          'Alleen voor één personage: --who Alice',
          'Een totaal van 20 of meer bij de eerste inline-worp van een "Strength"-worp: --text Strength && ## --total >=20',
        ],
        code: [
          '!crl new Crit Sound --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Blunder --natural 1 --dice 20 --commands /em blundert! \\\\ /roll 1t[Fumbles]',
          '!crl new Verteller --results crit fumble --speaker crl --commands /desc ${who} gooide een ${result}!',
        ],
      },
      matching: {
        heading: 'Wat een luisteraar controleert',
        points: [
          'Een luisteraar activeert wanneer al zijn filters overeenkomen. Lege filters komen met alles overeen.',
          'Rolsjablonen: de naam van het sjabloon, zoals atkdmg of simple. "none" komt overeen met berichten zonder sjabloon. Meerdere namen betekent: een van die namen.',
          'Berichttypen: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon-sheets) en api. Als dit leeg is, wordt elk type behalve api-commando’s gecontroleerd.',
          'Tekst: een of meer tekststukken, gescheiden door &&, die allemaal moeten voorkomen. Hoofdletters en kleine letters maken niet uit. Tekst wordt ook gevonden in worptotalen en resultaten van gooibare tabellen.',
          '## in de tekst staat voor een inline-worp; de worpcontroles kijken dan alleen naar de worpen die daar staan. Zonder ## wordt elke worp in het bericht gecontroleerd.',
          'Tekst kan een reguliere expressie zijn in plaats van platte tekst (--regex on).',
          'Sprekers / personages: de naam die in de chat staat, of de personagenaam in het rolsjabloon. Spelers: de weergavenaam van de speler.',
        ],
      },
      templates: {
        heading: 'Namen van rolsjablonen',
        points: [
          'Een rolsjabloon is de opmaak die een sheet gebruikt voor zijn worpkaarten. De naam is het deel na template: in een macro, dus &{template:atkdmg} is het sjabloon atkdmg. Elk sheet heeft zijn eigen namen.',
          'De snelste manier om een naam te vinden: klik op Volgend bericht inspecteren, gooi vanaf het sheet en lees de regel Rolsjabloon die CRL terugfluistert.',
          'Je kunt de naam ook lezen in de macro van een sheetknop, of in de broncode van het sheet op GitHub, waar elk sjabloon een <rolltemplate class="sheet-rolltemplate-NAME"> is.',
          'Sjablonen van veelgebruikte sheets:',
        ],
        colSheet: 'Personageblad',
        colNames: 'Sjabloonnamen',
        links: 'Meer over rolsjablonen:',
        builtIn: 'Roll20: ingebouwde rolsjablonen',
        dnd5e2014: 'Roll20: rolsjablonen van D&D 5e (2014)',
        sheets: 'Broncode van Roll20-personagebladen',
      },
      rolls: {
        heading: 'Worpcontroles',
        points: [
          'Worpresultaat: kritiek (de hoogste zijde van de dobbelsteen, of het cs-bereik), blunder (een 1, of het cf-bereik), succes (minstens één dobbelsteen haalt een doel zoals 1d20>15), mislukking (een worp met doel zonder successen). Meerdere resultaten betekent: een van die resultaten.',
          'Worptotaal: een getal, een vergelijking zoals >=15, of een bereik zoals 19-20.',
          'Natuurlijke worp: de zijde waarop een dobbelsteen landde, zoals 20, of <=2.',
          'Gecontroleerde dobbelstenen: auto kijkt alleen naar d20’s als er een is gegooid, zodat schadedobbelstenen met hun hoogste zijde niet als kritiek tellen. Kies Elke dobbelsteen, of een grootte zoals d100, om dat te veranderen.',
          'Weggevallen dobbelstenen (voordeel en nadeel) en opnieuw gegooide dobbelstenen worden genegeerd.',
          'Het sheet D&D 5E by Roll20 (2014) gooit voordeel en nadeel als twee aparte d20-worpen (r1 en r2), dus CRL controleert beide: met voordeel telt een 1 op de laagste dobbelsteen nog steeds als blunder, en met nadeel telt een 20 op de hoogste dobbelsteen nog steeds als kritiek.',
          'Een luisteraar activeert wanneer minstens één worp aan alle worpcontroles voldoet.',
        ],
      },
      commands: {
        heading: 'Chatcommando’s',
        intro:
          'Elk commando is alleen voor de GM. Een luisteraar kan worden aangeduid met zijn naam of zijn ID.',
        colCommand: 'Commando',
        colDesc: 'Wat het doet',
      },
      options: {
        heading: 'Luisteraaropties',
        intro:
          'Voeg deze toe aan !crl new of !crl edit. Laat een waarde leeg, of gebruik -, om haar te wissen. --commands moet als laatste komen.',
        colOption: 'Optie',
        colDesc: 'Betekenis',
        templates:
          'Namen van rolsjablonen, gescheiden door spaties. none = geen sjabloon. Zie Namen van rolsjablonen hierboven.',
        types: 'Berichttypen, gescheiden door spaties: {types}.',
        text: 'Te zoeken tekst. Scheid stukken met &&. ## markeert een inline-worp.',
        regex: 'on om de tekst als reguliere expressies te lezen, off voor platte tekst.',
        who: 'Namen van sprekers of personages, gescheiden door komma’s.',
        players: 'Weergavenamen van spelers, gescheiden door komma’s.',
        results: 'crit, fumble, success en/of fail.',
        total: 'Worptotaal: 15, >=15, <5 of 19-20.',
        natural: 'Natuurlijke worp: 20, <=2 of 19-20.',
        dice: 'auto, any, of een dobbelsteengrootte zoals 20.',
        cooldown: 'Seconden voordat de luisteraar opnieuw kan activeren.',
        stop: 'on om latere luisteraars niet meer te controleren zodra deze activeert.',
        speaker: 'default, crl of roller.',
        enabled: 'on of off.',
        name: 'Hernoemt de luisteraar.',
        commands: 'De uit te voeren commando’s. Scheid regels met \\\\.',
      },
      placeholders: {
        heading: 'Plaatshouders',
        intro: 'Deze worden vervangen in de commando’s van een luisteraar wanneer hij activeert.',
        colName: 'Plaatshouder',
        colDesc: 'Vervangen door',
        who: 'De naam die in de chat staat.',
        character: 'De personagenaam uit het rolsjabloon, of de naam die in de chat staat.',
        player: 'De weergavenaam van de speler.',
        template: 'De naam van het rolsjabloon.',
        total: 'Het totaal van de worp die overeenkwam (of de eerste worp).',
        natural: 'De natuurlijke d20 (of eerste dobbelsteen) van die worp.',
        result: 'crit, fumble, success of fail, als daarom gevraagd werd.',
        expression: 'De worpexpressie, zoals 1d20+5.',
        table: 'Resultaten van gooibare tabellen in die worp.',
        listener: 'De naam van de luisteraar.',
        field:
          'Een veld van het rolsjabloon, zoals ${field:rname} (inline-worpen worden als hun totaal getoond).',
      },
      running: {
        heading: 'Hoe commando’s worden uitgevoerd',
        points: [
          'Elke regel wordt als apart chatbericht verstuurd, behalve dat een {{ … }}-blok over meerdere regels (een rolsjabloon of ScriptCards-script) bij elkaar blijft.',
          'Commando’s worden verstuurd als CRL, of als het personage dat gooide, zoals per luisteraar of in de instellingen is ingesteld. Andere mods zien commando’s van CRL als afkomstig van de API.',
          'Commando’s kunnen inline-worpen, rolsjablonen, @{Character|attribute} en %{Character|ability} gebruiken. Verwijzingen naar geselecteerde tokens (@{selected|…}) en vragen (?{…}) werken niet, want er is niemand om het aan te vragen.',
          'Luisteraars worden op volgorde gecontroleerd. Een luisteraar met Hierna stoppen voorkomt dat latere luisteraars op hetzelfde bericht activeren.',
          'Een afkoeltijd voorkomt dat een luisteraar gedurende dat aantal seconden opnieuw activeert.',
          'CRL negeert zijn eigen berichten. Als een luisteraar toch meer dan 20 keer in 10 seconden activeert, wordt hij uitgeschakeld en krijgt de GM een melding.',
        ],
      },
      inspector: {
        heading: 'De inspecteur',
        points: [
          'Klik op Volgend bericht inspecteren en gooi dan. CRL fluistert wat het zag: het berichttype, de spreker, het personage, het sjabloon en zijn velden, elke worp met zijn dobbelstenen, de tekst die luisteraars doorzoeken, en waarom elke luisteraar wel of niet activeerde.',
          'Gebruik hem om de sjabloonnaam van een sheet te vinden, of om te zien wat een Beacon-sheet (zoals D&D 2024) verstuurt.',
          'Beacon-sheets plaatsen worpkaarten in plaats van rolsjablonen. CRL leest ze: het sjabloon is de eerste class van de kaart (dnd-2024 voor D&D 2024), het personage, de titel (zoals Dexterity Check) en de subcategorie worden velden, en elke worp in de uitsplitsing is een worp, dus controles op crit, fumble, totaal en natuurlijke worp werken.',
        ],
      },
      settings: {
        heading: 'Instellingen',
        intro:
          'Wijzig deze met !crl config of de knop Instellingen. Sommige kunnen ook worden ingesteld in de One-Click-opties van de mod.',
        colKey: 'Instelling',
        colName: 'Naam',
        colDesc: 'Beschrijving',
      },
      storage: {
        heading: 'Waar luisteraars worden bewaard',
        body: 'Elke luisteraar is een vaardigheid op het gearchiveerde personage "{character}". De vaardigheid bevat de commando’s, dus je kunt ze in het Journal bewerken met de volledige macro-editor. Haar beschrijving bevat de regels van de luisteraar, waardoor luisteraars ook het kopiëren van het spel overleven. Een vaardigheid verwijderen verwijdert haar luisteraar; een met de hand toegevoegde vaardigheid verschijnt uitgeschakeld in het menu.',
      },
      upgrading: {
        heading: 'Upgraden vanaf versie 1',
        points: [
          'Luisteraars van versie 1 worden bij de eerste start omgezet en behouden hun commando’s.',
          'Tekst met alleen gewone tekens wordt platte tekst en negeert nu hoofdletters en kleine letters. Tekst met symbolen van reguliere expressies blijft een reguliere expressie.',
          'Luisteraars met een worpresultaat maar zonder ## faalden vroeger met "not parseable"; ze controleren nu elke worp in het bericht.',
          'Fail betekent nu een worp met doel zonder successen; een worp precies op het doel is een succes.',
          'De commando’s van versie 1 werken nog steeds:',
        ],
        colV1: 'Versie 1',
        colV2: 'Versie 2',
      },
      troubleshooting: {
        heading: 'Probleemoplossing',
        points: [
          'Er gebeurt niets: controleer of Luisteren aan staat en de luisteraar aan staat, en gebruik dan de inspecteur om te zien welk filter faalt.',
          'De worpen van een sheet worden niet herkend: inspecteer er een; de sjabloonnaam en velden die hij toont zijn waarop je filtert.',
          'Beacon-sheets (zoals D&D 2024) hebben de Experimental Mod-sandbox nodig zodat mods hun worpen zien.',
          'Commando’s met @{…} of %{…} verliezen die als ze in !crl worden getypt; bewerk in plaats daarvan de vaardigheid in het Journal.',
          'Schadedobbelstenen tellen als kritiek: zet Gecontroleerde dobbelstenen op d20.',
          'Fouten worden naar de API-console geschreven met het voorvoegsel "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Talen',
        body: 'Kies een taal met !crl config language of de One-Click-optie Language. Ondersteunde talen:',
        colCode: 'Taalcode',
        colName: 'Taal',
        colNative: 'Naam in eigen taal',
      },
      credits: {
        heading: 'Met dank aan',
        original: 'Oorspronkelijke mod door',
        maintainer: 'Versie 2 door',
        support: 'Meld problemen op de Roll20-forums of in de GitHub-repository.',
        wiki: 'Wikipagina van versie 1',
      },
    },
  };

  var localeEnUS = {
    titles: {
      ready: 'Customizable Roll Listener is ready.',
      settings: 'CRL Settings',
      languages: 'Choose a Language',
      help: 'CRL Commands',
      confirm: 'Please Confirm',
      inspect: 'CRL Inspector',
      listener: 'Listener: {name}',
      listenerCommands: 'Commands: {name}',
    },
    menu: {
      listening: 'Listening',
      listeners: 'Listeners (checked in this order)',
      noListeners: 'No listeners yet. Click New Listener to make one.',
      noCommands: 'No commands yet.',
      commandsHint:
        'Separate lines with \\\\ when typing commands in chat. For @{...} or %{...} references, edit the ability in the Journal instead, because chat replaces them before CRL sees them.',
    },
    buttons: {
      back: 'Back',
      change: 'Change',
      confirmDelete: 'Yes, Delete It',
      delete: 'Delete',
      edit: 'Edit',
      help: 'Help',
      inspect: 'Inspect Next Message',
      inspectOff: 'Stop Inspecting',
      new: 'New Listener',
      openJournal: 'Open in Journal',
      rebuildJournal: 'Rebuild Handouts',
      rename: 'Rename',
      setCommands: 'Set Commands',
      settings: 'Settings',
      test: 'Test',
      enable: 'Turn On',
      disable: 'Turn Off',
      menu: 'Listeners',
      turnOn: 'Listening On',
      turnOff: 'Listening Off',
    },
    prompts: {
      newName: 'Name for the new listener',
      name: 'New name',
      target: 'Listener name',
      commands: 'Commands - separate lines with two backslashes',
      templates:
        'Roll templates separated by spaces - none for no template - empty for any - Inspect shows a roll’s template',
      types: 'Message types separated by spaces - empty for any except api',
      text: 'Text to look for - see the Help handout - empty for any',
      regex: 'How to read the text',
      who: 'Speaker or character names separated by commas - empty for anyone',
      players: 'Player names separated by commas - empty for anyone',
      results: 'Roll result',
      total: 'Roll total such as 15 or 19-20 - see the Help handout - empty for any',
      natural: 'Natural die result such as 20 or 1-2 - empty for any',
      dice: 'Which dice the checks look at',
      cooldown: 'Seconds to wait before triggering again - 0 for none',
      speaker: 'Send commands as',
    },

    choices: {
      critOrFumble: 'Critical or fumble',
    },
    values: {
      on: 'On',
      off: 'Off',
      none: 'None',
      any: 'Any',
      allButApi: 'Any (not API commands)',
      plain: 'Plain text',
      regex: 'Regular expression',
      diceAuto: 'Auto (d20s if rolled)',
      diceAny: 'Any die',
      seconds: '{seconds} s',
      speaker: {
        default: 'Default setting',
        crl: 'CRL',
        roller: 'The roller',
      },
    },
    results: {
      crit: 'Critical',
      fumble: 'Fumble',
      success: 'Success',
      fail: 'Failure',
    },
    fields: {
      enabled: 'On',
      templates: 'Roll templates',
      types: 'Message types',
      text: 'Text',
      regex: 'Text is',
      who: 'Speakers / characters',
      players: 'Players',
      results: 'Roll result',
      total: 'Roll total',
      natural: 'Natural die',
      dice: 'Dice checked',
      cooldown: 'Cooldown',
      stop: 'Stop after this one',
      speaker: 'Send as',
      commands: 'Commands',
    },
    settings: {
      enabled: {
        label: 'Listening',
        desc: 'Turns every listener on or off at once.',
      },
      speaker: {
        label: 'Send commands as',
        desc: 'Who listener commands are sent as, unless a listener says otherwise: CRL, or the character (or player) whose message triggered it.',
      },
      listenToMods: {
        label: 'Listen to other mods',
        desc: 'Whether chat sent by other mods can trigger listeners. CRL never reacts to its own messages.',
      },
      language: {
        label: 'Language',
        desc: 'Language for menus, messages and handouts.',
      },
    },
    inspect: {
      type: 'Type',
      who: 'Speaker',
      character: 'Character',
      player: 'Player',
      template: 'Roll template',
      keys: 'Message properties',
      extras: 'Extra message data',
      fields: 'Template fields',
      rolls: 'Rolls',
      dice: 'dice',
      table: 'table',
      target: 'has a success target',
      crit: 'crit',
      fumble: 'fumble',
      text: 'Text (as listeners read it)',
      raw: 'Raw content',
      listeners: 'Listeners',
      matched: 'would trigger {result}',
      reasons: {
        disabled: 'switched off',
        type: 'message type does not match',
        template: 'roll template does not match',
        who: 'speaker or character does not match',
        player: 'player does not match',
        text: 'text not found',
        roll: 'no roll meets the roll conditions',
      },
    },
    messages: {
      upgraded:
        'Upgraded from version 1. {count} listener(s) were converted and their commands kept.',
      restored: 'Restored {count} listener(s) from the store character.',
      adopted:
        'Found {count} ability(s) on the store character without listener rules. They have been added switched off; set them up from the menu.',
      removed: 'Removed {count} listener(s) whose ability was deleted.',
      listeningOff: 'Listening is switched off. Type !crl on to turn it on.',
      readyHint: '{count} listener(s). Type !crl for the menu or !crl help for every command.',
      loopStopped:
        'The listener "{name}" fired too often in a short time, probably because its commands trigger it again, so it has been switched off.',
      noCommands: 'The listener "{name}" has no commands to run.',
      tested: 'Ran the commands of "{name}" ({count} message(s)).',
      confirmDelete: 'Delete the listener "{name}" and its commands? This cannot be undone.',
      deleted: 'Deleted the listener "{name}".',
      inspectOn: 'The next chat message will be inspected and the result whispered to you.',
      inspectOff: 'The inspector has been switched off.',
      journalRebuilt: 'Rebuilt the "{help}" and "{deck}" handouts.',
    },
    errors: {
      gmOnly: 'Only a GM can use Customizable Roll Listener commands.',
      unexpected: 'Something went wrong: {message}',
      unknownCommand: 'Unknown command "{command}".',
      badOption: 'Unknown option --{option}.',
      notFound: 'There is no listener called "{name}".',
      nameRequired: 'Please give a listener name.',
      nameInvalid: 'The name "{name}" cannot be used.',
      nameTaken: 'There is already a listener called "{name}".',
      badOnOff: 'The value "{value}" is not valid for --{option}.',
      badType: 'Unknown message type(s): {value}.',
      badRegex: 'The regular expression "{term}" is not valid: {error}',
      tooManyTerms: 'A listener can look for at most {max} pieces of text.',
      badResult: 'Unknown roll result(s): {value}.',
      badComparison: 'The value "{value}" is not valid for --{option}.',
      badDice: 'The value "{value}" is not valid for --dice.',
      badCooldown: 'The value "{value}" is not valid for --cooldown.',
      badSpeaker: 'The value "{value}" is not valid for --speaker.',
      noStore: 'The store character could not be created.',
      badSetting: 'Unknown setting "{key}".',
      badSettingValue: 'The value "{value}" is not valid for {key}.',
    },
    hints: {
      gmOnly: 'Ask your GM to set up listeners for you.',
      unknownCommand: 'Type !crl help to see every command.',
      badOption:
        'Options are --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name and --commands.',
      notFound: 'Type !crl to see the list of listeners.',
      nameInvalid:
        'Use up to {max} characters, without these: | { } [ ] \\ @ % # ? ~ or "--", and do not start with "-".',
      badOnOff: 'Use on or off.',
      badType: 'Message types are: {types}.',
      badResult: 'Use crit, fumble, success or fail.',
      badComparison: 'Use a number, a comparison such as >=15 or <3, or a range such as 19-20.',
      badDice: 'Use auto, any, or a die size such as 20 or d20.',
      badCooldown: 'Use a whole number of seconds from 0 to 3600.',
      badSpeaker: 'Use default, crl or roller.',
      badSetting: 'Settings are: {keys}.',
      noStore: 'Check the API console for errors, then restart the sandbox.',
    },
    help: {
      menu: 'Show the list of listeners.',
      new: 'Make a listener. Options can be added straight away.',
      show: 'Show a listener and its settings, with buttons to change them.',
      edit: 'Change a listener. Leave a value empty (or use -) to clear it.',
      commands:
        'Replace a listener’s commands. Everything after --commands is used, so put it last.',
      enable: 'Turn a listener on or off.',
      move: 'Move a listener earlier or later in the order listeners are checked.',
      test: 'Run a listener’s commands now, as if a natural 20 had been rolled.',
      delete: 'Delete a listener and its commands (asks first).',
      inspect: 'Whisper a breakdown of the next chat message and which listeners it would trigger.',
      inspectOff: 'Stop waiting for a message to inspect.',
      onOff: 'Turn all listening on or off.',
      config: 'Show or change the global settings.',
      journal: 'Rebuild the Help and Command Deck handouts.',
      help: 'Show this list.',
      optionsTitle: 'Options',
      options:
        'Options: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name and --commands. Names may be used instead of IDs.',
      placeholders:
        'Commands can use ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} and ${field:name}.',
      handouts: 'The "{help}" handout explains everything; the "{deck}" handout has buttons.',
    },
    store: {
      bio: 'This character belongs to the Customizable Roll Listener mod. Each ability is one listener: the ability holds the commands to run, and its description holds the listener’s rules.',
      bioHelp:
        'You can edit the commands here. Change the rules with !crl or from the Command Deck handout. Deleting an ability deletes its listener.',
    },
    deck: {
      subtitle: 'Command Deck',
      listeners: 'Listeners',
      listenersDesc: 'See, make, change and test listeners.',
      listening: 'Listening',
      listeningDesc: 'Turn every listener on or off at once.',
      tools: 'Tools',
      toolsDesc: 'Inspect a chat message, change settings, rebuild the handouts, or read the help.',
      footer: 'All commands are GM only. See the "{help}" handout for details.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hear the dice, hear the action',
      footer: 'Buttons for every command are in the "{deck}" handout.',
      overview: {
        heading: 'Overview',
        body: 'Customizable Roll Listener (CRL) watches chat and runs commands of your choice when a message matches a listener. A listener can look at the roll template, the text, who sent the message, and the rolls in it: critical hits, fumbles, successes, failures, totals and natural die results. Commands can be anything you could type in chat, including other mods’ commands, so CRL can play sounds, roll on tables, post emotes, apply status markers and more.',
      },
      quickStart: {
        heading: 'Quick Start',
        steps: [
          'Type !crl in chat (or click Listeners in the Command Deck handout).',
          'Click New Listener and give it a name, such as Crit Sound.',
          'Click Change next to Roll result and choose Critical.',
          'Click Set Commands and enter what to run, for example !roll20AM --audio,play|Crit.',
          'Click Test to check the commands, then roll an attack. Use Inspect Next Message if it does not trigger.',
        ],
      },
      examples: {
        heading: 'Examples',
        points: [
          'Sound on any critical hit, from any sheet: --results crit',
          'Fumble table on a natural 1 in the D&D 5e 2014 attack template: --templates atkdmg atk --natural 1',
          'React to a rollable table result: --text Combat',
          'Only for one character: --who Alice',
          'A total of 20 or more on the first inline roll of a "Strength" roll: --text Strength && ## --total >=20',
        ],
        code: [
          '!crl new Crit Sound --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Fumble --natural 1 --dice 20 --commands /em fumbles! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrator --results crit fumble --speaker crl --commands /desc ${who} rolled a ${result}!',
        ],
      },
      matching: {
        heading: 'What a Listener Checks',
        points: [
          'A listener triggers when every filter it has matches. Empty filters match everything.',
          'Roll templates: the template name, such as atkdmg or simple. "none" matches messages without a template. Several names mean any of them.',
          'Message types: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon sheets) and api. When empty, every type except api commands is checked.',
          'Text: one or more pieces of text, separated by &&, that must all appear. Matching ignores upper and lower case. Text is also found in roll totals and rollable table results.',
          '## in the text stands for an inline roll; the roll checks then only look at the rolls found there. Without ##, every roll in the message is checked.',
          'Text can be a regular expression instead of plain text (--regex on).',
          'Speakers / characters: the name shown in chat, or the character name in the roll template. Players: the player’s display name.',
        ],
      },
      templates: {
        heading: 'Roll Template Names',
        points: [
          'A roll template is the layout a sheet uses for its roll cards. Its name is the part after template: in a macro, so &{template:atkdmg} is the atkdmg template. Each sheet has its own names.',
          'The quickest way to find a name: click Inspect Next Message, make the roll from the sheet, and read the Roll template line CRL whispers back.',
          'You can also read the name in a sheet button’s macro, or in the sheet’s source on GitHub, where each template is a <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Templates of common sheets:',
        ],
        colSheet: 'Sheet',
        colNames: 'Template names',
        links: 'More about roll templates:',
        builtIn: 'Roll20: built-in roll templates',
        dnd5e2014: 'Roll20: D&D 5e (2014) roll templates',
        sheets: 'Roll20 character sheet source',
      },
      rolls: {
        heading: 'Roll Checks',
        points: [
          'Roll result: critical (the die’s highest face, or the cs range), fumble (a 1, or the cf range), success (at least one die meets a target such as 1d20>15), failure (a target roll with no successes). Several results mean any of them.',
          'Roll total: a number, a comparison such as >=15, or a range such as 19-20.',
          'Natural die: the face a die landed on, such as 20, or <=2.',
          'Dice checked: auto looks only at d20s when one was rolled, so damage dice rolling their highest face do not count as crits. Choose any die, or a size such as d100, to change that.',
          'Dropped dice (advantage and disadvantage) and rerolled dice are ignored.',
          'The D&D 5E by Roll20 (2014) sheet rolls advantage and disadvantage as two separate d20 rolls (r1 and r2), so CRL checks both: with advantage a 1 on the lower die still counts as a fumble, and with disadvantage a 20 on the higher die still counts as a crit.',
          'A listener triggers when at least one roll meets every roll check.',
        ],
      },
      commands: {
        heading: 'Chat Commands',
        intro: 'Every command is GM only. A listener can be named by its name or its ID.',
        colCommand: 'Command',
        colDesc: 'What it does',
      },
      options: {
        heading: 'Listener Options',
        intro:
          'Add these to !crl new or !crl edit. Leave a value empty, or use -, to clear it. --commands must come last.',
        colOption: 'Option',
        colDesc: 'Meaning',
        templates:
          'Roll template names, separated by spaces. none = no template. See Roll Template Names above.',
        types: 'Message types, separated by spaces: {types}.',
        text: 'Text to find. Separate pieces with &&. ## marks an inline roll.',
        regex: 'on to read the text as regular expressions, off for plain text.',
        who: 'Speaker or character names, separated by commas.',
        players: 'Player display names, separated by commas.',
        results: 'crit, fumble, success and/or fail.',
        total: 'Roll total: 15, >=15, <5 or 19-20.',
        natural: 'Natural die face: 20, <=2 or 19-20.',
        dice: 'auto, any, or a die size such as 20.',
        cooldown: 'Seconds before the listener can trigger again.',
        stop: 'on to stop checking later listeners once this one triggers.',
        speaker: 'default, crl or roller.',
        enabled: 'on or off.',
        name: 'Renames the listener.',
        commands: 'The commands to run. Separate lines with \\\\.',
      },
      placeholders: {
        heading: 'Placeholders',
        intro: 'These are replaced in a listener’s commands when it triggers.',
        colName: 'Placeholder',
        colDesc: 'Replaced with',
        who: 'The name shown in chat.',
        character: 'The character name from the roll template, or the name shown in chat.',
        player: 'The player’s display name.',
        template: 'The roll template name.',
        total: 'The total of the roll that matched (or the first roll).',
        natural: 'The natural d20 (or first die) of that roll.',
        result: 'crit, fumble, success or fail, when one was asked for.',
        expression: 'The roll expression, such as 1d20+5.',
        table: 'Rollable table results of that roll.',
        listener: 'The listener’s name.',
        field:
          'A roll template field, such as ${field:rname} (inline rolls are shown as their totals).',
      },
      running: {
        heading: 'How Commands Run',
        points: [
          'Each line is sent as its own chat message, except that a {{ … }} block spread over several lines (a roll template or ScriptCards script) is kept together.',
          'Commands are sent as CRL, or as the character who rolled, as set per listener or in the settings. Other mods see commands sent by CRL as coming from the API.',
          'Commands can use inline rolls, roll templates, @{Character|attribute} and %{Character|ability}. Selected-token references (@{selected|…}) and queries (?{…}) do not work, because there is no one to ask.',
          'Listeners are checked in order. A listener set to Stop after this one stops later listeners from triggering on the same message.',
          'A cooldown stops a listener triggering again for that many seconds.',
          'CRL ignores its own messages. If a listener still triggers more than 20 times in 10 seconds, it is switched off and the GM is told.',
        ],
      },
      inspector: {
        heading: 'The Inspector',
        points: [
          'Click Inspect Next Message, then make the roll. CRL whispers what it saw: the message type, speaker, character, template and its fields, every roll with its dice, the text listeners search, and why each listener did or did not trigger.',
          'Use it to find a sheet’s template name, or to see what a Beacon sheet (such as D&D 2024) sends.',
          'Beacon sheets post roll cards instead of roll templates. CRL reads them: the template is the card’s first class (dnd-2024 for D&D 2024), the character, title (such as Dexterity Check) and subcategory become fields, and each roll in the breakdown is a roll, so crit, fumble, total and natural checks work.',
        ],
      },
      settings: {
        heading: 'Settings',
        intro:
          'Change these with !crl config or the Settings button. Some can also be set in the Mod’s One-Click options.',
        colKey: 'Setting',
        colName: 'Name',
        colDesc: 'Description',
      },
      storage: {
        heading: 'Where Listeners Are Kept',
        body: 'Each listener is an ability on the archived "{character}" character. The ability holds the commands, so you can edit them in the Journal with the full macro editor. Its description holds the listener’s rules, which also lets listeners survive copying the game. Deleting an ability deletes its listener; an ability added by hand appears in the menu switched off.',
      },
      upgrading: {
        heading: 'Upgrading from Version 1',
        points: [
          'Version 1 listeners are converted on the first start and keep their commands.',
          'Text that only holds plain characters becomes plain text and now ignores upper and lower case. Text using regular expression symbols stays a regular expression.',
          'Listeners with a roll result but no ## used to fail with "not parseable"; they now check every roll in the message.',
          'Fail now means a target roll with no successes; a roll exactly on the target is a success.',
          'The version 1 commands still work:',
        ],
        colV1: 'Version 1',
        colV2: 'Version 2',
      },
      troubleshooting: {
        heading: 'Troubleshooting',
        points: [
          'Nothing happens: check Listening is on and the listener is on, then use the inspector to see which filter fails.',
          'A sheet’s rolls are not recognised: inspect one; the template name and fields it shows are what to filter on.',
          'Beacon sheets (such as D&D 2024) need the Experimental Mod sandbox for mods to see their rolls.',
          'Commands that use @{…} or %{…} lose them when typed into !crl; edit the ability in the Journal instead.',
          'Damage dice counted as crits: set Dice checked to d20.',
          'Errors are written to the API console with the prefix "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Languages',
        body: 'Choose a language with !crl config language or the Language One-Click option. Supported languages:',
        colCode: 'Code',
        colName: 'Language',
        colNative: 'Native name',
      },
      credits: {
        heading: 'Credits',
        original: 'Original mod by',
        maintainer: 'Version 2 by',
        support: 'Report problems on the Roll20 forums or the GitHub repository.',
        wiki: 'Version 1 wiki page',
      },
    },
  };

  const TRANSLATION$g = {
    titles: {
      ready: 'Customizable Roll Listener on valmis.',
      settings: 'CRL-asetukset',
      languages: 'Valitse kieli',
      help: 'CRL-komennot',
      confirm: 'Vahvista',
      inspect: 'CRL-tarkastin',
      listener: 'Kuuntelija: {name}',
      listenerCommands: 'Komennot: {name}',
    },
    menu: {
      listening: 'Kuuntelu',
      listeners: 'Kuuntelijat (tarkistetaan tässä järjestyksessä)',
      noListeners: 'Ei vielä kuuntelijoita. Luo sellainen napsauttamalla Uusi kuuntelija.',
      noCommands: 'Ei vielä komentoja.',
      commandsHint:
        'Erota rivit merkeillä \\\\, kun kirjoitat komentoja chattiin. Muokkaa @{...}- tai %{...}-viittauksia varten kykyä mieluummin Journalissa, koska chat korvaa ne ennen kuin CRL näkee ne.',
    },
    buttons: {
      back: 'Takaisin',
      change: 'Muuta',
      confirmDelete: 'Kyllä, poista',
      delete: 'Poista',
      edit: 'Muokkaa',
      help: 'Ohje',
      inspect: 'Tutki seuraava viesti',
      inspectOff: 'Lopeta tutkiminen',
      new: 'Uusi kuuntelija',
      openJournal: 'Avaa Journalissa',
      rebuildJournal: 'Luo monisteet uudelleen',
      rename: 'Nimeä uudelleen',
      setCommands: 'Aseta komennot',
      settings: 'Asetukset',
      test: 'Testaa',
      enable: 'Kytke päälle',
      disable: 'Kytke pois',
      menu: 'Kuuntelijat',
      turnOn: 'Kuuntelu päälle',
      turnOff: 'Kuuntelu pois',
    },
    prompts: {
      newName: 'Uuden kuuntelijan nimi',
      name: 'Uusi nimi',
      target: 'Kuuntelijan nimi',
      commands: 'Komennot - erota rivit kahdella kenoviivalla',
      templates:
        'Heittopohjat välilyönnein eroteltuina - none = ei pohjaa - tyhjä = mikä tahansa - Tutki näyttää heiton pohjan',
      types: 'Viestityypit välilyönnein eroteltuina - tyhjä = kaikki paitsi api',
      text: 'Etsittävä teksti - katso Ohje-moniste - tyhjä = mikä tahansa',
      regex: 'Miten teksti luetaan',
      who: 'Puhujien tai hahmojen nimet pilkuin eroteltuina - tyhjä = kuka tahansa',
      players: 'Pelaajien nimet pilkuin eroteltuina - tyhjä = kuka tahansa',
      results: 'Heiton tulos',
      total: 'Heiton summa, esim. 15 tai 19-20 - katso Ohje-moniste - tyhjä = mikä tahansa',
      natural: 'Nopan luonnollinen tulos, esim. 20 tai 1-2 - tyhjä = mikä tahansa',
      dice: 'Mitä noppia tarkistukset katsovat',
      cooldown: 'Odotusaika sekunteina ennen uutta laukeamista - 0 = ei odotusta',
      speaker: 'Lähetä komennot nimellä',
    },
    choices: {
      critOrFumble: 'Kriittinen tai kömmähdys',
    },
    values: {
      on: 'Päällä',
      off: 'Pois',
      none: 'Ei mitään',
      any: 'Mikä tahansa',
      allButApi: 'Mikä tahansa (ei API-komennot)',
      plain: 'Tavallinen teksti',
      regex: 'Säännöllinen lauseke',
      diceAuto: 'Automaattinen (d20:t, jos heitetty)',
      diceAny: 'Mikä tahansa noppa',
      seconds: '{seconds} s',
      speaker: {
        default: 'Oletusasetus',
        crl: 'CRL',
        roller: 'Heittäjä',
      },
    },
    results: {
      crit: 'Kriittinen',
      fumble: 'Kömmähdys',
      success: 'Onnistuminen',
      fail: 'Epäonnistuminen',
    },
    fields: {
      enabled: 'Päällä',
      templates: 'Heittopohjat',
      types: 'Viestityypit',
      text: 'Teksti',
      regex: 'Teksti on',
      who: 'Puhujat / hahmot',
      players: 'Pelaajat',
      results: 'Heiton tulos',
      total: 'Heiton summa',
      natural: 'Luonnollinen noppa',
      dice: 'Tarkistetut nopat',
      cooldown: 'Odotusaika',
      stop: 'Lopeta tämän jälkeen',
      speaker: 'Lähetä nimellä',
      commands: 'Komennot',
    },
    settings: {
      enabled: {
        label: 'Kuuntelu',
        desc: 'Kytkee kaikki kuuntelijat päälle tai pois kerralla.',
      },
      speaker: {
        label: 'Lähetä komennot nimellä',
        desc: 'Kenen nimissä kuuntelijoiden komennot lähetetään, ellei kuuntelija toisin määrää: CRL tai hahmo (tai pelaaja), jonka viesti laukaisi sen.',
      },
      listenToMods: {
        label: 'Kuuntele muita modeja',
        desc: 'Voivatko muiden modien chattiin lähettämät viestit laukaista kuuntelijoita. CRL ei koskaan reagoi omiin viesteihinsä.',
      },
      language: {
        label: 'Kieli',
        desc: 'Valikkojen, viestien ja monisteiden kieli.',
      },
    },
    inspect: {
      type: 'Tyyppi',
      who: 'Puhuja',
      character: 'Hahmo',
      player: 'Pelaaja',
      template: 'Heittopohja',
      keys: 'Viestin ominaisuudet',
      extras: 'Viestin lisätiedot',
      fields: 'Pohjan kentät',
      rolls: 'Heitot',
      dice: 'nopat',
      table: 'taulukko',
      target: 'on onnistumisraja',
      crit: 'kriittinen',
      fumble: 'kömmähdys',
      text: 'Teksti (kuten kuuntelijat sen lukevat)',
      raw: 'Raakasisältö',
      listeners: 'Kuuntelijat',
      matched: 'laukeaisi: {result}',
      reasons: {
        disabled: 'pois päältä',
        type: 'viestityyppi ei täsmää',
        template: 'heittopohja ei täsmää',
        who: 'puhuja tai hahmo ei täsmää',
        player: 'pelaaja ei täsmää',
        text: 'tekstiä ei löytynyt',
        roll: 'mikään heitto ei täytä heittoehtoja',
      },
    },
    messages: {
      upgraded:
        'Päivitetty versiosta 1. {count} kuuntelija(a) muunnettiin ja niiden komennot säilytettiin.',
      restored: 'Palautettiin {count} kuuntelija(a) tallennushahmolta.',
      adopted:
        'Tallennushahmolta löytyi {count} kyky(ä) ilman kuuntelijasääntöjä. Ne on lisätty pois päältä; määritä ne valikosta.',
      removed: 'Poistettiin {count} kuuntelija(a), joiden kyky oli poistettu.',
      listeningOff: 'Kuuntelu on pois päältä. Kirjoita !crl on kytkeäksesi sen päälle.',
      readyHint:
        '{count} kuuntelija(a). Kirjoita !crl avataksesi valikon tai !crl help nähdäksesi kaikki komennot.',
      loopStopped:
        'Kuuntelija ”{name}” laukesi liian usein lyhyessä ajassa, luultavasti koska sen komennot laukaisevat sen uudelleen, joten se on kytketty pois päältä.',
      noCommands: 'Kuuntelijalla ”{name}” ei ole suoritettavia komentoja.',
      tested: 'Suoritettiin kuuntelijan ”{name}” komennot ({count} viesti(ä)).',
      confirmDelete: 'Poistetaanko kuuntelija ”{name}” ja sen komennot? Tätä ei voi perua.',
      deleted: 'Kuuntelija ”{name}” poistettiin.',
      inspectOn: 'Seuraava chat-viesti tutkitaan ja tulos kuiskataan sinulle.',
      inspectOff: 'Tarkastin on kytketty pois päältä.',
      journalRebuilt: 'Monisteet ”{help}” ja ”{deck}” luotiin uudelleen.',
    },
    errors: {
      gmOnly: 'Vain pelinjohtaja voi käyttää Customizable Roll Listener -komentoja.',
      unexpected: 'Jokin meni vikaan: {message}',
      unknownCommand: 'Tuntematon komento ”{command}”.',
      badOption: 'Tuntematon valitsin --{option}.',
      notFound: 'Kuuntelijaa nimeltä ”{name}” ei ole.',
      nameRequired: 'Anna kuuntelijan nimi.',
      nameInvalid: 'Nimeä ”{name}” ei voi käyttää.',
      nameTaken: 'Kuuntelija nimeltä ”{name}” on jo olemassa.',
      badOnOff: 'Arvo ”{value}” ei kelpaa valitsimelle --{option}.',
      badType: 'Tuntemattomat viestityypit: {value}.',
      badRegex: 'Säännöllinen lauseke ”{term}” ei kelpaa: {error}',
      tooManyTerms: 'Kuuntelija voi etsiä enintään {max} tekstinpätkää.',
      badResult: 'Tuntemattomat heiton tulokset: {value}.',
      badComparison: 'Arvo ”{value}” ei kelpaa valitsimelle --{option}.',
      badDice: 'Arvo ”{value}” ei kelpaa valitsimelle --dice.',
      badCooldown: 'Arvo ”{value}” ei kelpaa valitsimelle --cooldown.',
      badSpeaker: 'Arvo ”{value}” ei kelpaa valitsimelle --speaker.',
      noStore: 'Tallennushahmoa ei voitu luoda.',
      badSetting: 'Tuntematon asetus ”{key}”.',
      badSettingValue: 'Arvo ”{value}” ei kelpaa asetukselle {key}.',
    },
    hints: {
      gmOnly: 'Pyydä pelinjohtajaa määrittämään kuuntelijat puolestasi.',
      unknownCommand: 'Kirjoita !crl help nähdäksesi kaikki komennot.',
      badOption:
        'Valitsimet ovat --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name ja --commands.',
      notFound: 'Kirjoita !crl nähdäksesi kuuntelijoiden luettelon.',
      nameInvalid:
        'Käytä enintään {max} merkkiä ilman näitä: | { } [ ] \\ @ % # ? ~ tai "--", äläkä aloita merkillä "-".',
      badOnOff: 'Käytä on tai off.',
      badType: 'Viestityypit ovat: {types}.',
      badResult: 'Käytä crit, fumble, success tai fail.',
      badComparison: 'Käytä lukua, vertailua kuten >=15 tai <3, tai väliä kuten 19-20.',
      badDice: 'Käytä auto, any tai nopan kokoa kuten 20 tai d20.',
      badCooldown: 'Käytä kokonaislukua sekunteina välillä 0–3600.',
      badSpeaker: 'Käytä default, crl tai roller.',
      badSetting: 'Asetukset ovat: {keys}.',
      noStore: 'Tarkista virheet API-konsolista ja käynnistä sitten sandbox uudelleen.',
    },
    help: {
      menu: 'Näytä kuuntelijoiden luettelo.',
      new: 'Luo kuuntelija. Valitsimia voi lisätä saman tien.',
      show: 'Näytä kuuntelija asetuksineen ja painikkeet niiden muuttamiseen.',
      edit: 'Muuta kuuntelijaa. Jätä arvo tyhjäksi (tai käytä -) tyhjentääksesi sen.',
      commands:
        'Korvaa kuuntelijan komennot. Kaikki --commands-valitsimen jälkeinen käytetään, joten laita se viimeiseksi.',
      enable: 'Kytke kuuntelija päälle tai pois.',
      move: 'Siirrä kuuntelijaa aiemmaksi tai myöhemmäksi tarkistusjärjestyksessä.',
      test: 'Suorita kuuntelijan komennot nyt, ikään kuin olisi heitetty luonnollinen 20.',
      delete: 'Poista kuuntelija ja sen komennot (kysyy ensin).',
      inspect:
        'Kuiskaa erittely seuraavasta chat-viestistä ja siitä, mitkä kuuntelijat se laukaisisi.',
      inspectOff: 'Lopeta tutkittavan viestin odottaminen.',
      onOff: 'Kytke kaikki kuuntelu päälle tai pois.',
      config: 'Näytä tai muuta yleisasetuksia.',
      journal: 'Luo Ohje- ja Komentotaulu-monisteet uudelleen.',
      help: 'Näytä tämä luettelo.',
      optionsTitle: 'Valitsimet',
      options:
        'Valitsimet: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name ja --commands. ID-tunnusten sijaan voi käyttää nimiä.',
      placeholders:
        'Komennoissa voi käyttää muuttujia ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} ja ${field:name}.',
      handouts: 'Moniste ”{help}” selittää kaiken; monisteessa ”{deck}” on painikkeet.',
    },
    store: {
      bio: 'Tämä hahmo kuuluu Customizable Roll Listener -modiin. Jokainen kyky on yksi kuuntelija: kyky sisältää suoritettavat komennot ja sen kuvaus kuuntelijan säännöt.',
      bioHelp:
        'Voit muokata komentoja täällä. Muuta sääntöjä komennolla !crl tai Komentotaulu-monisteesta. Kyvyn poistaminen poistaa sen kuuntelijan.',
    },
    deck: {
      subtitle: 'Komentotaulu',
      listeners: 'Kuuntelijat',
      listenersDesc: 'Katso, luo, muuta ja testaa kuuntelijoita.',
      listening: 'Kuuntelu',
      listeningDesc: 'Kytke kaikki kuuntelijat päälle tai pois kerralla.',
      tools: 'Työkalut',
      toolsDesc: 'Tutki chat-viestiä, muuta asetuksia, luo monisteet uudelleen tai lue ohje.',
      footer: 'Kaikki komennot ovat vain pelinjohtajalle. Lisätietoja monisteessa ”{help}”.',
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'Kuule nopat, kuule toiminta',
      footer: 'Painikkeet jokaiselle komennolle ovat monisteessa ”{deck}”.',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'Customizable Roll Listener (CRL) seuraa chattia ja suorittaa valitsemasi komennot, kun viesti täsmää kuuntelijaan. Kuuntelija voi katsoa heittopohjaa, tekstiä, viestin lähettäjää ja viestin heittoja: kriittisiä osumia, kömmähdyksiä, onnistumisia, epäonnistumisia, summia ja noppien luonnollisia tuloksia. Komennot voivat olla mitä tahansa, mitä voisit kirjoittaa chattiin, myös muiden modien komentoja, joten CRL voi soittaa ääniä, heittää taulukoilta, lähettää emoteja, asettaa tilamerkkejä ja paljon muuta.',
      },
      quickStart: {
        heading: 'Pika-aloitus',
        steps: [
          'Kirjoita chattiin !crl (tai napsauta Kuuntelijat Komentotaulu-monisteessa).',
          'Napsauta Uusi kuuntelija ja anna sille nimi, esimerkiksi Kriittinen ääni.',
          'Napsauta Muuta kohdan Heiton tulos vieressä ja valitse Kriittinen.',
          'Napsauta Aseta komennot ja kirjoita suoritettava komento, esimerkiksi !roll20AM --audio,play|Crit.',
          'Napsauta Testaa tarkistaaksesi komennot ja heitä sitten hyökkäys. Käytä Tutki seuraava viesti, jos kuuntelija ei laukea.',
        ],
      },
      examples: {
        heading: 'Esimerkkejä',
        points: [
          'Ääni jokaisesta kriittisestä osumasta millä tahansa lomakkeella: --results crit',
          'Kömmähdystaulukko luonnollisella 1:llä D&D 5e 2014 -hyökkäyspohjassa: --templates atkdmg atk --natural 1',
          'Reagoi heittotaulukon tulokseen: --text Combat',
          'Vain yhdelle hahmolle: --who Alice',
          'Summa 20 tai enemmän ”Voima”-heiton ensimmäisessä rivin sisäisessä heitossa: --text Voima && ## --total >=20',
        ],
        code: [
          '!crl new Kriittinen ääni --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Kömmähdys --natural 1 --dice 20 --commands /em kömmähtää! \\\\ /roll 1t[Fumbles]',
          '!crl new Kertoja --results crit fumble --speaker crl --commands /desc ${who} heitti: ${result}!',
        ],
      },
      matching: {
        heading: 'Mitä kuuntelija tarkistaa',
        points: [
          'Kuuntelija laukeaa, kun sen jokainen suodatin täsmää. Tyhjät suodattimet täsmäävät kaikkeen.',
          'Heittopohjat: pohjan nimi, kuten atkdmg tai simple. ”none” täsmää viesteihin, joissa ei ole pohjaa. Useampi nimi tarkoittaa mitä tahansa niistä.',
          'Viestityypit: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon-lomakkeet) ja api. Tyhjänä tarkistetaan kaikki tyypit paitsi api-komennot.',
          'Teksti: yksi tai useampi tekstinpätkä &&-merkein eroteltuina, joiden kaikkien on esiinnyttävä. Vertailu ei välitä isoista ja pienistä kirjaimista. Teksti löytyy myös heittojen summista ja heittotaulukoiden tuloksista.',
          '## tekstissä tarkoittaa rivin sisäistä heittoa; heittotarkistukset katsovat silloin vain siitä löytyviä heittoja. Ilman ##-merkkiä tarkistetaan viestin jokainen heitto.',
          'Teksti voi olla tavallisen tekstin sijaan säännöllinen lauseke (--regex on).',
          'Puhujat / hahmot: chatissa näkyvä nimi tai heittopohjan hahmon nimi. Pelaajat: pelaajan näyttönimi.',
        ],
      },
      templates: {
        heading: 'Heittopohjien nimet',
        points: [
          'Heittopohja on asettelu, jota lomake käyttää heittokorteissaan. Sen nimi on makrossa template:-osan jälkeinen osa, joten &{template:atkdmg} on atkdmg-pohja. Jokaisella lomakkeella on omat nimensä.',
          'Nopein tapa löytää nimi: napsauta Tutki seuraava viesti, heitä lomakkeelta ja lue Heittopohja-rivi, jonka CRL kuiskaa takaisin.',
          'Voit myös lukea nimen lomakkeen painikkeen makrosta tai lomakkeen lähdekoodista GitHubissa, jossa jokainen pohja on <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Yleisten lomakkeiden pohjat:',
        ],
        colSheet: 'Lomake',
        colNames: 'Pohjien nimet',
        links: 'Lisää heittopohjista:',
        builtIn: 'Roll20: sisäänrakennetut heittopohjat',
        dnd5e2014: 'Roll20: D&D 5e (2014) -heittopohjat',
        sheets: 'Roll20-hahmolomakkeiden lähdekoodi',
      },
      rolls: {
        heading: 'Heittotarkistukset',
        points: [
          'Heiton tulos: kriittinen (nopan suurin silmäluku tai cs-väli), kömmähdys (1 tai cf-väli), onnistuminen (vähintään yksi noppa saavuttaa rajan, kuten 1d20>15), epäonnistuminen (rajaheitto ilman onnistumisia). Useampi tulos tarkoittaa mitä tahansa niistä.',
          'Heiton summa: luku, vertailu kuten >=15 tai väli kuten 19-20.',
          'Luonnollinen noppa: silmäluku, jolle noppa pysähtyi, kuten 20 tai <=2.',
          'Tarkistetut nopat: auto katsoo vain d20-noppia, kun sellainen heitettiin, joten suurimman silmäluvun saaneita vahinkonoppia ei lasketa kriittisiksi. Valitse Mikä tahansa noppa tai koko kuten d100 muuttaaksesi tätä.',
          'Pudotetut nopat (etu ja haitta) ja uudelleen heitetyt nopat ohitetaan.',
          'D&D 5E by Roll20 (2014) -lomake heittää edun ja haitan kahtena erillisenä d20-heittona (r1 ja r2), joten CRL tarkistaa molemmat: edulla 1 pienemmässä nopassa lasketaan silti kömmähdykseksi ja haitalla 20 suuremmassa nopassa lasketaan silti kriittiseksi.',
          'Kuuntelija laukeaa, kun vähintään yksi heitto täyttää kaikki heittotarkistukset.',
        ],
      },
      commands: {
        heading: 'Chat-komennot',
        intro:
          'Kaikki komennot ovat vain pelinjohtajalle. Kuuntelijaan voi viitata nimellä tai ID-tunnuksella.',
        colCommand: 'Komento',
        colDesc: 'Mitä se tekee',
      },
      options: {
        heading: 'Kuuntelijan valitsimet',
        intro:
          'Lisää nämä komentoon !crl new tai !crl edit. Jätä arvo tyhjäksi tai käytä - tyhjentääksesi sen. --commands on oltava viimeisenä.',
        colOption: 'Valitsin',
        colDesc: 'Merkitys',
        templates:
          'Heittopohjien nimet välilyönnein eroteltuina. none = ei pohjaa. Katso Heittopohjien nimet yllä.',
        types: 'Viestityypit välilyönnein eroteltuina: {types}.',
        text: 'Etsittävä teksti. Erota pätkät merkeillä &&. ## merkitsee rivin sisäistä heittoa.',
        regex: 'on lukee tekstin säännöllisinä lausekkeina, off tavallisena tekstinä.',
        who: 'Puhujien tai hahmojen nimet pilkuin eroteltuina.',
        players: 'Pelaajien näyttönimet pilkuin eroteltuina.',
        results: 'crit, fumble, success ja/tai fail.',
        total: 'Heiton summa: 15, >=15, <5 tai 19-20.',
        natural: 'Nopan luonnollinen silmäluku: 20, <=2 tai 19-20.',
        dice: 'auto, any tai nopan koko kuten 20.',
        cooldown: 'Sekunnit ennen kuin kuuntelija voi laueta uudelleen.',
        stop: 'on lopettaa myöhempien kuuntelijoiden tarkistamisen, kun tämä laukeaa.',
        speaker: 'default, crl tai roller.',
        enabled: 'on tai off.',
        name: 'Nimeää kuuntelijan uudelleen.',
        commands: 'Suoritettavat komennot. Erota rivit merkeillä \\\\.',
      },
      placeholders: {
        heading: 'Muuttujat',
        intro: 'Nämä korvataan kuuntelijan komennoissa, kun se laukeaa.',
        colName: 'Muuttuja',
        colDesc: 'Korvataan tällä',
        who: 'Chatissa näkyvä nimi.',
        character: 'Hahmon nimi heittopohjasta tai chatissa näkyvä nimi.',
        player: 'Pelaajan näyttönimi.',
        template: 'Heittopohjan nimi.',
        total: 'Täsmänneen heiton (tai ensimmäisen heiton) summa.',
        natural: 'Kyseisen heiton luonnollinen d20 (tai ensimmäinen noppa).',
        result: 'crit, fumble, success tai fail, jos jotakin niistä kysyttiin.',
        expression: 'Heittolauseke, kuten 1d20+5.',
        table: 'Kyseisen heiton heittotaulukkotulokset.',
        listener: 'Kuuntelijan nimi.',
        field:
          'Heittopohjan kenttä, kuten ${field:rname} (rivin sisäiset heitot näytetään summinaan).',
      },
      running: {
        heading: 'Miten komennot suoritetaan',
        points: [
          'Jokainen rivi lähetetään omana chat-viestinään, paitsi että usealle riville jakautuva {{ … }}-lohko (heittopohja tai ScriptCards-skripti) pidetään yhdessä.',
          'Komennot lähetetään CRL:n tai heittäneen hahmon nimissä kuuntelijan tai asetusten mukaan. Muut modit näkevät CRL:n lähettämät komennot API:sta tulevina.',
          'Komennoissa voi käyttää rivin sisäisiä heittoja, heittopohjia, @{Character|attribute} ja %{Character|ability}. Valitun merkin viittaukset (@{selected|…}) ja kyselyt (?{…}) eivät toimi, koska kysyttävää ei ole.',
          'Kuuntelijat tarkistetaan järjestyksessä. Kuuntelija, jossa on Lopeta tämän jälkeen, estää myöhempiä kuuntelijoita laukeamasta samasta viestistä.',
          'Odotusaika estää kuuntelijaa laukeamasta uudelleen niin moneen sekuntiin.',
          'CRL ohittaa omat viestinsä. Jos kuuntelija silti laukeaa yli 20 kertaa 10 sekunnissa, se kytketään pois päältä ja pelinjohtajalle ilmoitetaan.',
        ],
      },
      inspector: {
        heading: 'Tarkastin',
        points: [
          'Napsauta Tutki seuraava viesti ja heitä sitten. CRL kuiskaa, mitä se näki: viestityypin, puhujan, hahmon, pohjan ja sen kentät, jokaisen heiton noppineen, kuuntelijoiden etsimän tekstin sekä syyn, miksi kukin kuuntelija laukesi tai ei lauennut.',
          'Käytä sitä lomakkeen pohjan nimen löytämiseen tai nähdäksesi, mitä Beacon-lomake (kuten D&D 2024) lähettää.',
          'Beacon-lomakkeet lähettävät heittopohjien sijaan heittokortteja. CRL lukee ne: pohja on kortin ensimmäinen luokka (dnd-2024 D&D 2024:lle), hahmosta, otsikosta (kuten Dexterity Check) ja alaluokasta tulee kenttiä, ja jokainen erittelyn heitto on heitto, joten kriittinen-, kömmähdys-, summa- ja luonnollinen-tarkistukset toimivat.',
        ],
      },
      settings: {
        heading: 'Asetukset',
        intro:
          'Muuta näitä komennolla !crl config tai Asetukset-painikkeella. Joitakin voi asettaa myös modin One-Click-asetuksissa.',
        colKey: 'Asetus',
        colName: 'Nimi',
        colDesc: 'Kuvaus',
      },
      storage: {
        heading: 'Missä kuuntelijat säilytetään',
        body: 'Jokainen kuuntelija on kyky arkistoidulla hahmolla ”{character}”. Kyky sisältää komennot, joten voit muokata niitä Journalissa täydellä makroeditorilla. Sen kuvaus sisältää kuuntelijan säännöt, minkä ansiosta kuuntelijat säilyvät myös pelin kopioinnissa. Kyvyn poistaminen poistaa sen kuuntelijan; käsin lisätty kyky näkyy valikossa pois päältä kytkettynä.',
      },
      upgrading: {
        heading: 'Päivittäminen versiosta 1',
        points: [
          'Version 1 kuuntelijat muunnetaan ensimmäisellä käynnistyskerralla, ja ne säilyttävät komentonsa.',
          'Teksti, jossa on vain tavallisia merkkejä, muuttuu tavalliseksi tekstiksi eikä enää välitä isoista ja pienistä kirjaimista. Säännöllisen lausekkeen symboleja käyttävä teksti pysyy säännöllisenä lausekkeena.',
          'Kuuntelijat, joilla oli heiton tulos mutta ei ##-merkkiä, epäonnistuivat ennen virheellä ”not parseable”; nyt ne tarkistavat viestin jokaisen heiton.',
          'Epäonnistuminen tarkoittaa nyt rajaheittoa ilman onnistumisia; täsmälleen rajan suuruinen heitto on onnistuminen.',
          'Version 1 komennot toimivat yhä:',
        ],
        colV1: 'Versio 1',
        colV2: 'Versio 2',
      },
      troubleshooting: {
        heading: 'Vianmääritys',
        points: [
          'Mitään ei tapahdu: tarkista, että Kuuntelu on päällä ja kuuntelija on päällä, ja katso sitten tarkastimella, mikä suodatin ei täsmää.',
          'Lomakkeen heittoja ei tunnisteta: tutki yksi; sen näyttämä pohjan nimi ja kentät ovat se, millä suodattaa.',
          'Beacon-lomakkeet (kuten D&D 2024) vaativat Experimental Mod -sandboxin, jotta modit näkevät niiden heitot.',
          'Komennot, joissa on @{…} tai %{…}, menettävät ne, kun ne kirjoitetaan komentoon !crl; muokkaa kykyä mieluummin Journalissa.',
          'Vahinkonoppia lasketaan kriittisiksi: aseta Tarkistetut nopat arvoon d20.',
          'Virheet kirjoitetaan API-konsoliin etuliitteellä ”Customizable Roll Listener”.',
        ],
      },
      languages: {
        heading: 'Kielet',
        body: 'Valitse kieli komennolla !crl config language tai One-Click-asetuksella Language. Tuetut kielet:',
        colCode: 'Koodi',
        colName: 'Kieli',
        colNative: 'Alkuperäinen nimi',
      },
      credits: {
        heading: 'Tekijät',
        original: 'Alkuperäinen modi:',
        maintainer: 'Versio 2:',
        support: 'Ilmoita ongelmista Roll20-foorumeilla tai GitHub-repositoriossa.',
        wiki: 'Version 1 wikisivu',
      },
    },
  };

  const TRANSLATION$f = {
    titles: {
      ready: 'Customizable Roll Listener est prêt.',
      settings: 'Paramètres de CRL',
      languages: 'Choisir une langue',
      help: 'Commandes de CRL',
      confirm: 'Veuillez confirmer',
      inspect: 'Inspecteur CRL',
      listener: 'Écouteur : {name}',
      listenerCommands: 'Commandes : {name}',
    },
    menu: {
      listening: 'Écoute',
      listeners: 'Écouteurs (vérifiés dans cet ordre)',
      noListeners: 'Aucun écouteur pour l’instant. Cliquez sur Nouvel écouteur pour en créer un.',
      noCommands: 'Aucune commande pour l’instant.',
      commandsHint:
        'Séparez les lignes par \\\\ quand vous tapez des commandes dans le chat. Pour les références @{...} ou %{...}, modifiez plutôt la capacité dans le Journal, car le chat les remplace avant que CRL ne les voie.',
    },
    buttons: {
      back: 'Retour',
      change: 'Modifier',
      confirmDelete: 'Oui, supprimer',
      delete: 'Supprimer',
      edit: 'Éditer',
      help: 'Aide',
      inspect: 'Inspecter le prochain message',
      inspectOff: 'Arrêter l’inspection',
      new: 'Nouvel écouteur',
      openJournal: 'Ouvrir dans le Journal',
      rebuildJournal: 'Reconstruire les documents',
      rename: 'Renommer',
      setCommands: 'Définir les commandes',
      settings: 'Paramètres',
      test: 'Tester',
      enable: 'Activer',
      disable: 'Désactiver',
      menu: 'Écouteurs',
      turnOn: 'Activer l’écoute',
      turnOff: 'Couper l’écoute',
    },
    prompts: {
      newName: 'Nom du nouvel écouteur',
      name: 'Nouveau nom',
      target: 'Nom de l’écouteur',
      commands: 'Commandes - séparez les lignes par deux barres obliques inverses',
      templates:
        'Modèles de jet séparés par des espaces - none pour aucun modèle - vide pour tous - Inspecter affiche le modèle d’un jet',
      types: 'Types de message séparés par des espaces - vide pour tous sauf api',
      text: 'Texte à chercher - voir le document d’aide - vide pour tout',
      regex: 'Comment lire le texte',
      who: 'Noms d’orateurs ou de personnages séparés par des virgules - vide pour tout le monde',
      players: 'Noms de joueurs séparés par des virgules - vide pour tout le monde',
      results: 'Résultat du jet',
      total: 'Total du jet, par exemple 15 ou 19-20 - voir le document d’aide - vide pour tous',
      natural: 'Résultat naturel du dé, par exemple 20 ou 1-2 - vide pour tous',
      dice: 'Quels dés les vérifications examinent',
      cooldown: 'Secondes d’attente avant un nouveau déclenchement - 0 pour aucune',
      speaker: 'Envoyer les commandes en tant que',
    },
    choices: {
      critOrFumble: 'Critique ou échec critique',
    },
    values: {
      on: 'Activé',
      off: 'Désactivé',
      none: 'Aucun',
      any: 'Tous',
      allButApi: 'Tous (sauf commandes API)',
      plain: 'Texte simple',
      regex: 'Expression régulière',
      diceAuto: 'Auto (d20 si lancés)',
      diceAny: 'N’importe quel dé',
      seconds: '{seconds} s',
      speaker: {
        default: 'Réglage par défaut',
        crl: 'CRL',
        roller: 'Le lanceur',
      },
    },
    results: {
      crit: 'Critique',
      fumble: 'Échec critique',
      success: 'Réussite',
      fail: 'Échec',
    },
    fields: {
      enabled: 'Activé',
      templates: 'Modèles de jet',
      types: 'Types de message',
      text: 'Texte',
      regex: 'Le texte est',
      who: 'Orateurs / personnages',
      players: 'Joueurs',
      results: 'Résultat du jet',
      total: 'Total du jet',
      natural: 'Dé naturel',
      dice: 'Dés vérifiés',
      cooldown: 'Délai de réactivation',
      stop: 'S’arrêter après celui-ci',
      speaker: 'Envoyer en tant que',
      commands: 'Commandes',
    },
    settings: {
      enabled: {
        label: 'Écoute',
        desc: 'Active ou désactive tous les écouteurs d’un coup.',
      },
      speaker: {
        label: 'Envoyer les commandes en tant que',
        desc: 'Au nom de qui les commandes des écouteurs sont envoyées, sauf indication contraire d’un écouteur : CRL, ou le personnage (ou joueur) dont le message l’a déclenché.',
      },
      listenToMods: {
        label: 'Écouter les autres mods',
        desc: 'Indique si le chat envoyé par d’autres mods peut déclencher des écouteurs. CRL ne réagit jamais à ses propres messages.',
      },
      language: {
        label: 'Langue',
        desc: 'Langue des menus, messages et documents.',
      },
    },
    inspect: {
      type: 'Type',
      who: 'Orateur',
      character: 'Personnage',
      player: 'Joueur',
      template: 'Modèle de jet',
      keys: 'Propriétés du message',
      extras: 'Données supplémentaires du message',
      fields: 'Champs du modèle',
      rolls: 'Jets',
      dice: 'dés',
      table: 'table',
      target: 'a un seuil de réussite',
      crit: 'critique',
      fumble: 'échec critique',
      text: 'Texte (tel que lu par les écouteurs)',
      raw: 'Contenu brut',
      listeners: 'Écouteurs',
      matched: 'déclencherait {result}',
      reasons: {
        disabled: 'désactivé',
        type: 'le type de message ne correspond pas',
        template: 'le modèle de jet ne correspond pas',
        who: 'l’orateur ou le personnage ne correspond pas',
        player: 'le joueur ne correspond pas',
        text: 'texte introuvable',
        roll: 'aucun jet ne remplit les conditions de jet',
      },
    },
    messages: {
      upgraded:
        'Mise à niveau depuis la version 1. {count} écouteur(s) converti(s), commandes conservées.',
      restored: '{count} écouteur(s) restauré(s) depuis le personnage de stockage.',
      adopted:
        '{count} capacité(s) trouvée(s) sur le personnage de stockage sans règles d’écouteur. Elles ont été ajoutées désactivées ; configurez-les depuis le menu.',
      removed: '{count} écouteur(s) supprimé(s) car leur capacité a été effacée.',
      listeningOff: 'L’écoute est désactivée. Tapez !crl on pour l’activer.',
      readyHint:
        '{count} écouteur(s). Tapez !crl pour le menu ou !crl help pour toutes les commandes.',
      loopStopped:
        'L’écouteur « {name} » s’est déclenché trop souvent en peu de temps, sans doute parce que ses commandes le redéclenchent ; il a donc été désactivé.',
      noCommands: 'L’écouteur « {name} » n’a aucune commande à exécuter.',
      tested: 'Commandes de « {name} » exécutées ({count} message(s)).',
      confirmDelete:
        'Supprimer l’écouteur « {name} » et ses commandes ? Cette action est irréversible.',
      deleted: 'L’écouteur « {name} » a été supprimé.',
      inspectOn: 'Le prochain message du chat sera inspecté et le résultat vous sera chuchoté.',
      inspectOff: 'L’inspecteur a été désactivé.',
      journalRebuilt: 'Les documents « {help} » et « {deck} » ont été reconstruits.',
    },
    errors: {
      gmOnly: 'Seul un MJ peut utiliser les commandes de Customizable Roll Listener.',
      unexpected: 'Une erreur s’est produite : {message}',
      unknownCommand: 'Commande inconnue « {command} ».',
      badOption: 'Option inconnue --{option}.',
      notFound: 'Aucun écouteur ne s’appelle « {name} ».',
      nameRequired: 'Veuillez indiquer un nom d’écouteur.',
      nameInvalid: 'Le nom « {name} » ne peut pas être utilisé.',
      nameTaken: 'Un écouteur s’appelle déjà « {name} ».',
      badOnOff: 'La valeur « {value} » n’est pas valide pour --{option}.',
      badType: 'Type(s) de message inconnu(s) : {value}.',
      badRegex: 'L’expression régulière « {term} » n’est pas valide : {error}',
      tooManyTerms: 'Un écouteur peut chercher au plus {max} morceaux de texte.',
      badResult: 'Résultat(s) de jet inconnu(s) : {value}.',
      badComparison: 'La valeur « {value} » n’est pas valide pour --{option}.',
      badDice: 'La valeur « {value} » n’est pas valide pour --dice.',
      badCooldown: 'La valeur « {value} » n’est pas valide pour --cooldown.',
      badSpeaker: 'La valeur « {value} » n’est pas valide pour --speaker.',
      noStore: 'Le personnage de stockage n’a pas pu être créé.',
      badSetting: 'Paramètre inconnu « {key} ».',
      badSettingValue: 'La valeur « {value} » n’est pas valide pour {key}.',
    },
    hints: {
      gmOnly: 'Demandez à votre MJ de configurer les écouteurs pour vous.',
      unknownCommand: 'Tapez !crl help pour voir toutes les commandes.',
      badOption:
        'Les options sont --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name et --commands.',
      notFound: 'Tapez !crl pour voir la liste des écouteurs.',
      nameInvalid:
        'Utilisez au plus {max} caractères, sans ceux-ci : | { } [ ] \\ @ % # ? ~ ni "--", et ne commencez pas par "-".',
      badOnOff: 'Utilisez on ou off.',
      badType: 'Les types de message sont : {types}.',
      badResult: 'Utilisez crit, fumble, success ou fail.',
      badComparison:
        'Utilisez un nombre, une comparaison comme >=15 ou <3, ou une plage comme 19-20.',
      badDice: 'Utilisez auto, any, ou une taille de dé comme 20 ou d20.',
      badCooldown: 'Utilisez un nombre entier de secondes entre 0 et 3600.',
      badSpeaker: 'Utilisez default, crl ou roller.',
      badSetting: 'Les paramètres sont : {keys}.',
      noStore: 'Vérifiez les erreurs dans la console API, puis redémarrez le sandbox.',
    },
    help: {
      menu: 'Affiche la liste des écouteurs.',
      new: 'Crée un écouteur. Des options peuvent être ajoutées directement.',
      show: 'Affiche un écouteur et ses réglages, avec des boutons pour les modifier.',
      edit: 'Modifie un écouteur. Laissez une valeur vide (ou utilisez -) pour l’effacer.',
      commands:
        'Remplace les commandes d’un écouteur. Tout ce qui suit --commands est utilisé, placez-le donc en dernier.',
      enable: 'Active ou désactive un écouteur.',
      move: 'Avance ou recule un écouteur dans l’ordre de vérification.',
      test: 'Exécute maintenant les commandes d’un écouteur, comme si un 20 naturel avait été obtenu.',
      delete: 'Supprime un écouteur et ses commandes (après confirmation).',
      inspect:
        'Chuchote une analyse du prochain message du chat et des écouteurs qu’il déclencherait.',
      inspectOff: 'Cesse d’attendre un message à inspecter.',
      onOff: 'Active ou désactive toute l’écoute.',
      config: 'Affiche ou modifie les paramètres généraux.',
      journal: 'Reconstruit les documents d’aide et de tableau de commandes.',
      help: 'Affiche cette liste.',
      optionsTitle: 'Options',
      options:
        'Options : --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name et --commands. Les noms peuvent remplacer les ID.',
      placeholders:
        'Les commandes peuvent utiliser ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} et ${field:name}.',
      handouts:
        'Le document « {help} » explique tout ; le document « {deck} » contient des boutons.',
    },
    store: {
      bio: 'Ce personnage appartient au mod Customizable Roll Listener. Chaque capacité est un écouteur : la capacité contient les commandes à exécuter, et sa description contient les règles de l’écouteur.',
      bioHelp:
        'Vous pouvez modifier les commandes ici. Changez les règles avec !crl ou depuis le document Tableau de commandes. Supprimer une capacité supprime son écouteur.',
    },
    deck: {
      subtitle: 'Tableau de commandes',
      listeners: 'Écouteurs',
      listenersDesc: 'Voir, créer, modifier et tester les écouteurs.',
      listening: 'Écoute',
      listeningDesc: 'Activer ou désactiver tous les écouteurs d’un coup.',
      tools: 'Outils',
      toolsDesc:
        'Inspecter un message du chat, modifier les paramètres, reconstruire les documents ou lire l’aide.',
      footer:
        'Toutes les commandes sont réservées au MJ. Voir le document « {help} » pour les détails.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Écoutez les dés, entendez l’action',
      footer: 'Des boutons pour chaque commande se trouvent dans le document « {deck} ».',
      overview: {
        heading: 'Présentation',
        body: 'Customizable Roll Listener (CRL) surveille le chat et exécute les commandes de votre choix quand un message correspond à un écouteur. Un écouteur peut examiner le modèle de jet, le texte, l’auteur du message et les jets qu’il contient : coups critiques, échecs critiques, réussites, échecs, totaux et résultats naturels des dés. Les commandes peuvent être tout ce que vous pourriez taper dans le chat, y compris les commandes d’autres mods : CRL peut donc jouer des sons, lancer sur des tables, publier des emotes, appliquer des marqueurs d’état et bien plus.',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        steps: [
          'Tapez !crl dans le chat (ou cliquez sur Écouteurs dans le document Tableau de commandes).',
          'Cliquez sur Nouvel écouteur et donnez-lui un nom, par exemple Son critique.',
          'Cliquez sur Modifier à côté de Résultat du jet et choisissez Critique.',
          'Cliquez sur Définir les commandes et saisissez ce qu’il faut exécuter, par exemple !roll20AM --audio,play|Crit.',
          'Cliquez sur Tester pour vérifier les commandes, puis lancez une attaque. Utilisez Inspecter le prochain message s’il ne se déclenche pas.',
        ],
      },
      examples: {
        heading: 'Exemples',
        points: [
          'Un son à chaque coup critique, depuis n’importe quelle fiche : --results crit',
          'Table d’échecs critiques sur un 1 naturel dans le modèle d’attaque D&D 5e 2014 : --templates atkdmg atk --natural 1',
          'Réagir à un résultat de table aléatoire : --text Combat',
          'Pour un seul personnage : --who Alice',
          'Un total de 20 ou plus sur le premier jet en ligne d’un jet de « Force » : --text Force && ## --total >=20',
        ],
        code: [
          '!crl new Son critique --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Échec critique --natural 1 --dice 20 --commands /em rate lamentablement ! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrateur --results crit fumble --speaker crl --commands /desc ${who} obtient : ${result} !',
        ],
      },
      matching: {
        heading: 'Ce que vérifie un écouteur',
        points: [
          'Un écouteur se déclenche quand tous ses filtres correspondent. Les filtres vides correspondent à tout.',
          'Modèles de jet : le nom du modèle, comme atkdmg ou simple. « none » correspond aux messages sans modèle. Plusieurs noms signifient n’importe lequel d’entre eux.',
          'Types de message : general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (fiches Beacon) et api. Si vide, tous les types sauf les commandes api sont vérifiés.',
          'Texte : un ou plusieurs morceaux de texte, séparés par &&, qui doivent tous apparaître. La recherche ignore les majuscules et minuscules. Le texte est aussi trouvé dans les totaux de jets et les résultats de tables aléatoires.',
          '## dans le texte représente un jet en ligne ; les vérifications de jet n’examinent alors que les jets trouvés à cet endroit. Sans ##, tous les jets du message sont vérifiés.',
          'Le texte peut être une expression régulière au lieu de texte simple (--regex on).',
          'Orateurs / personnages : le nom affiché dans le chat, ou le nom du personnage dans le modèle de jet. Joueurs : le nom d’affichage du joueur.',
        ],
      },
      templates: {
        heading: 'Noms des modèles de jet',
        points: [
          'Un modèle de jet est la mise en page qu’une fiche utilise pour ses cartes de jet. Son nom est la partie après template: dans une macro ; ainsi &{template:atkdmg} est le modèle atkdmg. Chaque fiche a ses propres noms.',
          'Le moyen le plus rapide de trouver un nom : cliquez sur Inspecter le prochain message, faites le jet depuis la fiche et lisez la ligne Modèle de jet que CRL vous chuchote.',
          'Vous pouvez aussi lire le nom dans la macro d’un bouton de la fiche, ou dans la source de la fiche sur GitHub, où chaque modèle est un <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Modèles des fiches courantes :',
        ],
        colSheet: 'Fiche',
        colNames: 'Noms des modèles',
        links: 'En savoir plus sur les modèles de jet :',
        builtIn: 'Roll20 : modèles de jet intégrés',
        dnd5e2014: 'Roll20 : modèles de jet D&D 5e (2014)',
        sheets: 'Source des fiches de personnage Roll20',
      },
      rolls: {
        heading: 'Vérifications de jet',
        points: [
          'Résultat du jet : critique (la face la plus haute du dé, ou la plage cs), échec critique (un 1, ou la plage cf), réussite (au moins un dé atteint un seuil comme 1d20>15), échec (un jet à seuil sans aucune réussite). Plusieurs résultats signifient n’importe lequel d’entre eux.',
          'Total du jet : un nombre, une comparaison comme >=15, ou une plage comme 19-20.',
          'Dé naturel : la face sur laquelle un dé est tombé, comme 20, ou <=2.',
          'Dés vérifiés : auto n’examine que les d20 quand il y en a un, pour que les dés de dégâts sur leur face maximale ne comptent pas comme des critiques. Choisissez N’importe quel dé, ou une taille comme d100, pour changer cela.',
          'Les dés écartés (avantage et désavantage) et les dés relancés sont ignorés.',
          'La fiche D&D 5E by Roll20 (2014) lance l’avantage et le désavantage comme deux jets de d20 séparés (r1 et r2), CRL vérifie donc les deux : avec l’avantage, un 1 sur le dé le plus bas compte quand même comme échec critique, et avec le désavantage, un 20 sur le dé le plus haut compte quand même comme critique.',
          'Un écouteur se déclenche quand au moins un jet remplit toutes les vérifications de jet.',
        ],
      },
      commands: {
        heading: 'Commandes de chat',
        intro:
          'Toutes les commandes sont réservées au MJ. Un écouteur peut être désigné par son nom ou son ID.',
        colCommand: 'Commande',
        colDesc: 'Ce qu’elle fait',
      },
      options: {
        heading: 'Options des écouteurs',
        intro:
          'Ajoutez-les à !crl new ou !crl edit. Laissez une valeur vide, ou utilisez -, pour l’effacer. --commands doit venir en dernier.',
        colOption: 'Option',
        colDesc: 'Signification',
        templates:
          'Noms des modèles de jet, séparés par des espaces. none = aucun modèle. Voir Noms des modèles de jet ci-dessus.',
        types: 'Types de message, séparés par des espaces : {types}.',
        text: 'Texte à trouver. Séparez les morceaux par &&. ## marque un jet en ligne.',
        regex: 'on pour lire le texte comme des expressions régulières, off pour du texte simple.',
        who: 'Noms d’orateurs ou de personnages, séparés par des virgules.',
        players: 'Noms d’affichage des joueurs, séparés par des virgules.',
        results: 'crit, fumble, success et/ou fail.',
        total: 'Total du jet : 15, >=15, <5 ou 19-20.',
        natural: 'Face naturelle du dé : 20, <=2 ou 19-20.',
        dice: 'auto, any, ou une taille de dé comme 20.',
        cooldown: 'Secondes avant que l’écouteur puisse se redéclencher.',
        stop: 'on pour ne plus vérifier les écouteurs suivants une fois celui-ci déclenché.',
        speaker: 'default, crl ou roller.',
        enabled: 'on ou off.',
        name: 'Renomme l’écouteur.',
        commands: 'Les commandes à exécuter. Séparez les lignes par \\\\.',
      },
      placeholders: {
        heading: 'Variables',
        intro: 'Elles sont remplacées dans les commandes d’un écouteur quand il se déclenche.',
        colName: 'Variable',
        colDesc: 'Remplacée par',
        who: 'Le nom affiché dans le chat.',
        character: 'Le nom du personnage tiré du modèle de jet, ou le nom affiché dans le chat.',
        player: 'Le nom d’affichage du joueur.',
        template: 'Le nom du modèle de jet.',
        total: 'Le total du jet correspondant (ou du premier jet).',
        natural: 'Le d20 naturel (ou premier dé) de ce jet.',
        result: 'crit, fumble, success ou fail, si l’un d’eux était demandé.',
        expression: 'L’expression du jet, comme 1d20+5.',
        table: 'Les résultats de table aléatoire de ce jet.',
        listener: 'Le nom de l’écouteur.',
        field:
          'Un champ du modèle de jet, comme ${field:rname} (les jets en ligne sont affichés par leur total).',
      },
      running: {
        heading: 'Exécution des commandes',
        points: [
          'Chaque ligne est envoyée comme un message de chat distinct, sauf qu’un bloc {{ … }} réparti sur plusieurs lignes (un modèle de jet ou un script ScriptCards) reste groupé.',
          'Les commandes sont envoyées au nom de CRL, ou du personnage qui a lancé, selon le réglage de l’écouteur ou des paramètres. Les autres mods voient les commandes envoyées par CRL comme provenant de l’API.',
          'Les commandes peuvent utiliser des jets en ligne, des modèles de jet, @{Character|attribute} et %{Character|ability}. Les références au jeton sélectionné (@{selected|…}) et les requêtes (?{…}) ne fonctionnent pas, car personne n’est là pour répondre.',
          'Les écouteurs sont vérifiés dans l’ordre. Un écouteur réglé sur S’arrêter après celui-ci empêche les écouteurs suivants de se déclencher sur le même message.',
          'Un délai de réactivation empêche un écouteur de se redéclencher pendant ce nombre de secondes.',
          'CRL ignore ses propres messages. Si un écouteur se déclenche malgré tout plus de 20 fois en 10 secondes, il est désactivé et le MJ est prévenu.',
        ],
      },
      inspector: {
        heading: 'L’inspecteur',
        points: [
          'Cliquez sur Inspecter le prochain message, puis faites le jet. CRL chuchote ce qu’il a vu : le type de message, l’orateur, le personnage, le modèle et ses champs, chaque jet avec ses dés, le texte examiné par les écouteurs, et pourquoi chaque écouteur s’est déclenché ou non.',
          'Utilisez-le pour trouver le nom de modèle d’une fiche, ou pour voir ce qu’envoie une fiche Beacon (comme D&D 2024).',
          'Les fiches Beacon publient des cartes de jet au lieu de modèles de jet. CRL les lit : le modèle est la première classe de la carte (dnd-2024 pour D&D 2024), le personnage, le titre (comme Test de Dextérité) et la sous-catégorie deviennent des champs, et chaque jet du détail est un jet ; les vérifications critique, échec critique, total et naturel fonctionnent donc.',
        ],
      },
      settings: {
        heading: 'Paramètres',
        intro:
          'Modifiez-les avec !crl config ou le bouton Paramètres. Certains peuvent aussi être réglés dans les options One-Click du mod.',
        colKey: 'Paramètre',
        colName: 'Nom',
        colDesc: 'Description',
      },
      storage: {
        heading: 'Où sont conservés les écouteurs',
        body: 'Chaque écouteur est une capacité du personnage archivé « {character} ». La capacité contient les commandes, que vous pouvez donc modifier dans le Journal avec l’éditeur de macros complet. Sa description contient les règles de l’écouteur, ce qui permet aussi aux écouteurs de survivre à la copie de la partie. Supprimer une capacité supprime son écouteur ; une capacité ajoutée à la main apparaît désactivée dans le menu.',
      },
      upgrading: {
        heading: 'Mise à niveau depuis la version 1',
        points: [
          'Les écouteurs de la version 1 sont convertis au premier démarrage et conservent leurs commandes.',
          'Un texte qui ne contient que des caractères simples devient du texte simple et ignore désormais les majuscules et minuscules. Un texte utilisant des symboles d’expression régulière reste une expression régulière.',
          'Les écouteurs avec un résultat de jet mais sans ## échouaient avec « not parseable » ; ils vérifient désormais tous les jets du message.',
          'Échec signifie désormais un jet à seuil sans aucune réussite ; un jet exactement égal au seuil est une réussite.',
          'Les commandes de la version 1 fonctionnent toujours :',
        ],
        colV1: 'Version 1',
        colV2: 'Version 2',
      },
      troubleshooting: {
        heading: 'Dépannage',
        points: [
          'Rien ne se passe : vérifiez que l’écoute est activée et que l’écouteur est activé, puis utilisez l’inspecteur pour voir quel filtre échoue.',
          'Les jets d’une fiche ne sont pas reconnus : inspectez-en un ; le nom de modèle et les champs affichés sont ce sur quoi filtrer.',
          'Les fiches Beacon (comme D&D 2024) nécessitent le sandbox Experimental Mod pour que les mods voient leurs jets.',
          'Les commandes utilisant @{…} ou %{…} les perdent quand elles sont tapées dans !crl ; modifiez plutôt la capacité dans le Journal.',
          'Dés de dégâts comptés comme critiques : réglez Dés vérifiés sur d20.',
          'Les erreurs sont écrites dans la console API avec le préfixe « Customizable Roll Listener ».',
        ],
      },
      languages: {
        heading: 'Langues',
        body: 'Choisissez une langue avec !crl config language ou l’option One-Click Language. Langues prises en charge :',
        colCode: 'Code',
        colName: 'Langue',
        colNative: 'Nom natif',
      },
      credits: {
        heading: 'Crédits',
        original: 'Mod original par',
        maintainer: 'Version 2 par',
        support: 'Signalez les problèmes sur les forums Roll20 ou sur le dépôt GitHub.',
        wiki: 'Page wiki de la version 1',
      },
    },
  };

  const TRANSLATION$e = {
    titles: {
      ready: 'Customizable Roll Listener ist bereit.',
      settings: 'CRL-Einstellungen',
      languages: 'Sprache wählen',
      help: 'CRL-Befehle',
      confirm: 'Bitte bestätigen',
      inspect: 'CRL-Inspektor',
      listener: 'Listener: {name}',
      listenerCommands: 'Befehle: {name}',
    },
    menu: {
      listening: 'Lauschen',
      listeners: 'Listener (in dieser Reihenfolge geprüft)',
      noListeners: 'Noch keine Listener. Klicke auf „Neuer Listener“, um einen anzulegen.',
      noCommands: 'Noch keine Befehle.',
      commandsHint:
        'Trenne Zeilen mit \\\\, wenn du Befehle im Chat eingibst. Für @{...}- oder %{...}-Verweise bearbeite stattdessen die Fähigkeit im Journal, denn der Chat ersetzt sie, bevor CRL sie sieht.',
    },
    buttons: {
      back: 'Zurück',
      change: 'Ändern',
      confirmDelete: 'Ja, löschen',
      delete: 'Löschen',
      edit: 'Bearbeiten',
      help: 'Hilfe',
      inspect: 'Nächste Nachricht prüfen',
      inspectOff: 'Prüfen beenden',
      new: 'Neuer Listener',
      openJournal: 'Im Journal öffnen',
      rebuildJournal: 'Handouts neu erstellen',
      rename: 'Umbenennen',
      setCommands: 'Befehle festlegen',
      settings: 'Einstellungen',
      test: 'Testen',
      enable: 'Einschalten',
      disable: 'Ausschalten',
      menu: 'Listener',
      turnOn: 'Lauschen an',
      turnOff: 'Lauschen aus',
    },
    prompts: {
      newName: 'Name des neuen Listeners',
      name: 'Neuer Name',
      target: 'Name des Listeners',
      commands: 'Befehle – Zeilen mit zwei Backslashes trennen',
      templates:
        'Wurfvorlagen, durch Leerzeichen getrennt – none für keine Vorlage – leer für jede – der Inspektor zeigt die Vorlage eines Wurfs',
      types: 'Nachrichtentypen, durch Leerzeichen getrennt – leer für alle außer api',
      text: 'Gesuchter Text – siehe Hilfe-Handout – leer für jeden',
      regex: 'Wie der Text gelesen wird',
      who: 'Sprecher- oder Charakternamen, durch Kommas getrennt – leer für alle',
      players: 'Spielernamen, durch Kommas getrennt – leer für alle',
      results: 'Wurfergebnis',
      total: 'Wurfsumme wie 15 oder 19-20 – siehe Hilfe-Handout – leer für jede',
      natural: 'Natürliches Würfelergebnis wie 20 oder 1-2 – leer für jedes',
      dice: 'Welche Würfel geprüft werden',
      cooldown: 'Sekunden bis zum erneuten Auslösen – 0 für keine',
      speaker: 'Befehle senden als',
    },
    choices: {
      critOrFumble: 'Kritisch oder Patzer',
    },
    values: {
      on: 'An',
      off: 'Aus',
      none: 'Keine',
      any: 'Beliebig',
      allButApi: 'Beliebig (keine API-Befehle)',
      plain: 'Klartext',
      regex: 'Regulärer Ausdruck',
      diceAuto: 'Auto (W20, falls gewürfelt)',
      diceAny: 'Jeder Würfel',
      seconds: '{seconds} s',
      speaker: {
        default: 'Standardeinstellung',
        crl: 'CRL',
        roller: 'Der Würfelnde',
      },
    },
    results: {
      crit: 'Kritisch',
      fumble: 'Patzer',
      success: 'Erfolg',
      fail: 'Fehlschlag',
    },
    fields: {
      enabled: 'An',
      templates: 'Wurfvorlagen',
      types: 'Nachrichtentypen',
      text: 'Text',
      regex: 'Text ist',
      who: 'Sprecher / Charaktere',
      players: 'Spieler',
      results: 'Wurfergebnis',
      total: 'Wurfsumme',
      natural: 'Natürlicher Wurf',
      dice: 'Geprüfte Würfel',
      cooldown: 'Abklingzeit',
      stop: 'Danach anhalten',
      speaker: 'Senden als',
      commands: 'Befehle',
    },
    settings: {
      enabled: {
        label: 'Lauschen',
        desc: 'Schaltet alle Listener auf einmal ein oder aus.',
      },
      speaker: {
        label: 'Befehle senden als',
        desc: 'Als wer die Befehle der Listener gesendet werden, sofern ein Listener nichts anderes festlegt: CRL oder der Charakter (bzw. Spieler), dessen Nachricht ihn ausgelöst hat.',
      },
      listenToMods: {
        label: 'Auf andere Mods hören',
        desc: 'Ob Chatnachrichten anderer Mods Listener auslösen können. CRL reagiert nie auf seine eigenen Nachrichten.',
      },
      language: {
        label: 'Sprache',
        desc: 'Sprache für Menüs, Meldungen und Handouts.',
      },
    },
    inspect: {
      type: 'Typ',
      who: 'Sprecher',
      character: 'Charakter',
      player: 'Spieler',
      template: 'Wurfvorlage',
      keys: 'Nachrichteneigenschaften',
      extras: 'Zusätzliche Nachrichtendaten',
      fields: 'Vorlagenfelder',
      rolls: 'Würfe',
      dice: 'Würfel',
      table: 'Tabelle',
      target: 'hat einen Erfolgswert',
      crit: 'Krit',
      fumble: 'Patzer',
      text: 'Text (wie Listener ihn lesen)',
      raw: 'Rohinhalt',
      listeners: 'Listener',
      matched: 'würde auslösen {result}',
      reasons: {
        disabled: 'ausgeschaltet',
        type: 'Nachrichtentyp passt nicht',
        template: 'Wurfvorlage passt nicht',
        who: 'Sprecher oder Charakter passt nicht',
        player: 'Spieler passt nicht',
        text: 'Text nicht gefunden',
        roll: 'kein Wurf erfüllt die Wurfbedingungen',
      },
    },
    messages: {
      upgraded:
        'Von Version 1 aktualisiert. {count} Listener wurden umgewandelt, ihre Befehle bleiben erhalten.',
      restored: '{count} Listener aus dem Speicher-Charakter wiederhergestellt.',
      adopted:
        '{count} Fähigkeit(en) ohne Listener-Regeln auf dem Speicher-Charakter gefunden. Sie wurden ausgeschaltet hinzugefügt; richte sie über das Menü ein.',
      removed: '{count} Listener entfernt, deren Fähigkeit gelöscht wurde.',
      listeningOff: 'Lauschen ist ausgeschaltet. Gib !crl on ein, um es einzuschalten.',
      readyHint: '{count} Listener. Gib !crl für das Menü oder !crl help für alle Befehle ein.',
      loopStopped:
        'Der Listener „{name}“ hat in kurzer Zeit zu oft ausgelöst, vermutlich weil seine Befehle ihn erneut auslösen, und wurde daher ausgeschaltet.',
      noCommands: 'Der Listener „{name}“ hat keine Befehle zum Ausführen.',
      tested: 'Befehle von „{name}“ ausgeführt ({count} Nachricht(en)).',
      confirmDelete:
        'Den Listener „{name}“ und seine Befehle löschen? Dies kann nicht rückgängig gemacht werden.',
      deleted: 'Listener „{name}“ gelöscht.',
      inspectOn: 'Die nächste Chatnachricht wird geprüft und das Ergebnis dir zugeflüstert.',
      inspectOff: 'Der Inspektor wurde ausgeschaltet.',
      journalRebuilt: 'Die Handouts „{help}“ und „{deck}“ wurden neu erstellt.',
    },
    errors: {
      gmOnly: 'Nur die SL kann Befehle von Customizable Roll Listener verwenden.',
      unexpected: 'Etwas ist schiefgelaufen: {message}',
      unknownCommand: 'Unbekannter Befehl „{command}“.',
      badOption: 'Unbekannte Option --{option}.',
      notFound: 'Es gibt keinen Listener namens „{name}“.',
      nameRequired: 'Bitte gib einen Listener-Namen an.',
      nameInvalid: 'Der Name „{name}“ kann nicht verwendet werden.',
      nameTaken: 'Es gibt bereits einen Listener namens „{name}“.',
      badOnOff: 'Der Wert „{value}“ ist für --{option} nicht gültig.',
      badType: 'Unbekannte(r) Nachrichtentyp(en): {value}.',
      badRegex: 'Der reguläre Ausdruck „{term}“ ist nicht gültig: {error}',
      tooManyTerms: 'Ein Listener kann nach höchstens {max} Textstücken suchen.',
      badResult: 'Unbekannte(s) Wurfergebnis(se): {value}.',
      badComparison: 'Der Wert „{value}“ ist für --{option} nicht gültig.',
      badDice: 'Der Wert „{value}“ ist für --dice nicht gültig.',
      badCooldown: 'Der Wert „{value}“ ist für --cooldown nicht gültig.',
      badSpeaker: 'Der Wert „{value}“ ist für --speaker nicht gültig.',
      noStore: 'Der Speicher-Charakter konnte nicht erstellt werden.',
      badSetting: 'Unbekannte Einstellung „{key}“.',
      badSettingValue: 'Der Wert „{value}“ ist für {key} nicht gültig.',
    },
    hints: {
      gmOnly: 'Bitte deine SL, Listener für dich einzurichten.',
      unknownCommand: 'Gib !crl help ein, um alle Befehle zu sehen.',
      badOption:
        'Optionen sind --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name und --commands.',
      notFound: 'Gib !crl ein, um die Liste der Listener zu sehen.',
      nameInvalid:
        'Verwende bis zu {max} Zeichen, ohne diese: | { } [ ] \\ @ % # ? ~ oder „--“, und beginne nicht mit „-“.',
      badOnOff: 'Verwende on oder off.',
      badType: 'Nachrichtentypen sind: {types}.',
      badResult: 'Verwende crit, fumble, success oder fail.',
      badComparison:
        'Verwende eine Zahl, einen Vergleich wie >=15 oder <3 oder einen Bereich wie 19-20.',
      badDice: 'Verwende auto, any oder eine Würfelgröße wie 20 oder d20.',
      badCooldown: 'Verwende eine ganze Zahl an Sekunden von 0 bis 3600.',
      badSpeaker: 'Verwende default, crl oder roller.',
      badSetting: 'Einstellungen sind: {keys}.',
      noStore: 'Prüfe die API-Konsole auf Fehler und starte dann die Sandbox neu.',
    },
    help: {
      menu: 'Zeigt die Liste der Listener.',
      new: 'Erstellt einen Listener. Optionen können direkt angegeben werden.',
      show: 'Zeigt einen Listener und seine Einstellungen mit Schaltflächen zum Ändern.',
      edit: 'Ändert einen Listener. Lass einen Wert leer (oder nutze -), um ihn zu löschen.',
      commands:
        'Ersetzt die Befehle eines Listeners. Alles nach --commands wird verwendet, also setze es ans Ende.',
      enable: 'Schaltet einen Listener ein oder aus.',
      move: 'Verschiebt einen Listener in der Prüfreihenfolge nach vorne oder hinten.',
      test: 'Führt die Befehle eines Listeners jetzt aus, als wäre eine natürliche 20 gewürfelt worden.',
      delete: 'Löscht einen Listener und seine Befehle (mit Rückfrage).',
      inspect:
        'Flüstert eine Aufschlüsselung der nächsten Chatnachricht und welche Listener sie auslösen würde.',
      inspectOff: 'Wartet nicht mehr auf eine zu prüfende Nachricht.',
      onOff: 'Schaltet das gesamte Lauschen ein oder aus.',
      config: 'Zeigt oder ändert die globalen Einstellungen.',
      journal: 'Erstellt die Handouts Hilfe und Befehlsdeck neu.',
      help: 'Zeigt diese Liste.',
      optionsTitle: 'Optionen',
      options:
        'Optionen: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name und --commands. Statt IDs können Namen verwendet werden.',
      placeholders:
        'Befehle können ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} und ${field:name} verwenden.',
      handouts: 'Das Handout „{help}“ erklärt alles; das Handout „{deck}“ enthält Schaltflächen.',
    },
    store: {
      bio: 'Dieser Charakter gehört zum Mod Customizable Roll Listener. Jede Fähigkeit ist ein Listener: Die Fähigkeit enthält die auszuführenden Befehle, ihre Beschreibung die Regeln des Listeners.',
      bioHelp:
        'Hier kannst du die Befehle bearbeiten. Ändere die Regeln mit !crl oder im Handout Befehlsdeck. Wird eine Fähigkeit gelöscht, wird auch ihr Listener gelöscht.',
    },
    deck: {
      subtitle: 'Befehlsdeck',
      listeners: 'Listener',
      listenersDesc: 'Listener ansehen, erstellen, ändern und testen.',
      listening: 'Lauschen',
      listeningDesc: 'Alle Listener auf einmal ein- oder ausschalten.',
      tools: 'Werkzeuge',
      toolsDesc:
        'Eine Chatnachricht prüfen, Einstellungen ändern, die Handouts neu erstellen oder die Hilfe lesen.',
      footer: 'Alle Befehle sind nur für die SL. Details im Handout „{help}“.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hör die Würfel, hör die Action',
      footer: 'Schaltflächen für alle Befehle findest du im Handout „{deck}“.',
      overview: {
        heading: 'Überblick',
        body: 'Customizable Roll Listener (CRL) beobachtet den Chat und führt Befehle deiner Wahl aus, wenn eine Nachricht zu einem Listener passt. Ein Listener kann die Wurfvorlage, den Text, den Absender der Nachricht und die enthaltenen Würfe prüfen: kritische Treffer, Patzer, Erfolge, Fehlschläge, Summen und natürliche Würfelergebnisse. Befehle können alles sein, was du in den Chat tippen könntest, auch Befehle anderer Mods – so kann CRL Sounds abspielen, auf Tabellen würfeln, Emotes posten, Statusmarker setzen und mehr.',
      },
      quickStart: {
        heading: 'Schnellstart',
        steps: [
          'Gib !crl im Chat ein (oder klicke im Handout Befehlsdeck auf Listener).',
          'Klicke auf Neuer Listener und gib ihm einen Namen, etwa Krit-Sound.',
          'Klicke neben Wurfergebnis auf Ändern und wähle Kritisch.',
          'Klicke auf Befehle festlegen und gib ein, was ausgeführt werden soll, zum Beispiel !roll20AM --audio,play|Crit.',
          'Klicke auf Testen, um die Befehle zu prüfen, und würfle dann einen Angriff. Nutze Nächste Nachricht prüfen, falls er nicht auslöst.',
        ],
      },
      examples: {
        heading: 'Beispiele',
        points: [
          'Sound bei jedem kritischen Treffer, von jedem Bogen: --results crit',
          'Patzertabelle bei einer natürlichen 1 in der Angriffsvorlage von D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Auf ein Ergebnis einer Würfeltabelle reagieren: --text Combat',
          'Nur für einen Charakter: --who Alice',
          'Eine Summe von 20 oder mehr im ersten Inline-Wurf eines „Stärke“-Wurfs: --text Stärke && ## --total >=20',
        ],
        code: [
          '!crl new Krit-Sound --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Patzer --natural 1 --dice 20 --commands /em patzt! \\\\ /roll 1t[Patzer]',
          '!crl new Erzähler --results crit fumble --speaker crl --commands /desc ${who} würfelt: ${result}!',
        ],
      },
      matching: {
        heading: 'Was ein Listener prüft',
        points: [
          'Ein Listener löst aus, wenn alle seine Filter passen. Leere Filter passen auf alles.',
          'Wurfvorlagen: der Vorlagenname, etwa atkdmg oder simple. „none“ passt auf Nachrichten ohne Vorlage. Mehrere Namen bedeuten: einer davon.',
          'Nachrichtentypen: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon-Bögen) und api. Wenn leer, wird jeder Typ außer api-Befehlen geprüft.',
          'Text: ein oder mehrere Textstücke, getrennt durch &&, die alle vorkommen müssen. Groß- und Kleinschreibung wird ignoriert. Text wird auch in Wurfsummen und Ergebnissen von Würfeltabellen gefunden.',
          '## im Text steht für einen Inline-Wurf; die Wurfprüfungen betrachten dann nur die dort gefundenen Würfe. Ohne ## wird jeder Wurf der Nachricht geprüft.',
          'Text kann statt Klartext ein regulärer Ausdruck sein (--regex on).',
          'Sprecher / Charaktere: der im Chat angezeigte Name oder der Charaktername in der Wurfvorlage. Spieler: der Anzeigename des Spielers.',
        ],
      },
      templates: {
        heading: 'Namen von Wurfvorlagen',
        points: [
          'Eine Wurfvorlage ist das Layout, das ein Bogen für seine Wurfkarten nutzt. Ihr Name ist der Teil nach template: in einem Makro, also ist &{template:atkdmg} die Vorlage atkdmg. Jeder Bogen hat eigene Namen.',
          'Am schnellsten findest du einen Namen so: Klicke auf Nächste Nachricht prüfen, würfle über den Bogen und lies die Zeile Wurfvorlage, die CRL dir zurückflüstert.',
          'Du kannst den Namen auch im Makro einer Bogenschaltfläche lesen oder im Quellcode des Bogens auf GitHub, wo jede Vorlage ein <rolltemplate class="sheet-rolltemplate-NAME"> ist.',
          'Vorlagen gängiger Bögen:',
        ],
        colSheet: 'Bogen',
        colNames: 'Vorlagennamen',
        links: 'Mehr über Wurfvorlagen:',
        builtIn: 'Roll20: eingebaute Wurfvorlagen',
        dnd5e2014: 'Roll20: Wurfvorlagen für D&D 5e (2014)',
        sheets: 'Roll20: Quellcode der Charakterbögen',
      },
      rolls: {
        heading: 'Wurfprüfungen',
        points: [
          'Wurfergebnis: kritisch (die höchste Seite des Würfels oder der cs-Bereich), Patzer (eine 1 oder der cf-Bereich), Erfolg (mindestens ein Würfel erreicht einen Zielwert wie 1d20>15), Fehlschlag (ein Zielwurf ohne Erfolge). Mehrere Ergebnisse bedeuten: eines davon.',
          'Wurfsumme: eine Zahl, ein Vergleich wie >=15 oder ein Bereich wie 19-20.',
          'Natürlicher Wurf: die Seite, auf der ein Würfel landete, etwa 20 oder <=2.',
          'Geprüfte Würfel: auto betrachtet nur W20, wenn einer gewürfelt wurde, damit Schadenswürfel mit ihrer höchsten Seite nicht als Krit zählen. Wähle Jeder Würfel oder eine Größe wie d100, um das zu ändern.',
          'Verworfene Würfel (Vorteil und Nachteil) und neu gewürfelte Würfel werden ignoriert.',
          'Der Bogen D&D 5E by Roll20 (2014) würfelt Vorteil und Nachteil als zwei getrennte W20-Würfe (r1 und r2), daher prüft CRL beide: Mit Vorteil zählt eine 1 auf dem niedrigeren Würfel trotzdem als Patzer, mit Nachteil eine 20 auf dem höheren Würfel trotzdem als Krit.',
          'Ein Listener löst aus, wenn mindestens ein Wurf alle Wurfprüfungen erfüllt.',
        ],
      },
      commands: {
        heading: 'Chatbefehle',
        intro:
          'Alle Befehle sind nur für die SL. Ein Listener kann über seinen Namen oder seine ID angegeben werden.',
        colCommand: 'Befehl',
        colDesc: 'Funktion',
      },
      options: {
        heading: 'Listener-Optionen',
        intro:
          'Hänge diese an !crl new oder !crl edit an. Lass einen Wert leer oder nutze -, um ihn zu löschen. --commands muss am Ende stehen.',
        colOption: 'Option',
        colDesc: 'Bedeutung',
        templates:
          'Namen von Wurfvorlagen, durch Leerzeichen getrennt. none = keine Vorlage. Siehe Namen von Wurfvorlagen oben.',
        types: 'Nachrichtentypen, durch Leerzeichen getrennt: {types}.',
        text: 'Gesuchter Text. Stücke mit && trennen. ## markiert einen Inline-Wurf.',
        regex: 'on, um den Text als reguläre Ausdrücke zu lesen, off für Klartext.',
        who: 'Sprecher- oder Charakternamen, durch Kommas getrennt.',
        players: 'Anzeigenamen der Spieler, durch Kommas getrennt.',
        results: 'crit, fumble, success und/oder fail.',
        total: 'Wurfsumme: 15, >=15, <5 oder 19-20.',
        natural: 'Natürliche Würfelseite: 20, <=2 oder 19-20.',
        dice: 'auto, any oder eine Würfelgröße wie 20.',
        cooldown: 'Sekunden, bevor der Listener erneut auslösen kann.',
        stop: 'on, um spätere Listener nicht mehr zu prüfen, sobald dieser auslöst.',
        speaker: 'default, crl oder roller.',
        enabled: 'on oder off.',
        name: 'Benennt den Listener um.',
        commands: 'Die auszuführenden Befehle. Zeilen mit \\\\ trennen.',
      },
      placeholders: {
        heading: 'Platzhalter',
        intro: 'Diese werden in den Befehlen eines Listeners ersetzt, wenn er auslöst.',
        colName: 'Platzhalter',
        colDesc: 'Ersetzt durch',
        who: 'Der im Chat angezeigte Name.',
        character: 'Der Charaktername aus der Wurfvorlage oder der im Chat angezeigte Name.',
        player: 'Der Anzeigename des Spielers.',
        template: 'Der Name der Wurfvorlage.',
        total: 'Die Summe des passenden Wurfs (oder des ersten Wurfs).',
        natural: 'Der natürliche W20 (oder erste Würfel) dieses Wurfs.',
        result: 'crit, fumble, success oder fail, wenn danach gefragt wurde.',
        expression: 'Der Wurfausdruck, etwa 1d20+5.',
        table: 'Ergebnisse von Würfeltabellen in diesem Wurf.',
        listener: 'Der Name des Listeners.',
        field:
          'Ein Feld der Wurfvorlage, etwa ${field:rname} (Inline-Würfe werden als ihre Summe angezeigt).',
      },
      running: {
        heading: 'Wie Befehle ausgeführt werden',
        points: [
          'Jede Zeile wird als eigene Chatnachricht gesendet; nur ein {{ … }}-Block über mehrere Zeilen (eine Wurfvorlage oder ein ScriptCards-Skript) bleibt zusammen.',
          'Befehle werden als CRL oder als der würfelnde Charakter gesendet, je nach Listener oder Einstellungen. Andere Mods sehen von CRL gesendete Befehle als von der API kommend.',
          'Befehle können Inline-Würfe, Wurfvorlagen, @{Character|attribute} und %{Character|ability} verwenden. Verweise auf ausgewählte Token (@{selected|…}) und Abfragen (?{…}) funktionieren nicht, da niemand gefragt werden kann.',
          'Listener werden der Reihe nach geprüft. Ein Listener mit Danach anhalten verhindert, dass spätere Listener bei derselben Nachricht auslösen.',
          'Eine Abklingzeit verhindert, dass ein Listener für so viele Sekunden erneut auslöst.',
          'CRL ignoriert seine eigenen Nachrichten. Löst ein Listener trotzdem mehr als 20-mal in 10 Sekunden aus, wird er ausgeschaltet und die SL informiert.',
        ],
      },
      inspector: {
        heading: 'Der Inspektor',
        points: [
          'Klicke auf Nächste Nachricht prüfen und würfle dann. CRL flüstert, was es gesehen hat: Nachrichtentyp, Sprecher, Charakter, Vorlage und ihre Felder, jeden Wurf mit seinen Würfeln, den Text, den Listener durchsuchen, und warum jeder Listener ausgelöst hat oder nicht.',
          'Nutze ihn, um den Vorlagennamen eines Bogens zu finden oder um zu sehen, was ein Beacon-Bogen (etwa D&D 2024) sendet.',
          'Beacon-Bögen posten Wurfkarten statt Wurfvorlagen. CRL liest sie: Die Vorlage ist die erste Klasse der Karte (dnd-2024 für D&D 2024), Charakter, Titel (etwa Geschicklichkeitswurf) und Unterkategorie werden zu Feldern, und jeder Wurf in der Aufschlüsselung ist ein Wurf, sodass Krit-, Patzer-, Summen- und Natürlich-Prüfungen funktionieren.',
        ],
      },
      settings: {
        heading: 'Einstellungen',
        intro:
          'Ändere sie mit !crl config oder der Schaltfläche Einstellungen. Einige lassen sich auch in den One-Click-Optionen des Mods festlegen.',
        colKey: 'Einstellung',
        colName: 'Name',
        colDesc: 'Beschreibung',
      },
      storage: {
        heading: 'Wo Listener gespeichert werden',
        body: 'Jeder Listener ist eine Fähigkeit des archivierten Charakters „{character}“. Die Fähigkeit enthält die Befehle, sodass du sie im Journal mit dem vollen Makro-Editor bearbeiten kannst. Ihre Beschreibung enthält die Regeln des Listeners, wodurch Listener auch das Kopieren des Spiels überstehen. Wird eine Fähigkeit gelöscht, wird ihr Listener gelöscht; eine von Hand hinzugefügte Fähigkeit erscheint ausgeschaltet im Menü.',
      },
      upgrading: {
        heading: 'Upgrade von Version 1',
        points: [
          'Listener aus Version 1 werden beim ersten Start umgewandelt und behalten ihre Befehle.',
          'Text, der nur einfache Zeichen enthält, wird zu Klartext und ignoriert nun Groß- und Kleinschreibung. Text mit Symbolen regulärer Ausdrücke bleibt ein regulärer Ausdruck.',
          'Listener mit Wurfergebnis, aber ohne ## schlugen früher mit „not parseable“ fehl; jetzt prüfen sie jeden Wurf der Nachricht.',
          'Fehlschlag bedeutet nun ein Zielwurf ohne Erfolge; ein Wurf genau auf dem Zielwert ist ein Erfolg.',
          'Die Befehle aus Version 1 funktionieren weiterhin:',
        ],
        colV1: 'Version 1',
        colV2: 'Version 2',
      },
      troubleshooting: {
        heading: 'Fehlerbehebung',
        points: [
          'Nichts passiert: Prüfe, ob Lauschen und der Listener eingeschaltet sind, und finde dann mit dem Inspektor heraus, welcher Filter scheitert.',
          'Die Würfe eines Bogens werden nicht erkannt: Prüfe einen; der angezeigte Vorlagenname und die Felder sind das, wonach du filtern solltest.',
          'Beacon-Bögen (etwa D&D 2024) brauchen die Experimental-Mod-Sandbox, damit Mods ihre Würfe sehen.',
          'Befehle mit @{…} oder %{…} verlieren diese, wenn sie in !crl getippt werden; bearbeite stattdessen die Fähigkeit im Journal.',
          'Schadenswürfel zählen als Krit: Setze Geprüfte Würfel auf d20.',
          'Fehler werden mit dem Präfix „Customizable Roll Listener“ in die API-Konsole geschrieben.',
        ],
      },
      languages: {
        heading: 'Sprachen',
        body: 'Wähle eine Sprache mit !crl config language oder der One-Click-Option Language. Unterstützte Sprachen:',
        colCode: 'Code',
        colName: 'Sprache',
        colNative: 'Eigenname',
      },
      credits: {
        heading: 'Mitwirkende',
        original: 'Ursprünglicher Mod von',
        maintainer: 'Version 2 von',
        support: 'Melde Probleme in den Roll20-Foren oder im GitHub-Repository.',
        wiki: 'Wiki-Seite zu Version 1',
      },
    },
  };

  const TRANSLATION$d = {
    titles: {
      ready: 'Το Customizable Roll Listener είναι έτοιμο.',
      settings: 'Ρυθμίσεις CRL',
      languages: 'Επιλογή γλώσσας',
      help: 'Εντολές CRL',
      confirm: 'Επιβεβαίωση',
      inspect: 'Επιθεωρητής CRL',
      listener: 'Ακροατής: {name}',
      listenerCommands: 'Εντολές: {name}',
    },
    menu: {
      listening: 'Ακρόαση',
      listeners: 'Ακροατές (ελέγχονται με αυτή τη σειρά)',
      noListeners: 'Δεν υπάρχουν ακροατές ακόμα. Πατήστε «Νέος ακροατής» για να φτιάξετε έναν.',
      noCommands: 'Δεν υπάρχουν εντολές ακόμα.',
      commandsHint:
        'Χωρίστε τις γραμμές με \\\\ όταν πληκτρολογείτε εντολές στη συνομιλία. Για αναφορές @{...} ή %{...}, επεξεργαστείτε την ικανότητα στο Journal, γιατί η συνομιλία τις αντικαθιστά πριν τις δει το CRL.',
    },
    buttons: {
      back: 'Πίσω',
      change: 'Αλλαγή',
      confirmDelete: 'Ναι, διαγραφή',
      delete: 'Διαγραφή',
      edit: 'Επεξεργασία',
      help: 'Βοήθεια',
      inspect: 'Επιθεώρηση επόμενου μηνύματος',
      inspectOff: 'Τέλος επιθεώρησης',
      new: 'Νέος ακροατής',
      openJournal: 'Άνοιγμα στο Journal',
      rebuildJournal: 'Αναδημιουργία φυλλαδίων',
      rename: 'Μετονομασία',
      setCommands: 'Ορισμός εντολών',
      settings: 'Ρυθμίσεις',
      test: 'Δοκιμή',
      enable: 'Ενεργοποίηση',
      disable: 'Απενεργοποίηση',
      menu: 'Ακροατές',
      turnOn: 'Ακρόαση ανοιχτή',
      turnOff: 'Ακρόαση κλειστή',
    },
    prompts: {
      newName: 'Όνομα του νέου ακροατή',
      name: 'Νέο όνομα',
      target: 'Όνομα ακροατή',
      commands: 'Εντολές - χωρίστε τις γραμμές με δύο ανάποδες καθέτους',
      templates:
        'Πρότυπα ζαριάς χωρισμένα με κενά - none για κανένα πρότυπο - κενό για οποιοδήποτε - η Επιθεώρηση δείχνει το πρότυπο μιας ζαριάς',
      types: 'Τύποι μηνυμάτων χωρισμένοι με κενά - κενό για όλους εκτός από api',
      text: 'Κείμενο προς αναζήτηση - δείτε το φυλλάδιο Βοήθειας - κενό για οποιοδήποτε',
      regex: 'Πώς διαβάζεται το κείμενο',
      who: 'Ονόματα ομιλητών ή χαρακτήρων χωρισμένα με κόμματα - κενό για όλους',
      players: 'Ονόματα παικτών χωρισμένα με κόμματα - κενό για όλους',
      results: 'Αποτέλεσμα ζαριάς',
      total: 'Σύνολο ζαριάς, π.χ. 15 ή 19-20 - δείτε το φυλλάδιο Βοήθειας - κενό για οποιοδήποτε',
      natural: 'Φυσικό αποτέλεσμα ζαριού, π.χ. 20 ή 1-2 - κενό για οποιοδήποτε',
      dice: 'Ποια ζάρια εξετάζουν οι έλεγχοι',
      cooldown: 'Δευτερόλεπτα αναμονής πριν από νέα ενεργοποίηση - 0 για καθόλου',
      speaker: 'Αποστολή εντολών ως',
    },
    choices: {
      critOrFumble: 'Κρίσιμη επιτυχία ή αποτυχία',
    },
    values: {
      on: 'Ανοιχτό',
      off: 'Κλειστό',
      none: 'Κανένα',
      any: 'Οποιοδήποτε',
      allButApi: 'Οποιοδήποτε (όχι εντολές API)',
      plain: 'Απλό κείμενο',
      regex: 'Κανονική έκφραση',
      diceAuto: 'Αυτόματο (d20 αν ρίχτηκαν)',
      diceAny: 'Οποιοδήποτε ζάρι',
      seconds: '{seconds} δευτ.',
      speaker: {
        default: 'Προεπιλεγμένη ρύθμιση',
        crl: 'CRL',
        roller: 'Αυτός που έριξε',
      },
    },
    results: {
      crit: 'Κρίσιμη επιτυχία',
      fumble: 'Κρίσιμη αποτυχία',
      success: 'Επιτυχία',
      fail: 'Αποτυχία',
    },
    fields: {
      enabled: 'Ενεργός',
      templates: 'Πρότυπα ζαριάς',
      types: 'Τύποι μηνυμάτων',
      text: 'Κείμενο',
      regex: 'Το κείμενο είναι',
      who: 'Ομιλητές / χαρακτήρες',
      players: 'Παίκτες',
      results: 'Αποτέλεσμα ζαριάς',
      total: 'Σύνολο ζαριάς',
      natural: 'Φυσικό ζάρι',
      dice: 'Ελεγχόμενα ζάρια',
      cooldown: 'Χρόνος αναμονής',
      stop: 'Διακοπή μετά από αυτόν',
      speaker: 'Αποστολή ως',
      commands: 'Εντολές',
    },
    settings: {
      enabled: {
        label: 'Ακρόαση',
        desc: 'Ενεργοποιεί ή απενεργοποιεί όλους τους ακροατές μαζί.',
      },
      speaker: {
        label: 'Αποστολή εντολών ως',
        desc: 'Ως ποιος στέλνονται οι εντολές των ακροατών, εκτός αν ένας ακροατής ορίζει κάτι άλλο: το CRL ή ο χαρακτήρας (ή παίκτης) του οποίου το μήνυμα τον ενεργοποίησε.',
      },
      listenToMods: {
        label: 'Ακρόαση άλλων mods',
        desc: 'Αν τα μηνύματα συνομιλίας άλλων mods μπορούν να ενεργοποιούν ακροατές. Το CRL δεν αντιδρά ποτέ στα δικά του μηνύματα.',
      },
      language: {
        label: 'Γλώσσα',
        desc: 'Γλώσσα για μενού, μηνύματα και φυλλάδια.',
      },
    },
    inspect: {
      type: 'Τύπος',
      who: 'Ομιλητής',
      character: 'Χαρακτήρας',
      player: 'Παίκτης',
      template: 'Πρότυπο ζαριάς',
      keys: 'Ιδιότητες μηνύματος',
      extras: 'Επιπλέον δεδομένα μηνύματος',
      fields: 'Πεδία προτύπου',
      rolls: 'Ζαριές',
      dice: 'ζάρια',
      table: 'πίνακας',
      target: 'έχει στόχο επιτυχίας',
      crit: 'κρίσιμη',
      fumble: 'αποτυχία',
      text: 'Κείμενο (όπως το διαβάζουν οι ακροατές)',
      raw: 'Ακατέργαστο περιεχόμενο',
      listeners: 'Ακροατές',
      matched: 'θα ενεργοποιούνταν {result}',
      reasons: {
        disabled: 'απενεργοποιημένος',
        type: 'ο τύπος μηνύματος δεν ταιριάζει',
        template: 'το πρότυπο ζαριάς δεν ταιριάζει',
        who: 'ο ομιλητής ή ο χαρακτήρας δεν ταιριάζει',
        player: 'ο παίκτης δεν ταιριάζει',
        text: 'το κείμενο δεν βρέθηκε',
        roll: 'καμία ζαριά δεν πληροί τις συνθήκες ζαριάς',
      },
    },
    messages: {
      upgraded:
        'Αναβάθμιση από την έκδοση 1. Μετατράπηκαν {count} ακροατές και διατηρήθηκαν οι εντολές τους.',
      restored: 'Επαναφέρθηκαν {count} ακροατές από τον χαρακτήρα αποθήκευσης.',
      adopted:
        'Βρέθηκαν {count} ικανότητες στον χαρακτήρα αποθήκευσης χωρίς κανόνες ακροατή. Προστέθηκαν απενεργοποιημένες· ρυθμίστε τις από το μενού.',
      removed: 'Αφαιρέθηκαν {count} ακροατές των οποίων η ικανότητα διαγράφηκε.',
      listeningOff:
        'Η ακρόαση είναι απενεργοποιημένη. Πληκτρολογήστε !crl on για να την ενεργοποιήσετε.',
      readyHint:
        '{count} ακροατές. Πληκτρολογήστε !crl για το μενού ή !crl help για όλες τις εντολές.',
      loopStopped:
        'Ο ακροατής «{name}» ενεργοποιήθηκε πολύ συχνά σε σύντομο χρόνο, πιθανώς επειδή οι εντολές του τον ενεργοποιούν ξανά, γι’ αυτό απενεργοποιήθηκε.',
      noCommands: 'Ο ακροατής «{name}» δεν έχει εντολές για εκτέλεση.',
      tested: 'Εκτελέστηκαν οι εντολές του «{name}» ({count} μηνύματα).',
      confirmDelete: 'Διαγραφή του ακροατή «{name}» και των εντολών του; Αυτό δεν αναιρείται.',
      deleted: 'Ο ακροατής «{name}» διαγράφηκε.',
      inspectOn: 'Το επόμενο μήνυμα συνομιλίας θα επιθεωρηθεί και το αποτέλεσμα θα σας ψιθυριστεί.',
      inspectOff: 'Ο επιθεωρητής απενεργοποιήθηκε.',
      journalRebuilt: 'Τα φυλλάδια «{help}» και «{deck}» αναδημιουργήθηκαν.',
    },
    errors: {
      gmOnly: 'Μόνο ο GM μπορεί να χρησιμοποιεί τις εντολές του Customizable Roll Listener.',
      unexpected: 'Κάτι πήγε στραβά: {message}',
      unknownCommand: 'Άγνωστη εντολή «{command}».',
      badOption: 'Άγνωστη επιλογή --{option}.',
      notFound: 'Δεν υπάρχει ακροατής με όνομα «{name}».',
      nameRequired: 'Δώστε ένα όνομα ακροατή.',
      nameInvalid: 'Το όνομα «{name}» δεν μπορεί να χρησιμοποιηθεί.',
      nameTaken: 'Υπάρχει ήδη ακροατής με όνομα «{name}».',
      badOnOff: 'Η τιμή «{value}» δεν είναι έγκυρη για το --{option}.',
      badType: 'Άγνωστος τύπος μηνύματος: {value}.',
      badRegex: 'Η κανονική έκφραση «{term}» δεν είναι έγκυρη: {error}',
      tooManyTerms: 'Ένας ακροατής μπορεί να αναζητά το πολύ {max} τμήματα κειμένου.',
      badResult: 'Άγνωστο αποτέλεσμα ζαριάς: {value}.',
      badComparison: 'Η τιμή «{value}» δεν είναι έγκυρη για το --{option}.',
      badDice: 'Η τιμή «{value}» δεν είναι έγκυρη για το --dice.',
      badCooldown: 'Η τιμή «{value}» δεν είναι έγκυρη για το --cooldown.',
      badSpeaker: 'Η τιμή «{value}» δεν είναι έγκυρη για το --speaker.',
      noStore: 'Δεν ήταν δυνατή η δημιουργία του χαρακτήρα αποθήκευσης.',
      badSetting: 'Άγνωστη ρύθμιση «{key}».',
      badSettingValue: 'Η τιμή «{value}» δεν είναι έγκυρη για το {key}.',
    },
    hints: {
      gmOnly: 'Ζητήστε από τον GM να ρυθμίσει ακροατές για εσάς.',
      unknownCommand: 'Πληκτρολογήστε !crl help για να δείτε όλες τις εντολές.',
      badOption:
        'Οι επιλογές είναι --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name και --commands.',
      notFound: 'Πληκτρολογήστε !crl για να δείτε τη λίστα ακροατών.',
      nameInvalid:
        'Χρησιμοποιήστε έως {max} χαρακτήρες, χωρίς τους: | { } [ ] \\ @ % # ? ~ ή «--», και μην ξεκινάτε με «-».',
      badOnOff: 'Χρησιμοποιήστε on ή off.',
      badType: 'Οι τύποι μηνυμάτων είναι: {types}.',
      badResult: 'Χρησιμοποιήστε crit, fumble, success ή fail.',
      badComparison:
        'Χρησιμοποιήστε έναν αριθμό, μια σύγκριση όπως >=15 ή <3, ή ένα εύρος όπως 19-20.',
      badDice: 'Χρησιμοποιήστε auto, any ή ένα μέγεθος ζαριού όπως 20 ή d20.',
      badCooldown: 'Χρησιμοποιήστε ακέραιο αριθμό δευτερολέπτων από 0 έως 3600.',
      badSpeaker: 'Χρησιμοποιήστε default, crl ή roller.',
      badSetting: 'Οι ρυθμίσεις είναι: {keys}.',
      noStore: 'Ελέγξτε την κονσόλα API για σφάλματα και μετά επανεκκινήστε το sandbox.',
    },
    help: {
      menu: 'Εμφανίζει τη λίστα ακροατών.',
      new: 'Δημιουργεί έναν ακροατή. Μπορείτε να προσθέσετε επιλογές αμέσως.',
      show: 'Εμφανίζει έναν ακροατή και τις ρυθμίσεις του, με κουμπιά για αλλαγές.',
      edit: 'Αλλάζει έναν ακροατή. Αφήστε μια τιμή κενή (ή χρησιμοποιήστε -) για να τη διαγράψετε.',
      commands:
        'Αντικαθιστά τις εντολές ενός ακροατή. Χρησιμοποιείται ό,τι ακολουθεί το --commands, οπότε βάλτε το τελευταίο.',
      enable: 'Ενεργοποιεί ή απενεργοποιεί έναν ακροατή.',
      move: 'Μετακινεί έναν ακροατή νωρίτερα ή αργότερα στη σειρά ελέγχου.',
      test: 'Εκτελεί τώρα τις εντολές ενός ακροατή, σαν να είχε ριχτεί φυσικό 20.',
      delete: 'Διαγράφει έναν ακροατή και τις εντολές του (ζητά επιβεβαίωση).',
      inspect:
        'Ψιθυρίζει ανάλυση του επόμενου μηνύματος συνομιλίας και ποιους ακροατές θα ενεργοποιούσε.',
      inspectOff: 'Σταματά την αναμονή για μήνυμα προς επιθεώρηση.',
      onOff: 'Ενεργοποιεί ή απενεργοποιεί όλη την ακρόαση.',
      config: 'Εμφανίζει ή αλλάζει τις γενικές ρυθμίσεις.',
      journal: 'Αναδημιουργεί τα φυλλάδια Βοήθειας και Πίνακα εντολών.',
      help: 'Εμφανίζει αυτή τη λίστα.',
      optionsTitle: 'Επιλογές',
      options:
        'Επιλογές: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name και --commands. Μπορούν να χρησιμοποιηθούν ονόματα αντί για IDs.',
      placeholders:
        'Οι εντολές μπορούν να χρησιμοποιούν ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} και ${field:name}.',
      handouts: 'Το φυλλάδιο «{help}» εξηγεί τα πάντα· το φυλλάδιο «{deck}» έχει κουμπιά.',
    },
    store: {
      bio: 'Αυτός ο χαρακτήρας ανήκει στο mod Customizable Roll Listener. Κάθε ικανότητα είναι ένας ακροατής: η ικανότητα περιέχει τις εντολές προς εκτέλεση και η περιγραφή της τους κανόνες του ακροατή.',
      bioHelp:
        'Εδώ μπορείτε να επεξεργαστείτε τις εντολές. Αλλάξτε τους κανόνες με το !crl ή από το φυλλάδιο Πίνακας εντολών. Η διαγραφή μιας ικανότητας διαγράφει τον ακροατή της.',
    },
    deck: {
      subtitle: 'Πίνακας εντολών',
      listeners: 'Ακροατές',
      listenersDesc: 'Δείτε, δημιουργήστε, αλλάξτε και δοκιμάστε ακροατές.',
      listening: 'Ακρόαση',
      listeningDesc: 'Ενεργοποιήστε ή απενεργοποιήστε όλους τους ακροατές μαζί.',
      tools: 'Εργαλεία',
      toolsDesc:
        'Επιθεωρήστε ένα μήνυμα συνομιλίας, αλλάξτε ρυθμίσεις, αναδημιουργήστε τα φυλλάδια ή διαβάστε τη βοήθεια.',
      footer: 'Όλες οι εντολές είναι μόνο για τον GM. Λεπτομέρειες στο φυλλάδιο «{help}».',
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Άκου τα ζάρια, άκου τη δράση',
      footer: 'Κουμπιά για κάθε εντολή υπάρχουν στο φυλλάδιο «{deck}».',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το Customizable Roll Listener (CRL) παρακολουθεί τη συνομιλία και εκτελεί εντολές της επιλογής σας όταν ένα μήνυμα ταιριάζει με έναν ακροατή. Ένας ακροατής μπορεί να εξετάζει το πρότυπο ζαριάς, το κείμενο, ποιος έστειλε το μήνυμα και τις ζαριές του: κρίσιμες επιτυχίες, κρίσιμες αποτυχίες, επιτυχίες, αποτυχίες, σύνολα και φυσικά αποτελέσματα ζαριών. Οι εντολές μπορούν να είναι οτιδήποτε θα πληκτρολογούσατε στη συνομιλία, ακόμα και εντολές άλλων mods, έτσι το CRL μπορεί να παίζει ήχους, να ρίχνει σε πίνακες, να δημοσιεύει emotes, να βάζει δείκτες κατάστασης και πολλά άλλα.',
      },
      quickStart: {
        heading: 'Γρήγορο ξεκίνημα',
        steps: [
          'Πληκτρολογήστε !crl στη συνομιλία (ή πατήστε Ακροατές στο φυλλάδιο Πίνακας εντολών).',
          'Πατήστε Νέος ακροατής και δώστε του ένα όνομα, π.χ. Ήχος κρίσιμης.',
          'Πατήστε Αλλαγή δίπλα στο Αποτέλεσμα ζαριάς και επιλέξτε Κρίσιμη επιτυχία.',
          'Πατήστε Ορισμός εντολών και εισάγετε τι θα εκτελεστεί, για παράδειγμα !roll20AM --audio,play|Crit.',
          'Πατήστε Δοκιμή για να ελέγξετε τις εντολές και μετά ρίξτε μια επίθεση. Αν δεν ενεργοποιηθεί, χρησιμοποιήστε την Επιθεώρηση επόμενου μηνύματος.',
        ],
      },
      examples: {
        heading: 'Παραδείγματα',
        points: [
          'Ήχος σε κάθε κρίσιμη επιτυχία, από οποιοδήποτε φύλλο: --results crit',
          'Πίνακας αποτυχιών σε φυσικό 1 στο πρότυπο επίθεσης του D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Αντίδραση σε αποτέλεσμα πίνακα ζαριάς: --text Combat',
          'Μόνο για έναν χαρακτήρα: --who Alice',
          'Σύνολο 20 ή περισσότερο στην πρώτη ενσωματωμένη ζαριά μιας ζαριάς «Δύναμη»: --text Δύναμη && ## --total >=20',
        ],
        code: [
          '!crl new Ήχος κρίσιμης --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Αποτυχία --natural 1 --dice 20 --commands /em αποτυγχάνει παταγωδώς! \\\\ /roll 1t[Αποτυχίες]',
          '!crl new Αφηγητής --results crit fumble --speaker crl --commands /desc ${who} έφερε ${result}!',
        ],
      },
      matching: {
        heading: 'Τι ελέγχει ένας ακροατής',
        points: [
          'Ένας ακροατής ενεργοποιείται όταν ταιριάζουν όλα τα φίλτρα του. Τα κενά φίλτρα ταιριάζουν με όλα.',
          'Πρότυπα ζαριάς: το όνομα του προτύπου, π.χ. atkdmg ή simple. Το «none» ταιριάζει με μηνύματα χωρίς πρότυπο. Πολλά ονόματα σημαίνουν οποιοδήποτε από αυτά.',
          'Τύποι μηνυμάτων: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (φύλλα Beacon) και api. Όταν είναι κενό, ελέγχονται όλοι οι τύποι εκτός από τις εντολές api.',
          'Κείμενο: ένα ή περισσότερα τμήματα κειμένου, χωρισμένα με &&, που πρέπει να εμφανίζονται όλα. Δεν γίνεται διάκριση πεζών-κεφαλαίων. Το κείμενο βρίσκεται και σε σύνολα ζαριών και σε αποτελέσματα πινάκων ζαριάς.',
          'Το ## στο κείμενο αντιστοιχεί σε μια ενσωματωμένη ζαριά· οι έλεγχοι ζαριάς εξετάζουν τότε μόνο τις ζαριές που βρέθηκαν εκεί. Χωρίς ##, ελέγχεται κάθε ζαριά του μηνύματος.',
          'Το κείμενο μπορεί να είναι κανονική έκφραση αντί για απλό κείμενο (--regex on).',
          'Ομιλητές / χαρακτήρες: το όνομα που εμφανίζεται στη συνομιλία ή το όνομα χαρακτήρα στο πρότυπο ζαριάς. Παίκτες: το εμφανιζόμενο όνομα του παίκτη.',
        ],
      },
      templates: {
        heading: 'Ονόματα προτύπων ζαριάς',
        points: [
          'Ένα πρότυπο ζαριάς είναι η διάταξη που χρησιμοποιεί ένα φύλλο για τις κάρτες ζαριάς του. Το όνομά του είναι το τμήμα μετά το template: σε μια μακροεντολή, άρα το &{template:atkdmg} είναι το πρότυπο atkdmg. Κάθε φύλλο έχει τα δικά του ονόματα.',
          'Ο γρηγορότερος τρόπος να βρείτε ένα όνομα: πατήστε Επιθεώρηση επόμενου μηνύματος, ρίξτε από το φύλλο και διαβάστε τη γραμμή Πρότυπο ζαριάς που σας ψιθυρίζει το CRL.',
          'Μπορείτε επίσης να διαβάσετε το όνομα στη μακροεντολή ενός κουμπιού του φύλλου ή στον πηγαίο κώδικα του φύλλου στο GitHub, όπου κάθε πρότυπο είναι ένα <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Πρότυπα συνηθισμένων φύλλων:',
        ],
        colSheet: 'Φύλλο',
        colNames: 'Ονόματα προτύπων',
        links: 'Περισσότερα για τα πρότυπα ζαριάς:',
        builtIn: 'Roll20: ενσωματωμένα πρότυπα ζαριάς',
        dnd5e2014: 'Roll20: πρότυπα ζαριάς D&D 5e (2014)',
        sheets: 'Roll20: πηγαίος κώδικας φύλλων χαρακτήρα',
      },
      rolls: {
        heading: 'Έλεγχοι ζαριάς',
        points: [
          'Αποτέλεσμα ζαριάς: κρίσιμη επιτυχία (η μέγιστη έδρα του ζαριού ή το εύρος cs), κρίσιμη αποτυχία (ένα 1 ή το εύρος cf), επιτυχία (τουλάχιστον ένα ζάρι πιάνει στόχο όπως 1d20>15), αποτυχία (ζαριά με στόχο χωρίς επιτυχίες). Πολλά αποτελέσματα σημαίνουν οποιοδήποτε από αυτά.',
          'Σύνολο ζαριάς: ένας αριθμός, μια σύγκριση όπως >=15 ή ένα εύρος όπως 19-20.',
          'Φυσικό ζάρι: η έδρα στην οποία έπεσε ένα ζάρι, π.χ. 20 ή <=2.',
          'Ελεγχόμενα ζάρια: το auto εξετάζει μόνο d20 όταν ρίχτηκε κάποιο, ώστε τα ζάρια ζημιάς στη μέγιστη έδρα τους να μη μετρούν ως κρίσιμες. Επιλέξτε Οποιοδήποτε ζάρι ή ένα μέγεθος όπως d100 για να το αλλάξετε.',
          'Τα ζάρια που απορρίπτονται (πλεονέκτημα και μειονέκτημα) και τα ξαναριγμένα ζάρια αγνοούνται.',
          'Το φύλλο D&D 5E by Roll20 (2014) ρίχνει το πλεονέκτημα και το μειονέκτημα ως δύο ξεχωριστές ζαριές d20 (r1 και r2), οπότε το CRL ελέγχει και τις δύο: με πλεονέκτημα ένα 1 στο χαμηλότερο ζάρι μετρά ακόμα ως κρίσιμη αποτυχία, και με μειονέκτημα ένα 20 στο υψηλότερο ζάρι μετρά ακόμα ως κρίσιμη επιτυχία.',
          'Ένας ακροατής ενεργοποιείται όταν τουλάχιστον μία ζαριά πληροί όλους τους ελέγχους ζαριάς.',
        ],
      },
      commands: {
        heading: 'Εντολές συνομιλίας',
        intro:
          'Όλες οι εντολές είναι μόνο για τον GM. Ένας ακροατής μπορεί να δηλωθεί με το όνομα ή το ID του.',
        colCommand: 'Εντολή',
        colDesc: 'Τι κάνει',
      },
      options: {
        heading: 'Επιλογές ακροατή',
        intro:
          'Προσθέστε τες στο !crl new ή στο !crl edit. Αφήστε μια τιμή κενή ή χρησιμοποιήστε - για να τη διαγράψετε. Το --commands πρέπει να είναι τελευταίο.',
        colOption: 'Επιλογή',
        colDesc: 'Σημασία',
        templates:
          'Ονόματα προτύπων ζαριάς, χωρισμένα με κενά. none = κανένα πρότυπο. Δείτε Ονόματα προτύπων ζαριάς παραπάνω.',
        types: 'Τύποι μηνυμάτων, χωρισμένοι με κενά: {types}.',
        text: 'Κείμενο προς αναζήτηση. Χωρίστε τα τμήματα με &&. Το ## σημαίνει ενσωματωμένη ζαριά.',
        regex: 'on για ανάγνωση του κειμένου ως κανονικές εκφράσεις, off για απλό κείμενο.',
        who: 'Ονόματα ομιλητών ή χαρακτήρων, χωρισμένα με κόμματα.',
        players: 'Εμφανιζόμενα ονόματα παικτών, χωρισμένα με κόμματα.',
        results: 'crit, fumble, success και/ή fail.',
        total: 'Σύνολο ζαριάς: 15, >=15, <5 ή 19-20.',
        natural: 'Φυσική έδρα ζαριού: 20, <=2 ή 19-20.',
        dice: 'auto, any ή ένα μέγεθος ζαριού όπως 20.',
        cooldown: 'Δευτερόλεπτα πριν ο ακροατής μπορέσει να ενεργοποιηθεί ξανά.',
        stop: 'on για να μην ελέγχονται οι επόμενοι ακροατές μόλις ενεργοποιηθεί αυτός.',
        speaker: 'default, crl ή roller.',
        enabled: 'on ή off.',
        name: 'Μετονομάζει τον ακροατή.',
        commands: 'Οι εντολές προς εκτέλεση. Χωρίστε τις γραμμές με \\\\.',
      },
      placeholders: {
        heading: 'Σύμβολα κράτησης θέσης',
        intro: 'Αυτά αντικαθίστανται στις εντολές ενός ακροατή όταν ενεργοποιείται.',
        colName: 'Σύμβολο',
        colDesc: 'Αντικαθίσταται με',
        who: 'Το όνομα που εμφανίζεται στη συνομιλία.',
        character:
          'Το όνομα χαρακτήρα από το πρότυπο ζαριάς ή το όνομα που εμφανίζεται στη συνομιλία.',
        player: 'Το εμφανιζόμενο όνομα του παίκτη.',
        template: 'Το όνομα του προτύπου ζαριάς.',
        total: 'Το σύνολο της ζαριάς που ταίριαξε (ή της πρώτης ζαριάς).',
        natural: 'Το φυσικό d20 (ή το πρώτο ζάρι) αυτής της ζαριάς.',
        result: 'crit, fumble, success ή fail, όταν ζητήθηκε κάποιο.',
        expression: 'Η έκφραση της ζαριάς, π.χ. 1d20+5.',
        table: 'Τα αποτελέσματα πινάκων ζαριάς αυτής της ζαριάς.',
        listener: 'Το όνομα του ακροατή.',
        field:
          'Ένα πεδίο του προτύπου ζαριάς, π.χ. ${field:rname} (οι ενσωματωμένες ζαριές εμφανίζονται ως σύνολα).',
      },
      running: {
        heading: 'Πώς εκτελούνται οι εντολές',
        points: [
          'Κάθε γραμμή στέλνεται ως ξεχωριστό μήνυμα συνομιλίας, εκτός από ένα μπλοκ {{ … }} που εκτείνεται σε πολλές γραμμές (ένα πρότυπο ζαριάς ή σενάριο ScriptCards), το οποίο μένει ενιαίο.',
          'Οι εντολές στέλνονται ως CRL ή ως ο χαρακτήρας που έριξε, όπως ορίζεται ανά ακροατή ή στις ρυθμίσεις. Τα άλλα mods βλέπουν τις εντολές που στέλνει το CRL ως προερχόμενες από το API.',
          'Οι εντολές μπορούν να χρησιμοποιούν ενσωματωμένες ζαριές, πρότυπα ζαριάς, @{Character|attribute} και %{Character|ability}. Οι αναφορές σε επιλεγμένο token (@{selected|…}) και τα ερωτήματα (?{…}) δεν λειτουργούν, γιατί δεν υπάρχει κάποιος να ερωτηθεί.',
          'Οι ακροατές ελέγχονται με τη σειρά. Ένας ακροατής με Διακοπή μετά από αυτόν εμποδίζει τους επόμενους ακροατές να ενεργοποιηθούν στο ίδιο μήνυμα.',
          'Ο χρόνος αναμονής εμποδίζει έναν ακροατή να ενεργοποιηθεί ξανά για τόσα δευτερόλεπτα.',
          'Το CRL αγνοεί τα δικά του μηνύματα. Αν ένας ακροατής ενεργοποιηθεί πάνω από 20 φορές σε 10 δευτερόλεπτα, απενεργοποιείται και ενημερώνεται ο GM.',
        ],
      },
      inspector: {
        heading: 'Ο Επιθεωρητής',
        points: [
          'Πατήστε Επιθεώρηση επόμενου μηνύματος και μετά ρίξτε. Το CRL ψιθυρίζει τι είδε: τον τύπο μηνύματος, τον ομιλητή, τον χαρακτήρα, το πρότυπο και τα πεδία του, κάθε ζαριά με τα ζάρια της, το κείμενο που αναζητούν οι ακροατές και γιατί κάθε ακροατής ενεργοποιήθηκε ή όχι.',
          'Χρησιμοποιήστε τον για να βρείτε το όνομα προτύπου ενός φύλλου ή για να δείτε τι στέλνει ένα φύλλο Beacon (όπως το D&D 2024).',
          'Τα φύλλα Beacon δημοσιεύουν κάρτες ζαριάς αντί για πρότυπα ζαριάς. Το CRL τις διαβάζει: το πρότυπο είναι η πρώτη κλάση της κάρτας (dnd-2024 για το D&D 2024), ο χαρακτήρας, ο τίτλος (π.χ. Έλεγχος Επιδεξιότητας) και η υποκατηγορία γίνονται πεδία, και κάθε ζαριά της ανάλυσης είναι μια ζαριά, οπότε λειτουργούν οι έλεγχοι κρίσιμης επιτυχίας, κρίσιμης αποτυχίας, συνόλου και φυσικού ζαριού.',
        ],
      },
      settings: {
        heading: 'Ρυθμίσεις',
        intro:
          'Αλλάξτε τες με το !crl config ή το κουμπί Ρυθμίσεις. Κάποιες ορίζονται επίσης στις επιλογές One-Click του mod.',
        colKey: 'Ρύθμιση',
        colName: 'Όνομα',
        colDesc: 'Περιγραφή',
      },
      storage: {
        heading: 'Πού φυλάσσονται οι ακροατές',
        body: 'Κάθε ακροατής είναι μια ικανότητα στον αρχειοθετημένο χαρακτήρα «{character}». Η ικανότητα περιέχει τις εντολές, ώστε να τις επεξεργάζεστε στο Journal με τον πλήρη επεξεργαστή μακροεντολών. Η περιγραφή της περιέχει τους κανόνες του ακροατή, κάτι που επιτρέπει στους ακροατές να διατηρούνται και όταν αντιγράφεται το παιχνίδι. Η διαγραφή μιας ικανότητας διαγράφει τον ακροατή της· μια ικανότητα που προστέθηκε με το χέρι εμφανίζεται στο μενού απενεργοποιημένη.',
      },
      upgrading: {
        heading: 'Αναβάθμιση από την έκδοση 1',
        points: [
          'Οι ακροατές της έκδοσης 1 μετατρέπονται στην πρώτη εκκίνηση και διατηρούν τις εντολές τους.',
          'Κείμενο με μόνο απλούς χαρακτήρες γίνεται απλό κείμενο και πλέον αγνοεί πεζά-κεφαλαία. Κείμενο με σύμβολα κανονικών εκφράσεων παραμένει κανονική έκφραση.',
          'Οι ακροατές με αποτέλεσμα ζαριάς αλλά χωρίς ## αποτύγχαναν με «not parseable»· τώρα ελέγχουν κάθε ζαριά του μηνύματος.',
          'Αποτυχία σημαίνει πλέον ζαριά με στόχο χωρίς επιτυχίες· μια ζαριά ακριβώς στον στόχο είναι επιτυχία.',
          'Οι εντολές της έκδοσης 1 εξακολουθούν να λειτουργούν:',
        ],
        colV1: 'Έκδοση 1',
        colV2: 'Έκδοση 2',
      },
      troubleshooting: {
        heading: 'Αντιμετώπιση προβλημάτων',
        points: [
          'Δεν συμβαίνει τίποτα: βεβαιωθείτε ότι η Ακρόαση και ο ακροατής είναι ενεργοί και μετά χρησιμοποιήστε τον επιθεωρητή για να δείτε ποιο φίλτρο αποτυγχάνει.',
          'Οι ζαριές ενός φύλλου δεν αναγνωρίζονται: επιθεωρήστε μία· το όνομα προτύπου και τα πεδία που εμφανίζει είναι αυτά στα οποία φιλτράρετε.',
          'Τα φύλλα Beacon (όπως το D&D 2024) χρειάζονται το Experimental Mod sandbox για να βλέπουν τα mods τις ζαριές τους.',
          'Οι εντολές που χρησιμοποιούν @{…} ή %{…} τα χάνουν όταν πληκτρολογούνται στο !crl· επεξεργαστείτε την ικανότητα στο Journal.',
          'Ζάρια ζημιάς μετρούν ως κρίσιμες: ορίστε τα Ελεγχόμενα ζάρια σε d20.',
          'Τα σφάλματα γράφονται στην κονσόλα API με το πρόθεμα «Customizable Roll Listener».',
        ],
      },
      languages: {
        heading: 'Γλώσσες',
        body: 'Επιλέξτε γλώσσα με το !crl config language ή την επιλογή One-Click Language. Υποστηριζόμενες γλώσσες:',
        colCode: 'Κωδικός',
        colName: 'Γλώσσα',
        colNative: 'Εγγενές όνομα',
      },
      credits: {
        heading: 'Συντελεστές',
        original: 'Αρχικό mod από',
        maintainer: 'Έκδοση 2 από',
        support: 'Αναφέρετε προβλήματα στα φόρουμ του Roll20 ή στο αποθετήριο GitHub.',
        wiki: 'Σελίδα wiki της έκδοσης 1',
      },
    },
  };

  const TRANSLATION$c = {
    titles: {
      ready: 'Customizable Roll Listener מוכן.',
      settings: 'הגדרות CRL',
      languages: 'בחירת שפה',
      help: 'פקודות CRL',
      confirm: 'נא לאשר',
      inspect: 'בודק CRL',
      listener: 'מאזין: {name}',
      listenerCommands: 'פקודות: {name}',
    },
    menu: {
      listening: 'האזנה',
      listeners: 'מאזינים (נבדקים בסדר הזה)',
      noListeners: 'אין עדיין מאזינים. לחצו על מאזין חדש כדי ליצור אחד.',
      noCommands: 'אין עדיין פקודות.',
      commandsHint:
        "כשמקלידים פקודות בצ'אט, מפרידים שורות ב-\\\\. להפניות @{...} או %{...} ערכו את היכולת ביומן, כי הצ'אט מחליף אותן לפני ש-CRL רואה אותן.",
    },
    buttons: {
      back: 'חזרה',
      change: 'שינוי',
      confirmDelete: 'כן, למחוק',
      delete: 'מחיקה',
      edit: 'עריכה',
      help: 'עזרה',
      inspect: 'בדיקת ההודעה הבאה',
      inspectOff: 'הפסקת הבדיקה',
      new: 'מאזין חדש',
      openJournal: 'פתיחה ביומן',
      rebuildJournal: 'בנייה מחדש של דפי המידע',
      rename: 'שינוי שם',
      setCommands: 'הגדרת פקודות',
      settings: 'הגדרות',
      test: 'ניסיון',
      enable: 'הפעלה',
      disable: 'כיבוי',
      menu: 'מאזינים',
      turnOn: 'האזנה פעילה',
      turnOff: 'האזנה כבויה',
    },
    prompts: {
      newName: 'שם המאזין החדש',
      name: 'שם חדש',
      target: 'שם המאזין',
      commands: 'פקודות - מפרידים שורות בשני לוכסנים הפוכים',
      templates:
        'תבניות הטלה מופרדות ברווחים - none ללא תבנית - ריק לכל תבנית - בדיקת ההודעה מציגה את התבנית של הטלה',
      types: 'סוגי הודעות מופרדים ברווחים - ריק לכל סוג מלבד api',
      text: 'טקסט לחיפוש - ראו את דף העזרה - ריק לכל טקסט',
      regex: 'איך לקרוא את הטקסט',
      who: 'שמות דוברים או דמויות מופרדים בפסיקים - ריק לכולם',
      players: 'שמות שחקנים מופרדים בפסיקים - ריק לכולם',
      results: 'תוצאת ההטלה',
      total: 'סכום ההטלה, כגון 15 או 19-20 - ראו את דף העזרה - ריק לכל סכום',
      natural: 'תוצאה טבעית של הקובייה, כגון 20 או 1-2 - ריק לכל תוצאה',
      dice: 'באילו קוביות הבדיקות מתחשבות',
      cooldown: 'שניות המתנה לפני הפעלה חוזרת - 0 ללא המתנה',
      speaker: 'שליחת הפקודות בשם',
    },
    choices: {
      critOrFumble: 'קריטי או כישלון חרוץ',
    },
    values: {
      on: 'פעיל',
      off: 'כבוי',
      none: 'ללא',
      any: 'הכול',
      allButApi: 'הכול (בלי פקודות API)',
      plain: 'טקסט רגיל',
      regex: 'ביטוי רגולרי',
      diceAuto: 'אוטומטי (d20 אם הוטלה)',
      diceAny: 'כל קובייה',
      seconds: '{seconds} שנ׳',
      speaker: {
        default: 'ברירת המחדל',
        crl: 'CRL',
        roller: 'המטיל',
      },
    },
    results: {
      crit: 'קריטי',
      fumble: 'כישלון חרוץ',
      success: 'הצלחה',
      fail: 'כישלון',
    },
    fields: {
      enabled: 'פעיל',
      templates: 'תבניות הטלה',
      types: 'סוגי הודעות',
      text: 'טקסט',
      regex: 'הטקסט הוא',
      who: 'דוברים / דמויות',
      players: 'שחקנים',
      results: 'תוצאת ההטלה',
      total: 'סכום ההטלה',
      natural: 'קובייה טבעית',
      dice: 'קוביות נבדקות',
      cooldown: 'זמן המתנה',
      stop: 'עצירה אחרי מאזין זה',
      speaker: 'שליחה בשם',
      commands: 'פקודות',
    },
    settings: {
      enabled: {
        label: 'האזנה',
        desc: 'מפעיל או מכבה את כל המאזינים בבת אחת.',
      },
      speaker: {
        label: 'שליחת הפקודות בשם',
        desc: 'בשם מי נשלחות פקודות המאזינים, אלא אם מאזין קובע אחרת: CRL, או הדמות (או השחקן) שההודעה שלה הפעילה אותו.',
      },
      listenToMods: {
        label: 'האזנה למודים אחרים',
        desc: "האם הודעות צ'אט ששולחים מודים אחרים יכולות להפעיל מאזינים. CRL לעולם לא מגיב להודעות של עצמו.",
      },
      language: {
        label: 'שפה',
        desc: 'השפה של התפריטים, ההודעות ודפי המידע.',
      },
    },
    inspect: {
      type: 'סוג',
      who: 'דובר',
      character: 'דמות',
      player: 'שחקן',
      template: 'תבנית הטלה',
      keys: 'מאפייני ההודעה',
      extras: 'נתוני הודעה נוספים',
      fields: 'שדות התבנית',
      rolls: 'הטלות',
      dice: 'קוביות',
      table: 'טבלה',
      target: 'יש יעד הצלחה',
      crit: 'קריטי',
      fumble: 'כישלון חרוץ',
      text: 'טקסט (כפי שהמאזינים קוראים אותו)',
      raw: 'תוכן גולמי',
      listeners: 'מאזינים',
      matched: 'היה מופעל {result}',
      reasons: {
        disabled: 'כבוי',
        type: 'סוג ההודעה לא תואם',
        template: 'תבנית ההטלה לא תואמת',
        who: 'הדובר או הדמות לא תואמים',
        player: 'השחקן לא תואם',
        text: 'הטקסט לא נמצא',
        roll: 'אף הטלה לא עומדת בתנאי ההטלה',
      },
    },
    messages: {
      upgraded: 'שודרג מגרסה 1. {count} מאזינים הומרו והפקודות שלהם נשמרו.',
      restored: 'שוחזרו {count} מאזינים מדמות האחסון.',
      adopted:
        'נמצאו {count} יכולות בדמות האחסון ללא כללי מאזין. הן נוספו במצב כבוי; הגדירו אותן מהתפריט.',
      removed: 'הוסרו {count} מאזינים שהיכולת שלהם נמחקה.',
      listeningOff: 'ההאזנה כבויה. הקלידו !crl on כדי להפעיל אותה.',
      readyHint: '{count} מאזינים. הקלידו !crl לתפריט או !crl help לרשימת כל הפקודות.',
      loopStopped:
        'המאזין "{name}" הופעל יותר מדי פעמים בזמן קצר, כנראה כי הפקודות שלו מפעילות אותו שוב, ולכן הוא כובה.',
      noCommands: 'למאזין "{name}" אין פקודות להרצה.',
      tested: 'הורצו הפקודות של "{name}" ({count} הודעות).',
      confirmDelete: 'למחוק את המאזין "{name}" ואת הפקודות שלו? אי אפשר לבטל פעולה זו.',
      deleted: 'המאזין "{name}" נמחק.',
      inspectOn: "הודעת הצ'אט הבאה תיבדק והתוצאה תישלח אליכם בלחישה.",
      inspectOff: 'הבודק כובה.',
      journalRebuilt: 'דפי המידע "{help}" ו-"{deck}" נבנו מחדש.',
    },
    errors: {
      gmOnly: 'רק GM יכול להשתמש בפקודות של Customizable Roll Listener.',
      unexpected: 'משהו השתבש: {message}',
      unknownCommand: 'פקודה לא מוכרת "{command}".',
      badOption: 'אפשרות לא מוכרת --{option}.',
      notFound: 'אין מאזין בשם "{name}".',
      nameRequired: 'נא לציין שם מאזין.',
      nameInvalid: 'אי אפשר להשתמש בשם "{name}".',
      nameTaken: 'כבר יש מאזין בשם "{name}".',
      badOnOff: 'הערך "{value}" אינו תקין עבור --{option}.',
      badType: 'סוגי הודעות לא מוכרים: {value}.',
      badRegex: 'הביטוי הרגולרי "{term}" אינו תקין: {error}',
      tooManyTerms: 'מאזין יכול לחפש לכל היותר {max} קטעי טקסט.',
      badResult: 'תוצאות הטלה לא מוכרות: {value}.',
      badComparison: 'הערך "{value}" אינו תקין עבור --{option}.',
      badDice: 'הערך "{value}" אינו תקין עבור --dice.',
      badCooldown: 'הערך "{value}" אינו תקין עבור --cooldown.',
      badSpeaker: 'הערך "{value}" אינו תקין עבור --speaker.',
      noStore: 'לא ניתן היה ליצור את דמות האחסון.',
      badSetting: 'הגדרה לא מוכרת "{key}".',
      badSettingValue: 'הערך "{value}" אינו תקין עבור {key}.',
    },
    hints: {
      gmOnly: 'בקשו מה-GM שלכם להגדיר עבורכם מאזינים.',
      unknownCommand: 'הקלידו !crl help כדי לראות את כל הפקודות.',
      badOption:
        'האפשרויות הן --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name ו--commands.',
      notFound: 'הקלידו !crl כדי לראות את רשימת המאזינים.',
      nameInvalid:
        'עד {max} תווים, בלי התווים האלה: | { } [ ] \\ @ % # ? ~ או "--", ובלי "-" בהתחלה.',
      badOnOff: 'השתמשו ב-on או off.',
      badType: 'סוגי ההודעות הם: {types}.',
      badResult: 'השתמשו ב-crit, fumble, success או fail.',
      badComparison: 'השתמשו במספר, בהשוואה כגון >=15 או <3, או בטווח כגון 19-20.',
      badDice: 'השתמשו ב-auto, any, או בגודל קובייה כגון 20 או d20.',
      badCooldown: 'השתמשו במספר שלם של שניות בין 0 ל-3600.',
      badSpeaker: 'השתמשו ב-default, crl או roller.',
      badSetting: 'ההגדרות הן: {keys}.',
      noStore: 'בדקו אם יש שגיאות במסוף ה-API, ואז הפעילו מחדש את ה-sandbox.',
    },
    help: {
      menu: 'הצגת רשימת המאזינים.',
      new: 'יצירת מאזין. אפשר להוסיף אפשרויות כבר עכשיו.',
      show: 'הצגת מאזין וההגדרות שלו, עם לחצנים לשינוי.',
      edit: 'שינוי מאזין. השאירו ערך ריק (או כתבו -) כדי לנקות אותו.',
      commands: 'החלפת הפקודות של מאזין. כל מה שאחרי --commands נלקח, לכן שימו אותו אחרון.',
      enable: 'הפעלה או כיבוי של מאזין.',
      move: 'הזזת מאזין קדימה או אחורה בסדר שבו המאזינים נבדקים.',
      test: 'הרצת הפקודות של מאזין עכשיו, כאילו הוטל 20 טבעי.',
      delete: 'מחיקת מאזין והפקודות שלו (עם בקשת אישור).',
      inspect: "לחישת פירוט של הודעת הצ'אט הבאה ואילו מאזינים היא הייתה מפעילה.",
      inspectOff: 'הפסקת ההמתנה להודעה לבדיקה.',
      onOff: 'הפעלה או כיבוי של כל ההאזנה.',
      config: 'הצגה או שינוי של ההגדרות הכלליות.',
      journal: 'בנייה מחדש של דפי המידע של העזרה ושל לוח הפקודות.',
      help: 'הצגת הרשימה הזו.',
      optionsTitle: 'אפשרויות',
      options:
        'אפשרויות: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name ו--commands. ניתן להשתמש בשמות במקום במזהים.',
      placeholders:
        'פקודות יכולות להשתמש ב-${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} ו-${field:name}.',
      handouts: 'דף המידע "{help}" מסביר הכול; בדף המידע "{deck}" יש לחצנים.',
    },
    store: {
      bio: 'דמות זו שייכת למוד Customizable Roll Listener. כל יכולת היא מאזין אחד: היכולת מכילה את הפקודות להרצה, והתיאור שלה מכיל את כללי המאזין.',
      bioHelp:
        'אפשר לערוך כאן את הפקודות. את הכללים משנים עם !crl או מדף המידע לוח הפקודות. מחיקת יכולת מוחקת את המאזין שלה.',
    },
    deck: {
      subtitle: 'לוח הפקודות',
      listeners: 'מאזינים',
      listenersDesc: 'צפייה, יצירה, שינוי וניסיון של מאזינים.',
      listening: 'האזנה',
      listeningDesc: 'הפעלה או כיבוי של כל המאזינים בבת אחת.',
      tools: 'כלים',
      toolsDesc: "בדיקת הודעת צ'אט, שינוי הגדרות, בנייה מחדש של דפי המידע או קריאת העזרה.",
      footer: 'כל הפקודות מיועדות ל-GM בלבד. פרטים בדף המידע "{help}".',
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'שומעים את הקוביות, שומעים את האקשן',
      footer: 'לחצנים לכל הפקודות נמצאים בדף המידע "{deck}".',
      overview: {
        heading: 'סקירה כללית',
        body: "Customizable Roll Listener (CRL) עוקב אחרי הצ'אט ומריץ פקודות לבחירתכם כשהודעה תואמת מאזין. מאזין יכול לבדוק את תבנית ההטלה, את הטקסט, את שולח ההודעה ואת ההטלות שבה: פגיעות קריטיות, כישלונות חרוצים, הצלחות, כישלונות, סכומים ותוצאות טבעיות של קוביות. פקודה יכולה להיות כל דבר שאפשר להקליד בצ'אט, כולל פקודות של מודים אחרים, כך ש-CRL יכול להשמיע צלילים, להטיל על טבלאות, לפרסם אמוטים, להוסיף סמני מצב ועוד.",
      },
      quickStart: {
        heading: 'התחלה מהירה',
        steps: [
          "הקלידו !crl בצ'אט (או לחצו על מאזינים בדף המידע לוח הפקודות).",
          'לחצו על מאזין חדש ותנו לו שם, למשל צליל קריטי.',
          'לחצו על שינוי ליד תוצאת ההטלה ובחרו קריטי.',
          'לחצו על הגדרת פקודות והזינו מה להריץ, למשל !roll20AM --audio,play|Crit.',
          'לחצו על ניסיון כדי לבדוק את הפקודות, ואז הטילו התקפה. אם המאזין לא מופעל, השתמשו בבדיקת ההודעה הבאה.',
        ],
      },
      examples: {
        heading: 'דוגמאות',
        points: [
          'צליל בכל פגיעה קריטית, מכל גיליון: --results crit',
          'טבלת כישלונות חרוצים על 1 טבעי בתבנית ההתקפה של D&D 5e 2014: --templates atkdmg atk --natural 1',
          'תגובה לתוצאה של טבלת הטלה: --text קרב',
          'רק לדמות אחת: --who אליס',
          'סכום 20 ומעלה בהטלה המוטבעת הראשונה של הטלת "כוח": --text כוח && ## --total >=20',
        ],
        code: [
          '!crl new צליל קריטי --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new כישלון חרוץ --natural 1 --dice 20 --commands /em נכשל כישלון חרוץ! \\\\ /roll 1t[Fumbles]',
          '!crl new מספר --results crit fumble --speaker crl --commands /desc ${who} הטיל ${result}!',
        ],
      },
      matching: {
        heading: 'מה מאזין בודק',
        points: [
          'מאזין מופעל כשכל המסננים שלו תואמים. מסנן ריק תואם הכול.',
          'תבניות הטלה: שם התבנית, כגון atkdmg או simple. "none" תואם הודעות ללא תבנית. כמה שמות פירושם כל אחד מהם.',
          'סוגי הודעות: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (גיליונות Beacon) ו-api. אם השדה ריק, נבדקים כל הסוגים מלבד פקודות api.',
          'טקסט: קטע טקסט אחד או יותר, מופרדים ב-&&, שכולם חייבים להופיע. אין הבחנה בין אותיות גדולות לקטנות. הטקסט נמצא גם בסכומי הטלות ובתוצאות של טבלאות הטלה.',
          '## בטקסט מייצג הטלה מוטבעת; בדיקות ההטלה בודקות אז רק את ההטלות שנמצאו שם. בלי ##, נבדקת כל הטלה בהודעה.',
          'הטקסט יכול להיות ביטוי רגולרי במקום טקסט רגיל (--regex on).',
          "דוברים / דמויות: השם שמוצג בצ'אט, או שם הדמות בתבנית ההטלה. שחקנים: שם התצוגה של השחקן.",
        ],
      },
      templates: {
        heading: 'שמות של תבניות הטלה',
        points: [
          'תבנית הטלה היא הפריסה שגיליון משתמש בה לכרטיסי ההטלה שלו. השם שלה הוא החלק שאחרי template: במאקרו, כך ש-&{template:atkdmg} היא התבנית atkdmg. לכל גיליון יש שמות משלו.',
          'הדרך המהירה ביותר למצוא שם: לחצו על בדיקת ההודעה הבאה, הטילו מהגיליון, וקראו את שורת תבנית ההטלה ש-CRL לוחש לכם.',
          'אפשר גם לקרוא את השם במאקרו של לחצן בגיליון, או בקוד המקור של הגיליון ב-GitHub, שבו כל תבנית היא <rolltemplate class="sheet-rolltemplate-NAME">.',
          'תבניות של גיליונות נפוצים:',
        ],
        colSheet: 'גיליון',
        colNames: 'שמות תבניות',
        links: 'עוד על תבניות הטלה:',
        builtIn: 'Roll20: תבניות הטלה מובנות',
        dnd5e2014: 'Roll20: תבניות הטלה של D&D 5e (2014)',
        sheets: 'קוד המקור של גיליונות הדמות ב-Roll20',
      },
      rolls: {
        heading: 'בדיקות הטלה',
        points: [
          'תוצאת ההטלה: קריטי (הפאה הגבוהה ביותר של הקובייה, או טווח ה-cs), כישלון חרוץ (1, או טווח ה-cf), הצלחה (לפחות קובייה אחת מגיעה ליעד, כגון 1d20>15), כישלון (הטלה עם יעד ללא הצלחות). כמה תוצאות פירושן כל אחת מהן.',
          'סכום ההטלה: מספר, השוואה כגון >=15, או טווח כגון 19-20.',
          'קובייה טבעית: הפאה שעליה נחתה הקובייה, כגון 20 או <=2.',
          'קוביות נבדקות: אוטומטי בודק רק קוביות d20 כשהוטלה אחת, כך שקוביות נזק שיצאה בהן הפאה הגבוהה ביותר לא נחשבות קריטי. כדי לשנות זאת, בחרו כל קובייה או גודל כגון d100.',
          'קוביות שהושמטו (יתרון וחיסרון) וקוביות שהוטלו מחדש אינן נלקחות בחשבון.',
          'הגיליון D&D 5E by Roll20 (2014) מטיל יתרון וחיסרון כשתי הטלות d20 נפרדות (r1 ו-r2), ולכן CRL בודק את שתיהן: ביתרון, 1 בקובייה הנמוכה עדיין נחשב כישלון חרוץ, ובחיסרון, 20 בקובייה הגבוהה עדיין נחשב קריטי.',
          'מאזין מופעל כשלפחות הטלה אחת עומדת בכל בדיקות ההטלה.',
        ],
      },
      commands: {
        heading: "פקודות צ'אט",
        intro: 'כל הפקודות מיועדות ל-GM בלבד. אפשר לציין מאזין לפי השם או המזהה שלו.',
        colCommand: 'פקודה',
        colDesc: 'מה היא עושה',
      },
      options: {
        heading: 'אפשרויות מאזין',
        intro:
          'הוסיפו אותן ל-!crl new או ל-!crl edit. השאירו ערך ריק, או כתבו -, כדי לנקות אותו. --commands חייב להופיע אחרון.',
        colOption: 'אפשרות',
        colDesc: 'משמעות',
        templates:
          'שמות תבניות הטלה, מופרדים ברווחים. none = ללא תבנית. ראו שמות של תבניות הטלה למעלה.',
        types: 'סוגי הודעות, מופרדים ברווחים: {types}.',
        text: 'טקסט לחיפוש. הפרידו קטעים ב-&&. ## מסמן הטלה מוטבעת.',
        regex: 'on כדי לקרוא את הטקסט כביטויים רגולריים, off לטקסט רגיל.',
        who: 'שמות דוברים או דמויות, מופרדים בפסיקים.',
        players: 'שמות התצוגה של שחקנים, מופרדים בפסיקים.',
        results: 'crit, fumble, success ו/או fail.',
        total: 'סכום ההטלה: 15, >=15, <5 או 19-20.',
        natural: 'הפאה הטבעית של הקובייה: 20, <=2 או 19-20.',
        dice: 'auto, any, או גודל קובייה כגון 20.',
        cooldown: 'שניות עד שהמאזין יכול להיות מופעל שוב.',
        stop: 'on כדי להפסיק לבדוק את המאזינים הבאים אחרי שמאזין זה הופעל.',
        speaker: 'default, crl או roller.',
        enabled: 'on או off.',
        name: 'משנה את שם המאזין.',
        commands: 'הפקודות להרצה. הפרידו שורות ב-\\\\.',
      },
      placeholders: {
        heading: 'מצייני מקום',
        intro: 'אלה מוחלפים בפקודות של מאזין כשהוא מופעל.',
        colName: 'מציין מקום',
        colDesc: 'מוחלף ב',
        who: "השם שמוצג בצ'אט.",
        character: "שם הדמות מתבנית ההטלה, או השם שמוצג בצ'אט.",
        player: 'שם התצוגה של השחקן.',
        template: 'שם תבנית ההטלה.',
        total: 'הסכום של ההטלה שהתאימה (או של ההטלה הראשונה).',
        natural: 'ה-d20 הטבעי (או הקובייה הראשונה) של אותה הטלה.',
        result: 'crit, fumble, success או fail, כשאחת מהן התבקשה.',
        expression: 'ביטוי ההטלה, כגון 1d20+5.',
        table: 'תוצאות טבלאות ההטלה של אותה הטלה.',
        listener: 'שם המאזין.',
        field: 'שדה של תבנית הטלה, כגון ${field:rname} (הטלות מוטבעות מוצגות לפי הסכום שלהן).',
      },
      running: {
        heading: 'איך הפקודות רצות',
        points: [
          "כל שורה נשלחת כהודעת צ'אט נפרדת, חוץ מבלוק {{ … }} שמתפרס על כמה שורות (תבנית הטלה או סקריפט ScriptCards), שנשמר יחד.",
          'הפקודות נשלחות בשם CRL, או בשם הדמות שהטילה, לפי הגדרת המאזין או ההגדרות הכלליות. מודים אחרים רואים פקודות ש-CRL שולח כאילו הגיעו מה-API.',
          'פקודות יכולות להשתמש בהטלות מוטבעות, בתבניות הטלה, ב-@{Character|attribute} וב-%{Character|ability}. הפניות לאסימון הנבחר (@{selected|…}) ושאילתות (?{…}) לא עובדות, כי אין את מי לשאול.',
          'המאזינים נבדקים לפי הסדר. מאזין שמוגדרת בו עצירה אחרי מאזין זה מונע ממאזינים מאוחרים יותר להיות מופעלים מאותה הודעה.',
          'זמן המתנה מונע ממאזין להיות מופעל שוב במשך מספר השניות הזה.',
          'CRL מתעלם מההודעות של עצמו. אם מאזין בכל זאת מופעל יותר מ-20 פעמים ב-10 שניות, הוא מכובה וה-GM מקבל הודעה.',
        ],
      },
      inspector: {
        heading: 'הבודק',
        points: [
          'לחצו על בדיקת ההודעה הבאה, ואז הטילו. CRL לוחש מה הוא ראה: סוג ההודעה, הדובר, הדמות, התבנית והשדות שלה, כל הטלה עם הקוביות שלה, הטקסט שהמאזינים מחפשים בו, ולמה כל מאזין הופעל או לא.',
          'השתמשו בו כדי למצוא את שם התבנית של גיליון, או כדי לראות מה גיליון Beacon (כגון D&D 2024) שולח.',
          'גיליונות Beacon מפרסמים כרטיסי הטלה במקום תבניות הטלה. CRL קורא אותם: התבנית היא ה-class הראשון של הכרטיס (dnd-2024 עבור D&D 2024), הדמות, הכותרת (כגון Dexterity Check) ותת-הקטגוריה הופכות לשדות, וכל הטלה בפירוט נחשבת הטלה, כך שבדיקות קריטי, כישלון חרוץ, סכום וקובייה טבעית עובדות.',
        ],
      },
      settings: {
        heading: 'הגדרות',
        intro:
          'שנו אותן עם !crl config או עם הלחצן הגדרות. את חלקן אפשר להגדיר גם באפשרויות One-Click של המוד.',
        colKey: 'הגדרה',
        colName: 'שם',
        colDesc: 'תיאור',
      },
      storage: {
        heading: 'איפה המאזינים נשמרים',
        body: 'כל מאזין הוא יכולת של הדמות "{character}" שבארכיון. היכולת מכילה את הפקודות, כך שאפשר לערוך אותן ביומן עם עורך המאקרו המלא. התיאור שלה מכיל את כללי המאזין, וכך המאזינים שורדים גם העתקה של המשחק. מחיקת יכולת מוחקת את המאזין שלה; יכולת שנוספה ידנית מופיעה בתפריט במצב כבוי.',
      },
      upgrading: {
        heading: 'שדרוג מגרסה 1',
        points: [
          'מאזינים מגרסה 1 מומרים בהפעלה הראשונה ושומרים על הפקודות שלהם.',
          'טקסט שמכיל רק תווים רגילים הופך לטקסט רגיל, ומעכשיו אין בו הבחנה בין אותיות גדולות לקטנות. טקסט שמשתמש בסימנים של ביטוי רגולרי נשאר ביטוי רגולרי.',
          'מאזינים עם תוצאת הטלה אבל בלי ## נכשלו בעבר עם "not parseable"; עכשיו הם בודקים כל הטלה בהודעה.',
          'כישלון פירושו עכשיו הטלה עם יעד ללא הצלחות; הטלה שמגיעה בדיוק ליעד היא הצלחה.',
          'הפקודות של גרסה 1 עדיין עובדות:',
        ],
        colV1: 'גרסה 1',
        colV2: 'גרסה 2',
      },
      troubleshooting: {
        heading: 'פתרון בעיות',
        points: [
          'שום דבר לא קורה: ודאו שההאזנה פעילה ושהמאזין פעיל, ואז השתמשו בבודק כדי לראות איזה מסנן נכשל.',
          'ההטלות של גיליון לא מזוהות: בדקו אחת מהן; שם התבנית והשדות שמוצגים הם מה שצריך לסנן לפיו.',
          'גיליונות Beacon (כגון D&D 2024) דורשים את ה-sandbox של Experimental Mod כדי שמודים יראו את ההטלות שלהם.',
          'פקודות שמשתמשות ב-@{…} או ב-%{…} מאבדות אותם כשמקלידים אותן ב-!crl; ערכו את היכולת ביומן במקום זאת.',
          'קוביות נזק נספרות כקריטי: הגדירו את קוביות נבדקות ל-d20.',
          'שגיאות נכתבות למסוף ה-API עם הקידומת "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'שפות',
        body: 'בחרו שפה עם !crl config language או עם האפשרות Language של One-Click. השפות הנתמכות:',
        colCode: 'קוד',
        colName: 'שפה',
        colNative: 'שם מקורי',
      },
      credits: {
        heading: 'קרדיטים',
        original: 'המוד המקורי מאת',
        maintainer: 'גרסה 2 מאת',
        support: 'דווחו על בעיות בפורומים של Roll20 או במאגר ב-GitHub.',
        wiki: 'דף הוויקי של גרסה 1',
      },
    },
  };

  const TRANSLATION$b = {
    titles: {
      ready: 'A Customizable Roll Listener készen áll.',
      settings: 'CRL-beállítások',
      languages: 'Nyelv kiválasztása',
      help: 'CRL-parancsok',
      confirm: 'Megerősítés',
      inspect: 'CRL-vizsgáló',
      listener: 'Figyelő: {name}',
      listenerCommands: 'Parancsok: {name}',
    },
    menu: {
      listening: 'Figyelés',
      listeners: 'Figyelők (ebben a sorrendben ellenőrizve)',
      noListeners: 'Még nincs figyelő. Létrehozáshoz kattintson az Új figyelő gombra.',
      noCommands: 'Még nincsenek parancsok.',
      commandsHint:
        'Ha a chatbe gépeli a parancsokat, a sorokat \\\\ jellel válassza el. @{...} vagy %{...} hivatkozásokhoz inkább a Naplóban szerkessze a képességet, mert a chat lecseréli őket, mielőtt a CRL megkapná.',
    },
    buttons: {
      back: 'Vissza',
      change: 'Módosítás',
      confirmDelete: 'Igen, törlés',
      delete: 'Törlés',
      edit: 'Szerkesztés',
      help: 'Súgó',
      inspect: 'Következő üzenet vizsgálata',
      inspectOff: 'Vizsgálat leállítása',
      new: 'Új figyelő',
      openJournal: 'Megnyitás a Naplóban',
      rebuildJournal: 'Segédanyagok újraépítése',
      rename: 'Átnevezés',
      setCommands: 'Parancsok megadása',
      settings: 'Beállítások',
      test: 'Teszt',
      enable: 'Bekapcsolás',
      disable: 'Kikapcsolás',
      menu: 'Figyelők',
      turnOn: 'Figyelés be',
      turnOff: 'Figyelés ki',
    },
    prompts: {
      newName: 'Az új figyelő neve',
      name: 'Új név',
      target: 'Figyelő neve',
      commands: 'Parancsok – a sorokat két fordított perjellel válassza el',
      templates:
        'Dobássablonok szóközzel elválasztva – none: sablon nélkül – üres: bármelyik – a vizsgáló megmutatja egy dobás sablonját',
      types: 'Üzenettípusok szóközzel elválasztva – üres: bármelyik, kivéve api',
      text: 'Keresett szöveg – lásd a Súgó segédanyagot – üres: bármi',
      regex: 'Hogyan értelmezze a szöveget',
      who: 'Beszélők vagy karakterek nevei vesszővel elválasztva – üres: bárki',
      players: 'Játékosnevek vesszővel elválasztva – üres: bárki',
      results: 'Dobás eredménye',
      total: 'Dobás összege, pl. 15 vagy 19-20 – lásd a Súgó segédanyagot – üres: bármennyi',
      natural: 'Natúr kockaérték, pl. 20 vagy 1-2 – üres: bármennyi',
      dice: 'Mely kockákat nézzék az ellenőrzések',
      cooldown: 'Várakozás másodpercben az újbóli aktiválás előtt – 0: nincs',
      speaker: 'Parancsok küldője',
    },
    choices: {
      critOrFumble: 'Kritikus vagy kritikus hiba',
    },
    values: {
      on: 'Be',
      off: 'Ki',
      none: 'Nincs',
      any: 'Bármelyik',
      allButApi: 'Bármelyik (API-parancsok nélkül)',
      plain: 'Egyszerű szöveg',
      regex: 'Reguláris kifejezés',
      diceAuto: 'Automatikus (d20, ha dobtak)',
      diceAny: 'Bármely kocka',
      seconds: '{seconds} mp',
      speaker: {
        default: 'Alapbeállítás',
        crl: 'CRL',
        roller: 'A dobó',
      },
    },
    results: {
      crit: 'Kritikus',
      fumble: 'Kritikus hiba',
      success: 'Siker',
      fail: 'Kudarc',
    },
    fields: {
      enabled: 'Bekapcsolva',
      templates: 'Dobássablonok',
      types: 'Üzenettípusok',
      text: 'Szöveg',
      regex: 'Szöveg típusa',
      who: 'Beszélők / karakterek',
      players: 'Játékosok',
      results: 'Dobás eredménye',
      total: 'Dobás összege',
      natural: 'Natúr kocka',
      dice: 'Ellenőrzött kockák',
      cooldown: 'Várakozási idő',
      stop: 'Megállás ennél',
      speaker: 'Küldő',
      commands: 'Parancsok',
    },
    settings: {
      enabled: {
        label: 'Figyelés',
        desc: 'Az összes figyelőt egyszerre be- vagy kikapcsolja.',
      },
      speaker: {
        label: 'Parancsok küldője',
        desc: 'Kinek a nevében mennek el a figyelők parancsai, ha a figyelő mást nem ír elő: a CRL, vagy az a karakter (vagy játékos), akinek az üzenete aktiválta.',
      },
      listenToMods: {
        label: 'Más modok figyelése',
        desc: 'Aktiválhatják-e a figyelőket más modok chatüzenetei. A CRL soha nem reagál a saját üzeneteire.',
      },
      language: {
        label: 'Nyelv',
        desc: 'A menük, üzenetek és segédanyagok nyelve.',
      },
    },
    inspect: {
      type: 'Típus',
      who: 'Beszélő',
      character: 'Karakter',
      player: 'Játékos',
      template: 'Dobássablon',
      keys: 'Üzenet tulajdonságai',
      extras: 'További üzenetadatok',
      fields: 'Sablonmezők',
      rolls: 'Dobások',
      dice: 'kockák',
      table: 'táblázat',
      target: 'van sikercélja',
      crit: 'kritikus',
      fumble: 'kritikus hiba',
      text: 'Szöveg (ahogy a figyelők látják)',
      raw: 'Nyers tartalom',
      listeners: 'Figyelők',
      matched: 'aktiválódna {result}',
      reasons: {
        disabled: 'kikapcsolva',
        type: 'az üzenettípus nem egyezik',
        template: 'a dobássablon nem egyezik',
        who: 'a beszélő vagy a karakter nem egyezik',
        player: 'a játékos nem egyezik',
        text: 'a szöveg nem található',
        roll: 'egyik dobás sem felel meg a dobásfeltételeknek',
      },
    },
    messages: {
      upgraded:
        'Frissítve az 1-es verzióról. {count} figyelő átalakítva, a parancsaik megmaradtak.',
      restored: '{count} figyelő visszaállítva a tároló karakterről.',
      adopted:
        '{count} képesség található a tároló karakteren figyelőszabályok nélkül. Kikapcsolva kerültek be; állítsa be őket a menüből.',
      removed: '{count} figyelő eltávolítva, mert a képességét törölték.',
      listeningOff: 'A figyelés ki van kapcsolva. Bekapcsoláshoz írja be: !crl on',
      readyHint:
        '{count} figyelő. Írja be a !crl parancsot a menühöz, vagy a !crl help parancsot az összes parancshoz.',
      loopStopped:
        'A(z) „{name}” figyelő rövid idő alatt túl sokszor aktiválódott, valószínűleg mert a parancsai újra aktiválják, ezért kikapcsoltuk.',
      noCommands: 'A(z) „{name}” figyelőnek nincsenek futtatható parancsai.',
      tested: 'A(z) „{name}” parancsai lefutottak ({count} üzenet).',
      confirmDelete: 'Törli a(z) „{name}” figyelőt és a parancsait? Ez nem vonható vissza.',
      deleted: 'A(z) „{name}” figyelő törölve.',
      inspectOn: 'A következő chatüzenet vizsgálatának eredményét suttogásban kapja meg.',
      inspectOff: 'A vizsgáló kikapcsolva.',
      journalRebuilt: 'A(z) „{help}” és „{deck}” segédanyag újraépítve.',
    },
    errors: {
      gmOnly: 'A Customizable Roll Listener parancsait csak GM használhatja.',
      unexpected: 'Hiba történt: {message}',
      unknownCommand: 'Ismeretlen parancs: „{command}”.',
      badOption: 'Ismeretlen opció: --{option}.',
      notFound: 'Nincs „{name}” nevű figyelő.',
      nameRequired: 'Adja meg a figyelő nevét.',
      nameInvalid: 'A(z) „{name}” név nem használható.',
      nameTaken: 'Már van „{name}” nevű figyelő.',
      badOnOff: 'A(z) „{value}” érték érvénytelen ehhez: --{option}.',
      badType: 'Ismeretlen üzenettípus(ok): {value}.',
      badRegex: 'A(z) „{term}” reguláris kifejezés érvénytelen: {error}',
      tooManyTerms: 'Egy figyelő legfeljebb {max} szövegrészt kereshet.',
      badResult: 'Ismeretlen dobáseredmény(ek): {value}.',
      badComparison: 'A(z) „{value}” érték érvénytelen ehhez: --{option}.',
      badDice: 'A(z) „{value}” érték érvénytelen ehhez: --dice.',
      badCooldown: 'A(z) „{value}” érték érvénytelen ehhez: --cooldown.',
      badSpeaker: 'A(z) „{value}” érték érvénytelen ehhez: --speaker.',
      noStore: 'A tároló karaktert nem sikerült létrehozni.',
      badSetting: 'Ismeretlen beállítás: „{key}”.',
      badSettingValue: 'A(z) „{value}” érték érvénytelen ehhez: {key}.',
    },
    hints: {
      gmOnly: 'Kérje meg a GM-et, hogy állítson be figyelőket.',
      unknownCommand: 'Az összes parancsot a !crl help paranccsal láthatja.',
      badOption:
        'A lehetőségek: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name és --commands.',
      notFound: 'A figyelők listáját a !crl paranccsal láthatja.',
      nameInvalid:
        'Legfeljebb {max} karakter, ezek nélkül: | { } [ ] \\ @ % # ? ~ vagy "--", és nem kezdődhet "-" jellel.',
      badOnOff: 'Használja: on vagy off.',
      badType: 'Az üzenettípusok a következők: {types}.',
      badResult: 'Használja: crit, fumble, success vagy fail.',
      badComparison:
        'Adjon meg számot, összehasonlítást (pl. >=15 vagy <3) vagy tartományt (pl. 19-20).',
      badDice: 'Használja: auto, any, vagy egy kockaméret, pl. 20 vagy d20.',
      badCooldown: 'Adjon meg egész számú másodpercet 0 és 3600 között.',
      badSpeaker: 'Használja: default, crl vagy roller.',
      badSetting: 'A beállítások a következők: {keys}.',
      noStore: 'Nézze meg a hibákat az API-konzolon, majd indítsa újra a sandboxot.',
    },
    help: {
      menu: 'A figyelők listájának megjelenítése.',
      new: 'Figyelő létrehozása. Opciók rögtön megadhatók.',
      show: 'Egy figyelő és beállításai megjelenítése, módosítógombokkal.',
      edit: 'Figyelő módosítása. Érték törléséhez hagyja üresen (vagy írjon -).',
      commands:
        'Egy figyelő parancsainak cseréje. A --commands utáni teljes szöveg parancs lesz, ezért ez legyen az utolsó.',
      enable: 'Figyelő be- vagy kikapcsolása.',
      move: 'Figyelő előbbre vagy hátrébb helyezése az ellenőrzési sorrendben.',
      test: 'Egy figyelő parancsainak futtatása most, mintha natúr 20-at dobtak volna.',
      delete: 'Figyelő és parancsainak törlése (előbb rákérdez).',
      inspect:
        'A következő chatüzenet részletezése suttogásban, és hogy mely figyelőket aktiválná.',
      inspectOff: 'A vizsgálandó üzenetre várakozás leállítása.',
      onOff: 'Az összes figyelés be- vagy kikapcsolása.',
      config: 'A globális beállítások megjelenítése vagy módosítása.',
      journal: 'A Súgó és a Parancspult segédanyag újraépítése.',
      help: 'Ez a lista.',
      optionsTitle: 'Opciók',
      options:
        'Opciók: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name és --commands. Az azonosítók helyett nevek is használhatók.',
      placeholders:
        'A parancsok a következőket használhatják: ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} és ${field:name}.',
      handouts:
        'A(z) „{help}” segédanyag mindent elmagyaráz; a(z) „{deck}” segédanyagon gombok vannak.',
    },
    store: {
      bio: 'Ez a karakter a Customizable Roll Listener modhoz tartozik. Minden képesség egy figyelő: a képesség a futtatandó parancsokat, a leírása a figyelő szabályait tartalmazza.',
      bioHelp:
        'A parancsokat itt szerkesztheti. A szabályokat a !crl paranccsal vagy a Parancspult segédanyagból módosíthatja. Egy képesség törlése a figyelőjét is törli.',
    },
    deck: {
      subtitle: 'Parancspult',
      listeners: 'Figyelők',
      listenersDesc: 'Figyelők megtekintése, létrehozása, módosítása és tesztelése.',
      listening: 'Figyelés',
      listeningDesc: 'Az összes figyelő be- vagy kikapcsolása egyszerre.',
      tools: 'Eszközök',
      toolsDesc:
        'Chatüzenet vizsgálata, beállítások módosítása, segédanyagok újraépítése vagy a súgó olvasása.',
      footer: 'Minden parancs csak GM-nek érhető el. Részletek a(z) „{help}” segédanyagban.',
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'Halld a kockát, halld a kalandot',
      footer: 'Minden parancs gombja a(z) „{deck}” segédanyagban található.',
      overview: {
        heading: 'Áttekintés',
        body: 'A Customizable Roll Listener (CRL) figyeli a chatet, és az Ön által választott parancsokat futtatja, ha egy üzenet megfelel egy figyelőnek. A figyelő vizsgálhatja a dobássablont, a szöveget, az üzenet küldőjét és a benne lévő dobásokat: kritikus találatokat, kritikus hibákat, sikereket, kudarcokat, összegeket és natúr kockaértékeket. Parancs bármi lehet, amit a chatbe beírhat, más modok parancsait is beleértve, így a CRL hangokat játszhat le, dobótáblázatokon dobhat, emote-okat küldhet, állapotjelzőket tehet fel és még sok mást.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        steps: [
          'Írja be a chatbe: !crl (vagy kattintson a Figyelők gombra a Parancspult segédanyagban).',
          'Kattintson az Új figyelő gombra, és adjon neki nevet, például Kritikus hang.',
          'Kattintson a Módosítás gombra a Dobás eredménye mellett, és válassza a Kritikus lehetőséget.',
          'Kattintson a Parancsok megadása gombra, és adja meg, mit futtasson, például !roll20AM --audio,play|Crit.',
          'Kattintson a Teszt gombra a parancsok kipróbálásához, majd dobjon egy támadást. Ha nem aktiválódik, használja a Következő üzenet vizsgálata gombot.',
        ],
      },
      examples: {
        heading: 'Példák',
        points: [
          'Hang minden kritikus találatra, bármely lapról: --results crit',
          'Kritikushiba-táblázat natúr 1-re a D&D 5e 2014 támadássablonjában: --templates atkdmg atk --natural 1',
          'Reagálás egy dobótáblázat eredményére: --text Harc',
          'Csak egy karakternek: --who Alice',
          'Legalább 20-as összeg egy „Erő” dobás első beágyazott dobásán: --text Erő && ## --total >=20',
        ],
        code: [
          '!crl new Kritikus hang --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Kritikus hiba --natural 1 --dice 20 --commands /em kritikus hibát dobott! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrátor --results crit fumble --speaker crl --commands /desc ${who} dobása: ${result}!',
        ],
      },
      matching: {
        heading: 'Mit ellenőriz egy figyelő',
        points: [
          'Egy figyelő akkor aktiválódik, ha minden szűrője egyezik. Az üres szűrő mindenre illeszkedik.',
          'Dobássablonok: a sablon neve, például atkdmg vagy simple. A „none” a sablon nélküli üzenetekre illeszkedik. Több név esetén bármelyik megfelel.',
          'Üzenettípusok: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon lapok) és api. Ha üres, az api-parancsok kivételével minden típust ellenőriz.',
          'Szöveg: egy vagy több szövegrész &&-vel elválasztva, amelyeknek mind szerepelniük kell. A kis- és nagybetű nem számít. A szöveget a dobásösszegekben és a dobótáblázat-eredményekben is keresi.',
          'A ## a szövegben egy beágyazott dobást jelöl; ilyenkor a dobásellenőrzések csak az ott talált dobásokat nézik. ## nélkül az üzenet minden dobását ellenőrzi.',
          'A szöveg egyszerű szöveg helyett reguláris kifejezés is lehet (--regex on).',
          'Beszélők / karakterek: a chatben megjelenő név, vagy a karakter neve a dobássablonban. Játékosok: a játékos megjelenített neve.',
        ],
      },
      templates: {
        heading: 'Dobássablonok nevei',
        points: [
          'A dobássablon az az elrendezés, amelyet egy lap a dobáskártyáihoz használ. A neve a makróban a template: utáni rész, tehát a &{template:atkdmg} az atkdmg sablon. Minden lapnak saját sablonnevei vannak.',
          'A név megtalálásának leggyorsabb módja: kattintson a Következő üzenet vizsgálata gombra, dobjon a lapról, és olvassa el a Dobássablon sort abban, amit a CRL visszasúg.',
          'A nevet egy lapgomb makrójában vagy a lap GitHubon lévő forráskódjában is megtalálja, ahol minden sablon egy <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Gyakori lapok sablonjai:',
        ],
        colSheet: 'Lap',
        colNames: 'Sablonnevek',
        links: 'Bővebben a dobássablonokról:',
        builtIn: 'Roll20: beépített dobássablonok',
        dnd5e2014: 'Roll20: D&D 5e (2014) dobássablonok',
        sheets: 'Roll20 karakterlapok forráskódja',
      },
      rolls: {
        heading: 'Dobásellenőrzések',
        points: [
          'Dobás eredménye: kritikus (a kocka legnagyobb értéke vagy a cs tartomány), kritikus hiba (1-es vagy a cf tartomány), siker (legalább egy kocka eléri a célt, pl. 1d20>15), kudarc (céldobás siker nélkül). Több eredmény esetén bármelyik megfelel.',
          'Dobás összege: szám, összehasonlítás (pl. >=15) vagy tartomány (pl. 19-20).',
          'Natúr kocka: az érték, amelyre a kocka esett, pl. 20 vagy <=2.',
          'Ellenőrzött kockák: az Automatikus csak a d20-akat nézi, ha dobtak ilyet, így a maximumot dobó sebzéskockák nem számítanak kritikusnak. Ezen a Bármely kocka vagy egy méret (pl. d100) választásával változtathat.',
          'Az eldobott kockák (előny és hátrány) és az újradobott kockák nem számítanak.',
          'A D&D 5E by Roll20 (2014) lap az előnyt és a hátrányt két külön d20-dobásként (r1 és r2) dobja, ezért a CRL mindkettőt ellenőrzi: előnnyel az alacsonyabb kockán dobott 1-es is kritikus hibának számít, hátránnyal pedig a magasabb kockán dobott 20-as is kritikusnak.',
          'Egy figyelő akkor aktiválódik, ha legalább egy dobás minden dobásellenőrzésnek megfelel.',
        ],
      },
      commands: {
        heading: 'Chatparancsok',
        intro:
          'Minden parancs csak GM-nek érhető el. A figyelőre a nevével vagy az azonosítójával hivatkozhat.',
        colCommand: 'Parancs',
        colDesc: 'Mit csinál',
      },
      options: {
        heading: 'Figyelőopciók',
        intro:
          'Ezeket a !crl new vagy a !crl edit után adhatja meg. Érték törléséhez hagyja üresen, vagy írjon -. A --commands legyen az utolsó.',
        colOption: 'Opció',
        colDesc: 'Jelentés',
        templates:
          'Dobássablonok nevei szóközzel elválasztva. none = nincs sablon. Lásd fent: Dobássablonok nevei.',
        types: 'Üzenettípusok szóközzel elválasztva: {types}.',
        text: 'Keresett szöveg. A részeket &&-vel válassza el. A ## beágyazott dobást jelöl.',
        regex: 'on: a szöveg reguláris kifejezés, off: egyszerű szöveg.',
        who: 'Beszélők vagy karakterek nevei vesszővel elválasztva.',
        players: 'Játékosok megjelenített nevei vesszővel elválasztva.',
        results: 'crit, fumble, success és/vagy fail.',
        total: 'Dobás összege: 15, >=15, <5 vagy 19-20.',
        natural: 'Natúr kockaérték: 20, <=2 vagy 19-20.',
        dice: 'auto, any, vagy egy kockaméret, pl. 20.',
        cooldown: 'Ennyi másodperc után aktiválódhat újra a figyelő.',
        stop: 'on: ha ez a figyelő aktiválódik, a későbbieket már nem ellenőrzi.',
        speaker: 'default, crl vagy roller.',
        enabled: 'on vagy off.',
        name: 'Átnevezi a figyelőt.',
        commands: 'A futtatandó parancsok. A sorokat \\\\ jellel válassza el.',
      },
      placeholders: {
        heading: 'Helyőrzők',
        intro: 'Ezek a figyelő parancsaiban lecserélődnek, amikor a figyelő aktiválódik.',
        colName: 'Helyőrző',
        colDesc: 'Mire cserélődik',
        who: 'A chatben megjelenő név.',
        character: 'A karakter neve a dobássablonból, vagy a chatben megjelenő név.',
        player: 'A játékos megjelenített neve.',
        template: 'A dobássablon neve.',
        total: 'Az egyező dobás (vagy az első dobás) összege.',
        natural: 'Annak a dobásnak a natúr d20-a (vagy első kockája).',
        result: 'crit, fumble, success vagy fail, ha a figyelő ilyet keresett.',
        expression: 'A dobáskifejezés, pl. 1d20+5.',
        table: 'Annak a dobásnak a dobótáblázat-eredményei.',
        listener: 'A figyelő neve.',
        field:
          'Egy dobássablon-mező, pl. ${field:rname} (a beágyazott dobások az összegükkel jelennek meg).',
      },
      running: {
        heading: 'Hogyan futnak a parancsok',
        points: [
          'Minden sor külön chatüzenetként megy el, kivéve a több sorra kiterjedő {{ … }} blokkot (dobássablon vagy ScriptCards-szkript), amely egyben marad.',
          'A parancsok a CRL vagy a dobó karakter nevében mennek el, a figyelő vagy a beállítások szerint. Más modok a CRL által küldött parancsokat az API-tól érkezőnek látják.',
          'A parancsokban használhatók beágyazott dobások, dobássablonok, @{Character|attribute} és %{Character|ability}. A kijelölt tokenre mutató hivatkozások (@{selected|…}) és a lekérdezések (?{…}) nem működnek, mert nincs kitől kérdezni.',
          'A figyelők ellenőrzése sorrendben történik. A Megállás ennél beállítású figyelő megakadályozza, hogy a későbbi figyelők ugyanarra az üzenetre aktiválódjanak.',
          'A várakozási idő alatt a figyelő ennyi másodpercig nem aktiválódhat újra.',
          'A CRL figyelmen kívül hagyja a saját üzeneteit. Ha egy figyelő mégis több mint 20-szor aktiválódik 10 másodpercen belül, a CRL kikapcsolja, és értesíti a GM-et.',
        ],
      },
      inspector: {
        heading: 'A vizsgáló',
        points: [
          'Kattintson a Következő üzenet vizsgálata gombra, majd dobjon. A CRL visszasúgja, mit látott: az üzenet típusát, a beszélőt, a karaktert, a sablont és a mezőit, minden dobást a kockáival, a szöveget, amelyben a figyelők keresnek, és hogy az egyes figyelők miért aktiválódtak vagy miért nem.',
          'Ezzel megtalálhatja egy lap sablonnevét, vagy megnézheti, mit küld egy Beacon lap (például a D&D 2024).',
          'A Beacon lapok dobássablonok helyett dobáskártyákat küldenek. A CRL ezeket is beolvassa: a sablon a kártya első osztálya (D&D 2024 esetén dnd-2024), a karakter, a cím (pl. Dexterity Check) és az alkategória mezők lesznek, a lebontás minden dobása pedig dobásnak számít, így a kritikus, kritikus hiba, összeg és natúr ellenőrzések működnek.',
        ],
      },
      settings: {
        heading: 'Beállítások',
        intro:
          'Ezeket a !crl config paranccsal vagy a Beállítások gombbal módosíthatja. Néhány a mod One-Click beállításai között is megadható.',
        colKey: 'Beállítás',
        colName: 'Név',
        colDesc: 'Leírás',
      },
      storage: {
        heading: 'Hol tárolódnak a figyelők',
        body: 'Minden figyelő egy képesség az archivált „{character}” karakteren. A képesség tartalmazza a parancsokat, így a Naplóban a teljes makrószerkesztővel szerkesztheti őket. A leírása tartalmazza a figyelő szabályait, így a figyelők a játék másolását is túlélik. Egy képesség törlése a figyelőjét is törli; a kézzel hozzáadott képesség kikapcsolva jelenik meg a menüben.',
      },
      upgrading: {
        heading: 'Frissítés az 1-es verzióról',
        points: [
          'Az 1-es verzió figyelői az első indításkor átalakulnak, és megtartják a parancsaikat.',
          'A csak egyszerű karaktereket tartalmazó szöveg egyszerű szöveg lesz, és már nem számít benne a kis- és nagybetű. A reguláris kifejezések jeleit használó szöveg reguláris kifejezés marad.',
          'A dobáseredményt figyelő, de ## nélküli figyelők korábban „not parseable” hibával elbuktak; most az üzenet minden dobását ellenőrzik.',
          'A kudarc mostantól siker nélküli céldobást jelent; a pontosan a célt elérő dobás siker.',
          'Az 1-es verzió parancsai továbbra is működnek:',
        ],
        colV1: '1-es verzió',
        colV2: '2-es verzió',
      },
      troubleshooting: {
        heading: 'Hibaelhárítás',
        points: [
          'Semmi sem történik: ellenőrizze, hogy a Figyelés és a figyelő is be van-e kapcsolva, majd a vizsgálóval nézze meg, melyik szűrő nem egyezik.',
          'Egy lap dobásait nem ismeri fel: vizsgáljon meg egyet; az ott látható sablonnév és mezők alapján szűrhet.',
          'A Beacon lapokhoz (például D&D 2024) az Experimental Mod sandbox kell, hogy a modok lássák a dobásaikat.',
          'A @{…} és %{…} hivatkozások elvesznek, ha a parancsot a !crl után gépeli be; helyette a Naplóban szerkessze a képességet.',
          'A sebzéskockák kritikusnak számítanak: állítsa az Ellenőrzött kockák értékét d20-ra.',
          'A hibák „Customizable Roll Listener” előtaggal kerülnek az API-konzolra.',
        ],
      },
      languages: {
        heading: 'Nyelvek',
        body: 'Nyelvet a !crl config language paranccsal vagy a Language One-Click opcióval választhat. Támogatott nyelvek:',
        colCode: 'Kód',
        colName: 'Nyelv',
        colNative: 'Eredeti név',
      },
      credits: {
        heading: 'Köszönetnyilvánítás',
        original: 'Az eredeti modot készítette',
        maintainer: 'A 2-es verziót készítette',
        support: 'Problémákat a Roll20 fórumain vagy a GitHub-tárolóban jelezhet.',
        wiki: 'Az 1-es verzió wikioldala',
      },
    },
  };

  const TRANSLATION$a = {
    titles: {
      ready: 'Customizable Roll Listener è pronto.',
      settings: 'Impostazioni CRL',
      languages: 'Scegli una lingua',
      help: 'Comandi CRL',
      confirm: 'Conferma',
      inspect: 'Ispettore CRL',
      listener: 'Listener «{name}»',
      listenerCommands: 'Comandi: {name}',
    },
    menu: {
      listening: 'Ascolto',
      listeners: "Listener (controllati in quest'ordine)",
      noListeners: 'Ancora nessun listener. Fai clic su Nuovo listener per crearne uno.',
      noCommands: 'Ancora nessun comando.',
      commandsHint:
        "Separa le righe con \\\\ quando scrivi i comandi in chat. Per i riferimenti @{...} o %{...} modifica invece l'abilità nel Diario, perché la chat li sostituisce prima che CRL li veda.",
    },
    buttons: {
      back: 'Indietro',
      change: 'Cambia',
      confirmDelete: 'Sì, elimina',
      delete: 'Elimina',
      edit: 'Modifica',
      help: 'Aiuto',
      inspect: 'Ispeziona prossimo messaggio',
      inspectOff: 'Smetti di ispezionare',
      new: 'Nuovo listener',
      openJournal: 'Apri nel Diario',
      rebuildJournal: 'Ricrea dispense',
      rename: 'Rinomina',
      setCommands: 'Imposta comandi',
      settings: 'Impostazioni',
      test: 'Prova',
      enable: 'Attiva',
      disable: 'Disattiva',
      menu: 'Listener',
      turnOn: 'Ascolto attivo',
      turnOff: 'Ascolto disattivato',
    },
    prompts: {
      newName: 'Nome del nuovo listener',
      name: 'Nuovo nome',
      target: 'Nome del listener',
      commands: 'Comandi - separa le righe con due barre rovesciate',
      templates:
        'Template di tiro separati da spazi - none per nessun template - vuoto per qualsiasi - Ispeziona mostra il template di un tiro',
      types: 'Tipi di messaggio separati da spazi - vuoto per tutti tranne api',
      text: 'Testo da cercare - vedi la dispensa Help - vuoto per qualsiasi',
      regex: 'Come leggere il testo',
      who: 'Nomi di mittenti o personaggi separati da virgole - vuoto per chiunque',
      players: 'Nomi dei giocatori separati da virgole - vuoto per chiunque',
      results: 'Risultato del tiro',
      total: 'Totale del tiro, ad esempio 15 o 19-20 - vedi la dispensa Help - vuoto per qualsiasi',
      natural: 'Risultato naturale del dado, ad esempio 20 o 1-2 - vuoto per qualsiasi',
      dice: 'Quali dadi esaminano i controlli',
      cooldown: 'Secondi di attesa prima di attivarsi di nuovo - 0 per nessuna attesa',
      speaker: 'Invia i comandi come',
    },
    choices: {
      critOrFumble: 'Critico o fallimento critico',
    },
    values: {
      on: 'Attivo',
      off: 'Disattivo',
      none: 'Nessuno',
      any: 'Qualsiasi',
      allButApi: 'Qualsiasi (non comandi API)',
      plain: 'Testo semplice',
      regex: 'Espressione regolare',
      diceAuto: 'Auto (d20 se tirati)',
      diceAny: 'Qualsiasi dado',
      seconds: '{seconds} s',
      speaker: {
        default: 'Impostazione predefinita',
        crl: 'CRL',
        roller: 'Chi ha tirato',
      },
    },
    results: {
      crit: 'Critico',
      fumble: 'Fallimento critico',
      success: 'Successo',
      fail: 'Fallimento',
    },
    fields: {
      enabled: 'Attivo',
      templates: 'Template di tiro',
      types: 'Tipi di messaggio',
      text: 'Testo',
      regex: 'Il testo è',
      who: 'Mittenti / personaggi',
      players: 'Giocatori',
      results: 'Risultato del tiro',
      total: 'Totale del tiro',
      natural: 'Dado naturale',
      dice: 'Dadi controllati',
      cooldown: 'Tempo di ricarica',
      stop: 'Fermati dopo questo',
      speaker: 'Invia come',
      commands: 'Comandi',
    },
    settings: {
      enabled: {
        label: 'Ascolto',
        desc: 'Attiva o disattiva tutti i listener insieme.',
      },
      speaker: {
        label: 'Invia i comandi come',
        desc: 'A nome di chi vengono inviati i comandi dei listener, se il listener non indica altro: CRL, oppure il personaggio (o giocatore) il cui messaggio lo ha attivato.',
      },
      listenToMods: {
        label: 'Ascolta gli altri mod',
        desc: 'Se i messaggi in chat inviati da altri mod possono attivare i listener. CRL non reagisce mai ai propri messaggi.',
      },
      language: {
        label: 'Lingua',
        desc: 'Lingua di menu, messaggi e dispense.',
      },
    },
    inspect: {
      type: 'Tipo',
      who: 'Mittente',
      character: 'Personaggio',
      player: 'Giocatore',
      template: 'Template di tiro',
      keys: 'Proprietà del messaggio',
      extras: 'Dati extra del messaggio',
      fields: 'Campi del template',
      rolls: 'Tiri',
      dice: 'dadi',
      table: 'tabella',
      target: 'ha una soglia di successo',
      crit: 'critico',
      fumble: 'fallimento critico',
      text: 'Testo (come lo leggono i listener)',
      raw: 'Contenuto grezzo',
      listeners: 'Listener',
      matched: 'attiverebbe {result}',
      reasons: {
        disabled: 'disattivato',
        type: 'il tipo di messaggio non corrisponde',
        template: 'il template di tiro non corrisponde',
        who: 'mittente o personaggio non corrisponde',
        player: 'il giocatore non corrisponde',
        text: 'testo non trovato',
        roll: 'nessun tiro soddisfa le condizioni sui tiri',
      },
    },
    messages: {
      upgraded: 'Aggiornato dalla versione 1. {count} listener convertiti, con i loro comandi.',
      restored: 'Ripristinati {count} listener dal personaggio di archivio.',
      adopted:
        'Trovate {count} abilità sul personaggio di archivio senza regole di listener. Sono state aggiunte disattivate; configurale dal menu.',
      removed: 'Rimossi {count} listener la cui abilità è stata eliminata.',
      listeningOff: "L'ascolto è disattivato. Digita !crl on per attivarlo.",
      readyHint: "{count} listener. Digita !crl per il menu o !crl help per l'elenco dei comandi.",
      loopStopped:
        'Il listener "{name}" si è attivato troppe volte in poco tempo, probabilmente perché i suoi comandi lo riattivano, quindi è stato disattivato.',
      noCommands: 'Il listener "{name}" non ha comandi da eseguire.',
      tested: 'Eseguiti i comandi di "{name}" ({count} messaggio/i).',
      confirmDelete:
        'Eliminare il listener "{name}" e i suoi comandi? L\'operazione non può essere annullata.',
      deleted: 'Listener "{name}" eliminato.',
      inspectOn:
        'Il prossimo messaggio in chat verrà ispezionato e il risultato ti verrà sussurrato.',
      inspectOff: "L'ispettore è stato disattivato.",
      journalRebuilt: 'Dispense "{help}" e "{deck}" ricreate.',
    },
    errors: {
      gmOnly: 'Solo un GM può usare i comandi di Customizable Roll Listener.',
      unexpected: 'Qualcosa è andato storto: {message}',
      unknownCommand: 'Comando sconosciuto "{command}".',
      badOption: 'Opzione sconosciuta --{option}.',
      notFound: 'Non esiste nessun listener chiamato "{name}".',
      nameRequired: 'Indica il nome di un listener.',
      nameInvalid: 'Il nome "{name}" non può essere usato.',
      nameTaken: 'Esiste già un listener chiamato "{name}".',
      badOnOff: 'Il valore "{value}" non è valido per --{option}.',
      badType: 'Tipi di messaggio sconosciuti: {value}.',
      badRegex: 'L\'espressione regolare "{term}" non è valida: {error}',
      tooManyTerms: 'Un listener può cercare al massimo {max} frammenti di testo.',
      badResult: 'Risultati del tiro sconosciuti: {value}.',
      badComparison: 'Il valore "{value}" non è valido per --{option}.',
      badDice: 'Il valore "{value}" non è valido per --dice.',
      badCooldown: 'Il valore "{value}" non è valido per --cooldown.',
      badSpeaker: 'Il valore "{value}" non è valido per --speaker.',
      noStore: 'Impossibile creare il personaggio di archivio.',
      badSetting: 'Impostazione sconosciuta "{key}".',
      badSettingValue: 'Il valore "{value}" non è valido per {key}.',
    },
    hints: {
      gmOnly: 'Chiedi al tuo GM di configurare i listener per te.',
      unknownCommand: 'Digita !crl help per vedere tutti i comandi.',
      badOption:
        'Le opzioni sono --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name e --commands.',
      notFound: "Digita !crl per vedere l'elenco dei listener.",
      nameInvalid:
        'Usa al massimo {max} caratteri, senza questi: | { } [ ] \\ @ % # ? ~ o "--", e non iniziare con "-".',
      badOnOff: 'Usa on o off.',
      badType: 'I tipi di messaggio sono: {types}.',
      badResult: 'Usa crit, fumble, success o fail.',
      badComparison: 'Usa un numero, un confronto come >=15 o <3, o un intervallo come 19-20.',
      badDice: 'Usa auto, any o una dimensione di dado come 20 o d20.',
      badCooldown: 'Usa un numero intero di secondi da 0 a 3600.',
      badSpeaker: 'Usa default, crl o roller.',
      badSetting: 'Le impostazioni sono: {keys}.',
      noStore: 'Controlla gli errori nella console API, poi riavvia la sandbox.',
    },
    help: {
      menu: "Mostra l'elenco dei listener.",
      new: 'Crea un listener. Le opzioni si possono aggiungere subito.',
      show: 'Mostra un listener e le sue impostazioni, con pulsanti per modificarle.',
      edit: 'Modifica un listener. Lascia un valore vuoto (o usa -) per cancellarlo.',
      commands:
        'Sostituisci i comandi di un listener. Viene usato tutto ciò che segue --commands, quindi mettilo per ultimo.',
      enable: 'Attiva o disattiva un listener.',
      move: "Sposta un listener prima o dopo nell'ordine in cui vengono controllati i listener.",
      test: 'Esegui subito i comandi di un listener, come se fosse uscito un 20 naturale.',
      delete: 'Elimina un listener e i suoi comandi (chiede conferma).',
      inspect: "Sussurra un'analisi del prossimo messaggio in chat e quali listener attiverebbe.",
      inspectOff: 'Smetti di attendere un messaggio da ispezionare.',
      onOff: "Attiva o disattiva tutto l'ascolto.",
      config: 'Mostra o modifica le impostazioni globali.',
      journal: 'Ricrea le dispense Help e Command Deck.',
      help: 'Mostra questo elenco.',
      optionsTitle: 'Opzioni',
      options:
        'Opzioni: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name e --commands. Si possono usare i nomi al posto degli ID.',
      placeholders:
        'I comandi possono usare ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} e ${field:name}.',
      handouts: 'La dispensa "{help}" spiega tutto; la dispensa "{deck}" ha i pulsanti.',
    },
    store: {
      bio: "Questo personaggio appartiene al mod Customizable Roll Listener. Ogni abilità è un listener: l'abilità contiene i comandi da eseguire e la sua descrizione contiene le regole del listener.",
      bioHelp:
        "Puoi modificare i comandi qui. Cambia le regole con !crl o dalla dispensa Command Deck. Eliminare un'abilità elimina il suo listener.",
    },
    deck: {
      subtitle: 'Pannello comandi',
      listeners: 'Listener',
      listenersDesc: 'Visualizza, crea, modifica e prova i listener.',
      listening: 'Ascolto',
      listeningDesc: 'Attiva o disattiva tutti i listener insieme.',
      tools: 'Strumenti',
      toolsDesc:
        'Ispeziona un messaggio in chat, modifica le impostazioni, ricrea le dispense o leggi la guida.',
      footer: 'Tutti i comandi sono riservati al GM. Vedi la dispensa "{help}" per i dettagli.',
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: "Ascolta i dadi, ascolta l'azione",
      footer: 'I pulsanti per tutti i comandi sono nella dispensa "{deck}".',
      overview: {
        heading: 'Panoramica',
        body: 'Customizable Roll Listener (CRL) osserva la chat ed esegue i comandi che scegli quando un messaggio corrisponde a un listener. Un listener può esaminare il template di tiro, il testo, chi ha inviato il messaggio e i tiri che contiene: colpi critici, fallimenti critici, successi, fallimenti, totali e risultati naturali dei dadi. I comandi possono essere qualsiasi cosa tu possa scrivere in chat, compresi i comandi di altri mod, quindi CRL può riprodurre suoni, tirare sulle tabelle casuali, pubblicare emote, applicare segnalini di stato e altro ancora.',
      },
      quickStart: {
        heading: 'Guida rapida',
        steps: [
          'Digita !crl in chat (o fai clic su Listener nella dispensa Command Deck).',
          'Fai clic su Nuovo listener e dagli un nome, ad esempio Suono Critico.',
          'Fai clic su Cambia accanto a Risultato del tiro e scegli Critico.',
          'Fai clic su Imposta comandi e inserisci cosa eseguire, ad esempio !roll20AM --audio,play|Crit.',
          'Fai clic su Prova per verificare i comandi, poi tira un attacco. Se non si attiva, usa Ispeziona prossimo messaggio.',
        ],
      },
      examples: {
        heading: 'Esempi',
        points: [
          'Suono a ogni colpo critico, da qualsiasi scheda: --results crit',
          'Tabella dei fallimenti critici con un 1 naturale nel template di attacco di D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reagire al risultato di una tabella casuale: --text Combattimento',
          'Solo per un personaggio: --who Alice',
          'Un totale di 20 o più nel primo tiro inline di un tiro di "Forza": --text Forza && ## --total >=20',
        ],
        code: [
          '!crl new Suono Critico --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Fallimento --natural 1 --dice 20 --commands /em fa un fallimento clamoroso! \\\\ /roll 1t[Fumbles]',
          '!crl new Narratore --results crit fumble --speaker crl --commands /desc ${who} ha ottenuto un ${result}!',
        ],
      },
      matching: {
        heading: 'Cosa controlla un listener',
        points: [
          'Un listener si attiva quando tutti i suoi filtri corrispondono. I filtri vuoti corrispondono a tutto.',
          'Template di tiro: il nome del template, ad esempio atkdmg o simple. "none" corrisponde ai messaggi senza template. Più nomi indicano uno qualsiasi di essi.',
          'Tipi di messaggio: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (schede Beacon) e api. Se vuoto, vengono controllati tutti i tipi tranne i comandi api.',
          'Testo: uno o più frammenti di testo, separati da &&, che devono comparire tutti. Il confronto ignora maiuscole e minuscole. Il testo viene cercato anche nei totali dei tiri e nei risultati delle tabelle casuali.',
          '## nel testo indica un tiro inline; i controlli sui tiri esaminano allora solo i tiri trovati lì. Senza ##, viene controllato ogni tiro del messaggio.',
          "Il testo può essere un'espressione regolare invece di testo semplice (--regex on).",
          'Mittenti / personaggi: il nome mostrato in chat o il nome del personaggio nel template di tiro. Giocatori: il nome visualizzato del giocatore.',
        ],
      },
      templates: {
        heading: 'Nomi dei template di tiro',
        points: [
          'Un template di tiro è il layout che una scheda usa per i suoi riquadri di tiro. Il suo nome è la parte dopo template: in una macro, quindi &{template:atkdmg} è il template atkdmg. Ogni scheda ha i suoi nomi.',
          'Il modo più rapido per trovare un nome: fai clic su Ispeziona prossimo messaggio, fai il tiro dalla scheda e leggi la riga Template di tiro che CRL ti sussurra.',
          'Puoi anche leggere il nome nella macro di un pulsante della scheda, o nel sorgente della scheda su GitHub, dove ogni template è un <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Template delle schede più diffuse:',
        ],
        colSheet: 'Scheda',
        colNames: 'Nomi dei template',
        links: 'Altre informazioni sui template di tiro:',
        builtIn: 'Roll20: template di tiro integrati',
        dnd5e2014: 'Roll20: template di tiro di D&D 5e (2014)',
        sheets: 'Sorgenti delle schede di Roll20',
      },
      rolls: {
        heading: 'Controlli sui tiri',
        points: [
          "Risultato del tiro: critico (la faccia più alta del dado, o l'intervallo cs), fallimento critico (un 1, o l'intervallo cf), successo (almeno un dado raggiunge una soglia come 1d20>15), fallimento (un tiro con soglia senza successi). Più risultati indicano uno qualsiasi di essi.",
          'Totale del tiro: un numero, un confronto come >=15 o un intervallo come 19-20.',
          'Dado naturale: la faccia su cui è caduto un dado, ad esempio 20, o <=2.',
          'Dadi controllati: auto esamina solo i d20 quando ne è stato tirato uno, così i dadi dei danni che fanno il massimo non contano come critici. Scegli qualsiasi dado, o una dimensione come d100, per cambiare questo comportamento.',
          'I dadi scartati (vantaggio e svantaggio) e i dadi ritirati vengono ignorati.',
          'La scheda D&D 5E by Roll20 (2014) tira vantaggio e svantaggio come due tiri di d20 separati (r1 e r2), quindi CRL li controlla entrambi: con vantaggio un 1 sul dado più basso conta comunque come fallimento critico, e con svantaggio un 20 sul dado più alto conta comunque come critico.',
          'Un listener si attiva quando almeno un tiro soddisfa tutti i controlli sui tiri.',
        ],
      },
      commands: {
        heading: 'Comandi di chat',
        intro:
          "Tutti i comandi sono riservati al GM. Un listener si può indicare con il nome o con l'ID.",
        colCommand: 'Comando',
        colDesc: 'Cosa fa',
      },
      options: {
        heading: 'Opzioni dei listener',
        intro:
          'Aggiungile a !crl new o !crl edit. Lascia un valore vuoto, o usa -, per cancellarlo. --commands deve venire per ultimo.',
        colOption: 'Opzione',
        colDesc: 'Significato',
        templates:
          'Nomi dei template di tiro, separati da spazi. none = nessun template. Vedi Nomi dei template di tiro sopra.',
        types: 'Tipi di messaggio, separati da spazi: {types}.',
        text: 'Testo da trovare. Separa i frammenti con &&. ## indica un tiro inline.',
        regex: 'on per leggere il testo come espressioni regolari, off per testo semplice.',
        who: 'Nomi di mittenti o personaggi, separati da virgole.',
        players: 'Nomi visualizzati dei giocatori, separati da virgole.',
        results: 'crit, fumble, success e/o fail.',
        total: 'Totale del tiro: 15, >=15, <5 o 19-20.',
        natural: 'Faccia del dado naturale: 20, <=2 o 19-20.',
        dice: 'auto, any o una dimensione di dado come 20.',
        cooldown: 'Secondi prima che il listener possa attivarsi di nuovo.',
        stop: 'on per non controllare i listener successivi quando questo si attiva.',
        speaker: 'default, crl o roller.',
        enabled: 'on o off.',
        name: 'Rinomina il listener.',
        commands: 'I comandi da eseguire. Separa le righe con \\\\.',
      },
      placeholders: {
        heading: 'Segnaposto',
        intro: 'Vengono sostituiti nei comandi di un listener quando si attiva.',
        colName: 'Segnaposto',
        colDesc: 'Sostituito con',
        who: 'Il nome mostrato in chat.',
        character: 'Il nome del personaggio dal template di tiro, o il nome mostrato in chat.',
        player: 'Il nome visualizzato del giocatore.',
        template: 'Il nome del template di tiro.',
        total: 'Il totale del tiro che corrisponde (o del primo tiro).',
        natural: 'Il d20 naturale (o il primo dado) di quel tiro.',
        result: 'crit, fumble, success o fail, quando ne è stato richiesto uno.',
        expression: "L'espressione del tiro, ad esempio 1d20+5.",
        table: 'I risultati delle tabelle casuali di quel tiro.',
        listener: 'Il nome del listener.',
        field:
          'Un campo del template di tiro, ad esempio ${field:rname} (i tiri inline vengono mostrati come totali).',
      },
      running: {
        heading: 'Come vengono eseguiti i comandi',
        points: [
          'Ogni riga viene inviata come messaggio di chat a sé, tranne un blocco {{ … }} distribuito su più righe (un template di tiro o uno script ScriptCards), che resta unito.',
          "I comandi vengono inviati come CRL, o come il personaggio che ha tirato, secondo l'impostazione del listener o quella generale. Gli altri mod vedono i comandi inviati da CRL come provenienti dall'API.",
          "I comandi possono usare tiri inline, template di tiro, @{Character|attribute} e %{Character|ability}. I riferimenti al token selezionato (@{selected|…}) e le richieste (?{…}) non funzionano, perché non c'è nessuno a cui chiedere.",
          'I listener vengono controllati in ordine. Un listener con Fermati dopo questo impedisce ai listener successivi di attivarsi sullo stesso messaggio.',
          'Il tempo di ricarica impedisce a un listener di riattivarsi per quel numero di secondi.',
          'CRL ignora i propri messaggi. Se un listener si attiva comunque più di 20 volte in 10 secondi, viene disattivato e il GM viene avvisato.',
        ],
      },
      inspector: {
        heading: "L'ispettore",
        points: [
          'Fai clic su Ispeziona prossimo messaggio, poi effettua il tiro. CRL sussurra ciò che ha visto: tipo di messaggio, mittente, personaggio, template e i suoi campi, ogni tiro con i suoi dadi, il testo cercato dai listener e perché ogni listener si è attivato o no.',
          'Usalo per trovare il nome del template di una scheda o per vedere cosa invia una scheda Beacon (come D&D 2024).',
          'Le schede Beacon pubblicano riquadri di tiro invece dei template di tiro. CRL li legge: il template è la prima classe del riquadro (dnd-2024 per D&D 2024), personaggio, titolo (come Prova di Destrezza) e sottocategoria diventano campi, e ogni tiro nel dettaglio è un tiro, quindi i controlli su critico, fallimento critico, totale e dado naturale funzionano.',
        ],
      },
      settings: {
        heading: 'Impostazioni',
        intro:
          'Modificale con !crl config o con il pulsante Impostazioni. Alcune si possono impostare anche nelle opzioni One-Click del mod.',
        colKey: 'Impostazione',
        colName: 'Nome',
        colDesc: 'Descrizione',
      },
      storage: {
        heading: 'Dove vengono salvati i listener',
        body: "Ogni listener è un'abilità del personaggio archiviato \"{character}\". L'abilità contiene i comandi, quindi puoi modificarli nel Diario con l'editor di macro completo. La sua descrizione contiene le regole del listener, il che permette ai listener anche di sopravvivere alla copia della partita. Eliminare un'abilità elimina il suo listener; un'abilità aggiunta a mano compare nel menu disattivata.",
      },
      upgrading: {
        heading: 'Aggiornamento dalla versione 1',
        points: [
          'I listener della versione 1 vengono convertiti al primo avvio e mantengono i loro comandi.',
          "Il testo che contiene solo caratteri normali diventa testo semplice e ora ignora maiuscole e minuscole. Il testo che usa simboli delle espressioni regolari resta un'espressione regolare.",
          'I listener con un risultato del tiro ma senza ## fallivano con "not parseable"; ora controllano ogni tiro del messaggio.',
          'Fallimento ora indica un tiro con soglia senza successi; un tiro esattamente uguale alla soglia è un successo.',
          'I comandi della versione 1 funzionano ancora:',
        ],
        colV1: 'Versione 1',
        colV2: 'Versione 2',
      },
      troubleshooting: {
        heading: 'Risoluzione dei problemi',
        points: [
          "Non succede nulla: controlla che Ascolto e il listener siano attivi, poi usa l'ispettore per vedere quale filtro non corrisponde.",
          'I tiri di una scheda non vengono riconosciuti: ispezionane uno; il nome del template e i campi mostrati sono ciò su cui filtrare.',
          'Le schede Beacon (come D&D 2024) richiedono la sandbox Experimental perché i mod possano vederne i tiri.',
          "I comandi che usano @{…} o %{…} li perdono quando vengono scritti in !crl; modifica invece l'abilità nel Diario.",
          'I dadi dei danni contano come critici: imposta Dadi controllati su d20.',
          'Gli errori vengono scritti nella console API con il prefisso "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Lingue',
        body: "Scegli una lingua con !crl config language o con l'opzione One-Click Language. Lingue supportate:",
        colCode: 'Codice',
        colName: 'Lingua',
        colNative: 'Nome originale',
      },
      credits: {
        heading: 'Riconoscimenti',
        original: 'Mod originale di',
        maintainer: 'Versione 2 di',
        support: 'Segnala i problemi sui forum di Roll20 o nel repository GitHub.',
        wiki: 'Pagina wiki della versione 1',
      },
    },
  };

  const TRANSLATION$9 = {
    titles: {
      ready: 'Customizable Roll Listener の準備ができました。',
      settings: 'CRL 設定',
      languages: '言語の選択',
      help: 'CRL コマンド',
      confirm: '確認',
      inspect: 'CRL インスペクター',
      listener: 'リスナー: {name}',
      listenerCommands: 'コマンド: {name}',
    },
    menu: {
      listening: 'リスニング',
      listeners: 'リスナー（この順にチェック）',
      noListeners: 'リスナーはまだありません。「新規リスナー」をクリックして作成してください。',
      noCommands: 'コマンドはまだありません。',
      commandsHint:
        'チャットでコマンドを入力するときは、行を \\\\ で区切ります。@{...} や %{...} の参照は CRL に届く前にチャットで置き換えられてしまうため、ジャーナルでアビリティを直接編集してください。',
    },
    buttons: {
      back: '戻る',
      change: '変更',
      confirmDelete: 'はい、削除します',
      delete: '削除',
      edit: '編集',
      help: 'ヘルプ',
      inspect: '次のメッセージを検査',
      inspectOff: '検査を中止',
      new: '新規リスナー',
      openJournal: 'ジャーナルで開く',
      rebuildJournal: 'ハンドアウトを再作成',
      rename: '名前を変更',
      setCommands: 'コマンドを設定',
      settings: '設定',
      test: 'テスト',
      enable: 'オンにする',
      disable: 'オフにする',
      menu: 'リスナー',
      turnOn: 'リスニングをオン',
      turnOff: 'リスニングをオフ',
    },
    prompts: {
      newName: '新しいリスナーの名前',
      name: '新しい名前',
      target: 'リスナー名',
      commands: 'コマンド - 行はバックスラッシュ 2 つで区切る',
      templates:
        'ロールテンプレート（スペース区切り）- テンプレートなしは none - 空欄ですべて - ロールのテンプレートは検査で確認できます',
      types: 'メッセージタイプ（スペース区切り）- 空欄で api 以外すべて',
      text: '検索するテキスト - ヘルプのハンドアウトを参照 - 空欄ですべて',
      regex: 'テキストの解釈方法',
      who: '発言者名またはキャラクター名（カンマ区切り）- 空欄で全員',
      players: 'プレイヤー名（カンマ区切り）- 空欄で全員',
      results: 'ロール結果',
      total: 'ロールの合計（15 や 19-20 など）- ヘルプのハンドアウトを参照 - 空欄ですべて',
      natural: 'ダイスの出目（20 や 1-2 など）- 空欄ですべて',
      dice: 'チェック対象のダイス',
      cooldown: '再発動までの待ち時間（秒）- なしは 0',
      speaker: 'コマンドの送信者',
    },
    choices: {
      critOrFumble: 'クリティカルまたはファンブル',
    },
    values: {
      on: 'オン',
      off: 'オフ',
      none: 'なし',
      any: 'すべて',
      allButApi: 'すべて（API コマンドを除く）',
      plain: 'プレーンテキスト',
      regex: '正規表現',
      diceAuto: '自動（d20 を振ったときは d20）',
      diceAny: 'すべてのダイス',
      seconds: '{seconds} 秒',
      speaker: {
        default: '既定の設定',
        crl: 'CRL',
        roller: 'ロールした人',
      },
    },
    results: {
      crit: 'クリティカル',
      fumble: 'ファンブル',
      success: '成功',
      fail: '失敗',
    },
    fields: {
      enabled: 'オン',
      templates: 'ロールテンプレート',
      types: 'メッセージタイプ',
      text: 'テキスト',
      regex: 'テキストの形式',
      who: '発言者 / キャラクター',
      players: 'プレイヤー',
      results: 'ロール結果',
      total: 'ロールの合計',
      natural: 'ダイスの出目',
      dice: 'チェック対象のダイス',
      cooldown: 'クールダウン',
      stop: 'ここで打ち止め',
      speaker: '送信者',
      commands: 'コマンド',
    },
    settings: {
      enabled: {
        label: 'リスニング',
        desc: 'すべてのリスナーをまとめてオン/オフにします。',
      },
      speaker: {
        label: 'コマンドの送信者',
        desc: 'リスナー側で指定がない場合に、リスナーのコマンドを誰として送信するか: CRL、または発動のきっかけとなったメッセージのキャラクター（またはプレイヤー）。',
      },
      listenToMods: {
        label: '他の Mod に反応',
        desc: '他の Mod が送信したチャットでもリスナーを発動させるかどうか。CRL は自分のメッセージには決して反応しません。',
      },
      language: {
        label: '言語',
        desc: 'メニュー、メッセージ、ハンドアウトの言語。',
      },
    },
    inspect: {
      type: 'タイプ',
      who: '発言者',
      character: 'キャラクター',
      player: 'プレイヤー',
      template: 'ロールテンプレート',
      keys: 'メッセージのプロパティ',
      extras: 'メッセージの追加データ',
      fields: 'テンプレートのフィールド',
      rolls: 'ロール',
      dice: 'ダイス',
      table: 'テーブル',
      target: '成功目標値あり',
      crit: 'クリティカル',
      fumble: 'ファンブル',
      text: 'テキスト（リスナーが読む形）',
      raw: '元の内容',
      listeners: 'リスナー',
      matched: '発動します {result}',
      reasons: {
        disabled: 'オフになっている',
        type: 'メッセージタイプが一致しない',
        template: 'ロールテンプレートが一致しない',
        who: '発言者またはキャラクターが一致しない',
        player: 'プレイヤーが一致しない',
        text: 'テキストが見つからない',
        roll: 'ロール条件を満たすロールがない',
      },
    },
    messages: {
      upgraded:
        'バージョン 1 からアップグレードしました。{count} 個のリスナーを変換し、コマンドはそのまま引き継ぎました。',
      restored: '保存用キャラクターから {count} 個のリスナーを復元しました。',
      adopted:
        '保存用キャラクターにリスナーのルールがないアビリティが {count} 個見つかりました。オフの状態で追加したので、メニューから設定してください。',
      removed: 'アビリティが削除された {count} 個のリスナーを削除しました。',
      listeningOff: 'リスニングはオフです。オンにするには !crl on と入力してください。',
      readyHint: 'リスナー {count} 個。!crl でメニュー、!crl help ですべてのコマンドを表示します。',
      loopStopped:
        'リスナー「{name}」が短時間に何度も発動したため、オフにしました。コマンドが自身を再び発動させている可能性があります。',
      noCommands: 'リスナー「{name}」には実行するコマンドがありません。',
      tested: '「{name}」のコマンドを実行しました（メッセージ {count} 件）。',
      confirmDelete: 'リスナー「{name}」とそのコマンドを削除しますか？この操作は元に戻せません。',
      deleted: 'リスナー「{name}」を削除しました。',
      inspectOn: '次のチャットメッセージを検査し、結果をウィスパーで送ります。',
      inspectOff: 'インスペクターをオフにしました。',
      journalRebuilt: 'ハンドアウト「{help}」と「{deck}」を再作成しました。',
    },
    errors: {
      gmOnly: 'Customizable Roll Listener のコマンドは GM のみ使用できます。',
      unexpected: '問題が発生しました: {message}',
      unknownCommand: '不明なコマンド「{command}」です。',
      badOption: '不明なオプション --{option} です。',
      notFound: '「{name}」という名前のリスナーはありません。',
      nameRequired: 'リスナー名を指定してください。',
      nameInvalid: '「{name}」という名前は使用できません。',
      nameTaken: '「{name}」という名前のリスナーはすでにあります。',
      badOnOff: '値「{value}」は --{option} には使用できません。',
      badType: '不明なメッセージタイプ: {value}',
      badRegex: '正規表現「{term}」が正しくありません: {error}',
      tooManyTerms: '1 つのリスナーで検索できるテキストは最大 {max} 個です。',
      badResult: '不明なロール結果: {value}',
      badComparison: '値「{value}」は --{option} には使用できません。',
      badDice: '値「{value}」は --dice には使用できません。',
      badCooldown: '値「{value}」は --cooldown には使用できません。',
      badSpeaker: '値「{value}」は --speaker には使用できません。',
      noStore: '保存用キャラクターを作成できませんでした。',
      badSetting: '不明な設定「{key}」です。',
      badSettingValue: '値「{value}」は {key} には使用できません。',
    },
    hints: {
      gmOnly: 'リスナーの設定は GM に依頼してください。',
      unknownCommand: '!crl help と入力すると、すべてのコマンドを表示します。',
      badOption:
        'オプションは --templates、--types、--text、--regex、--who、--players、--results、--total、--natural、--dice、--cooldown、--stop、--speaker、--enabled、--name、--commands です。',
      notFound: '!crl と入力すると、リスナーの一覧を表示します。',
      nameInvalid:
        '{max} 文字以内で、| { } [ ] \\ @ % # ? ~ と "--" を含めず、"-" で始めないでください。',
      badOnOff: 'on または off を指定してください。',
      badType: 'メッセージタイプ: {types}',
      badResult: 'crit、fumble、success、fail のいずれかを指定してください。',
      badComparison: '数値、>=15 や <3 などの比較、または 19-20 などの範囲を指定してください。',
      badDice: 'auto、any、または 20 や d20 などのダイスの種類を指定してください。',
      badCooldown: '0 から 3600 までの整数（秒）を指定してください。',
      badSpeaker: 'default、crl、roller のいずれかを指定してください。',
      badSetting: '設定項目: {keys}',
      noStore: 'API コンソールでエラーを確認してから、サンドボックスを再起動してください。',
    },
    help: {
      menu: 'リスナーの一覧を表示します。',
      new: 'リスナーを作成します。オプションも同時に指定できます。',
      show: 'リスナーとその設定を、変更用のボタン付きで表示します。',
      edit: 'リスナーを変更します。値を空欄にする（または - を指定する）と、その値をクリアします。',
      commands:
        'リスナーのコマンドを置き換えます。--commands 以降はすべてコマンドとして扱われるため、最後に置いてください。',
      enable: 'リスナーをオン/オフにします。',
      move: 'リスナーをチェック順の前または後ろに移動します。',
      test: '出目 20 が出たものとして、リスナーのコマンドを今すぐ実行します。',
      delete: 'リスナーとそのコマンドを削除します（確認あり）。',
      inspect: '次のチャットメッセージの内訳と、それで発動するリスナーをウィスパーで送ります。',
      inspectOff: '検査するメッセージの待機を中止します。',
      onOff: 'リスニング全体をオン/オフにします。',
      config: '全体設定を表示または変更します。',
      journal: 'ヘルプとコマンドデッキのハンドアウトを再作成します。',
      help: 'この一覧を表示します。',
      optionsTitle: 'オプション',
      options:
        'オプション: --templates、--types、--text、--regex、--who、--players、--results、--total、--natural、--dice、--cooldown、--stop、--speaker、--enabled、--name、--commands。ID の代わりに名前も使えます。',
      placeholders:
        'コマンドでは ${who}、${character}、${player}、${template}、${total}、${natural}、${result}、${expression}、${table}、${listener}、${field:name} を使えます。',
      handouts:
        'ハンドアウト「{help}」にすべての説明があり、ハンドアウト「{deck}」にはボタンがあります。',
    },
    store: {
      bio: 'このキャラクターは Customizable Roll Listener Mod が使用します。アビリティ 1 つがリスナー 1 つに当たり、アビリティには実行するコマンドが、その説明にはリスナーのルールが保存されています。',
      bioHelp:
        'コマンドはここで編集できます。ルールは !crl またはコマンドデッキのハンドアウトで変更してください。アビリティを削除すると、そのリスナーも削除されます。',
    },
    deck: {
      subtitle: 'コマンドデッキ',
      listeners: 'リスナー',
      listenersDesc: 'リスナーの確認、作成、変更、テストを行います。',
      listening: 'リスニング',
      listeningDesc: 'すべてのリスナーをまとめてオン/オフにします。',
      tools: 'ツール',
      toolsDesc:
        'チャットメッセージの検査、設定の変更、ハンドアウトの再作成、ヘルプの表示を行います。',
      footer: 'すべてのコマンドは GM 専用です。詳しくはハンドアウト「{help}」を参照してください。',
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'ダイスの声を聞き、アクションを起こす',
      footer: 'すべてのコマンドのボタンはハンドアウト「{deck}」にあります。',
      overview: {
        heading: '概要',
        body: 'Customizable Roll Listener（CRL）はチャットを監視し、メッセージがリスナーに一致すると、指定したコマンドを実行します。リスナーが調べられるのは、ロールテンプレート、テキスト、メッセージの送信者、そしてメッセージ内のロール（クリティカル、ファンブル、成功、失敗、合計、ダイスの出目）です。コマンドには他の Mod のコマンドを含め、チャットに入力できるものなら何でも使えるので、CRL でサウンドの再生、テーブルでのロール、エモートの投稿、ステータスマーカーの付与などができます。',
      },
      quickStart: {
        heading: 'クイックスタート',
        steps: [
          'チャットに !crl と入力します（またはコマンドデッキのハンドアウトで「リスナー」をクリックします）。',
          '「新規リスナー」をクリックし、クリティカル音 などの名前を付けます。',
          '「ロール結果」の横の「変更」をクリックし、「クリティカル」を選びます。',
          '「コマンドを設定」をクリックし、実行する内容を入力します（例: !roll20AM --audio,play|Crit）。',
          '「テスト」をクリックしてコマンドを確認し、攻撃ロールをします。発動しない場合は「次のメッセージを検査」を使ってください。',
        ],
      },
      examples: {
        heading: '使用例',
        points: [
          'どのシートでもクリティカルでサウンドを鳴らす: --results crit',
          'D&D 5e 2014 の攻撃テンプレートで出目 1 のときにファンブル表を振る: --templates atkdmg atk --natural 1',
          'ロール可能テーブルの結果に反応する: --text 戦闘',
          '特定のキャラクターだけ: --who アリス',
          '「筋力」ロールの最初のインラインロールで合計 20 以上: --text 筋力 && ## --total >=20',
        ],
        code: [
          '!crl new クリティカル音 --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new ファンブル --natural 1 --dice 20 --commands /em はファンブルした！ \\\\ /roll 1t[Fumbles]',
          '!crl new ナレーター --results crit fumble --speaker crl --commands /desc ${who} の結果は ${result}！',
        ],
      },
      matching: {
        heading: 'リスナーがチェックする内容',
        points: [
          'リスナーは、設定したフィルターがすべて一致すると発動します。空のフィルターは何にでも一致します。',
          'ロールテンプレート: atkdmg や simple などのテンプレート名。「none」はテンプレートのないメッセージに一致します。複数の名前を指定すると、いずれかに一致すれば対象になります。',
          'メッセージタイプ: general、rollresult、gmrollresult、emote、whisper、desc、advancedroll（Beacon シート）、api。空欄の場合は api コマンド以外のすべてのタイプが対象です。',
          'テキスト: && で区切った 1 つ以上のテキストで、すべてが含まれている必要があります。大文字と小文字は区別しません。ロールの合計やロール可能テーブルの結果からも検索されます。',
          'テキスト中の ## はインラインロールを表し、ロールのチェックはそこで見つかったロールだけを対象にします。## がない場合は、メッセージ内のすべてのロールがチェックされます。',
          'テキストはプレーンテキストの代わりに正規表現にもできます（--regex on）。',
          '発言者 / キャラクター: チャットに表示される名前、またはロールテンプレート内のキャラクター名。プレイヤー: プレイヤーの表示名。',
        ],
      },
      templates: {
        heading: 'ロールテンプレート名',
        points: [
          'ロールテンプレートは、シートがロールカードに使うレイアウトです。名前はマクロ内の template: の後ろの部分で、&{template:atkdmg} なら atkdmg テンプレートです。名前はシートごとに異なります。',
          '名前を調べるいちばん早い方法: 「次のメッセージを検査」をクリックしてシートからロールし、CRL がウィスパーで返す「ロールテンプレート」の行を読みます。',
          'シートのボタンのマクロや、GitHub にあるシートのソースでも名前を確認できます。ソースでは各テンプレートが <rolltemplate class="sheet-rolltemplate-NAME"> になっています。',
          '主なシートのテンプレート:',
        ],
        colSheet: 'シート',
        colNames: 'テンプレート名',
        links: 'ロールテンプレートの詳細:',
        builtIn: 'Roll20: 組み込みロールテンプレート',
        dnd5e2014: 'Roll20: D&D 5e（2014）のロールテンプレート',
        sheets: 'Roll20 キャラクターシートのソース',
      },
      rolls: {
        heading: 'ロールのチェック',
        points: [
          'ロール結果: クリティカル（ダイスの最大の目、または cs の範囲）、ファンブル（1、または cf の範囲）、成功（1d20>15 のような目標値を少なくとも 1 つのダイスが満たす）、失敗（目標値付きのロールで成功が 0）。複数の結果を指定すると、いずれかに一致すれば対象になります。',
          'ロールの合計: 数値、>=15 などの比較、または 19-20 などの範囲。',
          'ダイスの出目: ダイスの出た目（20 や <=2 など）。',
          'チェック対象のダイス: auto は d20 を振ったときは d20 だけを見るため、ダメージダイスが最大の目を出してもクリティカルにはなりません。変えるには any か、d100 などのダイスの種類を選びます。',
          '捨てたダイス（有利・不利）と振り直したダイスは無視されます。',
          'D&D 5E by Roll20 (2014) シートは有利と不利を 2 回の別々の d20 ロール（r1 と r2）として振るため、CRL は両方をチェックします。有利では低い方のダイスの 1 もファンブル、不利では高い方のダイスの 20 もクリティカルとして扱います。',
          'リスナーは、少なくとも 1 つのロールがすべてのロール条件を満たすと発動します。',
        ],
      },
      commands: {
        heading: 'チャットコマンド',
        intro: 'すべてのコマンドは GM 専用です。リスナーは名前または ID で指定できます。',
        colCommand: 'コマンド',
        colDesc: '機能',
      },
      options: {
        heading: 'リスナーのオプション',
        intro:
          '!crl new または !crl edit に付けて使います。値を空欄にするか - を指定すると、その値をクリアします。--commands は最後に置いてください。',
        colOption: 'オプション',
        colDesc: '意味',
        templates:
          'ロールテンプレート名（スペース区切り）。none = テンプレートなし。上の「ロールテンプレート名」を参照してください。',
        types: 'メッセージタイプ（スペース区切り）: {types}。',
        text: '検索するテキスト。複数のテキストは && で区切ります。## はインラインロールを表します。',
        regex: 'on でテキストを正規表現として、off でプレーンテキストとして扱います。',
        who: '発言者名またはキャラクター名（カンマ区切り）。',
        players: 'プレイヤーの表示名（カンマ区切り）。',
        results: 'crit、fumble、success、fail（複数可）。',
        total: 'ロールの合計: 15、>=15、<5、19-20 など。',
        natural: 'ダイスの出目: 20、<=2、19-20 など。',
        dice: 'auto、any、または 20 などのダイスの種類。',
        cooldown: 'リスナーが再び発動できるまでの秒数。',
        stop: 'on にすると、このリスナーが発動したときに以降のリスナーをチェックしません。',
        speaker: 'default、crl、roller のいずれか。',
        enabled: 'on または off。',
        name: 'リスナーの名前を変更します。',
        commands: '実行するコマンド。行は \\\\ で区切ります。',
      },
      placeholders: {
        heading: 'プレースホルダー',
        intro: 'リスナーが発動したとき、コマンド内のこれらが置き換えられます。',
        colName: 'プレースホルダー',
        colDesc: '置き換えられる内容',
        who: 'チャットに表示される名前。',
        character: 'ロールテンプレートのキャラクター名、またはチャットに表示される名前。',
        player: 'プレイヤーの表示名。',
        template: 'ロールテンプレート名。',
        total: '一致したロール（または最初のロール）の合計。',
        natural: 'そのロールの d20（または最初のダイス）の出目。',
        result: '指定した場合の crit、fumble、success、fail のいずれか。',
        expression: '1d20+5 などのロール式。',
        table: 'そのロールのロール可能テーブルの結果。',
        listener: 'リスナーの名前。',
        field:
          '${field:rname} などのロールテンプレートのフィールド（インラインロールは合計で表示）。',
      },
      running: {
        heading: 'コマンドの実行方法',
        points: [
          '各行は個別のチャットメッセージとして送信されます。ただし、複数行にわたる {{ … }} ブロック（ロールテンプレートや ScriptCards のスクリプト）はまとめて送信されます。',
          'コマンドは、リスナーごとの設定または全体設定に従い、CRL として、またはロールしたキャラクターとして送信されます。CRL が送信したコマンドは、他の Mod からは API からのものに見えます。',
          'コマンドではインラインロール、ロールテンプレート、@{Character|attribute}、%{Character|ability} を使えます。選択中のトークンの参照（@{selected|…}）とクエリ（?{…}）は、入力する人がいないため使えません。',
          'リスナーは順番にチェックされます。「ここで打ち止め」を設定したリスナーが発動すると、同じメッセージで以降のリスナーは発動しません。',
          'クールダウンを設定すると、リスナーはその秒数のあいだ再発動しません。',
          'CRL は自分のメッセージを無視します。それでもリスナーが 10 秒間に 20 回を超えて発動した場合は、そのリスナーをオフにして GM に通知します。',
        ],
      },
      inspector: {
        heading: 'インスペクター',
        points: [
          '「次のメッセージを検査」をクリックしてからロールします。CRL は確認した内容をウィスパーで送ります: メッセージタイプ、発言者、キャラクター、テンプレートとそのフィールド、すべてのロールとそのダイス、リスナーが検索するテキスト、そして各リスナーが発動した理由・しなかった理由。',
          'シートのテンプレート名を調べたり、Beacon シート（D&D 2024 など）が何を送信しているかを確認したりするのに使います。',
          'Beacon シートはロールテンプレートの代わりにロールカードを投稿します。CRL はこれも読み取ります。カードの最初のクラスがテンプレート（D&D 2024 では dnd-2024）になり、キャラクター、タイトル（「【敏捷力】判定」など）、サブカテゴリーがフィールドになります。内訳の各ロールもロールとして扱われるので、クリティカル、ファンブル、合計、出目のチェックが機能します。',
        ],
      },
      settings: {
        heading: '設定',
        intro:
          '!crl config または「設定」ボタンで変更します。一部は Mod の One-Click オプションでも設定できます。',
        colKey: '設定キー',
        colName: '名前',
        colDesc: '説明',
      },
      storage: {
        heading: 'リスナーの保存場所',
        body: '各リスナーは、アーカイブされたキャラクター「{character}」のアビリティです。アビリティにはコマンドが保存されているので、ジャーナルの本格的なマクロエディターで編集できます。アビリティの説明にはリスナーのルールが保存されているため、ゲームをコピーしてもリスナーは引き継がれます。アビリティを削除するとそのリスナーも削除され、手動で追加したアビリティはオフの状態でメニューに表示されます。',
      },
      upgrading: {
        heading: 'バージョン 1 からのアップグレード',
        points: [
          'バージョン 1 のリスナーは最初の起動時に変換され、コマンドはそのまま引き継がれます。',
          '通常の文字だけのテキストはプレーンテキストになり、大文字と小文字を区別しなくなります。正規表現の記号を使ったテキストは正規表現のままです。',
          'ロール結果を指定していて ## のないリスナーは、以前は「not parseable」で失敗していましたが、今はメッセージ内のすべてのロールをチェックします。',
          '失敗は、目標値付きのロールで成功が 0 の場合を指すようになりました。目標値ちょうどのロールは成功です。',
          'バージョン 1 のコマンドも引き続き使えます:',
        ],
        colV1: 'バージョン 1',
        colV2: 'バージョン 2',
      },
      troubleshooting: {
        heading: 'トラブルシューティング',
        points: [
          '何も起こらない: リスニングとそのリスナーがオンになっているか確認し、インスペクターでどのフィルターが一致していないかを調べてください。',
          'シートのロールが認識されない: そのロールを 1 つ検査してください。表示されるテンプレート名とフィールドがフィルターに使える値です。',
          'Beacon シート（D&D 2024 など）のロールを Mod で認識するには、Experimental Mod サンドボックスが必要です。',
          '@{…} や %{…} を含むコマンドは、!crl で入力すると消えてしまいます。ジャーナルでアビリティを直接編集してください。',
          'ダメージダイスがクリティカルとして扱われる: 「チェック対象のダイス」を d20 にしてください。',
          'エラーは「Customizable Roll Listener」という接頭辞付きで API コンソールに出力されます。',
        ],
      },
      languages: {
        heading: '言語',
        body: '言語は !crl config language または One-Click オプションの Language で選択します。対応言語:',
        colCode: 'コード',
        colName: '言語',
        colNative: '現地語名',
      },
      credits: {
        heading: 'クレジット',
        original: 'オリジナル版の作者:',
        maintainer: 'バージョン 2 の作者:',
        support: '問題は Roll20 フォーラムまたは GitHub リポジトリで報告してください。',
        wiki: 'バージョン 1 の wiki ページ',
      },
    },
  };

  const TRANSLATION$8 = {
    titles: {
      ready: 'Customizable Roll Listener가 준비되었습니다.',
      settings: 'CRL 설정',
      languages: '언어 선택',
      help: 'CRL 명령어',
      confirm: '확인',
      inspect: 'CRL 검사기',
      listener: '리스너: {name}',
      listenerCommands: '명령어: {name}',
    },
    menu: {
      listening: '감지',
      listeners: '리스너(이 순서대로 확인)',
      noListeners: '아직 리스너가 없습니다. 새 리스너를 클릭해 만드세요.',
      noCommands: '아직 명령어가 없습니다.',
      commandsHint:
        '채팅에서 명령어를 입력할 때는 \\\\로 줄을 구분하세요. @{...}나 %{...} 참조는 CRL에 전달되기 전에 채팅에서 치환되므로, 저널에서 어빌리티를 직접 편집하세요.',
    },
    buttons: {
      back: '뒤로',
      change: '변경',
      confirmDelete: '예, 삭제합니다',
      delete: '삭제',
      edit: '편집',
      help: '도움말',
      inspect: '다음 메시지 검사',
      inspectOff: '검사 중지',
      new: '새 리스너',
      openJournal: '저널에서 열기',
      rebuildJournal: '핸드아웃 다시 만들기',
      rename: '이름 변경',
      setCommands: '명령어 설정',
      settings: '설정',
      test: '테스트',
      enable: '켜기',
      disable: '끄기',
      menu: '리스너',
      turnOn: '감지 켜기',
      turnOff: '감지 끄기',
    },
    prompts: {
      newName: '새 리스너의 이름',
      name: '새 이름',
      target: '리스너 이름',
      commands: '명령어 - 줄은 백슬래시 두 개로 구분',
      templates:
        '롤 템플릿(공백으로 구분) - 템플릿 없음은 none - 비우면 전체 - 굴림의 템플릿은 검사로 확인',
      types: '메시지 유형(공백으로 구분) - 비우면 api를 제외한 전체',
      text: '찾을 텍스트 - 도움말 핸드아웃 참고 - 비우면 전체',
      regex: '텍스트 해석 방식',
      who: '발언자 또는 캐릭터 이름(쉼표로 구분) - 비우면 누구나',
      players: '플레이어 이름(쉼표로 구분) - 비우면 누구나',
      results: '굴림 결과',
      total: '굴림 합계(예: 15 또는 19-20) - 도움말 핸드아웃 참고 - 비우면 전체',
      natural: '주사위 눈(예: 20 또는 1-2) - 비우면 전체',
      dice: '확인할 주사위',
      cooldown: '다시 발동하기까지 기다릴 시간(초) - 없으면 0',
      speaker: '명령어 발신자',
    },
    choices: {
      critOrFumble: '치명타 또는 펌블',
    },
    values: {
      on: '켜짐',
      off: '꺼짐',
      none: '없음',
      any: '전체',
      allButApi: '전체(API 명령어 제외)',
      plain: '일반 텍스트',
      regex: '정규식',
      diceAuto: '자동(d20을 굴렸으면 d20)',
      diceAny: '모든 주사위',
      seconds: '{seconds}초',
      speaker: {
        default: '기본 설정',
        crl: 'CRL',
        roller: '굴린 사람',
      },
    },
    results: {
      crit: '치명타',
      fumble: '펌블',
      success: '성공',
      fail: '실패',
    },
    fields: {
      enabled: '켜짐',
      templates: '롤 템플릿',
      types: '메시지 유형',
      text: '텍스트',
      regex: '텍스트 형식',
      who: '발언자/캐릭터',
      players: '플레이어',
      results: '굴림 결과',
      total: '굴림 합계',
      natural: '주사위 눈',
      dice: '확인할 주사위',
      cooldown: '쿨다운',
      stop: '여기서 확인 중단',
      speaker: '발신자',
      commands: '명령어',
    },
    settings: {
      enabled: {
        label: '감지',
        desc: '모든 리스너를 한꺼번에 켜거나 끕니다.',
      },
      speaker: {
        label: '명령어 발신자',
        desc: '리스너에서 따로 지정하지 않았을 때 리스너 명령어를 누구 이름으로 보낼지 정합니다. CRL 또는 리스너를 발동시킨 메시지의 캐릭터(또는 플레이어).',
      },
      listenToMods: {
        label: '다른 모드에 반응',
        desc: '다른 모드가 보낸 채팅으로도 리스너를 발동할지 정합니다. CRL은 자신의 메시지에는 절대 반응하지 않습니다.',
      },
      language: {
        label: '언어',
        desc: '메뉴, 메시지, 핸드아웃에 쓸 언어입니다.',
      },
    },
    inspect: {
      type: '유형',
      who: '발언자',
      character: '캐릭터',
      player: '플레이어',
      template: '롤 템플릿',
      keys: '메시지 속성',
      extras: '추가 메시지 데이터',
      fields: '템플릿 필드',
      rolls: '굴림',
      dice: '주사위',
      table: '테이블',
      target: '성공 목표값 있음',
      crit: '치명타',
      fumble: '펌블',
      text: '텍스트(리스너가 읽는 형태)',
      raw: '원본 내용',
      listeners: '리스너',
      matched: '발동함 {result}',
      reasons: {
        disabled: '꺼져 있음',
        type: '메시지 유형이 일치하지 않음',
        template: '롤 템플릿이 일치하지 않음',
        who: '발언자 또는 캐릭터가 일치하지 않음',
        player: '플레이어가 일치하지 않음',
        text: '텍스트를 찾지 못함',
        roll: '굴림 조건을 충족하는 굴림이 없음',
      },
    },
    messages: {
      upgraded:
        '버전 1에서 업그레이드했습니다. 리스너 {count}개를 변환했으며 명령어는 그대로 유지했습니다.',
      restored: '저장용 캐릭터에서 리스너 {count}개를 복원했습니다.',
      adopted:
        '저장용 캐릭터에서 리스너 규칙이 없는 어빌리티 {count}개를 찾았습니다. 꺼진 상태로 추가했으니 메뉴에서 설정하세요.',
      removed: '어빌리티가 삭제된 리스너 {count}개를 제거했습니다.',
      listeningOff: '감지가 꺼져 있습니다. 켜려면 !crl on을 입력하세요.',
      readyHint: '리스너 {count}개. 메뉴는 !crl, 전체 명령어는 !crl help를 입력하세요.',
      loopStopped:
        '리스너 "{name}"이(가) 짧은 시간에 너무 자주 발동해 꺼졌습니다. 명령어가 리스너를 다시 발동시키는 것으로 보입니다.',
      noCommands: '리스너 "{name}"에는 실행할 명령어가 없습니다.',
      tested: '"{name}"의 명령어를 실행했습니다(메시지 {count}개).',
      confirmDelete: '리스너 "{name}"와(과) 그 명령어를 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
      deleted: '리스너 "{name}"을(를) 삭제했습니다.',
      inspectOn: '다음 채팅 메시지를 검사해 결과를 귓속말로 보내 드립니다.',
      inspectOff: '검사기를 껐습니다.',
      journalRebuilt: '"{help}" 및 "{deck}" 핸드아웃을 다시 만들었습니다.',
    },
    errors: {
      gmOnly: 'Customizable Roll Listener 명령어는 GM만 사용할 수 있습니다.',
      unexpected: '문제가 발생했습니다: {message}',
      unknownCommand: '알 수 없는 명령어 "{command}"입니다.',
      badOption: '알 수 없는 옵션 --{option}입니다.',
      notFound: '"{name}"(이)라는 리스너가 없습니다.',
      nameRequired: '리스너 이름을 입력하세요.',
      nameInvalid: '"{name}"은(는) 이름으로 사용할 수 없습니다.',
      nameTaken: '"{name}"(이)라는 리스너가 이미 있습니다.',
      badOnOff: '"{value}"은(는) --{option}에 사용할 수 없는 값입니다.',
      badType: '알 수 없는 메시지 유형: {value}.',
      badRegex: '정규식 "{term}"이(가) 올바르지 않습니다: {error}',
      tooManyTerms: '리스너 하나가 찾을 수 있는 텍스트는 최대 {max}개입니다.',
      badResult: '알 수 없는 굴림 결과: {value}.',
      badComparison: '"{value}"은(는) --{option}에 사용할 수 없는 값입니다.',
      badDice: '"{value}"은(는) --dice에 사용할 수 없는 값입니다.',
      badCooldown: '"{value}"은(는) --cooldown에 사용할 수 없는 값입니다.',
      badSpeaker: '"{value}"은(는) --speaker에 사용할 수 없는 값입니다.',
      noStore: '저장용 캐릭터를 만들 수 없습니다.',
      badSetting: '알 수 없는 설정 "{key}"입니다.',
      badSettingValue: '"{value}"은(는) {key}에 사용할 수 없는 값입니다.',
    },
    hints: {
      gmOnly: 'GM에게 리스너 설정을 요청하세요.',
      unknownCommand: '모든 명령어를 보려면 !crl help를 입력하세요.',
      badOption:
        '옵션은 --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name, --commands입니다.',
      notFound: '!crl을 입력하면 리스너 목록을 볼 수 있습니다.',
      nameInvalid:
        '최대 {max}자까지 쓸 수 있으며, | { } [ ] \\ @ % # ? ~ 와 "--"는 쓸 수 없고 "-"로 시작할 수 없습니다.',
      badOnOff: 'on 또는 off를 사용하세요.',
      badType: '메시지 유형: {types}.',
      badResult: 'crit, fumble, success, fail 중 하나를 사용하세요.',
      badComparison: '숫자, >=15나 <3 같은 비교, 또는 19-20 같은 범위를 사용하세요.',
      badDice: 'auto, any, 또는 20이나 d20 같은 주사위 종류를 사용하세요.',
      badCooldown: '0에서 3600 사이의 정수(초)를 사용하세요.',
      badSpeaker: 'default, crl, roller 중 하나를 사용하세요.',
      badSetting: '설정 항목: {keys}.',
      noStore: 'API 콘솔에서 오류를 확인한 뒤 샌드박스를 다시 시작하세요.',
    },
    help: {
      menu: '리스너 목록을 표시합니다.',
      new: '리스너를 만듭니다. 옵션도 바로 지정할 수 있습니다.',
      show: '리스너와 그 설정을 변경 버튼과 함께 표시합니다.',
      edit: '리스너를 변경합니다. 값을 비우거나 -를 쓰면 그 값을 지웁니다.',
      commands:
        '리스너의 명령어를 교체합니다. --commands 뒤의 내용은 모두 명령어로 쓰이므로 맨 마지막에 넣으세요.',
      enable: '리스너를 켜거나 끕니다.',
      move: '리스너를 확인 순서에서 앞이나 뒤로 옮깁니다.',
      test: '주사위 눈 20이 나온 것처럼 리스너의 명령어를 지금 실행합니다.',
      delete: '리스너와 그 명령어를 삭제합니다(먼저 확인).',
      inspect: '다음 채팅 메시지의 분석 내용과 그 메시지로 발동할 리스너를 귓속말로 보냅니다.',
      inspectOff: '검사할 메시지 대기를 중지합니다.',
      onOff: '감지 전체를 켜거나 끕니다.',
      config: '전역 설정을 표시하거나 변경합니다.',
      journal: '도움말 및 커맨드 덱 핸드아웃을 다시 만듭니다.',
      help: '이 목록을 표시합니다.',
      optionsTitle: '옵션',
      options:
        '옵션: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name, --commands. ID 대신 이름을 써도 됩니다.',
      placeholders:
        '명령어에는 ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener}, ${field:name}을(를) 쓸 수 있습니다.',
      handouts: '"{help}" 핸드아웃에 모든 설명이 있고, "{deck}" 핸드아웃에는 버튼이 있습니다.',
    },
    store: {
      bio: '이 캐릭터는 Customizable Roll Listener 모드가 사용합니다. 어빌리티 하나가 리스너 하나이며, 어빌리티에는 실행할 명령어가, 설명에는 리스너의 규칙이 저장됩니다.',
      bioHelp:
        '명령어는 여기에서 편집할 수 있습니다. 규칙은 !crl이나 커맨드 덱 핸드아웃에서 변경하세요. 어빌리티를 삭제하면 해당 리스너도 삭제됩니다.',
    },
    deck: {
      subtitle: '커맨드 덱',
      listeners: '리스너',
      listenersDesc: '리스너를 확인하고, 만들고, 변경하고, 테스트합니다.',
      listening: '감지',
      listeningDesc: '모든 리스너를 한꺼번에 켜거나 끕니다.',
      tools: '도구',
      toolsDesc: '채팅 메시지 검사, 설정 변경, 핸드아웃 다시 만들기, 도움말 보기.',
      footer: '모든 명령어는 GM 전용입니다. 자세한 내용은 "{help}" 핸드아웃을 참고하세요.',
    },
    handout: {
      versionLabel: '버전',
      subtitle: '주사위 소리를 듣고, 액션으로 답하라',
      footer: '모든 명령어의 버튼은 "{deck}" 핸드아웃에 있습니다.',
      overview: {
        heading: '개요',
        body: 'Customizable Roll Listener(CRL)는 채팅을 지켜보다가 메시지가 리스너와 일치하면 원하는 명령어를 실행합니다. 리스너는 롤 템플릿, 텍스트, 메시지를 보낸 사람, 그리고 메시지 속 굴림(치명타, 펌블, 성공, 실패, 합계, 주사위 눈)을 확인할 수 있습니다. 명령어로는 다른 모드의 명령어를 포함해 채팅에 입력할 수 있는 것은 무엇이든 쓸 수 있으므로, CRL로 소리 재생, 테이블 굴림, 감정 표현 게시, 상태 마커 적용 등을 할 수 있습니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        steps: [
          '채팅에 !crl을 입력합니다(또는 커맨드 덱 핸드아웃에서 리스너를 클릭합니다).',
          '새 리스너를 클릭하고 치명타 소리 같은 이름을 붙입니다.',
          '굴림 결과 옆의 변경을 클릭하고 치명타를 선택합니다.',
          '명령어 설정을 클릭하고 실행할 내용을 입력합니다(예: !roll20AM --audio,play|Crit).',
          '테스트를 클릭해 명령어를 확인한 다음 공격 굴림을 합니다. 발동하지 않으면 다음 메시지 검사를 사용하세요.',
        ],
      },
      examples: {
        heading: '예시',
        points: [
          '어떤 시트든 치명타가 나오면 소리 재생: --results crit',
          'D&D 5e 2014 공격 템플릿에서 주사위 눈 1이 나오면 펌블 표 굴림: --templates atkdmg atk --natural 1',
          '굴림 테이블 결과에 반응: --text 전투',
          '특정 캐릭터만: --who Alice',
          '"근력" 굴림의 첫 번째 인라인 굴림 합계가 20 이상: --text 근력 && ## --total >=20',
        ],
        code: [
          '!crl new 치명타 소리 --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new 펌블 --natural 1 --dice 20 --commands /em 펌블! \\\\ /roll 1t[Fumbles]',
          '!crl new 내레이터 --results crit fumble --speaker crl --commands /desc ${who}의 굴림 결과: ${result}!',
        ],
      },
      matching: {
        heading: '리스너가 확인하는 항목',
        points: [
          '리스너는 설정된 필터가 모두 일치하면 발동합니다. 비어 있는 필터는 모든 것과 일치합니다.',
          '롤 템플릿: atkdmg나 simple 같은 템플릿 이름. "none"은 템플릿이 없는 메시지와 일치합니다. 이름을 여러 개 쓰면 그중 하나만 일치해도 됩니다.',
          '메시지 유형: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll(Beacon 시트), api. 비어 있으면 api 명령어를 제외한 모든 유형을 확인합니다.',
          '텍스트: &&로 구분한 하나 이상의 텍스트로, 모두 들어 있어야 합니다. 대소문자는 구분하지 않습니다. 굴림 합계와 굴림 테이블 결과에서도 찾습니다.',
          '텍스트 속 ##은 인라인 굴림을 나타내며, 이때 굴림 확인은 그 자리에서 찾은 굴림만 봅니다. ##이 없으면 메시지의 모든 굴림을 확인합니다.',
          '텍스트는 일반 텍스트 대신 정규식으로 쓸 수도 있습니다(--regex on).',
          '발언자/캐릭터: 채팅에 표시되는 이름, 또는 롤 템플릿 속 캐릭터 이름. 플레이어: 플레이어의 표시 이름.',
        ],
      },
      templates: {
        heading: '롤 템플릿 이름',
        points: [
          '롤 템플릿은 시트가 굴림 카드에 쓰는 레이아웃입니다. 이름은 매크로에서 template: 뒤에 오는 부분이므로 &{template:atkdmg}는 atkdmg 템플릿입니다. 이름은 시트마다 다릅니다.',
          '이름을 가장 빨리 찾는 방법: 다음 메시지 검사를 클릭하고 시트에서 굴린 뒤, CRL이 귓속말로 보내 주는 롤 템플릿 줄을 읽습니다.',
          '시트 버튼의 매크로나 GitHub에 있는 시트 소스에서도 이름을 확인할 수 있습니다. 소스에서 각 템플릿은 <rolltemplate class="sheet-rolltemplate-NAME"> 형태입니다.',
          '주요 시트의 템플릿:',
        ],
        colSheet: '시트',
        colNames: '템플릿 이름',
        links: '롤 템플릿 더 알아보기:',
        builtIn: 'Roll20: 기본 제공 롤 템플릿',
        dnd5e2014: 'Roll20: D&D 5e(2014) 롤 템플릿',
        sheets: 'Roll20 캐릭터 시트 소스',
      },
      rolls: {
        heading: '굴림 확인',
        points: [
          '굴림 결과: 치명타(주사위의 최댓값 또는 cs 범위), 펌블(1 또는 cf 범위), 성공(1d20>15 같은 목표값을 주사위 하나 이상이 충족), 실패(목표값이 있는 굴림에서 성공이 없음). 여러 결과를 지정하면 그중 하나만 일치해도 됩니다.',
          '굴림 합계: 숫자, >=15 같은 비교, 또는 19-20 같은 범위.',
          '주사위 눈: 주사위에서 나온 눈(예: 20 또는 <=2).',
          '확인할 주사위: auto는 d20을 굴렸을 때 d20만 보므로, 피해 주사위가 최댓값을 내도 치명타로 치지 않습니다. 바꾸려면 any나 d100 같은 주사위 종류를 고르세요.',
          '버린 주사위(이점과 불리점)와 다시 굴린 주사위는 무시합니다.',
          'D&D 5E by Roll20 (2014) 시트는 이점과 불리점을 별개의 d20 굴림 두 번(r1과 r2)으로 굴리므로 CRL은 둘 다 확인합니다. 이점일 때 낮은 주사위의 1도 펌블로, 불리점일 때 높은 주사위의 20도 치명타로 계산됩니다.',
          '굴림 하나 이상이 모든 굴림 조건을 충족하면 리스너가 발동합니다.',
        ],
      },
      commands: {
        heading: '채팅 명령어',
        intro: '모든 명령어는 GM 전용입니다. 리스너는 이름이나 ID로 지정할 수 있습니다.',
        colCommand: '명령어',
        colDesc: '기능',
      },
      options: {
        heading: '리스너 옵션',
        intro:
          '!crl new 또는 !crl edit에 붙여 씁니다. 값을 비우거나 -를 쓰면 그 값을 지웁니다. --commands는 맨 마지막에 와야 합니다.',
        colOption: '옵션',
        colDesc: '의미',
        templates:
          '롤 템플릿 이름(공백으로 구분). none = 템플릿 없음. 위의 롤 템플릿 이름을 참고하세요.',
        types: '메시지 유형(공백으로 구분): {types}.',
        text: '찾을 텍스트. 여러 텍스트는 &&로 구분합니다. ##은 인라인 굴림을 나타냅니다.',
        regex: 'on이면 텍스트를 정규식으로, off면 일반 텍스트로 읽습니다.',
        who: '발언자 또는 캐릭터 이름(쉼표로 구분).',
        players: '플레이어 표시 이름(쉼표로 구분).',
        results: 'crit, fumble, success, fail 중 하나 이상.',
        total: '굴림 합계: 15, >=15, <5 또는 19-20.',
        natural: '주사위 눈: 20, <=2 또는 19-20.',
        dice: 'auto, any, 또는 20 같은 주사위 종류.',
        cooldown: '리스너가 다시 발동할 수 있을 때까지의 시간(초).',
        stop: 'on이면 이 리스너가 발동한 뒤 이후 리스너를 확인하지 않습니다.',
        speaker: 'default, crl 또는 roller.',
        enabled: 'on 또는 off.',
        name: '리스너 이름을 바꿉니다.',
        commands: '실행할 명령어. 줄은 \\\\로 구분합니다.',
      },
      placeholders: {
        heading: '플레이스홀더',
        intro: '리스너가 발동하면 명령어 속 이 항목들이 치환됩니다.',
        colName: '플레이스홀더',
        colDesc: '치환되는 값',
        who: '채팅에 표시되는 이름.',
        character: '롤 템플릿의 캐릭터 이름, 또는 채팅에 표시되는 이름.',
        player: '플레이어의 표시 이름.',
        template: '롤 템플릿 이름.',
        total: '일치한 굴림(또는 첫 번째 굴림)의 합계.',
        natural: '그 굴림의 d20(또는 첫 번째 주사위) 눈.',
        result: '굴림 결과를 지정했을 때 crit, fumble, success, fail 중 하나.',
        expression: '1d20+5 같은 굴림 식.',
        table: '그 굴림의 굴림 테이블 결과.',
        listener: '리스너 이름.',
        field: '${field:rname} 같은 롤 템플릿 필드(인라인 굴림은 합계로 표시).',
      },
      running: {
        heading: '명령어 실행 방식',
        points: [
          '각 줄은 별도의 채팅 메시지로 보내집니다. 단, 여러 줄에 걸친 {{ … }} 블록(롤 템플릿이나 ScriptCards 스크립트)은 하나로 묶어 보냅니다.',
          '명령어는 리스너별 설정이나 전역 설정에 따라 CRL 또는 굴린 캐릭터 이름으로 보내집니다. 다른 모드에는 CRL이 보낸 명령어가 API에서 온 것으로 보입니다.',
          '명령어에는 인라인 굴림, 롤 템플릿, @{Character|attribute}, %{Character|ability}를 쓸 수 있습니다. 선택한 토큰 참조(@{selected|…})와 질의(?{…})는 답할 사람이 없으므로 작동하지 않습니다.',
          '리스너는 순서대로 확인합니다. 여기서 확인 중단이 설정된 리스너가 발동하면 같은 메시지로 이후 리스너는 발동하지 않습니다.',
          '쿨다운이 있으면 리스너는 그 시간(초) 동안 다시 발동하지 않습니다.',
          'CRL은 자신의 메시지를 무시합니다. 그래도 리스너가 10초 안에 20번 넘게 발동하면 그 리스너를 끄고 GM에게 알립니다.',
        ],
      },
      inspector: {
        heading: '검사기',
        points: [
          '다음 메시지 검사를 클릭한 뒤 굴립니다. CRL은 확인한 내용을 귓속말로 보냅니다. 메시지 유형, 발언자, 캐릭터, 템플릿과 그 필드, 모든 굴림과 주사위, 리스너가 검색하는 텍스트, 각 리스너가 발동했거나 발동하지 않은 이유.',
          '시트의 템플릿 이름을 찾거나, Beacon 시트(예: D&D 2024)가 무엇을 보내는지 확인할 때 쓰세요.',
          'Beacon 시트는 롤 템플릿 대신 굴림 카드를 게시합니다. CRL은 이것도 읽습니다. 카드의 첫 번째 클래스가 템플릿(D&D 2024는 dnd-2024)이 되고, 캐릭터, 제목(예: 민첩 판정), 하위 분류가 필드가 됩니다. 분석 내역의 각 굴림도 굴림으로 처리되므로 치명타, 펌블, 합계, 주사위 눈 확인이 작동합니다.',
        ],
      },
      settings: {
        heading: '설정',
        intro:
          '!crl config나 설정 버튼으로 변경합니다. 일부는 모드의 One-Click 옵션에서도 설정할 수 있습니다.',
        colKey: '설정 키',
        colName: '이름',
        colDesc: '설명',
      },
      storage: {
        heading: '리스너 저장 위치',
        body: '각 리스너는 보관된 "{character}" 캐릭터의 어빌리티입니다. 어빌리티에 명령어가 저장되므로 저널에서 전체 매크로 편집기로 편집할 수 있습니다. 어빌리티 설명에는 리스너의 규칙이 저장되어, 게임을 복사해도 리스너가 유지됩니다. 어빌리티를 삭제하면 해당 리스너도 삭제되며, 직접 추가한 어빌리티는 꺼진 상태로 메뉴에 나타납니다.',
      },
      upgrading: {
        heading: '버전 1에서 업그레이드',
        points: [
          '버전 1 리스너는 처음 시작할 때 변환되며 명령어는 그대로 유지됩니다.',
          '일반 문자로만 된 텍스트는 일반 텍스트가 되며 이제 대소문자를 구분하지 않습니다. 정규식 기호를 쓴 텍스트는 정규식으로 남습니다.',
          '굴림 결과는 있지만 ##이 없는 리스너는 예전에는 "not parseable" 오류로 실패했지만, 이제는 메시지의 모든 굴림을 확인합니다.',
          '이제 실패는 목표값이 있는 굴림에서 성공이 없는 경우를 뜻합니다. 목표값과 정확히 같은 굴림은 성공입니다.',
          '버전 1 명령어도 계속 쓸 수 있습니다:',
        ],
        colV1: '버전 1',
        colV2: '버전 2',
      },
      troubleshooting: {
        heading: '문제 해결',
        points: [
          '아무 일도 일어나지 않음: 감지와 해당 리스너가 켜져 있는지 확인한 뒤, 검사기로 어느 필터가 일치하지 않는지 확인하세요.',
          '시트의 굴림이 인식되지 않음: 굴림 하나를 검사하세요. 표시되는 템플릿 이름과 필드가 필터에 쓸 값입니다.',
          'Beacon 시트(예: D&D 2024)의 굴림을 모드가 보려면 Experimental Mod 샌드박스가 필요합니다.',
          '@{…}나 %{…}를 쓰는 명령어는 !crl로 입력하면 그 부분이 사라집니다. 저널에서 어빌리티를 직접 편집하세요.',
          '피해 주사위가 치명타로 계산됨: 확인할 주사위를 d20으로 설정하세요.',
          '오류는 "Customizable Roll Listener" 접두어와 함께 API 콘솔에 기록됩니다.',
        ],
      },
      languages: {
        heading: '언어',
        body: '!crl config language 또는 One-Click 옵션 Language로 언어를 선택하세요. 지원 언어:',
        colCode: '코드',
        colName: '언어',
        colNative: '원어 이름',
      },
      credits: {
        heading: '크레딧',
        original: '원작자:',
        maintainer: '버전 2 제작:',
        support: '문제는 Roll20 포럼이나 GitHub 저장소에 보고하세요.',
        wiki: '버전 1 위키 페이지',
      },
    },
  };

  const TRANSLATION$7 = {
    titles: {
      ready: 'Customizable Roll Listener jest gotowy.',
      settings: 'Ustawienia CRL',
      languages: 'Wybierz język',
      help: 'Polecenia CRL',
      confirm: 'Potwierdź',
      inspect: 'Inspektor CRL',
      listener: 'Listener „{name}”',
      listenerCommands: 'Polecenia: {name}',
    },
    menu: {
      listening: 'Nasłuchiwanie',
      listeners: 'Listenery (sprawdzane w tej kolejności)',
      noListeners: 'Nie ma jeszcze listenerów. Kliknij Nowy listener, aby go utworzyć.',
      noCommands: 'Nie ma jeszcze poleceń.',
      commandsHint:
        'Wpisując polecenia na czacie, oddzielaj wiersze znakami \\\\. Przy odwołaniach @{...} lub %{...} edytuj zamiast tego zdolność w Dzienniku, bo czat podmienia je, zanim CRL je zobaczy.',
    },
    buttons: {
      back: 'Wstecz',
      change: 'Zmień',
      confirmDelete: 'Tak, usuń',
      delete: 'Usuń',
      edit: 'Edytuj',
      help: 'Pomoc',
      inspect: 'Sprawdź następną wiadomość',
      inspectOff: 'Przestań sprawdzać',
      new: 'Nowy listener',
      openJournal: 'Otwórz w Dzienniku',
      rebuildJournal: 'Odtwórz notatki',
      rename: 'Zmień nazwę',
      setCommands: 'Ustaw polecenia',
      settings: 'Ustawienia',
      test: 'Testuj',
      enable: 'Włącz',
      disable: 'Wyłącz',
      menu: 'Listenery',
      turnOn: 'Nasłuchiwanie wł.',
      turnOff: 'Nasłuchiwanie wył.',
    },
    prompts: {
      newName: 'Nazwa nowego listenera',
      name: 'Nowa nazwa',
      target: 'Nazwa listenera',
      commands: 'Polecenia - oddzielaj wiersze dwoma ukośnikami odwrotnymi',
      templates:
        'Szablony rzutów oddzielone spacjami - none, jeśli bez szablonu - puste dla dowolnego - Sprawdź pokazuje szablon rzutu',
      types: 'Typy wiadomości oddzielone spacjami - puste dla wszystkich oprócz api',
      text: 'Tekst do wyszukania - zobacz notatkę Help - puste dla dowolnego',
      regex: 'Jak czytać tekst',
      who: 'Nazwy nadawców lub postaci oddzielone przecinkami - puste dla każdego',
      players: 'Nazwy graczy oddzielone przecinkami - puste dla każdego',
      results: 'Wynik rzutu',
      total: 'Suma rzutu, np. 15 lub 19-20 - zobacz notatkę Help - puste dla dowolnej',
      natural: 'Naturalny wynik kości, np. 20 lub 1-2 - puste dla dowolnego',
      dice: 'Które kości są sprawdzane',
      cooldown: 'Sekundy oczekiwania przed ponownym uruchomieniem - 0, aby nie czekać',
      speaker: 'Wysyłaj polecenia jako',
    },
    choices: {
      critOrFumble: 'Krytyczny sukces lub porażka',
    },
    values: {
      on: 'Włączone',
      off: 'Wyłączone',
      none: 'Brak',
      any: 'Dowolne',
      allButApi: 'Dowolne (bez poleceń API)',
      plain: 'Zwykły tekst',
      regex: 'Wyrażenie regularne',
      diceAuto: 'Auto (d20, jeśli rzucono)',
      diceAny: 'Dowolna kość',
      seconds: '{seconds} s',
      speaker: {
        default: 'Ustawienie domyślne',
        crl: 'CRL',
        roller: 'Rzucający',
      },
    },
    results: {
      crit: 'Krytyczny sukces',
      fumble: 'Krytyczna porażka',
      success: 'Sukces',
      fail: 'Porażka',
    },
    fields: {
      enabled: 'Włączony',
      templates: 'Szablony rzutów',
      types: 'Typy wiadomości',
      text: 'Tekst',
      regex: 'Tekst to',
      who: 'Nadawcy / postacie',
      players: 'Gracze',
      results: 'Wynik rzutu',
      total: 'Suma rzutu',
      natural: 'Naturalna kość',
      dice: 'Sprawdzane kości',
      cooldown: 'Czas odnowienia',
      stop: 'Zatrzymaj po tym',
      speaker: 'Wysyłaj jako',
      commands: 'Polecenia',
    },
    settings: {
      enabled: {
        label: 'Nasłuchiwanie',
        desc: 'Włącza lub wyłącza wszystkie listenery naraz.',
      },
      speaker: {
        label: 'Wysyłaj polecenia jako',
        desc: 'Jako kto są wysyłane polecenia listenerów, chyba że listener ustawia inaczej: CRL albo postać (lub gracz), której wiadomość go uruchomiła.',
      },
      listenToMods: {
        label: 'Słuchaj innych modów',
        desc: 'Czy wiadomości wysyłane na czat przez inne mody mogą uruchamiać listenery. CRL nigdy nie reaguje na własne wiadomości.',
      },
      language: {
        label: 'Język',
        desc: 'Język menu, komunikatów i notatek.',
      },
    },
    inspect: {
      type: 'Typ',
      who: 'Nadawca',
      character: 'Postać',
      player: 'Gracz',
      template: 'Szablon rzutu',
      keys: 'Właściwości wiadomości',
      extras: 'Dodatkowe dane wiadomości',
      fields: 'Pola szablonu',
      rolls: 'Rzuty',
      dice: 'kości',
      table: 'tabela',
      target: 'ma próg sukcesu',
      crit: 'krytyczny sukces',
      fumble: 'krytyczna porażka',
      text: 'Tekst (tak, jak czytają go listenery)',
      raw: 'Surowa treść',
      listeners: 'Listenery',
      matched: 'uruchomiłby: {result}',
      reasons: {
        disabled: 'wyłączony',
        type: 'typ wiadomości nie pasuje',
        template: 'szablon rzutu nie pasuje',
        who: 'nadawca lub postać nie pasuje',
        player: 'gracz nie pasuje',
        text: 'nie znaleziono tekstu',
        roll: 'żaden rzut nie spełnia warunków rzutu',
      },
    },
    messages: {
      upgraded:
        'Zaktualizowano z wersji 1. Przekonwertowano listenery ({count}) z zachowaniem ich poleceń.',
      restored: 'Przywrócono listenery ({count}) z postaci-magazynu.',
      adopted:
        'Znaleziono zdolności ({count}) na postaci-magazynie bez reguł listenera. Dodano je jako wyłączone; skonfiguruj je w menu.',
      removed: 'Usunięto listenery ({count}), których zdolności zostały skasowane.',
      listeningOff: 'Nasłuchiwanie jest wyłączone. Wpisz !crl on, aby je włączyć.',
      readyHint:
        'Listenery: {count}. Wpisz !crl, aby otworzyć menu, lub !crl help, aby zobaczyć wszystkie polecenia.',
      loopStopped:
        'Listener „{name}” uruchamiał się zbyt często w krótkim czasie, prawdopodobnie dlatego, że jego polecenia uruchamiają go ponownie, więc został wyłączony.',
      noCommands: 'Listener „{name}” nie ma poleceń do wykonania.',
      tested: 'Wykonano polecenia listenera „{name}” (wiadomości: {count}).',
      confirmDelete: 'Usunąć listener „{name}” i jego polecenia? Tej operacji nie można cofnąć.',
      deleted: 'Usunięto listener „{name}”.',
      inspectOn: 'Następna wiadomość na czacie zostanie sprawdzona, a wynik wysłany Ci szeptem.',
      inspectOff: 'Inspektor został wyłączony.',
      journalRebuilt: 'Odtworzono notatki „{help}” i „{deck}”.',
    },
    errors: {
      gmOnly: 'Tylko MG może używać poleceń Customizable Roll Listener.',
      unexpected: 'Coś poszło nie tak: {message}',
      unknownCommand: 'Nieznane polecenie „{command}”.',
      badOption: 'Nieznana opcja --{option}.',
      notFound: 'Nie ma listenera o nazwie „{name}”.',
      nameRequired: 'Podaj nazwę listenera.',
      nameInvalid: 'Nie można użyć nazwy „{name}”.',
      nameTaken: 'Listener o nazwie „{name}” już istnieje.',
      badOnOff: 'Wartość „{value}” jest nieprawidłowa dla --{option}.',
      badType: 'Nieznane typy wiadomości: {value}.',
      badRegex: 'Wyrażenie regularne „{term}” jest nieprawidłowe: {error}',
      tooManyTerms: 'Listener może szukać najwyżej {max} fragmentów tekstu.',
      badResult: 'Nieznane wyniki rzutu: {value}.',
      badComparison: 'Wartość „{value}” jest nieprawidłowa dla --{option}.',
      badDice: 'Wartość „{value}” jest nieprawidłowa dla --dice.',
      badCooldown: 'Wartość „{value}” jest nieprawidłowa dla --cooldown.',
      badSpeaker: 'Wartość „{value}” jest nieprawidłowa dla --speaker.',
      noStore: 'Nie udało się utworzyć postaci-magazynu.',
      badSetting: 'Nieznane ustawienie „{key}”.',
      badSettingValue: 'Wartość „{value}” jest nieprawidłowa dla {key}.',
    },
    hints: {
      gmOnly: 'Poproś MG o skonfigurowanie listenerów.',
      unknownCommand: 'Wpisz !crl help, aby zobaczyć wszystkie polecenia.',
      badOption:
        'Opcje to --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name i --commands.',
      notFound: 'Wpisz !crl, aby zobaczyć listę listenerów.',
      nameInvalid:
        'Użyj najwyżej {max} znaków, bez tych: | { } [ ] \\ @ % # ? ~ ani „--”, i nie zaczynaj od „-”.',
      badOnOff: 'Użyj on lub off.',
      badType: 'Typy wiadomości to: {types}.',
      badResult: 'Użyj crit, fumble, success lub fail.',
      badComparison: 'Użyj liczby, porównania, np. >=15 lub <3, albo zakresu, np. 19-20.',
      badDice: 'Użyj auto, any lub rozmiaru kości, np. 20 lub d20.',
      badCooldown: 'Użyj liczby całkowitej sekund od 0 do 3600.',
      badSpeaker: 'Użyj default, crl lub roller.',
      badSetting: 'Ustawienia to: {keys}.',
      noStore: 'Sprawdź błędy w konsoli API, a następnie uruchom ponownie piaskownicę.',
    },
    help: {
      menu: 'Pokaż listę listenerów.',
      new: 'Utwórz listener. Opcje można dodać od razu.',
      show: 'Pokaż listener i jego ustawienia z przyciskami do ich zmiany.',
      edit: 'Zmień listener. Pozostaw wartość pustą (lub użyj -), aby ją wyczyścić.',
      commands:
        'Zastąp polecenia listenera. Używane jest wszystko po --commands, więc umieść to na końcu.',
      enable: 'Włącz lub wyłącz listener.',
      move: 'Przesuń listener wcześniej lub później w kolejności sprawdzania listenerów.',
      test: 'Wykonaj teraz polecenia listenera, jakby wypadła naturalna 20.',
      delete: 'Usuń listener i jego polecenia (z potwierdzeniem).',
      inspect:
        'Wyślij szeptem analizę następnej wiadomości na czacie i listę listenerów, które by uruchomiła.',
      inspectOff: 'Przestań czekać na wiadomość do sprawdzenia.',
      onOff: 'Włącz lub wyłącz całe nasłuchiwanie.',
      config: 'Pokaż lub zmień ustawienia globalne.',
      journal: 'Odtwórz notatki Help i Command Deck.',
      help: 'Pokaż tę listę.',
      optionsTitle: 'Opcje',
      options:
        'Opcje: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name i --commands. Zamiast identyfikatorów można używać nazw.',
      placeholders:
        'Polecenia mogą używać ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} i ${field:name}.',
      handouts: 'Notatka „{help}” wyjaśnia wszystko; notatka „{deck}” zawiera przyciski.',
    },
    store: {
      bio: 'Ta postać należy do moda Customizable Roll Listener. Każda zdolność to jeden listener: zdolność zawiera polecenia do wykonania, a jej opis zawiera reguły listenera.',
      bioHelp:
        'Tutaj możesz edytować polecenia. Reguły zmienisz za pomocą !crl lub w notatce Command Deck. Usunięcie zdolności usuwa jej listener.',
    },
    deck: {
      subtitle: 'Panel poleceń',
      listeners: 'Listenery',
      listenersDesc: 'Przeglądaj, twórz, zmieniaj i testuj listenery.',
      listening: 'Nasłuchiwanie',
      listeningDesc: 'Włącz lub wyłącz wszystkie listenery naraz.',
      tools: 'Narzędzia',
      toolsDesc:
        'Sprawdź wiadomość na czacie, zmień ustawienia, odtwórz notatki lub przeczytaj pomoc.',
      footer: 'Wszystkie polecenia są tylko dla MG. Szczegóły znajdziesz w notatce „{help}”.',
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Usłysz kości, usłysz akcję',
      footer: 'Przyciski wszystkich poleceń znajdują się w notatce „{deck}”.',
      overview: {
        heading: 'Przegląd',
        body: 'Customizable Roll Listener (CRL) obserwuje czat i wykonuje wybrane przez Ciebie polecenia, gdy wiadomość pasuje do listenera. Listener może sprawdzać szablon rzutu, tekst, nadawcę wiadomości oraz zawarte w niej rzuty: trafienia krytyczne, krytyczne porażki, sukcesy, porażki, sumy i naturalne wyniki kości. Poleceniem może być wszystko, co możesz wpisać na czacie, także polecenia innych modów, więc CRL może odtwarzać dźwięki, rzucać na tabelach losowych, publikować emotki, nakładać znaczniki stanu i nie tylko.',
      },
      quickStart: {
        heading: 'Szybki start',
        steps: [
          'Wpisz !crl na czacie (lub kliknij Listenery w notatce Command Deck).',
          'Kliknij Nowy listener i nadaj mu nazwę, np. Dźwięk krytyka.',
          'Kliknij Zmień obok Wynik rzutu i wybierz Krytyczny sukces.',
          'Kliknij Ustaw polecenia i wpisz, co ma zostać wykonane, np. !roll20AM --audio,play|Crit.',
          'Kliknij Testuj, aby sprawdzić polecenia, a potem wykonaj rzut na atak. Jeśli listener się nie uruchomi, użyj Sprawdź następną wiadomość.',
        ],
      },
      examples: {
        heading: 'Przykłady',
        points: [
          'Dźwięk przy każdym trafieniu krytycznym, z dowolnej karty postaci: --results crit',
          'Tabela krytycznych porażek przy naturalnej 1 w szablonie ataku D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reakcja na wynik tabeli losowej: --text Walka',
          'Tylko dla jednej postaci: --who Alicja',
          'Suma 20 lub więcej w pierwszym rzucie inline rzutu „Siła”: --text Siła && ## --total >=20',
        ],
        code: [
          '!crl new Dźwięk krytyka --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Pech --natural 1 --dice 20 --commands /em zalicza spektakularną wpadkę! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrator --results crit fumble --speaker crl --commands /desc ${who} wyrzuca: ${result}!',
        ],
      },
      matching: {
        heading: 'Co sprawdza listener',
        points: [
          'Listener uruchamia się, gdy pasują wszystkie jego filtry. Puste filtry pasują do wszystkiego.',
          'Szablony rzutów: nazwa szablonu, np. atkdmg lub simple. „none” pasuje do wiadomości bez szablonu. Kilka nazw oznacza dowolną z nich.',
          'Typy wiadomości: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (karty Beacon) i api. Gdy pole jest puste, sprawdzane są wszystkie typy oprócz poleceń api.',
          'Tekst: jeden lub więcej fragmentów tekstu, oddzielonych &&, które muszą wystąpić wszystkie. Wielkość liter nie ma znaczenia. Tekst jest wyszukiwany także w sumach rzutów i wynikach tabel losowych.',
          '## w tekście oznacza rzut inline; warunki rzutu dotyczą wtedy tylko znalezionych tam rzutów. Bez ## sprawdzany jest każdy rzut w wiadomości.',
          'Tekst może być wyrażeniem regularnym zamiast zwykłego tekstu (--regex on).',
          'Nadawcy / postacie: nazwa wyświetlana na czacie lub nazwa postaci w szablonie rzutu. Gracze: wyświetlana nazwa gracza.',
        ],
      },
      templates: {
        heading: 'Nazwy szablonów rzutów',
        points: [
          'Szablon rzutu to układ, w jakim karta postaci wyświetla wyniki rzutów. Jego nazwa to część po template: w makrze, więc &{template:atkdmg} to szablon atkdmg. Każda karta ma własne nazwy.',
          'Najszybszy sposób na znalezienie nazwy: kliknij Sprawdź następną wiadomość, wykonaj rzut z karty postaci i odczytaj wiersz Szablon rzutu, który CRL wyśle Ci szeptem.',
          'Nazwę możesz też odczytać w makrze przycisku na karcie postaci albo w źródle karty na GitHubie, gdzie każdy szablon to <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Szablony popularnych kart postaci:',
        ],
        colSheet: 'Karta postaci',
        colNames: 'Nazwy szablonów',
        links: 'Więcej o szablonach rzutów:',
        builtIn: 'Roll20: wbudowane szablony rzutów',
        dnd5e2014: 'Roll20: szablony rzutów D&D 5e (2014)',
        sheets: 'Kod źródłowy kart postaci Roll20',
      },
      rolls: {
        heading: 'Warunki rzutów',
        points: [
          'Wynik rzutu: krytyczny sukces (najwyższa ścianka kości lub zakres cs), krytyczna porażka (1 lub zakres cf), sukces (co najmniej jedna kość osiąga próg, np. 1d20>15), porażka (rzut z progiem bez sukcesów). Kilka wyników oznacza dowolny z nich.',
          'Suma rzutu: liczba, porównanie, np. >=15, lub zakres, np. 19-20.',
          'Naturalna kość: ścianka, na którą upadła kość, np. 20 lub <=2.',
          'Sprawdzane kości: auto bierze pod uwagę tylko d20, jeśli rzucono taką kością, więc kości obrażeń z najwyższym wynikiem nie liczą się jako krytyki. Aby to zmienić, wybierz dowolną kość lub rozmiar, np. d100.',
          'Odrzucone kości (ułatwienie i utrudnienie) oraz przerzucone kości są ignorowane.',
          'Karta D&D 5E by Roll20 (2014) rzuca z ułatwieniem i utrudnieniem jako dwa osobne rzuty d20 (r1 i r2), więc CRL sprawdza oba: przy ułatwieniu 1 na niższej kości nadal liczy się jako krytyczna porażka, a przy utrudnieniu 20 na wyższej kości nadal liczy się jako krytyczny sukces.',
          'Listener uruchamia się, gdy co najmniej jeden rzut spełnia wszystkie warunki rzutu.',
        ],
      },
      commands: {
        heading: 'Polecenia czatu',
        intro:
          'Wszystkie polecenia są tylko dla MG. Listener można wskazać nazwą lub identyfikatorem.',
        colCommand: 'Polecenie',
        colDesc: 'Działanie',
      },
      options: {
        heading: 'Opcje listenera',
        intro:
          'Dodaj je do !crl new lub !crl edit. Pozostaw wartość pustą lub użyj -, aby ją wyczyścić. --commands musi być ostatnie.',
        colOption: 'Opcja',
        colDesc: 'Znaczenie',
        templates:
          'Nazwy szablonów rzutów oddzielone spacjami. none = bez szablonu. Zobacz Nazwy szablonów rzutów powyżej.',
        types: 'Typy wiadomości oddzielone spacjami: {types}.',
        text: 'Tekst do znalezienia. Fragmenty oddzielaj &&. ## oznacza rzut inline.',
        regex: 'on, aby czytać tekst jako wyrażenia regularne, off dla zwykłego tekstu.',
        who: 'Nazwy nadawców lub postaci oddzielone przecinkami.',
        players: 'Wyświetlane nazwy graczy oddzielone przecinkami.',
        results: 'crit, fumble, success i/lub fail.',
        total: 'Suma rzutu: 15, >=15, <5 lub 19-20.',
        natural: 'Naturalna ścianka kości: 20, <=2 lub 19-20.',
        dice: 'auto, any lub rozmiar kości, np. 20.',
        cooldown: 'Liczba sekund, zanim listener będzie mógł uruchomić się ponownie.',
        stop: 'on, aby po uruchomieniu tego listenera nie sprawdzać kolejnych.',
        speaker: 'default, crl lub roller.',
        enabled: 'on lub off.',
        name: 'Zmienia nazwę listenera.',
        commands: 'Polecenia do wykonania. Oddzielaj wiersze znakami \\\\.',
      },
      placeholders: {
        heading: 'Symbole zastępcze',
        intro: 'Są podmieniane w poleceniach listenera, gdy się uruchomi.',
        colName: 'Symbol zastępczy',
        colDesc: 'Zastępowany przez',
        who: 'Nazwa wyświetlana na czacie.',
        character: 'Nazwa postaci z szablonu rzutu lub nazwa wyświetlana na czacie.',
        player: 'Wyświetlana nazwa gracza.',
        template: 'Nazwa szablonu rzutu.',
        total: 'Suma pasującego rzutu (lub pierwszego rzutu).',
        natural: 'Naturalny wynik d20 (lub pierwszej kości) tego rzutu.',
        result: 'crit, fumble, success lub fail, jeśli o któryś proszono.',
        expression: 'Wyrażenie rzutu, np. 1d20+5.',
        table: 'Wyniki tabel losowych z tego rzutu.',
        listener: 'Nazwa listenera.',
        field:
          'Pole szablonu rzutu, np. ${field:rname} (rzuty inline są pokazywane jako ich sumy).',
      },
      running: {
        heading: 'Jak wykonywane są polecenia',
        points: [
          'Każdy wiersz jest wysyłany jako osobna wiadomość na czacie, z wyjątkiem bloku {{ … }} rozciągniętego na kilka wierszy (szablonu rzutu lub skryptu ScriptCards), który pozostaje w całości.',
          'Polecenia są wysyłane jako CRL lub jako postać, która rzucała, zgodnie z ustawieniem listenera lub ustawieniami ogólnymi. Inne mody widzą polecenia wysłane przez CRL jako pochodzące z API.',
          'Polecenia mogą używać rzutów inline, szablonów rzutów, @{Character|attribute} i %{Character|ability}. Odwołania do zaznaczonego tokena (@{selected|…}) i zapytania (?{…}) nie działają, bo nie ma kogo zapytać.',
          'Listenery są sprawdzane po kolei. Listener z ustawieniem Zatrzymaj po tym nie pozwala kolejnym listenerom uruchomić się na tej samej wiadomości.',
          'Czas odnowienia nie pozwala listenerowi uruchomić się ponownie przez podaną liczbę sekund.',
          'CRL ignoruje własne wiadomości. Jeśli listener mimo to uruchomi się więcej niż 20 razy w ciągu 10 sekund, zostanie wyłączony, a MG dostanie powiadomienie.',
        ],
      },
      inspector: {
        heading: 'Inspektor',
        points: [
          'Kliknij Sprawdź następną wiadomość, a potem wykonaj rzut. CRL wyśle szeptem to, co zobaczył: typ wiadomości, nadawcę, postać, szablon i jego pola, każdy rzut z kośćmi, tekst przeszukiwany przez listenery oraz powód, dla którego każdy listener się uruchomił lub nie.',
          'Użyj go, aby poznać nazwę szablonu karty postaci lub zobaczyć, co wysyła karta Beacon (np. D&D 2024).',
          'Karty Beacon wysyłają okienka rzutów zamiast szablonów rzutów. CRL je odczytuje: szablon to pierwsza klasa okienka (dnd-2024 dla D&D 2024), postać, tytuł (np. Test Zręczności) i podkategoria stają się polami, a każdy rzut w rozbiciu jest rzutem, więc warunki krytycznego sukcesu, krytycznej porażki, sumy i naturalnej kości działają.',
        ],
      },
      settings: {
        heading: 'Ustawienia',
        intro:
          'Zmieniaj je za pomocą !crl config lub przycisku Ustawienia. Niektóre można też ustawić w opcjach One-Click moda.',
        colKey: 'Ustawienie',
        colName: 'Nazwa',
        colDesc: 'Opis',
      },
      storage: {
        heading: 'Gdzie przechowywane są listenery',
        body: 'Każdy listener to zdolność zarchiwizowanej postaci „{character}”. Zdolność przechowuje polecenia, więc możesz je edytować w Dzienniku w pełnym edytorze makr. Jej opis zawiera reguły listenera, dzięki czemu listenery przetrwają też skopiowanie gry. Usunięcie zdolności usuwa jej listener; zdolność dodana ręcznie pojawia się w menu jako wyłączona.',
      },
      upgrading: {
        heading: 'Aktualizacja z wersji 1',
        points: [
          'Listenery z wersji 1 są konwertowane przy pierwszym uruchomieniu i zachowują swoje polecenia.',
          'Tekst zawierający tylko zwykłe znaki staje się zwykłym tekstem i teraz nie rozróżnia wielkości liter. Tekst z symbolami wyrażeń regularnych pozostaje wyrażeniem regularnym.',
          'Listenery z wynikiem rzutu, ale bez ##, kończyły się wcześniej błędem „not parseable”; teraz sprawdzają każdy rzut w wiadomości.',
          'Porażka oznacza teraz rzut z progiem bez sukcesów; rzut równy progowi jest sukcesem.',
          'Polecenia z wersji 1 nadal działają:',
        ],
        colV1: 'Wersja 1',
        colV2: 'Wersja 2',
      },
      troubleshooting: {
        heading: 'Rozwiązywanie problemów',
        points: [
          'Nic się nie dzieje: sprawdź, czy Nasłuchiwanie i listener są włączone, a potem użyj inspektora, aby zobaczyć, który filtr nie pasuje.',
          'Rzuty z karty postaci nie są rozpoznawane: sprawdź jeden z nich; nazwa szablonu i pola, które zobaczysz, to właśnie to, po czym należy filtrować.',
          'Karty Beacon (np. D&D 2024) wymagają piaskownicy Experimental, aby mody widziały ich rzuty.',
          'Polecenia używające @{…} lub %{…} tracą je po wpisaniu do !crl; zamiast tego edytuj zdolność w Dzienniku.',
          'Kości obrażeń liczone jako krytyki: ustaw Sprawdzane kości na d20.',
          'Błędy są zapisywane w konsoli API z przedrostkiem „Customizable Roll Listener”.',
        ],
      },
      languages: {
        heading: 'Języki',
        body: 'Wybierz język za pomocą !crl config language lub opcji One-Click Language. Obsługiwane języki:',
        colCode: 'Kod',
        colName: 'Język',
        colNative: 'Nazwa oryginalna',
      },
      credits: {
        heading: 'Autorzy',
        original: 'Oryginalny mod autorstwa',
        maintainer: 'Wersja 2 autorstwa',
        support: 'Zgłaszaj problemy na forach Roll20 lub w repozytorium GitHub.',
        wiki: 'Strona wiki wersji 1',
      },
    },
  };

  const TRANSLATION$6 = {
    titles: {
      ready: 'O Customizable Roll Listener está pronto.',
      settings: 'Definições do CRL',
      languages: 'Escolha um idioma',
      help: 'Comandos do CRL',
      confirm: 'Confirme, por favor',
      inspect: 'Inspetor do CRL',
      listener: 'Ouvinte: {name}',
      listenerCommands: 'Comandos: {name}',
    },
    menu: {
      listening: 'Escuta',
      listeners: 'Ouvintes (verificados por esta ordem)',
      noListeners: 'Ainda não há ouvintes. Clique em Novo ouvinte para criar um.',
      noCommands: 'Ainda não há comandos.',
      commandsHint:
        'Separe as linhas com \\\\ ao escrever comandos no chat. Para referências @{...} ou %{...}, edite a habilidade no Diário, porque o chat substitui-as antes de o CRL as ver.',
    },
    buttons: {
      back: 'Voltar',
      change: 'Alterar',
      confirmDelete: 'Sim, apagar',
      delete: 'Apagar',
      edit: 'Editar',
      help: 'Ajuda',
      inspect: 'Inspecionar próxima mensagem',
      inspectOff: 'Parar de inspecionar',
      new: 'Novo ouvinte',
      openJournal: 'Abrir no Diário',
      rebuildJournal: 'Recriar folhetos',
      rename: 'Mudar o nome',
      setCommands: 'Definir comandos',
      settings: 'Definições',
      test: 'Testar',
      enable: 'Ligar',
      disable: 'Desligar',
      menu: 'Ouvintes',
      turnOn: 'Ligar escuta',
      turnOff: 'Desligar escuta',
    },
    prompts: {
      newName: 'Nome do novo ouvinte',
      name: 'Novo nome',
      target: 'Nome do ouvinte',
      commands: 'Comandos - separe as linhas com duas barras invertidas',
      templates:
        'Modelos de lançamento separados por espaços - none para nenhum modelo - vazio para qualquer um - Inspecionar mostra o modelo de um lançamento',
      types: 'Tipos de mensagem separados por espaços - vazio para qualquer um, exceto api',
      text: 'Texto a procurar - consulte o folheto Help - vazio para qualquer um',
      regex: 'Como interpretar o texto',
      who: 'Nomes de oradores ou personagens separados por vírgulas - vazio para qualquer um',
      players: 'Nomes de jogadores separados por vírgulas - vazio para qualquer um',
      results: 'Resultado do lançamento',
      total:
        'Total do lançamento, como 15 ou 19-20 - consulte o folheto Help - vazio para qualquer um',
      natural: 'Resultado natural do dado, como 20 ou 1-2 - vazio para qualquer um',
      dice: 'Que dados as verificações consideram',
      cooldown: 'Segundos de espera antes de voltar a ser acionado - 0 para nenhum',
      speaker: 'Enviar comandos como',
    },
    choices: {
      critOrFumble: 'Crítico ou falha crítica',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
      any: 'Qualquer um',
      allButApi: 'Qualquer um (exceto comandos da API)',
      plain: 'Texto simples',
      regex: 'Expressão regular',
      diceAuto: 'Auto (d20 se houver)',
      diceAny: 'Qualquer dado',
      seconds: '{seconds} s',
      speaker: {
        default: 'Definição predefinida',
        crl: 'CRL',
        roller: 'Quem lançou',
      },
    },
    results: {
      crit: 'Crítico',
      fumble: 'Falha crítica',
      success: 'Sucesso',
      fail: 'Falha',
    },
    fields: {
      enabled: 'Ligado',
      templates: 'Modelos de lançamento',
      types: 'Tipos de mensagem',
      text: 'Texto',
      regex: 'O texto é',
      who: 'Oradores / personagens',
      players: 'Jogadores',
      results: 'Resultado do lançamento',
      total: 'Total do lançamento',
      natural: 'Dado natural',
      dice: 'Dados verificados',
      cooldown: 'Tempo de espera',
      stop: 'Parar após este',
      speaker: 'Enviar como',
      commands: 'Comandos',
    },
    settings: {
      enabled: {
        label: 'Escuta',
        desc: 'Liga ou desliga todos os ouvintes de uma só vez.',
      },
      speaker: {
        label: 'Enviar comandos como',
        desc: 'Como são enviados os comandos dos ouvintes, salvo indicação em contrário do ouvinte: como CRL, ou como a personagem (ou jogador) cuja mensagem o acionou.',
      },
      listenToMods: {
        label: 'Ouvir outros mods',
        desc: 'Se as mensagens de chat enviadas por outros mods podem acionar ouvintes. O CRL nunca reage às suas próprias mensagens.',
      },
      language: {
        label: 'Idioma',
        desc: 'Idioma dos menus, mensagens e folhetos.',
      },
    },
    inspect: {
      type: 'Tipo',
      who: 'Orador',
      character: 'Personagem',
      player: 'Jogador',
      template: 'Modelo de lançamento',
      keys: 'Propriedades da mensagem',
      extras: 'Dados adicionais da mensagem',
      fields: 'Campos do modelo',
      rolls: 'Lançamentos',
      dice: 'dados',
      table: 'tabela',
      target: 'tem um alvo de sucesso',
      crit: 'crítico',
      fumble: 'falha crítica',
      text: 'Texto (tal como os ouvintes o leem)',
      raw: 'Conteúdo em bruto',
      listeners: 'Ouvintes',
      matched: 'acionaria {result}',
      reasons: {
        disabled: 'desligado',
        type: 'o tipo de mensagem não corresponde',
        template: 'o modelo de lançamento não corresponde',
        who: 'o orador ou a personagem não corresponde',
        player: 'o jogador não corresponde',
        text: 'texto não encontrado',
        roll: 'nenhum lançamento cumpre as condições de lançamento',
      },
    },
    messages: {
      upgraded:
        'Atualizado a partir da versão 1. {count} ouvinte(s) foram convertidos e os seus comandos mantidos.',
      restored: '{count} ouvinte(s) restaurado(s) a partir da personagem de armazenamento.',
      adopted:
        'Encontrada(s) {count} habilidade(s) na personagem de armazenamento sem regras de ouvinte. Foram adicionadas desligadas; configure-as a partir do menu.',
      removed: '{count} ouvinte(s) removido(s) porque a respetiva habilidade foi apagada.',
      listeningOff: 'A escuta está desligada. Escreva !crl on para a ligar.',
      readyHint:
        '{count} ouvinte(s). Escreva !crl para ver o menu ou !crl help para ver todos os comandos.',
      loopStopped:
        'O ouvinte "{name}" foi acionado demasiadas vezes em pouco tempo, provavelmente porque os seus comandos o voltam a acionar, por isso foi desligado.',
      noCommands: 'O ouvinte "{name}" não tem comandos para executar.',
      tested: 'Comandos de "{name}" executados ({count} mensagem(ns)).',
      confirmDelete:
        'Apagar o ouvinte "{name}" e os seus comandos? Esta ação não pode ser anulada.',
      deleted: 'O ouvinte "{name}" foi apagado.',
      inspectOn: 'A próxima mensagem do chat será inspecionada e o resultado ser-lhe-á sussurrado.',
      inspectOff: 'O inspetor foi desligado.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram recriados.',
    },
    errors: {
      gmOnly: 'Só o mestre pode utilizar os comandos do Customizable Roll Listener.',
      unexpected: 'Algo correu mal: {message}',
      unknownCommand: 'Comando desconhecido "{command}".',
      badOption: 'Opção desconhecida --{option}.',
      notFound: 'Não existe nenhum ouvinte chamado "{name}".',
      nameRequired: 'Indique o nome de um ouvinte.',
      nameInvalid: 'O nome "{name}" não pode ser utilizado.',
      nameTaken: 'Já existe um ouvinte chamado "{name}".',
      badOnOff: 'O valor "{value}" não é válido para --{option}.',
      badType: 'Tipo(s) de mensagem desconhecido(s): {value}.',
      badRegex: 'A expressão regular "{term}" não é válida: {error}',
      tooManyTerms: 'Um ouvinte pode procurar no máximo {max} excertos de texto.',
      badResult: 'Resultado(s) de lançamento desconhecido(s): {value}.',
      badComparison: 'O valor "{value}" não é válido para --{option}.',
      badDice: 'O valor "{value}" não é válido para --dice.',
      badCooldown: 'O valor "{value}" não é válido para --cooldown.',
      badSpeaker: 'O valor "{value}" não é válido para --speaker.',
      noStore: 'Não foi possível criar a personagem de armazenamento.',
      badSetting: 'Definição desconhecida "{key}".',
      badSettingValue: 'O valor "{value}" não é válido para {key}.',
    },
    hints: {
      gmOnly: 'Peça ao seu mestre que configure ouvintes por si.',
      unknownCommand: 'Escreva !crl help para ver todos os comandos.',
      badOption:
        'As opções são --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name e --commands.',
      notFound: 'Escreva !crl para ver a lista de ouvintes.',
      nameInvalid:
        'Utilize até {max} caracteres, sem estes: | { } [ ] \\ @ % # ? ~ nem "--", e não comece por "-".',
      badOnOff: 'Utilize on ou off.',
      badType: 'Os tipos de mensagem são: {types}.',
      badResult: 'Utilize crit, fumble, success ou fail.',
      badComparison:
        'Utilize um número, uma comparação como >=15 ou <3, ou um intervalo como 19-20.',
      badDice: 'Utilize auto, any ou um tamanho de dado como 20 ou d20.',
      badCooldown: 'Utilize um número inteiro de segundos entre 0 e 3600.',
      badSpeaker: 'Utilize default, crl ou roller.',
      badSetting: 'As definições são: {keys}.',
      noStore: 'Verifique se há erros na consola da API e reinicie o sandbox.',
    },
    help: {
      menu: 'Mostra a lista de ouvintes.',
      new: 'Cria um ouvinte. Pode acrescentar opções logo de seguida.',
      show: 'Mostra um ouvinte e as suas definições, com botões para as alterar.',
      edit: 'Altera um ouvinte. Deixe um valor vazio (ou use -) para o limpar.',
      commands:
        'Substitui os comandos de um ouvinte. É usado tudo o que vem depois de --commands, por isso coloque esta opção no fim.',
      enable: 'Liga ou desliga um ouvinte.',
      move: 'Move um ouvinte para antes ou depois na ordem pela qual os ouvintes são verificados.',
      test: 'Executa já os comandos de um ouvinte, como se tivesse saído um 20 natural.',
      delete: 'Apaga um ouvinte e os seus comandos (pede confirmação).',
      inspect: 'Sussurra uma análise da próxima mensagem do chat e dos ouvintes que acionaria.',
      inspectOff: 'Deixa de esperar por uma mensagem para inspecionar.',
      onOff: 'Liga ou desliga toda a escuta.',
      config: 'Mostra ou altera as definições globais.',
      journal: 'Recria os folhetos Help e Command Deck.',
      help: 'Mostra esta lista.',
      optionsTitle: 'Opções',
      options:
        'Opções: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name e --commands. Pode usar nomes em vez de IDs.',
      placeholders:
        'Os comandos podem utilizar ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} e ${field:name}.',
      handouts: 'O folheto "{help}" explica tudo; o folheto "{deck}" tem botões.',
    },
    store: {
      bio: 'Esta personagem pertence ao mod Customizable Roll Listener. Cada habilidade é um ouvinte: a habilidade guarda os comandos a executar e a sua descrição guarda as regras do ouvinte.',
      bioHelp:
        'Pode editar os comandos aqui. Altere as regras com !crl ou a partir do folheto Command Deck. Apagar uma habilidade apaga o respetivo ouvinte.',
    },
    deck: {
      subtitle: 'Painel de comandos',
      listeners: 'Ouvintes',
      listenersDesc: 'Veja, crie, altere e teste ouvintes.',
      listening: 'Escuta',
      listeningDesc: 'Liga ou desliga todos os ouvintes de uma só vez.',
      tools: 'Ferramentas',
      toolsDesc:
        'Inspecione uma mensagem do chat, altere as definições, recrie os folhetos ou leia a ajuda.',
      footer:
        'Todos os comandos são exclusivos do mestre. Consulte o folheto "{help}" para mais pormenores.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Ouça os dados, ouça a ação',
      footer: 'Os botões de todos os comandos estão no folheto "{deck}".',
      overview: {
        heading: 'Visão geral',
        body: 'O Customizable Roll Listener (CRL) vigia o chat e executa os comandos que escolher quando uma mensagem corresponde a um ouvinte. Um ouvinte pode analisar o modelo de lançamento, o texto, quem enviou a mensagem e os lançamentos que contém: acertos críticos, falhas críticas, sucessos, falhas, totais e resultados naturais dos dados. Os comandos podem ser tudo o que escreveria no chat, incluindo comandos de outros mods, por isso o CRL pode tocar sons, lançar em tabelas, publicar emotes, aplicar marcadores de estado e muito mais.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Escreva !crl no chat (ou clique em Ouvintes no folheto Command Deck).',
          'Clique em Novo ouvinte e dê-lhe um nome, como Som de Crítico.',
          'Clique em Alterar junto a Resultado do lançamento e escolha Crítico.',
          'Clique em Definir comandos e introduza o que executar, por exemplo !roll20AM --audio,play|Crit.',
          'Clique em Testar para verificar os comandos e, de seguida, faça um lançamento de ataque. Se nada for acionado, utilize Inspecionar próxima mensagem.',
        ],
      },
      examples: {
        heading: 'Exemplos',
        points: [
          'Som em qualquer acerto crítico, de qualquer ficha: --results crit',
          'Tabela de falhas críticas num 1 natural no modelo de ataque do D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reagir ao resultado de uma tabela aleatória: --text Combate',
          'Apenas para uma personagem: --who Alice',
          'Total de 20 ou mais no primeiro lançamento em linha de um lançamento de "Força": --text Força && ## --total >=20',
        ],
        code: [
          '!crl new Som de Crítico --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Falha Crítica --natural 1 --dice 20 --commands /em falha redondamente! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrador --results crit fumble --speaker crl --commands /desc Resultado de ${who}: ${result}!',
        ],
      },
      matching: {
        heading: 'O que um ouvinte verifica',
        points: [
          'Um ouvinte é acionado quando todos os seus filtros correspondem. Os filtros vazios correspondem a tudo.',
          'Modelos de lançamento: o nome do modelo, como atkdmg ou simple. "none" corresponde a mensagens sem modelo. Vários nomes significam qualquer um deles.',
          'Tipos de mensagem: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (fichas Beacon) e api. Quando vazio, são verificados todos os tipos exceto os comandos da API.',
          'Texto: um ou mais excertos de texto, separados por &&, que têm de aparecer todos. Maiúsculas e minúsculas são ignoradas. O texto também é procurado nos totais dos lançamentos e nos resultados de tabelas aleatórias.',
          '## no texto representa um lançamento em linha; as verificações de lançamento passam então a considerar apenas os lançamentos aí encontrados. Sem ##, são verificados todos os lançamentos da mensagem.',
          'O texto pode ser uma expressão regular em vez de texto simples (--regex on).',
          'Oradores / personagens: o nome apresentado no chat, ou o nome da personagem no modelo de lançamento. Jogadores: o nome de apresentação do jogador.',
        ],
      },
      templates: {
        heading: 'Nomes de modelos de lançamento',
        points: [
          'Um modelo de lançamento é o esquema que uma ficha usa nos seus cartões de lançamento. O nome é o que vem depois de template: numa macro, por isso &{template:atkdmg} é o modelo atkdmg. Cada ficha tem os seus próprios nomes.',
          'A forma mais rápida de descobrir um nome: clique em Inspecionar próxima mensagem, faça o lançamento a partir da ficha e leia a linha Modelo de lançamento que o CRL lhe sussurra.',
          'Também pode ler o nome na macro de um botão da ficha, ou no código-fonte da ficha no GitHub, onde cada modelo é um <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Modelos de fichas comuns:',
        ],
        colSheet: 'Ficha',
        colNames: 'Nomes de modelos',
        links: 'Mais sobre modelos de lançamento:',
        builtIn: 'Roll20: modelos de lançamento incorporados',
        dnd5e2014: 'Roll20: modelos de lançamento do D&D 5e (2014)',
        sheets: 'Código-fonte das fichas de personagem do Roll20',
      },
      rolls: {
        heading: 'Verificações de lançamento',
        points: [
          'Resultado do lançamento: crítico (a face mais alta do dado, ou o intervalo cs), falha crítica (um 1, ou o intervalo cf), sucesso (pelo menos um dado atinge um alvo, como em 1d20>15), falha (um lançamento com alvo sem nenhum sucesso). Vários resultados significam qualquer um deles.',
          'Total do lançamento: um número, uma comparação como >=15 ou um intervalo como 19-20.',
          'Dado natural: a face em que o dado caiu, como 20 ou <=2.',
          'Dados verificados: auto considera apenas os d20 quando foi lançado algum, por isso os dados de dano que tiram a face mais alta não contam como críticos. Escolha Qualquer dado, ou um tamanho como d100, para mudar isto.',
          'Os dados descartados (vantagem e desvantagem) e os dados relançados são ignorados.',
          'A ficha D&D 5E by Roll20 (2014) lança vantagem e desvantagem como dois lançamentos de d20 separados (r1 e r2), por isso o CRL verifica ambos: com vantagem, um 1 no dado mais baixo continua a contar como falha crítica, e com desvantagem, um 20 no dado mais alto continua a contar como crítico.',
          'Um ouvinte é acionado quando pelo menos um lançamento cumpre todas as verificações de lançamento.',
        ],
      },
      commands: {
        heading: 'Comandos de chat',
        intro:
          'Todos os comandos são exclusivos do mestre. Um ouvinte pode ser indicado pelo nome ou pelo ID.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      options: {
        heading: 'Opções do ouvinte',
        intro:
          'Acrescente-as a !crl new ou !crl edit. Deixe um valor vazio, ou use -, para o limpar. --commands tem de vir em último lugar.',
        colOption: 'Opção',
        colDesc: 'Significado',
        templates:
          'Nomes de modelos de lançamento, separados por espaços. none = sem modelo. Consulte Nomes de modelos de lançamento acima.',
        types: 'Tipos de mensagem, separados por espaços: {types}.',
        text: 'Texto a procurar. Separe os excertos com &&. ## marca um lançamento em linha.',
        regex: 'on para ler o texto como expressões regulares, off para texto simples.',
        who: 'Nomes de oradores ou personagens, separados por vírgulas.',
        players: 'Nomes de apresentação dos jogadores, separados por vírgulas.',
        results: 'crit, fumble, success e/ou fail.',
        total: 'Total do lançamento: 15, >=15, <5 ou 19-20.',
        natural: 'Face natural do dado: 20, <=2 ou 19-20.',
        dice: 'auto, any ou um tamanho de dado como 20.',
        cooldown: 'Segundos até o ouvinte poder voltar a ser acionado.',
        stop: 'on para deixar de verificar os ouvintes seguintes quando este for acionado.',
        speaker: 'default, crl ou roller.',
        enabled: 'on ou off.',
        name: 'Muda o nome do ouvinte.',
        commands: 'Os comandos a executar. Separe as linhas com \\\\.',
      },
      placeholders: {
        heading: 'Marcadores',
        intro: 'São substituídos nos comandos de um ouvinte quando este é acionado.',
        colName: 'Marcador',
        colDesc: 'Substituído por',
        who: 'O nome apresentado no chat.',
        character: 'O nome da personagem no modelo de lançamento, ou o nome apresentado no chat.',
        player: 'O nome de apresentação do jogador.',
        template: 'O nome do modelo de lançamento.',
        total: 'O total do lançamento que correspondeu (ou do primeiro lançamento).',
        natural: 'O d20 natural (ou o primeiro dado) desse lançamento.',
        result: 'crit, fumble, success ou fail, quando foi pedido algum.',
        expression: 'A expressão do lançamento, como 1d20+5.',
        table: 'Resultados de tabelas aleatórias desse lançamento.',
        listener: 'O nome do ouvinte.',
        field:
          'Um campo do modelo de lançamento, como ${field:rname} (os lançamentos em linha aparecem como os seus totais).',
      },
      running: {
        heading: 'Como os comandos são executados',
        points: [
          'Cada linha é enviada como uma mensagem de chat separada, exceto um bloco {{ … }} distribuído por várias linhas (um modelo de lançamento ou um script do ScriptCards), que é mantido junto.',
          'Os comandos são enviados como CRL, ou como a personagem que lançou, conforme definido em cada ouvinte ou nas definições. Os outros mods veem os comandos enviados pelo CRL como vindos da API.',
          'Os comandos podem usar lançamentos em linha, modelos de lançamento, @{Character|attribute} e %{Character|ability}. As referências ao token selecionado (@{selected|…}) e as consultas (?{…}) não funcionam, porque não há ninguém a quem perguntar.',
          'Os ouvintes são verificados por ordem. Um ouvinte com Parar após este impede que os ouvintes seguintes sejam acionados pela mesma mensagem.',
          'O tempo de espera impede que um ouvinte volte a ser acionado durante esse número de segundos.',
          'O CRL ignora as suas próprias mensagens. Se, mesmo assim, um ouvinte for acionado mais de 20 vezes em 10 segundos, é desligado e o mestre é avisado.',
        ],
      },
      inspector: {
        heading: 'O inspetor',
        points: [
          'Clique em Inspecionar próxima mensagem e faça o lançamento. O CRL sussurra o que viu: o tipo de mensagem, o orador, a personagem, o modelo e os seus campos, cada lançamento com os seus dados, o texto em que os ouvintes procuram e porque é que cada ouvinte foi ou não acionado.',
          'Utilize-o para descobrir o nome do modelo de uma ficha, ou para ver o que uma ficha Beacon (como a de D&D 2024) envia.',
          'As fichas Beacon publicam cartões de lançamento em vez de modelos de lançamento. O CRL lê-os: o modelo é a primeira classe do cartão (dnd-2024 para D&D 2024), a personagem, o título (como Teste de Destreza) e a subcategoria tornam-se campos, e cada lançamento do detalhe é um lançamento, por isso as verificações de crítico, falha crítica, total e dado natural funcionam.',
        ],
      },
      settings: {
        heading: 'Definições',
        intro:
          'Altere-as com !crl config ou com o botão Definições. Algumas também podem ser definidas nas opções One-Click do mod.',
        colKey: 'Definição',
        colName: 'Nome',
        colDesc: 'Descrição',
      },
      storage: {
        heading: 'Onde são guardados os ouvintes',
        body: 'Cada ouvinte é uma habilidade da personagem arquivada "{character}". A habilidade guarda os comandos, por isso pode editá-los no Diário com o editor de macros completo. A sua descrição guarda as regras do ouvinte, o que também permite que os ouvintes se mantenham quando o jogo é copiado. Apagar uma habilidade apaga o respetivo ouvinte; uma habilidade adicionada à mão aparece desligada no menu.',
      },
      upgrading: {
        heading: 'Atualização a partir da versão 1',
        points: [
          'Os ouvintes da versão 1 são convertidos no primeiro arranque e mantêm os seus comandos.',
          'O texto que só contém caracteres comuns passa a texto simples e agora ignora maiúsculas e minúsculas. O texto que usa símbolos de expressão regular continua a ser uma expressão regular.',
          'Os ouvintes com resultado de lançamento mas sem ## falhavam com "not parseable"; agora verificam todos os lançamentos da mensagem.',
          'Falha significa agora um lançamento com alvo sem nenhum sucesso; um lançamento exatamente no alvo é um sucesso.',
          'Os comandos da versão 1 continuam a funcionar:',
        ],
        colV1: 'Versão 1',
        colV2: 'Versão 2',
      },
      troubleshooting: {
        heading: 'Resolução de problemas',
        points: [
          'Não acontece nada: verifique se a Escuta e o ouvinte estão ligados e, de seguida, utilize o inspetor para ver que filtro falha.',
          'Os lançamentos de uma ficha não são reconhecidos: inspecione um; o nome do modelo e os campos que mostra são o que deve usar nos filtros.',
          'As fichas Beacon (como a de D&D 2024) precisam do sandbox Experimental de mods para que os mods vejam os seus lançamentos.',
          'Os comandos que usam @{…} ou %{…} perdem-nos quando são escritos em !crl; nesse caso, edite a habilidade no Diário.',
          'Dados de dano contados como críticos: defina Dados verificados como d20.',
          'Os erros são registados na consola da API com o prefixo "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma com !crl config language ou com a opção Language do One-Click. Idiomas disponíveis:',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versão 2 de',
        support: 'Comunique problemas nos fóruns do Roll20 ou no repositório do GitHub.',
        wiki: 'Página da wiki da versão 1',
      },
    },
  };

  const TRANSLATION$5 = {
    titles: {
      ready: 'O Customizable Roll Listener está pronto.',
      settings: 'Configurações do CRL',
      languages: 'Escolha um idioma',
      help: 'Comandos do CRL',
      confirm: 'Confirme, por favor',
      inspect: 'Inspetor do CRL',
      listener: 'Ouvinte: {name}',
      listenerCommands: 'Comandos: {name}',
    },
    menu: {
      listening: 'Escuta',
      listeners: 'Ouvintes (verificados nesta ordem)',
      noListeners: 'Ainda não há ouvintes. Clique em Novo ouvinte para criar um.',
      noCommands: 'Ainda não há comandos.',
      commandsHint:
        'Separe as linhas com \\\\ ao digitar comandos no chat. Para referências @{...} ou %{...}, edite a habilidade no Diário, porque o chat as substitui antes que o CRL as veja.',
    },
    buttons: {
      back: 'Voltar',
      change: 'Alterar',
      confirmDelete: 'Sim, excluir',
      delete: 'Excluir',
      edit: 'Editar',
      help: 'Ajuda',
      inspect: 'Inspecionar próxima mensagem',
      inspectOff: 'Parar de inspecionar',
      new: 'Novo ouvinte',
      openJournal: 'Abrir no Diário',
      rebuildJournal: 'Recriar folhetos',
      rename: 'Renomear',
      setCommands: 'Definir comandos',
      settings: 'Configurações',
      test: 'Testar',
      enable: 'Ligar',
      disable: 'Desligar',
      menu: 'Ouvintes',
      turnOn: 'Ligar escuta',
      turnOff: 'Desligar escuta',
    },
    prompts: {
      newName: 'Nome do novo ouvinte',
      name: 'Novo nome',
      target: 'Nome do ouvinte',
      commands: 'Comandos - separe as linhas com duas barras invertidas',
      templates:
        'Modelos de rolagem separados por espaços - none para nenhum modelo - vazio para qualquer um - Inspecionar mostra o modelo de uma rolagem',
      types: 'Tipos de mensagem separados por espaços - vazio para qualquer um, exceto api',
      text: 'Texto a procurar - veja o folheto Help - vazio para qualquer um',
      regex: 'Como ler o texto',
      who: 'Nomes de falantes ou personagens separados por vírgulas - vazio para qualquer um',
      players: 'Nomes de jogadores separados por vírgulas - vazio para qualquer um',
      results: 'Resultado da rolagem',
      total: 'Total da rolagem, como 15 ou 19-20 - veja o folheto Help - vazio para qualquer um',
      natural: 'Resultado natural do dado, como 20 ou 1-2 - vazio para qualquer um',
      dice: 'Quais dados as verificações consideram',
      cooldown: 'Segundos de espera antes de acionar novamente - 0 para nenhum',
      speaker: 'Enviar comandos como',
    },
    choices: {
      critOrFumble: 'Crítico ou falha crítica',
    },
    values: {
      on: 'Ligado',
      off: 'Desligado',
      none: 'Nenhum',
      any: 'Qualquer um',
      allButApi: 'Qualquer um (exceto comandos de API)',
      plain: 'Texto simples',
      regex: 'Expressão regular',
      diceAuto: 'Auto (d20 se houver)',
      diceAny: 'Qualquer dado',
      seconds: '{seconds} s',
      speaker: {
        default: 'Configuração padrão',
        crl: 'CRL',
        roller: 'Quem rolou',
      },
    },
    results: {
      crit: 'Crítico',
      fumble: 'Falha crítica',
      success: 'Sucesso',
      fail: 'Falha',
    },
    fields: {
      enabled: 'Ligado',
      templates: 'Modelos de rolagem',
      types: 'Tipos de mensagem',
      text: 'Texto',
      regex: 'O texto é',
      who: 'Falantes / personagens',
      players: 'Jogadores',
      results: 'Resultado da rolagem',
      total: 'Total da rolagem',
      natural: 'Dado natural',
      dice: 'Dados verificados',
      cooldown: 'Recarga',
      stop: 'Parar após este',
      speaker: 'Enviar como',
      commands: 'Comandos',
    },
    settings: {
      enabled: {
        label: 'Escuta',
        desc: 'Liga ou desliga todos os ouvintes de uma vez.',
      },
      speaker: {
        label: 'Enviar comandos como',
        desc: 'Como os comandos dos ouvintes são enviados, a menos que o ouvinte defina outra coisa: como CRL, ou como o personagem (ou jogador) cuja mensagem o acionou.',
      },
      listenToMods: {
        label: 'Ouvir outros mods',
        desc: 'Se mensagens de chat enviadas por outros mods podem acionar ouvintes. O CRL nunca reage às próprias mensagens.',
      },
      language: {
        label: 'Idioma',
        desc: 'Idioma dos menus, mensagens e folhetos.',
      },
    },
    inspect: {
      type: 'Tipo',
      who: 'Falante',
      character: 'Personagem',
      player: 'Jogador',
      template: 'Modelo de rolagem',
      keys: 'Propriedades da mensagem',
      extras: 'Dados extras da mensagem',
      fields: 'Campos do modelo',
      rolls: 'Rolagens',
      dice: 'dados',
      table: 'tabela',
      target: 'tem um alvo de sucesso',
      crit: 'crítico',
      fumble: 'falha crítica',
      text: 'Texto (como os ouvintes o leem)',
      raw: 'Conteúdo bruto',
      listeners: 'Ouvintes',
      matched: 'acionaria {result}',
      reasons: {
        disabled: 'desligado',
        type: 'o tipo de mensagem não corresponde',
        template: 'o modelo de rolagem não corresponde',
        who: 'o falante ou personagem não corresponde',
        player: 'o jogador não corresponde',
        text: 'texto não encontrado',
        roll: 'nenhuma rolagem atende às condições de rolagem',
      },
    },
    messages: {
      upgraded:
        'Atualizado da versão 1. {count} ouvinte(s) foram convertidos e seus comandos mantidos.',
      restored: '{count} ouvinte(s) restaurado(s) a partir do personagem de armazenamento.',
      adopted:
        'Encontrada(s) {count} habilidade(s) no personagem de armazenamento sem regras de ouvinte. Elas foram adicionadas desligadas; configure-as pelo menu.',
      removed: '{count} ouvinte(s) removido(s) porque a habilidade foi excluída.',
      listeningOff: 'A escuta está desligada. Digite !crl on para ligá-la.',
      readyHint:
        '{count} ouvinte(s). Digite !crl para ver o menu ou !crl help para ver todos os comandos.',
      loopStopped:
        'O ouvinte "{name}" foi acionado vezes demais em pouco tempo, provavelmente porque seus comandos o acionam de novo, então ele foi desligado.',
      noCommands: 'O ouvinte "{name}" não tem comandos para executar.',
      tested: 'Comandos de "{name}" executados ({count} mensagem(ns)).',
      confirmDelete: 'Excluir o ouvinte "{name}" e seus comandos? Isso não pode ser desfeito.',
      deleted: 'O ouvinte "{name}" foi excluído.',
      inspectOn:
        'A próxima mensagem do chat será inspecionada e o resultado será sussurrado para você.',
      inspectOff: 'O inspetor foi desligado.',
      journalRebuilt: 'Os folhetos "{help}" e "{deck}" foram recriados.',
    },
    errors: {
      gmOnly: 'Somente o mestre pode usar os comandos do Customizable Roll Listener.',
      unexpected: 'Algo deu errado: {message}',
      unknownCommand: 'Comando desconhecido "{command}".',
      badOption: 'Opção desconhecida --{option}.',
      notFound: 'Não existe ouvinte chamado "{name}".',
      nameRequired: 'Informe o nome de um ouvinte.',
      nameInvalid: 'O nome "{name}" não pode ser usado.',
      nameTaken: 'Já existe um ouvinte chamado "{name}".',
      badOnOff: 'O valor "{value}" não é válido para --{option}.',
      badType: 'Tipo(s) de mensagem desconhecido(s): {value}.',
      badRegex: 'A expressão regular "{term}" não é válida: {error}',
      tooManyTerms: 'Um ouvinte pode procurar no máximo {max} trechos de texto.',
      badResult: 'Resultado(s) de rolagem desconhecido(s): {value}.',
      badComparison: 'O valor "{value}" não é válido para --{option}.',
      badDice: 'O valor "{value}" não é válido para --dice.',
      badCooldown: 'O valor "{value}" não é válido para --cooldown.',
      badSpeaker: 'O valor "{value}" não é válido para --speaker.',
      noStore: 'Não foi possível criar o personagem de armazenamento.',
      badSetting: 'Configuração desconhecida "{key}".',
      badSettingValue: 'O valor "{value}" não é válido para {key}.',
    },
    hints: {
      gmOnly: 'Peça ao seu mestre para configurar ouvintes para você.',
      unknownCommand: 'Digite !crl help para ver todos os comandos.',
      badOption:
        'As opções são --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name e --commands.',
      notFound: 'Digite !crl para ver a lista de ouvintes.',
      nameInvalid:
        'Use até {max} caracteres, sem estes: | { } [ ] \\ @ % # ? ~ ou "--", e não comece com "-".',
      badOnOff: 'Use on ou off.',
      badType: 'Os tipos de mensagem são: {types}.',
      badResult: 'Use crit, fumble, success ou fail.',
      badComparison: 'Use um número, uma comparação como >=15 ou <3, ou um intervalo como 19-20.',
      badDice: 'Use auto, any ou um tamanho de dado como 20 ou d20.',
      badCooldown: 'Use um número inteiro de segundos de 0 a 3600.',
      badSpeaker: 'Use default, crl ou roller.',
      badSetting: 'As configurações são: {keys}.',
      noStore: 'Procure erros no console da API e reinicie o sandbox.',
    },
    help: {
      menu: 'Mostra a lista de ouvintes.',
      new: 'Cria um ouvinte. As opções podem ser adicionadas na hora.',
      show: 'Mostra um ouvinte e suas configurações, com botões para alterá-las.',
      edit: 'Altera um ouvinte. Deixe um valor vazio (ou use -) para limpá-lo.',
      commands:
        'Substitui os comandos de um ouvinte. Tudo depois de --commands é usado, então coloque essa opção por último.',
      enable: 'Liga ou desliga um ouvinte.',
      move: 'Move um ouvinte para antes ou depois na ordem em que os ouvintes são verificados.',
      test: 'Executa os comandos de um ouvinte agora, como se tivesse saído um 20 natural.',
      delete: 'Exclui um ouvinte e seus comandos (pede confirmação).',
      inspect:
        'Sussurra uma análise da próxima mensagem do chat e de quais ouvintes ela acionaria.',
      inspectOff: 'Para de esperar uma mensagem para inspecionar.',
      onOff: 'Liga ou desliga toda a escuta.',
      config: 'Mostra ou altera as configurações globais.',
      journal: 'Recria os folhetos Help e Command Deck.',
      help: 'Mostra esta lista.',
      optionsTitle: 'Opções',
      options:
        'Opções: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name e --commands. É possível usar nomes em vez de IDs.',
      placeholders:
        'Os comandos podem usar ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} e ${field:name}.',
      handouts: 'O folheto "{help}" explica tudo; o folheto "{deck}" tem botões.',
    },
    store: {
      bio: 'Este personagem pertence ao mod Customizable Roll Listener. Cada habilidade é um ouvinte: a habilidade guarda os comandos a executar, e sua descrição guarda as regras do ouvinte.',
      bioHelp:
        'Você pode editar os comandos aqui. Altere as regras com !crl ou pelo folheto Command Deck. Excluir uma habilidade exclui o ouvinte dela.',
    },
    deck: {
      subtitle: 'Painel de comandos',
      listeners: 'Ouvintes',
      listenersDesc: 'Veja, crie, altere e teste ouvintes.',
      listening: 'Escuta',
      listeningDesc: 'Liga ou desliga todos os ouvintes de uma vez.',
      tools: 'Ferramentas',
      toolsDesc:
        'Inspecione uma mensagem do chat, altere as configurações, recrie os folhetos ou leia a ajuda.',
      footer:
        'Todos os comandos são exclusivos do mestre. Veja o folheto "{help}" para mais detalhes.',
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Ouça os dados, ouça a ação',
      footer: 'Os botões de todos os comandos estão no folheto "{deck}".',
      overview: {
        heading: 'Visão geral',
        body: 'O Customizable Roll Listener (CRL) observa o chat e executa os comandos que você escolher quando uma mensagem corresponde a um ouvinte. Um ouvinte pode analisar o modelo de rolagem, o texto, quem enviou a mensagem e as rolagens que ela contém: acertos críticos, falhas críticas, sucessos, falhas, totais e resultados naturais dos dados. Os comandos podem ser qualquer coisa que você digitaria no chat, inclusive comandos de outros mods, então o CRL pode tocar sons, rolar em tabelas, postar emotes, aplicar marcadores de status e muito mais.',
      },
      quickStart: {
        heading: 'Início rápido',
        steps: [
          'Digite !crl no chat (ou clique em Ouvintes no folheto Command Deck).',
          'Clique em Novo ouvinte e dê um nome a ele, como Som de Crítico.',
          'Clique em Alterar ao lado de Resultado da rolagem e escolha Crítico.',
          'Clique em Definir comandos e informe o que executar, por exemplo !roll20AM --audio,play|Crit.',
          'Clique em Testar para conferir os comandos e depois role um ataque. Se nada for acionado, use Inspecionar próxima mensagem.',
        ],
      },
      examples: {
        heading: 'Exemplos',
        points: [
          'Som em qualquer acerto crítico, de qualquer ficha: --results crit',
          'Tabela de falhas críticas com 1 natural no modelo de ataque do D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reagir ao resultado de uma tabela rolável: --text Combate',
          'Só para um personagem: --who Alice',
          'Total de 20 ou mais na primeira rolagem em linha de uma rolagem de "Força": --text Força && ## --total >=20',
        ],
        code: [
          '!crl new Som de Crítico --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Falha Crítica --natural 1 --dice 20 --commands /em erra feio! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrador --results crit fumble --speaker crl --commands /desc Resultado de ${who}: ${result}!',
        ],
      },
      matching: {
        heading: 'O que um ouvinte verifica',
        points: [
          'Um ouvinte é acionado quando todos os seus filtros correspondem. Filtros vazios correspondem a tudo.',
          'Modelos de rolagem: o nome do modelo, como atkdmg ou simple. "none" corresponde a mensagens sem modelo. Vários nomes significam qualquer um deles.',
          'Tipos de mensagem: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (fichas Beacon) e api. Quando vazio, todos os tipos são verificados, exceto comandos de API.',
          'Texto: um ou mais trechos de texto, separados por &&, que precisam aparecer todos. Maiúsculas e minúsculas são ignoradas. O texto também é procurado nos totais das rolagens e nos resultados de tabelas roláveis.',
          '## no texto representa uma rolagem em linha; as verificações de rolagem então consideram só as rolagens encontradas ali. Sem ##, todas as rolagens da mensagem são verificadas.',
          'O texto pode ser uma expressão regular em vez de texto simples (--regex on).',
          'Falantes / personagens: o nome mostrado no chat, ou o nome do personagem no modelo de rolagem. Jogadores: o nome de exibição do jogador.',
        ],
      },
      templates: {
        heading: 'Nomes de modelos de rolagem',
        points: [
          'Um modelo de rolagem é o layout que uma ficha usa nos seus cartões de rolagem. O nome dele é o que vem depois de template: em uma macro, então &{template:atkdmg} é o modelo atkdmg. Cada ficha tem seus próprios nomes.',
          'O jeito mais rápido de descobrir um nome: clique em Inspecionar próxima mensagem, faça a rolagem pela ficha e leia a linha Modelo de rolagem que o CRL sussurra de volta.',
          'Você também pode ler o nome na macro de um botão da ficha, ou no código-fonte da ficha no GitHub, onde cada modelo é um <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Modelos de fichas comuns:',
        ],
        colSheet: 'Ficha',
        colNames: 'Nomes de modelos',
        links: 'Mais sobre modelos de rolagem:',
        builtIn: 'Roll20: modelos de rolagem nativos',
        dnd5e2014: 'Roll20: modelos de rolagem do D&D 5e (2014)',
        sheets: 'Código-fonte das fichas de personagem do Roll20',
      },
      rolls: {
        heading: 'Verificações de rolagem',
        points: [
          'Resultado da rolagem: crítico (a face mais alta do dado, ou o intervalo cs), falha crítica (um 1, ou o intervalo cf), sucesso (pelo menos um dado atinge um alvo, como em 1d20>15), falha (uma rolagem com alvo sem nenhum sucesso). Vários resultados significam qualquer um deles.',
          'Total da rolagem: um número, uma comparação como >=15 ou um intervalo como 19-20.',
          'Dado natural: a face que o dado mostrou, como 20 ou <=2.',
          'Dados verificados: auto considera só os d20 quando algum foi rolado, então dados de dano que tiram a face mais alta não contam como críticos. Escolha Qualquer dado, ou um tamanho como d100, para mudar isso.',
          'Dados descartados (vantagem e desvantagem) e dados rerrolados são ignorados.',
          'A ficha D&D 5E by Roll20 (2014) rola vantagem e desvantagem como duas rolagens de d20 separadas (r1 e r2), então o CRL verifica as duas: com vantagem, um 1 no dado menor ainda conta como falha crítica, e com desvantagem, um 20 no dado maior ainda conta como crítico.',
          'Um ouvinte é acionado quando pelo menos uma rolagem atende a todas as verificações de rolagem.',
        ],
      },
      commands: {
        heading: 'Comandos de chat',
        intro:
          'Todos os comandos são exclusivos do mestre. Um ouvinte pode ser indicado pelo nome ou pelo ID.',
        colCommand: 'Comando',
        colDesc: 'O que faz',
      },
      options: {
        heading: 'Opções do ouvinte',
        intro:
          'Adicione-as a !crl new ou !crl edit. Deixe um valor vazio, ou use -, para limpá-lo. --commands deve vir por último.',
        colOption: 'Opção',
        colDesc: 'Significado',
        templates:
          'Nomes de modelos de rolagem, separados por espaços. none = sem modelo. Veja Nomes de modelos de rolagem acima.',
        types: 'Tipos de mensagem, separados por espaços: {types}.',
        text: 'Texto a procurar. Separe os trechos com &&. ## marca uma rolagem em linha.',
        regex: 'on para ler o texto como expressões regulares, off para texto simples.',
        who: 'Nomes de falantes ou personagens, separados por vírgulas.',
        players: 'Nomes de exibição dos jogadores, separados por vírgulas.',
        results: 'crit, fumble, success e/ou fail.',
        total: 'Total da rolagem: 15, >=15, <5 ou 19-20.',
        natural: 'Face natural do dado: 20, <=2 ou 19-20.',
        dice: 'auto, any ou um tamanho de dado como 20.',
        cooldown: 'Segundos até o ouvinte poder ser acionado de novo.',
        stop: 'on para parar de verificar os ouvintes seguintes quando este for acionado.',
        speaker: 'default, crl ou roller.',
        enabled: 'on ou off.',
        name: 'Renomeia o ouvinte.',
        commands: 'Os comandos a executar. Separe as linhas com \\\\.',
      },
      placeholders: {
        heading: 'Marcadores',
        intro: 'São substituídos nos comandos de um ouvinte quando ele é acionado.',
        colName: 'Marcador',
        colDesc: 'Substituído por',
        who: 'O nome mostrado no chat.',
        character: 'O nome do personagem no modelo de rolagem, ou o nome mostrado no chat.',
        player: 'O nome de exibição do jogador.',
        template: 'O nome do modelo de rolagem.',
        total: 'O total da rolagem que correspondeu (ou da primeira rolagem).',
        natural: 'O d20 natural (ou o primeiro dado) dessa rolagem.',
        result: 'crit, fumble, success ou fail, quando algum foi pedido.',
        expression: 'A expressão da rolagem, como 1d20+5.',
        table: 'Resultados de tabelas roláveis dessa rolagem.',
        listener: 'O nome do ouvinte.',
        field:
          'Um campo do modelo de rolagem, como ${field:rname} (rolagens em linha aparecem como seus totais).',
      },
      running: {
        heading: 'Como os comandos são executados',
        points: [
          'Cada linha é enviada como uma mensagem de chat separada, exceto um bloco {{ … }} distribuído em várias linhas (um modelo de rolagem ou um script do ScriptCards), que é mantido junto.',
          'Os comandos são enviados como CRL, ou como o personagem que rolou, conforme definido em cada ouvinte ou nas configurações. Outros mods veem os comandos enviados pelo CRL como vindos da API.',
          'Os comandos podem usar rolagens em linha, modelos de rolagem, @{Character|attribute} e %{Character|ability}. Referências ao token selecionado (@{selected|…}) e consultas (?{…}) não funcionam, porque não há ninguém a quem perguntar.',
          'Os ouvintes são verificados em ordem. Um ouvinte com Parar após este impede que os ouvintes seguintes sejam acionados pela mesma mensagem.',
          'A recarga impede que um ouvinte seja acionado de novo durante esse número de segundos.',
          'O CRL ignora as próprias mensagens. Se mesmo assim um ouvinte for acionado mais de 20 vezes em 10 segundos, ele é desligado e o mestre é avisado.',
        ],
      },
      inspector: {
        heading: 'O inspetor',
        points: [
          'Clique em Inspecionar próxima mensagem e faça a rolagem. O CRL sussurra o que viu: o tipo de mensagem, o falante, o personagem, o modelo e seus campos, cada rolagem com seus dados, o texto em que os ouvintes procuram e por que cada ouvinte foi ou não acionado.',
          'Use-o para descobrir o nome do modelo de uma ficha, ou para ver o que uma ficha Beacon (como a de D&D 2024) envia.',
          'As fichas Beacon publicam cartões de rolagem em vez de modelos de rolagem. O CRL os lê: o modelo é a primeira classe do cartão (dnd-2024 para D&D 2024), o personagem, o título (como Teste de Destreza) e a subcategoria viram campos, e cada rolagem do detalhamento é uma rolagem, então as verificações de crítico, falha crítica, total e dado natural funcionam.',
        ],
      },
      settings: {
        heading: 'Configurações',
        intro:
          'Altere-as com !crl config ou com o botão Configurações. Algumas também podem ser definidas nas opções One-Click do mod.',
        colKey: 'Configuração',
        colName: 'Nome',
        colDesc: 'Descrição',
      },
      storage: {
        heading: 'Onde os ouvintes ficam guardados',
        body: 'Cada ouvinte é uma habilidade do personagem arquivado "{character}". A habilidade guarda os comandos, então você pode editá-los no Diário com o editor de macros completo. A descrição dela guarda as regras do ouvinte, o que também faz os ouvintes sobreviverem à cópia do jogo. Excluir uma habilidade exclui o ouvinte dela; uma habilidade adicionada à mão aparece desligada no menu.',
      },
      upgrading: {
        heading: 'Atualização da versão 1',
        points: [
          'Os ouvintes da versão 1 são convertidos na primeira inicialização e mantêm seus comandos.',
          'Texto com apenas caracteres comuns vira texto simples e agora ignora maiúsculas e minúsculas. Texto com símbolos de expressão regular continua sendo uma expressão regular.',
          'Ouvintes com resultado de rolagem mas sem ## falhavam com "not parseable"; agora eles verificam todas as rolagens da mensagem.',
          'Falha agora significa uma rolagem com alvo sem nenhum sucesso; uma rolagem exatamente no alvo é um sucesso.',
          'Os comandos da versão 1 continuam funcionando:',
        ],
        colV1: 'Versão 1',
        colV2: 'Versão 2',
      },
      troubleshooting: {
        heading: 'Solução de problemas',
        points: [
          'Nada acontece: confira se a Escuta e o ouvinte estão ligados e use o inspetor para ver qual filtro falha.',
          'As rolagens de uma ficha não são reconhecidas: inspecione uma; o nome do modelo e os campos que ela mostra são o que usar nos filtros.',
          'Fichas Beacon (como a de D&D 2024) precisam do sandbox Experimental de mods para que os mods vejam suas rolagens.',
          'Comandos que usam @{…} ou %{…} os perdem quando digitados em !crl; nesse caso, edite a habilidade no Diário.',
          'Dados de dano contados como críticos: defina Dados verificados como d20.',
          'Os erros são gravados no console da API com o prefixo "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Escolha um idioma com !crl config language ou com a opção Language do One-Click. Idiomas disponíveis:',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nome nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versão 2 de',
        support: 'Relate problemas nos fóruns do Roll20 ou no repositório do GitHub.',
        wiki: 'Página da wiki da versão 1',
      },
    },
  };

  const TRANSLATION$4 = {
    titles: {
      ready: 'Customizable Roll Listener готов к работе.',
      settings: 'Настройки CRL',
      languages: 'Выбор языка',
      help: 'Команды CRL',
      confirm: 'Подтвердите действие',
      inspect: 'Инспектор CRL',
      listener: 'Слушатель: {name}',
      listenerCommands: 'Команды: {name}',
    },
    menu: {
      listening: 'Прослушивание',
      listeners: 'Слушатели (проверяются в этом порядке)',
      noListeners: 'Слушателей пока нет. Нажмите «Новый слушатель», чтобы создать его.',
      noCommands: 'Команд пока нет.',
      commandsHint:
        'При вводе команд в чате разделяйте строки символами \\\\. Для ссылок @{...} или %{...} редактируйте способность в Журнале: чат подставляет их значения раньше, чем их увидит CRL.',
    },
    buttons: {
      back: 'Назад',
      change: 'Изменить',
      confirmDelete: 'Да, удалить',
      delete: 'Удалить',
      edit: 'Изменить',
      help: 'Справка',
      inspect: 'Проверить следующее сообщение',
      inspectOff: 'Остановить проверку',
      new: 'Новый слушатель',
      openJournal: 'Открыть в Журнале',
      rebuildJournal: 'Пересоздать раздаточные материалы',
      rename: 'Переименовать',
      setCommands: 'Задать команды',
      settings: 'Настройки',
      test: 'Тест',
      enable: 'Включить',
      disable: 'Выключить',
      menu: 'Слушатели',
      turnOn: 'Прослушивание вкл.',
      turnOff: 'Прослушивание выкл.',
    },
    prompts: {
      newName: 'Имя нового слушателя',
      name: 'Новое имя',
      target: 'Имя слушателя',
      commands: 'Команды — строки разделяются двумя обратными косыми чертами',
      templates:
        'Шаблоны бросков через пробел — none, если без шаблона — пусто, если любой — инспектор показывает шаблон броска',
      types: 'Типы сообщений через пробел — пусто, если любой, кроме api',
      text: 'Искомый текст — см. раздаточный материал «Справка» — пусто, если любой',
      regex: 'Как читать текст',
      who: 'Имена отправителей или персонажей через запятую — пусто, если любые',
      players: 'Имена игроков через запятую — пусто, если любые',
      results: 'Результат броска',
      total:
        'Сумма броска, например 15 или 19-20 — см. раздаточный материал «Справка» — пусто, если любая',
      natural: 'Натуральный результат кубика, например 20 или 1-2 — пусто, если любой',
      dice: 'Какие кубики проверяются',
      cooldown: 'Сколько секунд ждать до повторного срабатывания — 0, если без перезарядки',
      speaker: 'Отправлять команды от имени',
    },
    choices: {
      critOrFumble: 'Критический успех или провал',
    },
    values: {
      on: 'Вкл.',
      off: 'Выкл.',
      none: 'Нет',
      any: 'Любой',
      allButApi: 'Любой (кроме команд API)',
      plain: 'Обычный текст',
      regex: 'Регулярное выражение',
      diceAuto: 'Авто (d20, если брошен)',
      diceAny: 'Любой кубик',
      seconds: '{seconds} с',
      speaker: {
        default: 'Как в настройках',
        crl: 'CRL',
        roller: 'Бросающий',
      },
    },
    results: {
      crit: 'Критический успех',
      fumble: 'Критический провал',
      success: 'Успех',
      fail: 'Провал',
    },
    fields: {
      enabled: 'Включён',
      templates: 'Шаблоны бросков',
      types: 'Типы сообщений',
      text: 'Текст',
      regex: 'Текст как',
      who: 'Отправители / персонажи',
      players: 'Игроки',
      results: 'Результат броска',
      total: 'Сумма броска',
      natural: 'Натуральный результат',
      dice: 'Проверяемые кубики',
      cooldown: 'Перезарядка',
      stop: 'Остановиться на этом',
      speaker: 'От имени',
      commands: 'Команды',
    },
    settings: {
      enabled: {
        label: 'Прослушивание',
        desc: 'Включает или выключает сразу всех слушателей.',
      },
      speaker: {
        label: 'Отправлять команды от имени',
        desc: 'От чьего имени отправляются команды слушателей, если в слушателе не указано иное: CRL или персонаж (или игрок), чьё сообщение вызвало срабатывание.',
      },
      listenToMods: {
        label: 'Слушать другие моды',
        desc: 'Могут ли сообщения других модов вызывать срабатывание слушателей. На собственные сообщения CRL никогда не реагирует.',
      },
      language: {
        label: 'Язык',
        desc: 'Язык меню, сообщений и раздаточных материалов.',
      },
    },
    inspect: {
      type: 'Тип',
      who: 'Отправитель',
      character: 'Персонаж',
      player: 'Игрок',
      template: 'Шаблон броска',
      keys: 'Свойства сообщения',
      extras: 'Дополнительные данные сообщения',
      fields: 'Поля шаблона',
      rolls: 'Броски',
      dice: 'кубики',
      table: 'таблица',
      target: 'есть порог успеха',
      crit: 'крит. успех',
      fumble: 'крит. провал',
      text: 'Текст (как его видят слушатели)',
      raw: 'Исходное содержимое',
      listeners: 'Слушатели',
      matched: 'сработает: {result}',
      reasons: {
        disabled: 'выключен',
        type: 'тип сообщения не совпадает',
        template: 'шаблон броска не совпадает',
        who: 'отправитель или персонаж не совпадает',
        player: 'игрок не совпадает',
        text: 'текст не найден',
        roll: 'ни один бросок не подходит под условия броска',
      },
    },
    messages: {
      upgraded:
        'Выполнено обновление с версии 1. Преобразовано слушателей: {count}, их команды сохранены.',
      restored: 'Восстановлено слушателей из персонажа-хранилища: {count}.',
      adopted:
        'У персонажа-хранилища найдено способностей без правил слушателя: {count}. Они добавлены выключенными; настройте их через меню.',
      removed: 'Удалено слушателей, чья способность была удалена: {count}.',
      listeningOff: 'Прослушивание выключено. Введите !crl on, чтобы включить его.',
      readyHint:
        'Слушателей: {count}. Введите !crl, чтобы открыть меню, или !crl help, чтобы увидеть все команды.',
      loopStopped:
        'Слушатель «{name}» срабатывал слишком часто за короткое время — вероятно, его команды снова его запускают, — поэтому он выключен.',
      noCommands: 'У слушателя «{name}» нет команд для выполнения.',
      tested: 'Выполнены команды слушателя «{name}» (сообщений: {count}).',
      confirmDelete: 'Удалить слушателя «{name}» и его команды? Это действие нельзя отменить.',
      deleted: 'Слушатель «{name}» удалён.',
      inspectOn: 'Следующее сообщение в чате будет проверено, а результат придёт вам шёпотом.',
      inspectOff: 'Инспектор выключен.',
      journalRebuilt: 'Раздаточные материалы «{help}» и «{deck}» пересозданы.',
    },
    errors: {
      gmOnly: 'Команды Customizable Roll Listener доступны только мастеру.',
      unexpected: 'Что-то пошло не так: {message}',
      unknownCommand: 'Неизвестная команда «{command}».',
      badOption: 'Неизвестный параметр --{option}.',
      notFound: 'Слушателя с именем «{name}» нет.',
      nameRequired: 'Укажите имя слушателя.',
      nameInvalid: 'Имя «{name}» использовать нельзя.',
      nameTaken: 'Слушатель с именем «{name}» уже существует.',
      badOnOff: 'Значение «{value}» недопустимо для --{option}.',
      badType: 'Неизвестные типы сообщений: {value}.',
      badRegex: 'Регулярное выражение «{term}» недопустимо: {error}',
      tooManyTerms: 'Слушатель может искать не более {max} фрагментов текста.',
      badResult: 'Неизвестные результаты броска: {value}.',
      badComparison: 'Значение «{value}» недопустимо для --{option}.',
      badDice: 'Значение «{value}» недопустимо для --dice.',
      badCooldown: 'Значение «{value}» недопустимо для --cooldown.',
      badSpeaker: 'Значение «{value}» недопустимо для --speaker.',
      noStore: 'Не удалось создать персонажа-хранилище.',
      badSetting: 'Неизвестная настройка «{key}».',
      badSettingValue: 'Значение «{value}» недопустимо для {key}.',
    },
    hints: {
      gmOnly: 'Попросите мастера настроить для вас слушателей.',
      unknownCommand: 'Введите !crl help, чтобы увидеть все команды.',
      badOption:
        'Доступные параметры: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name и --commands.',
      notFound: 'Введите !crl, чтобы увидеть список слушателей.',
      nameInvalid:
        'Не более {max} символов, без следующих: | { } [ ] \\ @ % # ? ~ и «--»; имя не должно начинаться с «-».',
      badOnOff: 'Используйте on или off.',
      badType: 'Типы сообщений: {types}.',
      badResult: 'Используйте crit, fumble, success или fail.',
      badComparison:
        'Используйте число, сравнение, например >=15 или <3, или диапазон, например 19-20.',
      badDice: 'Используйте auto, any или размер кубика, например 20 или d20.',
      badCooldown: 'Используйте целое число секунд от 0 до 3600.',
      badSpeaker: 'Используйте default, crl или roller.',
      badSetting: 'Настройки: {keys}.',
      noStore: 'Проверьте консоль API на наличие ошибок, затем перезапустите песочницу.',
    },
    help: {
      menu: 'Показать список слушателей.',
      new: 'Создать слушателя. Параметры можно указать сразу.',
      show: 'Показать слушателя и его настройки с кнопками для их изменения.',
      edit: 'Изменить слушателя. Оставьте значение пустым (или укажите -), чтобы очистить его.',
      commands:
        'Заменить команды слушателя. Используется всё, что идёт после --commands, поэтому ставьте его последним.',
      enable: 'Включить или выключить слушателя.',
      move: 'Переместить слушателя выше или ниже в порядке проверки.',
      test: 'Выполнить команды слушателя сейчас, как будто выпала натуральная 20.',
      delete: 'Удалить слушателя и его команды (с подтверждением).',
      inspect:
        'Прислать шёпотом разбор следующего сообщения в чате и список слушателей, которые на него сработают.',
      inspectOff: 'Перестать ждать сообщение для проверки.',
      onOff: 'Включить или выключить всё прослушивание.',
      config: 'Показать или изменить общие настройки.',
      journal: 'Пересоздать раздаточные материалы «Справка» и «Панель команд».',
      help: 'Показать этот список.',
      optionsTitle: 'Параметры',
      options:
        'Параметры: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name и --commands. Вместо ID можно указывать имена.',
      placeholders:
        'В командах можно использовать ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} и ${field:name}.',
      handouts:
        'В раздаточном материале «{help}» всё подробно объяснено, а в «{deck}» есть кнопки.',
    },
    store: {
      bio: 'Этот персонаж принадлежит моду Customizable Roll Listener. Каждая способность — это один слушатель: в самой способности хранятся выполняемые команды, а в её описании — правила слушателя.',
      bioHelp:
        'Здесь можно редактировать команды. Правила меняются через !crl или в раздаточном материале «Панель команд». Удаление способности удаляет и её слушателя.',
    },
    deck: {
      subtitle: 'Панель команд',
      listeners: 'Слушатели',
      listenersDesc: 'Просмотр, создание, изменение и тестирование слушателей.',
      listening: 'Прослушивание',
      listeningDesc: 'Включить или выключить сразу всех слушателей.',
      tools: 'Инструменты',
      toolsDesc:
        'Проверить сообщение в чате, изменить настройки, пересоздать раздаточные материалы или открыть справку.',
      footer:
        'Все команды доступны только мастеру. Подробности — в раздаточном материале «{help}».',
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Слушай кубики — слушай действие',
      footer: 'Кнопки для всех команд — в раздаточном материале «{deck}».',
      overview: {
        heading: 'Обзор',
        body: 'Customizable Roll Listener (CRL) следит за чатом и выполняет выбранные вами команды, когда сообщение подходит под слушателя. Слушатель может учитывать шаблон броска, текст, отправителя сообщения и броски в нём: критические успехи, критические провалы, успехи, провалы, суммы и натуральные результаты кубиков. Командой может быть всё, что можно ввести в чат, включая команды других модов, поэтому CRL может проигрывать звуки, бросать по таблицам, отправлять эмоции, ставить маркеры состояний и многое другое.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        steps: [
          'Введите !crl в чате (или нажмите «Слушатели» в раздаточном материале «Панель команд»).',
          'Нажмите «Новый слушатель» и задайте имя, например «Звук крита».',
          'Нажмите «Изменить» рядом с пунктом «Результат броска» и выберите «Критический успех».',
          'Нажмите «Задать команды» и введите, что нужно выполнить, например !roll20AM --audio,play|Crit.',
          'Нажмите «Тест», чтобы проверить команды, затем сделайте бросок атаки. Если слушатель не срабатывает, воспользуйтесь кнопкой «Проверить следующее сообщение».',
        ],
      },
      examples: {
        heading: 'Примеры',
        points: [
          'Звук при любом критическом попадании, с любого листа: --results crit',
          'Таблица критических провалов при натуральной 1 в шаблоне атаки D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Реакция на результат таблицы бросков: --text Бой',
          'Только для одного персонажа: --who Алиса',
          'Сумма 20 или больше в первом встроенном броске проверки «Сила»: --text Сила && ## --total >=20',
        ],
        code: [
          '!crl new Звук крита --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Критпровал --natural 1 --dice 20 --commands /em проваливается! \\\\ /roll 1t[Fumbles]',
          '!crl new Рассказчик --results crit fumble --speaker crl --commands /desc ${who} выбрасывает ${result}!',
        ],
      },
      matching: {
        heading: 'Что проверяет слушатель',
        points: [
          'Слушатель срабатывает, когда совпадают все заданные в нём фильтры. Пустой фильтр подходит подо всё.',
          'Шаблоны бросков: имя шаблона, например atkdmg или simple. «none» подходит для сообщений без шаблона. Если указано несколько имён, подходит любое из них.',
          'Типы сообщений: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (листы Beacon) и api. Если поле пустое, проверяются все типы, кроме команд api.',
          'Текст: один или несколько фрагментов текста через &&, которые должны встретиться все. Регистр букв не учитывается. Текст ищется также в суммах бросков и результатах таблиц бросков.',
          '## в тексте обозначает встроенный бросок; тогда проверки броска смотрят только на найденные там броски. Без ## проверяется каждый бросок в сообщении.',
          'Вместо обычного текста можно использовать регулярное выражение (--regex on).',
          'Отправители / персонажи: имя, показанное в чате, или имя персонажа в шаблоне броска. Игроки: отображаемое имя игрока.',
        ],
      },
      templates: {
        heading: 'Имена шаблонов бросков',
        points: [
          'Шаблон броска — это оформление карточек бросков, которое использует лист. Его имя — часть после template: в макросе, то есть &{template:atkdmg} — это шаблон atkdmg. У каждого листа свои имена.',
          'Быстрее всего узнать имя так: нажмите «Проверить следующее сообщение», сделайте бросок с листа и прочитайте строку «Шаблон броска» в ответе CRL.',
          'Имя также можно найти в макросе кнопки листа или в исходном коде листа на GitHub, где каждый шаблон — это <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Шаблоны популярных листов:',
        ],
        colSheet: 'Лист',
        colNames: 'Имена шаблонов',
        links: 'Подробнее о шаблонах бросков:',
        builtIn: 'Roll20: встроенные шаблоны бросков',
        dnd5e2014: 'Roll20: шаблоны бросков D&D 5e (2014)',
        sheets: 'Исходный код листов персонажей Roll20',
      },
      rolls: {
        heading: 'Проверки броска',
        points: [
          'Результат броска: критический успех (максимальная грань кубика или диапазон cs), критический провал (1 или диапазон cf), успех (хотя бы один кубик достиг порога, например 1d20>15), провал (бросок с порогом без единого успеха). Если указано несколько результатов, подходит любой.',
          'Сумма броска: число, сравнение, например >=15, или диапазон, например 19-20.',
          'Натуральный результат: грань, выпавшая на кубике, например 20 или <=2.',
          'Проверяемые кубики: auto смотрит только на d20, если они были брошены, поэтому максимальная грань на кубиках урона не считается критом. Чтобы это изменить, выберите любой кубик или размер, например d100.',
          'Отброшенные кубики (преимущество и помеха) и переброшенные кубики не учитываются.',
          'Лист D&D 5E by Roll20 (2014) бросает преимущество и помеху как два отдельных броска d20 (r1 и r2), поэтому CRL проверяет оба: при преимуществе 1 на меньшем кубике всё равно считается критическим провалом, а при помехе 20 на большем кубике всё равно считается критическим успехом.',
          'Слушатель срабатывает, когда хотя бы один бросок проходит все проверки броска.',
        ],
      },
      commands: {
        heading: 'Команды чата',
        intro: 'Все команды доступны только мастеру. Слушателя можно указать по имени или по ID.',
        colCommand: 'Команда',
        colDesc: 'Что делает',
      },
      options: {
        heading: 'Параметры слушателя',
        intro:
          'Добавляйте их к !crl new или !crl edit. Чтобы очистить значение, оставьте его пустым или укажите -. --commands должен идти последним.',
        colOption: 'Параметр',
        colDesc: 'Значение',
        templates:
          'Имена шаблонов бросков через пробел. none — без шаблона. См. «Имена шаблонов бросков» выше.',
        types: 'Типы сообщений через пробел: {types}.',
        text: 'Искомый текст. Фрагменты разделяются &&. ## обозначает встроенный бросок.',
        regex: 'on — читать текст как регулярные выражения, off — как обычный текст.',
        who: 'Имена отправителей или персонажей через запятую.',
        players: 'Отображаемые имена игроков через запятую.',
        results: 'crit, fumble, success и/или fail.',
        total: 'Сумма броска: 15, >=15, <5 или 19-20.',
        natural: 'Натуральный результат кубика: 20, <=2 или 19-20.',
        dice: 'auto, any или размер кубика, например 20.',
        cooldown: 'Сколько секунд должно пройти до повторного срабатывания слушателя.',
        stop: 'on — не проверять следующих слушателей, если сработал этот.',
        speaker: 'default, crl или roller.',
        enabled: 'on или off.',
        name: 'Переименовывает слушателя.',
        commands: 'Выполняемые команды. Строки разделяются символами \\\\.',
      },
      placeholders: {
        heading: 'Подстановки',
        intro: 'Заменяются в командах слушателя при его срабатывании.',
        colName: 'Подстановка',
        colDesc: 'Заменяется на',
        who: 'Имя, показанное в чате.',
        character: 'Имя персонажа из шаблона броска или имя, показанное в чате.',
        player: 'Отображаемое имя игрока.',
        template: 'Имя шаблона броска.',
        total: 'Сумма подошедшего броска (или первого броска).',
        natural: 'Натуральный результат d20 (или первого кубика) этого броска.',
        result: 'crit, fumble, success или fail, если такой результат был задан.',
        expression: 'Выражение броска, например 1d20+5.',
        table: 'Результаты таблиц бросков в этом броске.',
        listener: 'Имя слушателя.',
        field:
          'Поле шаблона броска, например ${field:rname} (встроенные броски показываются как их суммы).',
      },
      running: {
        heading: 'Как выполняются команды',
        points: [
          'Каждая строка отправляется отдельным сообщением в чат; исключение — блок {{ … }} на несколько строк (шаблон броска или скрипт ScriptCards), он отправляется целиком.',
          'Команды отправляются от имени CRL или бросавшего персонажа — как задано в слушателе или в настройках. Другие моды видят команды, отправленные CRL, как пришедшие от API.',
          'В командах можно использовать встроенные броски, шаблоны бросков, @{Character|attribute} и %{Character|ability}. Ссылки на выбранный токен (@{selected|…}) и запросы (?{…}) не работают, потому что спрашивать некого.',
          'Слушатели проверяются по порядку. Слушатель с включённым «Остановиться на этом» не даёт следующим слушателям сработать на то же сообщение.',
          'Перезарядка не даёт слушателю сработать повторно в течение указанного числа секунд.',
          'CRL не реагирует на собственные сообщения. Если слушатель всё же срабатывает больше 20 раз за 10 секунд, он выключается, а мастер получает уведомление.',
        ],
      },
      inspector: {
        heading: 'Инспектор',
        points: [
          'Нажмите «Проверить следующее сообщение», затем сделайте бросок. CRL шёпотом сообщит, что увидел: тип сообщения, отправителя, персонажа, шаблон и его поля, каждый бросок с кубиками, текст, в котором ищут слушатели, и почему каждый слушатель сработал или нет.',
          'Так можно узнать имя шаблона листа или посмотреть, что отправляет лист Beacon (например, D&D 2024).',
          'Листы Beacon публикуют карточки бросков вместо шаблонов бросков. CRL их читает: шаблоном считается первый класс карточки (dnd-2024 для D&D 2024), персонаж, заголовок (например, «Проверка Ловкости») и подкатегория становятся полями, а каждый бросок из расшифровки — отдельным броском, так что проверки критического успеха, критического провала, суммы и натурального результата работают.',
        ],
      },
      settings: {
        heading: 'Настройки',
        intro:
          'Меняются командой !crl config или кнопкой «Настройки». Некоторые также можно задать в параметрах One-Click мода.',
        colKey: 'Настройка',
        colName: 'Название',
        colDesc: 'Описание',
      },
      storage: {
        heading: 'Где хранятся слушатели',
        body: 'Каждый слушатель — это способность архивного персонажа «{character}». В способности хранятся команды, поэтому их можно редактировать в Журнале в полноценном редакторе макросов. В её описании хранятся правила слушателя, благодаря чему слушатели сохраняются и при копировании игры. Удаление способности удаляет её слушателя; способность, добавленная вручную, появляется в меню выключенной.',
      },
      upgrading: {
        heading: 'Обновление с версии 1',
        points: [
          'Слушатели версии 1 преобразуются при первом запуске и сохраняют свои команды.',
          'Текст из одних обычных символов становится обычным текстом и теперь ищется без учёта регистра. Текст с символами регулярных выражений остаётся регулярным выражением.',
          'Слушатели с результатом броска, но без ##, раньше завершались ошибкой «not parseable»; теперь они проверяют каждый бросок в сообщении.',
          'fail теперь означает бросок с порогом без единого успеха; бросок, ровно достигший порога, — успех.',
          'Команды версии 1 по-прежнему работают:',
        ],
        colV1: 'Версия 1',
        colV2: 'Версия 2',
      },
      troubleshooting: {
        heading: 'Решение проблем',
        points: [
          'Ничего не происходит: убедитесь, что прослушивание и сам слушатель включены, затем с помощью инспектора посмотрите, какой фильтр не проходит.',
          'Броски листа не распознаются: проверьте один из них инспектором; фильтровать нужно по показанному имени шаблона и полям.',
          'Чтобы моды видели броски листов Beacon (например, D&D 2024), нужна песочница Experimental Mod.',
          'Команды с @{…} или %{…} теряют их при вводе через !crl; редактируйте способность в Журнале.',
          'Кубики урона считаются критами: установите «Проверяемые кубики» на d20.',
          'Ошибки записываются в консоль API с префиксом «Customizable Roll Listener».',
        ],
      },
      languages: {
        heading: 'Языки',
        body: 'Выберите язык командой !crl config language или в параметре One-Click «Language». Поддерживаемые языки:',
        colCode: 'Код',
        colName: 'Язык',
        colNative: 'Самоназвание',
      },
      credits: {
        heading: 'Авторы',
        original: 'Автор оригинального мода:',
        maintainer: 'Версия 2:',
        support: 'Сообщайте о проблемах на форумах Roll20 или в репозитории GitHub.',
        wiki: 'Вики-страница версии 1',
      },
    },
  };

  const TRANSLATION$3 = {
    titles: {
      ready: 'Customizable Roll Listener está listo.',
      settings: 'Ajustes de CRL',
      languages: 'Elige un idioma',
      help: 'Comandos de CRL',
      confirm: 'Confirma, por favor',
      inspect: 'Inspector de CRL',
      listener: 'Oyente: {name}',
      listenerCommands: 'Comandos: {name}',
    },
    menu: {
      listening: 'Escucha',
      listeners: 'Oyentes (se comprueban en este orden)',
      noListeners: 'Aún no hay oyentes. Haz clic en Nuevo oyente para crear uno.',
      noCommands: 'Aún no hay comandos.',
      commandsHint:
        'Separa las líneas con \\\\ al escribir comandos en el chat. Para referencias @{...} o %{...}, edita la habilidad en el Diario, porque el chat las sustituye antes de que CRL las vea.',
    },
    buttons: {
      back: 'Atrás',
      change: 'Cambiar',
      confirmDelete: 'Sí, eliminar',
      delete: 'Eliminar',
      edit: 'Editar',
      help: 'Ayuda',
      inspect: 'Inspeccionar siguiente mensaje',
      inspectOff: 'Dejar de inspeccionar',
      new: 'Nuevo oyente',
      openJournal: 'Abrir en el Diario',
      rebuildJournal: 'Regenerar folletos',
      rename: 'Renombrar',
      setCommands: 'Definir comandos',
      settings: 'Ajustes',
      test: 'Probar',
      enable: 'Activar',
      disable: 'Desactivar',
      menu: 'Oyentes',
      turnOn: 'Activar escucha',
      turnOff: 'Desactivar escucha',
    },
    prompts: {
      newName: 'Nombre del nuevo oyente',
      name: 'Nuevo nombre',
      target: 'Nombre del oyente',
      commands: 'Comandos: separa las líneas con dos barras invertidas',
      templates:
        'Plantillas de tirada separadas por espacios - none para sin plantilla - vacío para cualquiera - Inspeccionar muestra la plantilla de una tirada',
      types: 'Tipos de mensaje separados por espacios - vacío para cualquiera excepto api',
      text: 'Texto que buscar - consulta el folleto Help - vacío para cualquiera',
      regex: 'Cómo interpretar el texto',
      who: 'Nombres de hablantes o personajes separados por comas - vacío para cualquiera',
      players: 'Nombres de jugadores separados por comas - vacío para cualquiera',
      results: 'Resultado de la tirada',
      total:
        'Total de la tirada, como 15 o 19-20 - consulta el folleto Help - vacío para cualquiera',
      natural: 'Resultado natural del dado, como 20 o 1-2 - vacío para cualquiera',
      dice: 'Qué dados miran las comprobaciones',
      cooldown: 'Segundos de espera antes de volver a activarse - 0 para ninguno',
      speaker: 'Enviar comandos como',
    },
    choices: {
      critOrFumble: 'Crítico o pifia',
    },
    values: {
      on: 'Activado',
      off: 'Desactivado',
      none: 'Ninguno',
      any: 'Cualquiera',
      allButApi: 'Cualquiera (excepto comandos de API)',
      plain: 'Texto normal',
      regex: 'Expresión regular',
      diceAuto: 'Auto (d20 si se tiran)',
      diceAny: 'Cualquier dado',
      seconds: '{seconds} s',
      speaker: {
        default: 'Ajuste predeterminado',
        crl: 'CRL',
        roller: 'Quien tira',
      },
    },
    results: {
      crit: 'Crítico',
      fumble: 'Pifia',
      success: 'Éxito',
      fail: 'Fallo',
    },
    fields: {
      enabled: 'Activo',
      templates: 'Plantillas de tirada',
      types: 'Tipos de mensaje',
      text: 'Texto',
      regex: 'El texto es',
      who: 'Hablantes / personajes',
      players: 'Jugadores',
      results: 'Resultado de la tirada',
      total: 'Total de la tirada',
      natural: 'Dado natural',
      dice: 'Dados comprobados',
      cooldown: 'Enfriamiento',
      stop: 'Detenerse tras este',
      speaker: 'Enviar como',
      commands: 'Comandos',
    },
    settings: {
      enabled: {
        label: 'Escucha',
        desc: 'Activa o desactiva todos los oyentes a la vez.',
      },
      speaker: {
        label: 'Enviar comandos como',
        desc: 'Como quién se envían los comandos de los oyentes, salvo que un oyente indique otra cosa: CRL, o el personaje (o jugador) cuyo mensaje lo activó.',
      },
      listenToMods: {
        label: 'Escuchar a otros mods',
        desc: 'Si los mensajes de chat enviados por otros mods pueden activar oyentes. CRL nunca reacciona a sus propios mensajes.',
      },
      language: {
        label: 'Idioma',
        desc: 'Idioma de los menús, mensajes y folletos.',
      },
    },
    inspect: {
      type: 'Tipo',
      who: 'Hablante',
      character: 'Personaje',
      player: 'Jugador',
      template: 'Plantilla de tirada',
      keys: 'Propiedades del mensaje',
      extras: 'Datos adicionales del mensaje',
      fields: 'Campos de la plantilla',
      rolls: 'Tiradas',
      dice: 'dados',
      table: 'tabla',
      target: 'tiene un objetivo de éxito',
      crit: 'crítico',
      fumble: 'pifia',
      text: 'Texto (tal como lo leen los oyentes)',
      raw: 'Contenido sin procesar',
      listeners: 'Oyentes',
      matched: 'se activaría {result}',
      reasons: {
        disabled: 'desactivado',
        type: 'el tipo de mensaje no coincide',
        template: 'la plantilla de tirada no coincide',
        who: 'el hablante o el personaje no coincide',
        player: 'el jugador no coincide',
        text: 'texto no encontrado',
        roll: 'ninguna tirada cumple las condiciones de tirada',
      },
    },
    messages: {
      upgraded:
        'Actualizado desde la versión 1. Se convirtieron {count} oyente(s) y se conservaron sus comandos.',
      restored: 'Se restauraron {count} oyente(s) desde el personaje de almacenamiento.',
      adopted:
        'Se encontraron {count} habilidad(es) en el personaje de almacenamiento sin reglas de oyente. Se han añadido desactivadas; configúralas desde el menú.',
      removed: 'Se eliminaron {count} oyente(s) cuya habilidad se había borrado.',
      listeningOff: 'La escucha está desactivada. Escribe !crl on para activarla.',
      readyHint:
        '{count} oyente(s). Escribe !crl para ver el menú o !crl help para ver todos los comandos.',
      loopStopped:
        'El oyente "{name}" se activó demasiadas veces en poco tiempo, probablemente porque sus comandos lo vuelven a activar, así que se ha desactivado.',
      noCommands: 'El oyente "{name}" no tiene comandos que ejecutar.',
      tested: 'Se ejecutaron los comandos de "{name}" ({count} mensaje(s)).',
      confirmDelete: '¿Eliminar el oyente "{name}" y sus comandos? No se puede deshacer.',
      deleted: 'Se eliminó el oyente "{name}".',
      inspectOn: 'Se inspeccionará el siguiente mensaje del chat y se te susurrará el resultado.',
      inspectOff: 'Se ha desactivado el inspector.',
      journalRebuilt: 'Se regeneraron los folletos "{help}" y "{deck}".',
    },
    errors: {
      gmOnly: 'Solo un DJ puede usar los comandos de Customizable Roll Listener.',
      unexpected: 'Algo ha fallado: {message}',
      unknownCommand: 'Comando desconocido "{command}".',
      badOption: 'Opción desconocida --{option}.',
      notFound: 'No hay ningún oyente llamado "{name}".',
      nameRequired: 'Indica el nombre de un oyente.',
      nameInvalid: 'No se puede usar el nombre "{name}".',
      nameTaken: 'Ya hay un oyente llamado "{name}".',
      badOnOff: 'El valor "{value}" no es válido para --{option}.',
      badType: 'Tipo(s) de mensaje desconocido(s): {value}.',
      badRegex: 'La expresión regular "{term}" no es válida: {error}',
      tooManyTerms: 'Un oyente puede buscar como máximo {max} fragmentos de texto.',
      badResult: 'Resultado(s) de tirada desconocido(s): {value}.',
      badComparison: 'El valor "{value}" no es válido para --{option}.',
      badDice: 'El valor "{value}" no es válido para --dice.',
      badCooldown: 'El valor "{value}" no es válido para --cooldown.',
      badSpeaker: 'El valor "{value}" no es válido para --speaker.',
      noStore: 'No se pudo crear el personaje de almacenamiento.',
      badSetting: 'Ajuste desconocido "{key}".',
      badSettingValue: 'El valor "{value}" no es válido para {key}.',
    },
    hints: {
      gmOnly: 'Pide a tu DJ que configure los oyentes por ti.',
      unknownCommand: 'Escribe !crl help para ver todos los comandos.',
      badOption:
        'Las opciones son --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name y --commands.',
      notFound: 'Escribe !crl para ver la lista de oyentes.',
      nameInvalid:
        'Usa hasta {max} caracteres, sin estos: | { } [ ] \\ @ % # ? ~ ni "--", y no empieces por "-".',
      badOnOff: 'Usa on u off.',
      badType: 'Los tipos de mensaje son: {types}.',
      badResult: 'Usa crit, fumble, success o fail.',
      badComparison: 'Usa un número, una comparación como >=15 o <3, o un rango como 19-20.',
      badDice: 'Usa auto, any o un tamaño de dado como 20 o d20.',
      badCooldown: 'Usa un número entero de segundos entre 0 y 3600.',
      badSpeaker: 'Usa default, crl o roller.',
      badSetting: 'Los ajustes son: {keys}.',
      noStore: 'Revisa si hay errores en la consola de la API y reinicia el sandbox.',
    },
    help: {
      menu: 'Muestra la lista de oyentes.',
      new: 'Crea un oyente. Puedes añadir opciones directamente.',
      show: 'Muestra un oyente y sus ajustes, con botones para cambiarlos.',
      edit: 'Cambia un oyente. Deja un valor vacío (o usa -) para borrarlo.',
      commands:
        'Sustituye los comandos de un oyente. Se usa todo lo que va después de --commands, así que ponlo al final.',
      enable: 'Activa o desactiva un oyente.',
      move: 'Adelanta o retrasa un oyente en el orden en que se comprueban los oyentes.',
      test: 'Ejecuta ahora los comandos de un oyente, como si se hubiera sacado un 20 natural.',
      delete: 'Elimina un oyente y sus comandos (pide confirmación).',
      inspect: 'Susurra un desglose del siguiente mensaje del chat y qué oyentes activaría.',
      inspectOff: 'Deja de esperar un mensaje que inspeccionar.',
      onOff: 'Activa o desactiva toda la escucha.',
      config: 'Muestra o cambia los ajustes globales.',
      journal: 'Regenera los folletos Help y Command Deck.',
      help: 'Muestra esta lista.',
      optionsTitle: 'Opciones',
      options:
        'Opciones: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name y --commands. Se pueden usar nombres en lugar de ID.',
      placeholders:
        'Los comandos pueden usar ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} y ${field:name}.',
      handouts: 'El folleto "{help}" lo explica todo; el folleto "{deck}" tiene botones.',
    },
    store: {
      bio: 'Este personaje pertenece al mod Customizable Roll Listener. Cada habilidad es un oyente: la habilidad contiene los comandos que se ejecutan y su descripción contiene las reglas del oyente.',
      bioHelp:
        'Aquí puedes editar los comandos. Cambia las reglas con !crl o desde el folleto Command Deck. Borrar una habilidad borra su oyente.',
    },
    deck: {
      subtitle: 'Panel de comandos',
      listeners: 'Oyentes',
      listenersDesc: 'Consulta, crea, cambia y prueba oyentes.',
      listening: 'Escucha',
      listeningDesc: 'Activa o desactiva todos los oyentes a la vez.',
      tools: 'Herramientas',
      toolsDesc:
        'Inspecciona un mensaje del chat, cambia los ajustes, regenera los folletos o lee la ayuda.',
      footer:
        'Todos los comandos son solo para el DJ. Consulta el folleto "{help}" para más detalles.',
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Escucha los dados, escucha la acción',
      footer: 'Los botones de todos los comandos están en el folleto "{deck}".',
      overview: {
        heading: 'Descripción general',
        body: 'Customizable Roll Listener (CRL) vigila el chat y ejecuta los comandos que elijas cuando un mensaje coincide con un oyente. Un oyente puede fijarse en la plantilla de tirada, el texto, quién envió el mensaje y las tiradas que contiene: críticos, pifias, éxitos, fallos, totales y resultados naturales de los dados. Los comandos pueden ser cualquier cosa que escribirías en el chat, incluidos comandos de otros mods, así que CRL puede reproducir sonidos, tirar en tablas, publicar emotes, aplicar marcadores de estado y mucho más.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        steps: [
          'Escribe !crl en el chat (o haz clic en Oyentes en el folleto Command Deck).',
          'Haz clic en Nuevo oyente y ponle un nombre, como Sonido Crítico.',
          'Haz clic en Cambiar junto a Resultado de la tirada y elige Crítico.',
          'Haz clic en Definir comandos e introduce lo que se debe ejecutar, por ejemplo !roll20AM --audio,play|Crit.',
          'Haz clic en Probar para comprobar los comandos y luego haz una tirada de ataque. Si no se activa, usa Inspeccionar siguiente mensaje.',
        ],
      },
      examples: {
        heading: 'Ejemplos',
        points: [
          'Sonido con cualquier crítico, desde cualquier hoja: --results crit',
          'Tabla de pifias con un 1 natural en la plantilla de ataque de D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reaccionar al resultado de una tabla aleatoria: --text Combate',
          'Solo para un personaje: --who Alice',
          'Un total de 20 o más en la primera tirada en línea de una tirada de "Fuerza": --text Fuerza && ## --total >=20',
        ],
        code: [
          '!crl new Sonido Crítico --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Pifia --natural 1 --dice 20 --commands /em ¡comete una pifia! \\\\ /roll 1t[Fumbles]',
          '!crl new Narrador --results crit fumble --speaker crl --commands /desc ¡Resultado de ${who}: ${result}!',
        ],
      },
      matching: {
        heading: 'Qué comprueba un oyente',
        points: [
          'Un oyente se activa cuando coinciden todos sus filtros. Los filtros vacíos coinciden con todo.',
          'Plantillas de tirada: el nombre de la plantilla, como atkdmg o simple. "none" coincide con los mensajes sin plantilla. Si hay varios nombres, vale cualquiera de ellos.',
          'Tipos de mensaje: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (hojas Beacon) y api. Si está vacío, se comprueban todos los tipos excepto los comandos de la API.',
          'Texto: uno o más fragmentos de texto, separados por &&, que deben aparecer todos. No se distingue entre mayúsculas y minúsculas. El texto también se busca en los totales de las tiradas y en los resultados de tablas aleatorias.',
          '## en el texto representa una tirada en línea; entonces las comprobaciones de tirada solo miran las tiradas que haya ahí. Sin ##, se comprueban todas las tiradas del mensaje.',
          'El texto puede ser una expresión regular en lugar de texto normal (--regex on).',
          'Hablantes / personajes: el nombre que se muestra en el chat, o el nombre del personaje en la plantilla de tirada. Jugadores: el nombre visible del jugador.',
        ],
      },
      templates: {
        heading: 'Nombres de plantillas de tirada',
        points: [
          'Una plantilla de tirada es el diseño que usa una hoja para sus tarjetas de tirada. Su nombre es lo que va tras template: en una macro, así que &{template:atkdmg} es la plantilla atkdmg. Cada hoja tiene sus propios nombres.',
          'La forma más rápida de encontrar un nombre: haz clic en Inspeccionar siguiente mensaje, haz la tirada desde la hoja y lee la línea Plantilla de tirada que te susurra CRL.',
          'También puedes leer el nombre en la macro de un botón de la hoja, o en el código fuente de la hoja en GitHub, donde cada plantilla es un <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Plantillas de hojas comunes:',
        ],
        colSheet: 'Hoja',
        colNames: 'Nombres de plantilla',
        links: 'Más sobre las plantillas de tirada:',
        builtIn: 'Roll20: plantillas de tirada integradas',
        dnd5e2014: 'Roll20: plantillas de tirada de D&D 5e (2014)',
        sheets: 'Código fuente de las hojas de personaje de Roll20',
      },
      rolls: {
        heading: 'Comprobaciones de tirada',
        points: [
          'Resultado de la tirada: crítico (la cara más alta del dado, o el rango cs), pifia (un 1, o el rango cf), éxito (al menos un dado alcanza un objetivo, como en 1d20>15), fallo (una tirada con objetivo sin ningún éxito). Si hay varios resultados, vale cualquiera de ellos.',
          'Total de la tirada: un número, una comparación como >=15 o un rango como 19-20.',
          'Dado natural: la cara en la que cayó un dado, como 20 o <=2.',
          'Dados comprobados: auto solo mira los d20 cuando se ha tirado alguno, así que los dados de daño que sacan su cara más alta no cuentan como críticos. Elige Cualquier dado, o un tamaño como d100, para cambiarlo.',
          'Se ignoran los dados descartados (ventaja y desventaja) y los dados que se vuelven a tirar.',
          'La hoja D&D 5E by Roll20 (2014) tira la ventaja y la desventaja como dos tiradas de d20 separadas (r1 y r2), así que CRL comprueba ambas: con ventaja, un 1 en el dado más bajo sigue contando como pifia, y con desventaja, un 20 en el dado más alto sigue contando como crítico.',
          'Un oyente se activa cuando al menos una tirada cumple todas las comprobaciones de tirada.',
        ],
      },
      commands: {
        heading: 'Comandos de chat',
        intro:
          'Todos los comandos son solo para el DJ. Un oyente se puede indicar por su nombre o por su ID.',
        colCommand: 'Comando',
        colDesc: 'Qué hace',
      },
      options: {
        heading: 'Opciones del oyente',
        intro:
          'Añádelas a !crl new o !crl edit. Deja un valor vacío, o usa -, para borrarlo. --commands debe ir al final.',
        colOption: 'Opción',
        colDesc: 'Significado',
        templates:
          'Nombres de plantillas de tirada, separados por espacios. none = sin plantilla. Consulta Nombres de plantillas de tirada más arriba.',
        types: 'Tipos de mensaje, separados por espacios: {types}.',
        text: 'Texto que buscar. Separa los fragmentos con &&. ## marca una tirada en línea.',
        regex: 'on para leer el texto como expresiones regulares, off para texto normal.',
        who: 'Nombres de hablantes o personajes, separados por comas.',
        players: 'Nombres visibles de los jugadores, separados por comas.',
        results: 'crit, fumble, success y/o fail.',
        total: 'Total de la tirada: 15, >=15, <5 o 19-20.',
        natural: 'Cara natural del dado: 20, <=2 o 19-20.',
        dice: 'auto, any o un tamaño de dado como 20.',
        cooldown: 'Segundos antes de que el oyente pueda volver a activarse.',
        stop: 'on para dejar de comprobar los oyentes siguientes cuando este se active.',
        speaker: 'default, crl o roller.',
        enabled: 'on u off.',
        name: 'Cambia el nombre del oyente.',
        commands: 'Los comandos que se ejecutan. Separa las líneas con \\\\.',
      },
      placeholders: {
        heading: 'Marcadores de posición',
        intro: 'Se sustituyen en los comandos de un oyente cuando se activa.',
        colName: 'Marcador',
        colDesc: 'Se sustituye por',
        who: 'El nombre que se muestra en el chat.',
        character:
          'El nombre del personaje de la plantilla de tirada, o el nombre que se muestra en el chat.',
        player: 'El nombre visible del jugador.',
        template: 'El nombre de la plantilla de tirada.',
        total: 'El total de la tirada que coincidió (o de la primera tirada).',
        natural: 'El d20 natural (o el primer dado) de esa tirada.',
        result: 'crit, fumble, success o fail, cuando se pidió alguno.',
        expression: 'La expresión de la tirada, como 1d20+5.',
        table: 'Resultados de tablas aleatorias de esa tirada.',
        listener: 'El nombre del oyente.',
        field:
          'Un campo de la plantilla de tirada, como ${field:rname} (las tiradas en línea se muestran como sus totales).',
      },
      running: {
        heading: 'Cómo se ejecutan los comandos',
        points: [
          'Cada línea se envía como un mensaje de chat independiente, salvo un bloque {{ … }} repartido en varias líneas (una plantilla de tirada o un script de ScriptCards), que se mantiene unido.',
          'Los comandos se envían como CRL o como el personaje que tiró, según lo que indique cada oyente o los ajustes. Otros mods ven los comandos enviados por CRL como procedentes de la API.',
          'Los comandos pueden usar tiradas en línea, plantillas de tirada, @{Character|attribute} y %{Character|ability}. Las referencias al token seleccionado (@{selected|…}) y las consultas (?{…}) no funcionan, porque no hay nadie a quien preguntar.',
          'Los oyentes se comprueban en orden. Un oyente con Detenerse tras este impide que los oyentes siguientes se activen con el mismo mensaje.',
          'El enfriamiento impide que un oyente vuelva a activarse durante esos segundos.',
          'CRL ignora sus propios mensajes. Si aun así un oyente se activa más de 20 veces en 10 segundos, se desactiva y se avisa al DJ.',
        ],
      },
      inspector: {
        heading: 'El inspector',
        points: [
          'Haz clic en Inspeccionar siguiente mensaje y haz la tirada. CRL te susurra lo que ha visto: el tipo de mensaje, el hablante, el personaje, la plantilla y sus campos, cada tirada con sus dados, el texto en el que buscan los oyentes y por qué cada oyente se activó o no.',
          'Úsalo para averiguar el nombre de plantilla de una hoja, o para ver qué envía una hoja Beacon (como D&D 2024).',
          'Las hojas Beacon publican tarjetas de tirada en lugar de plantillas de tirada. CRL las lee: la plantilla es la primera clase de la tarjeta (dnd-2024 para D&D 2024), el personaje, el título (como Prueba de Destreza) y la subcategoría pasan a ser campos, y cada tirada del desglose es una tirada, así que funcionan las comprobaciones de crítico, pifia, total y dado natural.',
        ],
      },
      settings: {
        heading: 'Ajustes',
        intro:
          'Cámbialos con !crl config o con el botón Ajustes. Algunos también se pueden definir en las opciones One-Click del mod.',
        colKey: 'Ajuste',
        colName: 'Nombre',
        colDesc: 'Descripción',
      },
      storage: {
        heading: 'Dónde se guardan los oyentes',
        body: 'Cada oyente es una habilidad del personaje archivado "{character}". La habilidad contiene los comandos, así que puedes editarlos en el Diario con el editor de macros completo. Su descripción contiene las reglas del oyente, lo que además permite que los oyentes se conserven al copiar la partida. Borrar una habilidad borra su oyente; una habilidad añadida a mano aparece desactivada en el menú.',
      },
      upgrading: {
        heading: 'Actualizar desde la versión 1',
        points: [
          'Los oyentes de la versión 1 se convierten en el primer arranque y conservan sus comandos.',
          'El texto que solo contiene caracteres normales pasa a ser texto normal y ahora no distingue entre mayúsculas y minúsculas. El texto que usa símbolos de expresiones regulares sigue siendo una expresión regular.',
          'Los oyentes con un resultado de tirada pero sin ## fallaban antes con "not parseable"; ahora comprueban todas las tiradas del mensaje.',
          'Fallo ahora significa una tirada con objetivo sin ningún éxito; una tirada que iguala exactamente el objetivo es un éxito.',
          'Los comandos de la versión 1 siguen funcionando:',
        ],
        colV1: 'Versión 1',
        colV2: 'Versión 2',
      },
      troubleshooting: {
        heading: 'Solución de problemas',
        points: [
          'No pasa nada: comprueba que la Escucha y el oyente estén activados y luego usa el inspector para ver qué filtro falla.',
          'No se reconocen las tiradas de una hoja: inspecciona una; filtra por el nombre de plantilla y los campos que muestra.',
          'Las hojas Beacon (como D&D 2024) necesitan el sandbox Experimental de mods para que los mods vean sus tiradas.',
          'Los comandos que usan @{…} o %{…} los pierden al escribirlos en !crl; edita la habilidad en el Diario en su lugar.',
          'Los dados de daño cuentan como críticos: pon Dados comprobados en d20.',
          'Los errores se escriben en la consola de la API con el prefijo "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Idiomas',
        body: 'Elige un idioma con !crl config language o con la opción Language de One-Click. Idiomas disponibles:',
        colCode: 'Código',
        colName: 'Idioma',
        colNative: 'Nombre nativo',
      },
      credits: {
        heading: 'Créditos',
        original: 'Mod original de',
        maintainer: 'Versión 2 de',
        support: 'Informa de problemas en los foros de Roll20 o en el repositorio de GitHub.',
        wiki: 'Página de la wiki de la versión 1',
      },
    },
  };

  const TRANSLATION$2 = {
    titles: {
      ready: 'Customizable Roll Listener är redo.',
      settings: 'CRL-inställningar',
      languages: 'Välj språk',
      help: 'CRL-kommandon',
      confirm: 'Bekräfta',
      inspect: 'CRL-inspektör',
      listener: 'Lyssnare: {name}',
      listenerCommands: 'Kommandon: {name}',
    },
    menu: {
      listening: 'Lyssning',
      listeners: 'Lyssnare (kontrolleras i denna ordning)',
      noListeners: 'Inga lyssnare än. Klicka på Ny lyssnare för att skapa en.',
      noCommands: 'Inga kommandon än.',
      commandsHint:
        'Skilj rader åt med \\\\ när du skriver kommandon i chatten. För @{...}- eller %{...}-referenser redigerar du förmågan i journalen i stället, eftersom chatten ersätter dem innan CRL ser dem.',
    },
    buttons: {
      back: 'Tillbaka',
      change: 'Ändra',
      confirmDelete: 'Ja, ta bort',
      delete: 'Ta bort',
      edit: 'Redigera',
      help: 'Hjälp',
      inspect: 'Inspektera nästa meddelande',
      inspectOff: 'Sluta inspektera',
      new: 'Ny lyssnare',
      openJournal: 'Öppna i journalen',
      rebuildJournal: 'Bygg om handouts',
      rename: 'Byt namn',
      setCommands: 'Ange kommandon',
      settings: 'Inställningar',
      test: 'Testa',
      enable: 'Slå på',
      disable: 'Stäng av',
      menu: 'Lyssnare',
      turnOn: 'Lyssning på',
      turnOff: 'Lyssning av',
    },
    prompts: {
      newName: 'Namn på den nya lyssnaren',
      name: 'Nytt namn',
      target: 'Lyssnarens namn',
      commands: 'Kommandon - skilj rader åt med två omvända snedstreck',
      templates:
        'Slagmallar åtskilda med mellanslag - none för ingen mall - tomt för alla - Inspektera visar vilken mall ett slag har',
      types: 'Meddelandetyper åtskilda med mellanslag - tomt för alla utom api',
      text: 'Text att leta efter - se Help-handouten - tomt för all text',
      regex: 'Hur texten ska läsas',
      who: 'Talar- eller karaktärsnamn åtskilda med kommatecken - tomt för alla',
      players: 'Spelarnamn åtskilda med kommatecken - tomt för alla',
      results: 'Slagresultat',
      total: 'Slagsumma, till exempel 15 eller 19-20 - se Help-handouten - tomt för alla',
      natural: 'Naturligt tärningsresultat, till exempel 20 eller 1-2 - tomt för alla',
      dice: 'Vilka tärningar kontrollerna tittar på',
      cooldown: 'Sekunder att vänta innan den kan utlösas igen - 0 för ingen väntan',
      speaker: 'Skicka kommandon som',
    },
    choices: {
      critOrFumble: 'Kritiskt eller fummel',
    },
    values: {
      on: 'På',
      off: 'Av',
      none: 'Ingen',
      any: 'Alla',
      allButApi: 'Alla (utom API-kommandon)',
      plain: 'Vanlig text',
      regex: 'Reguljärt uttryck',
      diceAuto: 'Auto (d20 om sådana slogs)',
      diceAny: 'Valfri tärning',
      seconds: '{seconds} s',
      speaker: {
        default: 'Standardinställning',
        crl: 'CRL',
        roller: 'Den som slog',
      },
    },
    results: {
      crit: 'Kritiskt',
      fumble: 'Fummel',
      success: 'Lyckat',
      fail: 'Misslyckat',
    },
    fields: {
      enabled: 'På',
      templates: 'Slagmallar',
      types: 'Meddelandetyper',
      text: 'Text',
      regex: 'Texten är',
      who: 'Talare / karaktärer',
      players: 'Spelare',
      results: 'Slagresultat',
      total: 'Slagsumma',
      natural: 'Naturlig tärning',
      dice: 'Kontrollerade tärningar',
      cooldown: 'Väntetid',
      stop: 'Stoppa efter denna',
      speaker: 'Skicka som',
      commands: 'Kommandon',
    },
    settings: {
      enabled: {
        label: 'Lyssning',
        desc: 'Slår på eller av alla lyssnare på en gång.',
      },
      speaker: {
        label: 'Skicka kommandon som',
        desc: 'Vem lyssnarnas kommandon skickas som, om inte lyssnaren anger annat: CRL, eller karaktären (eller spelaren) vars meddelande utlöste den.',
      },
      listenToMods: {
        label: 'Lyssna på andra mods',
        desc: 'Om chattmeddelanden från andra mods kan utlösa lyssnare. CRL reagerar aldrig på sina egna meddelanden.',
      },
      language: {
        label: 'Språk',
        desc: 'Språk för menyer, meddelanden och handouts.',
      },
    },
    inspect: {
      type: 'Typ',
      who: 'Talare',
      character: 'Karaktär',
      player: 'Spelare',
      template: 'Slagmall',
      keys: 'Meddelandeegenskaper',
      extras: 'Extra meddelandedata',
      fields: 'Mallfält',
      rolls: 'Slag',
      dice: 'tärningar',
      table: 'tabell',
      target: 'har ett mål för lyckat',
      crit: 'kritiskt',
      fumble: 'fummel',
      text: 'Text (som lyssnarna läser den)',
      raw: 'Råinnehåll',
      listeners: 'Lyssnare',
      matched: 'skulle utlösa {result}',
      reasons: {
        disabled: 'avstängd',
        type: 'meddelandetypen matchar inte',
        template: 'slagmallen matchar inte',
        who: 'talare eller karaktär matchar inte',
        player: 'spelaren matchar inte',
        text: 'texten hittades inte',
        roll: 'inget slag uppfyller slagvillkoren',
      },
    },
    messages: {
      upgraded:
        'Uppgraderad från version 1. {count} lyssnare konverterades och deras kommandon behölls.',
      restored: 'Återställde {count} lyssnare från lagringskaraktären.',
      adopted:
        'Hittade {count} förmåga(or) på lagringskaraktären utan lyssnarregler. De har lagts till avstängda; ställ in dem från menyn.',
      removed: 'Tog bort {count} lyssnare vars förmåga hade tagits bort.',
      listeningOff: 'Lyssningen är avstängd. Skriv !crl on för att slå på den.',
      readyHint: '{count} lyssnare. Skriv !crl för menyn eller !crl help för alla kommandon.',
      loopStopped:
        'Lyssnaren "{name}" utlöstes för ofta på kort tid, troligen för att dess kommandon utlöser den igen, så den har stängts av.',
      noCommands: 'Lyssnaren "{name}" har inga kommandon att köra.',
      tested: 'Körde kommandona för "{name}" ({count} meddelande(n)).',
      confirmDelete: 'Ta bort lyssnaren "{name}" och dess kommandon? Detta kan inte ångras.',
      deleted: 'Tog bort lyssnaren "{name}".',
      inspectOn: 'Nästa chattmeddelande inspekteras och resultatet viskas till dig.',
      inspectOff: 'Inspektören har stängts av.',
      journalRebuilt: 'Byggde om handouterna "{help}" och "{deck}".',
    },
    errors: {
      gmOnly: 'Endast en GM kan använda kommandona i Customizable Roll Listener.',
      unexpected: 'Något gick fel: {message}',
      unknownCommand: 'Okänt kommando "{command}".',
      badOption: 'Okänt alternativ --{option}.',
      notFound: 'Det finns ingen lyssnare som heter "{name}".',
      nameRequired: 'Ange ett lyssnarnamn.',
      nameInvalid: 'Namnet "{name}" kan inte användas.',
      nameTaken: 'Det finns redan en lyssnare som heter "{name}".',
      badOnOff: 'Värdet "{value}" är inte giltigt för --{option}.',
      badType: 'Okänd(a) meddelandetyp(er): {value}.',
      badRegex: 'Det reguljära uttrycket "{term}" är inte giltigt: {error}',
      tooManyTerms: 'En lyssnare kan leta efter högst {max} textbitar.',
      badResult: 'Okänt/okända slagresultat: {value}.',
      badComparison: 'Värdet "{value}" är inte giltigt för --{option}.',
      badDice: 'Värdet "{value}" är inte giltigt för --dice.',
      badCooldown: 'Värdet "{value}" är inte giltigt för --cooldown.',
      badSpeaker: 'Värdet "{value}" är inte giltigt för --speaker.',
      noStore: 'Lagringskaraktären kunde inte skapas.',
      badSetting: 'Okänd inställning "{key}".',
      badSettingValue: 'Värdet "{value}" är inte giltigt för {key}.',
    },
    hints: {
      gmOnly: 'Be din GM att ställa in lyssnare åt dig.',
      unknownCommand: 'Skriv !crl help för att se alla kommandon.',
      badOption:
        'Alternativen är --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name och --commands.',
      notFound: 'Skriv !crl för att se listan över lyssnare.',
      nameInvalid:
        'Använd högst {max} tecken, utan dessa: | { } [ ] \\ @ % # ? ~ eller "--", och börja inte med "-".',
      badOnOff: 'Använd on eller off.',
      badType: 'Meddelandetyperna är: {types}.',
      badResult: 'Använd crit, fumble, success eller fail.',
      badComparison:
        'Använd ett tal, en jämförelse som >=15 eller <3, eller ett intervall som 19-20.',
      badDice: 'Använd auto, any eller en tärningsstorlek som 20 eller d20.',
      badCooldown: 'Använd ett heltal sekunder från 0 till 3600.',
      badSpeaker: 'Använd default, crl eller roller.',
      badSetting: 'Inställningarna är: {keys}.',
      noStore: 'Kontrollera API-konsolen efter fel och starta sedan om sandlådan.',
    },
    help: {
      menu: 'Visa listan över lyssnare.',
      new: 'Skapa en lyssnare. Alternativ kan anges direkt.',
      show: 'Visa en lyssnare och dess inställningar, med knappar för att ändra dem.',
      edit: 'Ändra en lyssnare. Lämna ett värde tomt (eller använd -) för att rensa det.',
      commands: 'Ersätt en lyssnares kommandon. Allt efter --commands används, så lägg det sist.',
      enable: 'Slå på eller av en lyssnare.',
      move: 'Flytta en lyssnare tidigare eller senare i den ordning lyssnarna kontrolleras.',
      test: 'Kör en lyssnares kommandon nu, som om en naturlig 20 hade slagits.',
      delete: 'Ta bort en lyssnare och dess kommandon (frågar först).',
      inspect: 'Viska en genomgång av nästa chattmeddelande och vilka lyssnare det skulle utlösa.',
      inspectOff: 'Sluta vänta på ett meddelande att inspektera.',
      onOff: 'Slå på eller av all lyssning.',
      config: 'Visa eller ändra de globala inställningarna.',
      journal: 'Bygg om handouterna Help och Command Deck.',
      help: 'Visa den här listan.',
      optionsTitle: 'Alternativ',
      options:
        'Alternativ: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name och --commands. Namn kan användas i stället för ID.',
      placeholders:
        'Kommandon kan använda ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} och ${field:name}.',
      handouts: 'Handouten "{help}" förklarar allt; handouten "{deck}" har knappar.',
    },
    store: {
      bio: 'Den här karaktären tillhör modden Customizable Roll Listener. Varje förmåga är en lyssnare: förmågan innehåller kommandona som ska köras och dess beskrivning innehåller lyssnarens regler.',
      bioHelp:
        'Du kan redigera kommandona här. Ändra reglerna med !crl eller från handouten Command Deck. Tar du bort en förmåga tas dess lyssnare bort.',
    },
    deck: {
      subtitle: 'Kommandopanel',
      listeners: 'Lyssnare',
      listenersDesc: 'Visa, skapa, ändra och testa lyssnare.',
      listening: 'Lyssning',
      listeningDesc: 'Slå på eller av alla lyssnare på en gång.',
      tools: 'Verktyg',
      toolsDesc:
        'Inspektera ett chattmeddelande, ändra inställningar, bygg om handouterna eller läs hjälpen.',
      footer: 'Alla kommandon är endast för GM. Se handouten "{help}" för detaljer.',
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Hör tärningarna, hör äventyret',
      footer: 'Knappar för alla kommandon finns i handouten "{deck}".',
      overview: {
        heading: 'Översikt',
        body: 'Customizable Roll Listener (CRL) bevakar chatten och kör kommandon du väljer när ett meddelande matchar en lyssnare. En lyssnare kan titta på slagmallen, texten, vem som skickade meddelandet och slagen i det: kritiska träffar, fummel, lyckade och misslyckade slag, summor och naturliga tärningsresultat. Kommandon kan vara allt du kan skriva i chatten, även andra mods kommandon, så CRL kan spela ljud, slå på slumptabeller, skicka emotes, sätta statusmarkörer med mera.',
      },
      quickStart: {
        heading: 'Snabbstart',
        steps: [
          'Skriv !crl i chatten (eller klicka på Lyssnare i handouten Command Deck).',
          'Klicka på Ny lyssnare och ge den ett namn, till exempel Kritljud.',
          'Klicka på Ändra bredvid Slagresultat och välj Kritiskt.',
          'Klicka på Ange kommandon och skriv vad som ska köras, till exempel !roll20AM --audio,play|Crit.',
          'Klicka på Testa för att prova kommandona och slå sedan en attack. Använd Inspektera nästa meddelande om den inte utlöses.',
        ],
      },
      examples: {
        heading: 'Exempel',
        points: [
          'Ljud vid varje kritisk träff, från vilket formulär som helst: --results crit',
          'Fummeltabell vid en naturlig 1:a i attackmallen för D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Reagera på ett resultat från en slumptabell: --text Strid',
          'Bara för en karaktär: --who Alice',
          'En summa på 20 eller mer på det första inline-slaget i ett "Styrka"-slag: --text Styrka && ## --total >=20',
        ],
        code: [
          '!crl new Kritljud --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Fummel --natural 1 --dice 20 --commands /em fumlar! \\\\ /roll 1t[Fumbles]',
          '!crl new Berättare --results crit fumble --speaker crl --commands /desc ${who} slog ${result}!',
        ],
      },
      matching: {
        heading: 'Vad en lyssnare kontrollerar',
        points: [
          'En lyssnare utlöses när alla dess filter matchar. Tomma filter matchar allt.',
          'Slagmallar: mallens namn, till exempel atkdmg eller simple. "none" matchar meddelanden utan mall. Flera namn betyder vilket som helst av dem.',
          'Meddelandetyper: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon-formulär) och api. Om fältet är tomt kontrolleras alla typer utom api-kommandon.',
          'Text: en eller flera textbitar, åtskilda med &&, som alla måste förekomma. Matchningen skiljer inte på stora och små bokstäver. Text hittas även i slagsummor och resultat från slumptabeller.',
          '## i texten står för ett inline-slag; slagkontrollerna tittar då bara på slagen som finns där. Utan ## kontrolleras alla slag i meddelandet.',
          'Texten kan vara ett reguljärt uttryck i stället för vanlig text (--regex on).',
          'Talare / karaktärer: namnet som visas i chatten, eller karaktärsnamnet i slagmallen. Spelare: spelarens visningsnamn.',
        ],
      },
      templates: {
        heading: 'Namn på slagmallar',
        points: [
          'En slagmall är den layout ett formulär använder för sina slagkort. Namnet är delen efter template: i ett makro, så &{template:atkdmg} är mallen atkdmg. Varje formulär har sina egna namn.',
          'Snabbaste sättet att hitta ett namn: klicka på Inspektera nästa meddelande, slå slaget från formuläret och läs raden Slagmall som CRL viskar tillbaka.',
          'Du kan också läsa namnet i makrot för en knapp i formuläret, eller i formulärets källkod på GitHub, där varje mall är en <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Mallar för vanliga formulär:',
        ],
        colSheet: 'Formulär',
        colNames: 'Mallnamn',
        links: 'Mer om slagmallar:',
        builtIn: 'Roll20: inbyggda slagmallar',
        dnd5e2014: 'Roll20: slagmallar för D&D 5e (2014)',
        sheets: 'Källkod för Roll20:s formulär',
      },
      rolls: {
        heading: 'Slagkontroller',
        points: [
          'Slagresultat: kritiskt (tärningens högsta sida, eller cs-intervallet), fummel (en 1:a, eller cf-intervallet), lyckat (minst en tärning når ett mål som 1d20>15), misslyckat (ett slag mot mål utan lyckade). Flera resultat betyder vilket som helst av dem.',
          'Slagsumma: ett tal, en jämförelse som >=15, eller ett intervall som 19-20.',
          'Naturlig tärning: sidan en tärning landade på, till exempel 20, eller <=2.',
          'Kontrollerade tärningar: auto tittar bara på d20 när en sådan slogs, så skadetärningar som visar sin högsta sida räknas inte som kritiska. Välj valfri tärning, eller en storlek som d100, för att ändra det.',
          'Bortvalda tärningar (fördel och nackdel) och omslagna tärningar ignoreras.',
          'Formuläret D&D 5E by Roll20 (2014) slår fördel och nackdel som två separata d20-slag (r1 och r2), så CRL kontrollerar båda: med fördel räknas en 1:a på den lägre tärningen ändå som fummel, och med nackdel räknas en 20 på den högre tärningen ändå som kritiskt.',
          'En lyssnare utlöses när minst ett slag uppfyller alla slagkontroller.',
        ],
      },
      commands: {
        heading: 'Chattkommandon',
        intro:
          'Alla kommandon är endast för GM. En lyssnare kan anges med sitt namn eller sitt ID.',
        colCommand: 'Kommando',
        colDesc: 'Vad det gör',
      },
      options: {
        heading: 'Lyssnaralternativ',
        intro:
          'Lägg till dessa efter !crl new eller !crl edit. Lämna ett värde tomt, eller använd -, för att rensa det. --commands måste komma sist.',
        colOption: 'Alternativ',
        colDesc: 'Betydelse',
        templates:
          'Namn på slagmallar, åtskilda med mellanslag. none = ingen mall. Se Namn på slagmallar ovan.',
        types: 'Meddelandetyper, åtskilda med mellanslag: {types}.',
        text: 'Text att hitta. Skilj bitarna åt med &&. ## markerar ett inline-slag.',
        regex: 'on för att läsa texten som reguljära uttryck, off för vanlig text.',
        who: 'Talar- eller karaktärsnamn, åtskilda med kommatecken.',
        players: 'Spelarnas visningsnamn, åtskilda med kommatecken.',
        results: 'crit, fumble, success och/eller fail.',
        total: 'Slagsumma: 15, >=15, <5 eller 19-20.',
        natural: 'Naturlig tärningssida: 20, <=2 eller 19-20.',
        dice: 'auto, any eller en tärningsstorlek som 20.',
        cooldown: 'Sekunder innan lyssnaren kan utlösas igen.',
        stop: 'on för att sluta kontrollera senare lyssnare när denna utlöses.',
        speaker: 'default, crl eller roller.',
        enabled: 'on eller off.',
        name: 'Byter namn på lyssnaren.',
        commands: 'Kommandona som ska köras. Skilj rader åt med \\\\.',
      },
      placeholders: {
        heading: 'Platshållare',
        intro: 'Dessa ersätts i en lyssnares kommandon när den utlöses.',
        colName: 'Platshållare',
        colDesc: 'Ersätts med',
        who: 'Namnet som visas i chatten.',
        character: 'Karaktärsnamnet från slagmallen, eller namnet som visas i chatten.',
        player: 'Spelarens visningsnamn.',
        template: 'Slagmallens namn.',
        total: 'Summan av slaget som matchade (eller det första slaget).',
        natural: 'Den naturliga d20:n (eller första tärningen) i det slaget.',
        result: 'crit, fumble, success eller fail, när ett sådant efterfrågades.',
        expression: 'Slaguttrycket, till exempel 1d20+5.',
        table: 'Resultat från slumptabeller i det slaget.',
        listener: 'Lyssnarens namn.',
        field:
          'Ett slagmallsfält, till exempel ${field:rname} (inline-slag visas som sina summor).',
      },
      running: {
        heading: 'Hur kommandon körs',
        points: [
          'Varje rad skickas som ett eget chattmeddelande, förutom att ett {{ … }}-block över flera rader (en slagmall eller ett ScriptCards-skript) hålls ihop.',
          'Kommandon skickas som CRL, eller som karaktären som slog, enligt lyssnarens inställning eller inställningarna. Andra mods ser kommandon som CRL skickar som om de kom från API:t.',
          'Kommandon kan använda inline-slag, slagmallar, @{Character|attribute} och %{Character|ability}. Referenser till markerad token (@{selected|…}) och frågor (?{…}) fungerar inte, eftersom det inte finns någon att fråga.',
          'Lyssnarna kontrolleras i ordning. En lyssnare med Stoppa efter denna hindrar senare lyssnare från att utlösas av samma meddelande.',
          'En väntetid hindrar en lyssnare från att utlösas igen under så många sekunder.',
          'CRL ignorerar sina egna meddelanden. Om en lyssnare ändå utlöses mer än 20 gånger på 10 sekunder stängs den av och GM:en meddelas.',
        ],
      },
      inspector: {
        heading: 'Inspektören',
        points: [
          'Klicka på Inspektera nästa meddelande och slå sedan slaget. CRL viskar vad den såg: meddelandetyp, talare, karaktär, mall och dess fält, varje slag med sina tärningar, texten som lyssnarna söker i och varför varje lyssnare utlöstes eller inte.',
          'Använd den för att hitta ett formulärs mallnamn, eller för att se vad ett Beacon-formulär (som D&D 2024) skickar.',
          'Beacon-formulär skickar slagkort i stället för slagmallar. CRL läser dem: mallen är kortets första klass (dnd-2024 för D&D 2024), karaktären, titeln (som Dexterity Check) och underkategorin blir fält, och varje slag i uppdelningen är ett slag, så kontroller av kritiskt, fummel, summa och naturlig tärning fungerar.',
        ],
      },
      settings: {
        heading: 'Inställningar',
        intro:
          'Ändra dessa med !crl config eller knappen Inställningar. Vissa kan också ställas in i moddens One-Click-alternativ.',
        colKey: 'Inställning',
        colName: 'Namn',
        colDesc: 'Beskrivning',
      },
      storage: {
        heading: 'Var lyssnarna sparas',
        body: 'Varje lyssnare är en förmåga på den arkiverade karaktären "{character}". Förmågan innehåller kommandona, så du kan redigera dem i journalen med den fullständiga makroredigeraren. Dess beskrivning innehåller lyssnarens regler, vilket också gör att lyssnarna följer med när spelet kopieras. Tar du bort en förmåga tas dess lyssnare bort; en förmåga som läggs till för hand visas avstängd i menyn.',
      },
      upgrading: {
        heading: 'Uppgradera från version 1',
        points: [
          'Lyssnare från version 1 konverteras vid första starten och behåller sina kommandon.',
          'Text som bara innehåller vanliga tecken blir vanlig text och skiljer nu inte på stora och små bokstäver. Text med tecken för reguljära uttryck förblir ett reguljärt uttryck.',
          'Lyssnare med ett slagresultat men utan ## misslyckades förut med "not parseable"; nu kontrollerar de alla slag i meddelandet.',
          'Misslyckat betyder nu ett slag mot mål utan lyckade; ett slag exakt på målet är lyckat.',
          'Kommandona från version 1 fungerar fortfarande:',
        ],
        colV1: 'Version 1',
        colV2: 'Version 2',
      },
      troubleshooting: {
        heading: 'Felsökning',
        points: [
          'Ingenting händer: kontrollera att Lyssning är på och att lyssnaren är på, och använd sedan inspektören för att se vilket filter som inte matchar.',
          'Ett formulärs slag känns inte igen: inspektera ett; mallnamnet och fälten som visas är det du ska filtrera på.',
          'Beacon-formulär (som D&D 2024) kräver sandlådan Experimental för att mods ska se deras slag.',
          'Kommandon som använder @{…} eller %{…} förlorar dem när de skrivs in i !crl; redigera förmågan i journalen i stället.',
          'Skadetärningar räknas som kritiska: ställ in Kontrollerade tärningar på d20.',
          'Fel skrivs till API-konsolen med prefixet "Customizable Roll Listener".',
        ],
      },
      languages: {
        heading: 'Språk',
        body: 'Välj språk med !crl config language eller One-Click-alternativet Language. Språk som stöds:',
        colCode: 'Kod',
        colName: 'Språk',
        colNative: 'Eget namn',
      },
      credits: {
        heading: 'Tack till',
        original: 'Ursprunglig mod av',
        maintainer: 'Version 2 av',
        support: 'Rapportera problem på Roll20-forumen eller i GitHub-repot.',
        wiki: 'Wikisida för version 1',
      },
    },
  };

  const TRANSLATION$1 = {
    titles: {
      ready: 'Customizable Roll Listener hazır.',
      settings: 'CRL Ayarları',
      languages: 'Dil Seçin',
      help: 'CRL Komutları',
      confirm: 'Lütfen Onaylayın',
      inspect: 'CRL Denetleyicisi',
      listener: 'Dinleyici: {name}',
      listenerCommands: 'Komutlar: {name}',
    },
    menu: {
      listening: 'Dinleme',
      listeners: 'Dinleyiciler (bu sırayla kontrol edilir)',
      noListeners: "Henüz dinleyici yok. Oluşturmak için Yeni Dinleyici'ye tıklayın.",
      noCommands: 'Henüz komut yok.',
      commandsHint:
        "Sohbette komut yazarken satırları \\\\ ile ayırın. @{...} veya %{...} başvuruları için yeteneği Günlük'te düzenleyin; sohbet bunları CRL görmeden önce değiştirir.",
    },
    buttons: {
      back: 'Geri',
      change: 'Değiştir',
      confirmDelete: 'Evet, Sil',
      delete: 'Sil',
      edit: 'Düzenle',
      help: 'Yardım',
      inspect: 'Sonraki Mesajı İncele',
      inspectOff: 'İncelemeyi Durdur',
      new: 'Yeni Dinleyici',
      openJournal: "Günlük'te Aç",
      rebuildJournal: 'Belgeleri Yeniden Oluştur',
      rename: 'Yeniden Adlandır',
      setCommands: 'Komutları Ayarla',
      settings: 'Ayarlar',
      test: 'Test Et',
      enable: 'Aç',
      disable: 'Kapat',
      menu: 'Dinleyiciler',
      turnOn: 'Dinleme Açık',
      turnOff: 'Dinleme Kapalı',
    },
    prompts: {
      newName: 'Yeni dinleyicinin adı',
      name: 'Yeni ad',
      target: 'Dinleyici adı',
      commands: 'Komutlar - satırları iki ters eğik çizgiyle ayırın',
      templates:
        'Boşlukla ayrılmış atış şablonları - şablonsuz için none - hepsi için boş - İnceleme, atışın şablonunu gösterir',
      types: 'Boşlukla ayrılmış mesaj türleri - api dışındaki hepsi için boş',
      text: 'Aranacak metin - Yardım belgesine bakın - hepsi için boş',
      regex: 'Metin nasıl okunsun',
      who: 'Virgülle ayrılmış gönderen veya karakter adları - herkes için boş',
      players: 'Virgülle ayrılmış oyuncu adları - herkes için boş',
      results: 'Atış sonucu',
      total: '15 veya 19-20 gibi atış toplamı - Yardım belgesine bakın - hepsi için boş',
      natural: '20 veya 1-2 gibi doğal zar sonucu - hepsi için boş',
      dice: 'Kontrollerin baktığı zarlar',
      cooldown: 'Yeniden tetiklenmeden önce beklenecek saniye - beklemesiz için 0',
      speaker: 'Komutları gönderen',
    },
    choices: {
      critOrFumble: 'Kritik başarı veya kritik başarısızlık',
    },
    values: {
      on: 'Açık',
      off: 'Kapalı',
      none: 'Yok',
      any: 'Hepsi',
      allButApi: 'Hepsi (API komutları hariç)',
      plain: 'Düz metin',
      regex: 'Düzenli ifade',
      diceAuto: "Otomatik (atıldıysa d20'ler)",
      diceAny: 'Herhangi bir zar',
      seconds: '{seconds} sn',
      speaker: {
        default: 'Varsayılan ayar',
        crl: 'CRL',
        roller: 'Atışı yapan',
      },
    },
    results: {
      crit: 'Kritik başarı',
      fumble: 'Kritik başarısızlık',
      success: 'Başarı',
      fail: 'Başarısızlık',
    },
    fields: {
      enabled: 'Açık',
      templates: 'Atış şablonları',
      types: 'Mesaj türleri',
      text: 'Metin',
      regex: 'Metin türü',
      who: 'Gönderenler / karakterler',
      players: 'Oyuncular',
      results: 'Atış sonucu',
      total: 'Atış toplamı',
      natural: 'Doğal zar',
      dice: 'Kontrol edilen zarlar',
      cooldown: 'Bekleme süresi',
      stop: 'Bundan sonra dur',
      speaker: 'Gönderen',
      commands: 'Komutlar',
    },
    settings: {
      enabled: {
        label: 'Dinleme',
        desc: 'Tüm dinleyicileri tek seferde açar veya kapatır.',
      },
      speaker: {
        label: 'Komutları gönderen',
        desc: 'Dinleyici aksini belirtmedikçe dinleyici komutlarının kimin adına gönderileceği: CRL ya da mesajı dinleyiciyi tetikleyen karakter (veya oyuncu).',
      },
      listenToMods: {
        label: 'Diğer modları dinle',
        desc: 'Diğer modların gönderdiği sohbet mesajlarının dinleyicileri tetikleyip tetikleyemeyeceği. CRL kendi mesajlarına asla tepki vermez.',
      },
      language: {
        label: 'Dil',
        desc: 'Menüler, mesajlar ve belgeler için dil.',
      },
    },
    inspect: {
      type: 'Tür',
      who: 'Gönderen',
      character: 'Karakter',
      player: 'Oyuncu',
      template: 'Atış şablonu',
      keys: 'Mesaj özellikleri',
      extras: 'Ek mesaj verileri',
      fields: 'Şablon alanları',
      rolls: 'Atışlar',
      dice: 'zarlar',
      table: 'tablo',
      target: 'başarı hedefi var',
      crit: 'kritik başarı',
      fumble: 'kritik başarısızlık',
      text: 'Metin (dinleyicilerin okuduğu hâliyle)',
      raw: 'Ham içerik',
      listeners: 'Dinleyiciler',
      matched: 'tetiklenir: {result}',
      reasons: {
        disabled: 'kapalı',
        type: 'mesaj türü eşleşmiyor',
        template: 'atış şablonu eşleşmiyor',
        who: 'gönderen veya karakter eşleşmiyor',
        player: 'oyuncu eşleşmiyor',
        text: 'metin bulunamadı',
        roll: 'hiçbir atış atış koşullarını karşılamıyor',
      },
    },
    messages: {
      upgraded: "Sürüm 1'den yükseltildi. {count} dinleyici dönüştürüldü ve komutları korundu.",
      restored: 'Depo karakterinden {count} dinleyici geri yüklendi.',
      adopted:
        'Depo karakterinde dinleyici kuralı olmayan {count} yetenek bulundu. Kapalı olarak eklendiler; menüden ayarlayın.',
      removed: 'Yeteneği silinen {count} dinleyici kaldırıldı.',
      listeningOff: 'Dinleme kapalı. Açmak için !crl on yazın.',
      readyHint: '{count} dinleyici. Menü için !crl, tüm komutlar için !crl help yazın.',
      loopStopped:
        '"{name}" dinleyicisi kısa sürede çok sık tetiklendiği için kapatıldı; büyük olasılıkla komutları onu yeniden tetikliyor.',
      noCommands: '"{name}" dinleyicisinin çalıştıracak komutu yok.',
      tested: '"{name}" dinleyicisinin komutları çalıştırıldı ({count} mesaj).',
      confirmDelete: '"{name}" dinleyicisi ve komutları silinsin mi? Bu işlem geri alınamaz.',
      deleted: '"{name}" dinleyicisi silindi.',
      inspectOn: 'Bir sonraki sohbet mesajı incelenecek ve sonuç size fısıltıyla gönderilecek.',
      inspectOff: 'Denetleyici kapatıldı.',
      journalRebuilt: '"{help}" ve "{deck}" belgeleri yeniden oluşturuldu.',
    },
    errors: {
      gmOnly: 'Customizable Roll Listener komutlarını yalnızca GM kullanabilir.',
      unexpected: 'Bir şeyler ters gitti: {message}',
      unknownCommand: 'Bilinmeyen komut "{command}".',
      badOption: 'Bilinmeyen seçenek --{option}.',
      notFound: '"{name}" adında bir dinleyici yok.',
      nameRequired: 'Lütfen bir dinleyici adı verin.',
      nameInvalid: '"{name}" adı kullanılamaz.',
      nameTaken: '"{name}" adında bir dinleyici zaten var.',
      badOnOff: '"{value}" değeri --{option} için geçerli değil.',
      badType: 'Bilinmeyen mesaj türleri: {value}.',
      badRegex: '"{term}" düzenli ifadesi geçerli değil: {error}',
      tooManyTerms: 'Bir dinleyici en fazla {max} metin parçası arayabilir.',
      badResult: 'Bilinmeyen atış sonuçları: {value}.',
      badComparison: '"{value}" değeri --{option} için geçerli değil.',
      badDice: '"{value}" değeri --dice için geçerli değil.',
      badCooldown: '"{value}" değeri --cooldown için geçerli değil.',
      badSpeaker: '"{value}" değeri --speaker için geçerli değil.',
      noStore: 'Depo karakteri oluşturulamadı.',
      badSetting: 'Bilinmeyen ayar "{key}".',
      badSettingValue: '"{value}" değeri {key} için geçerli değil.',
    },
    hints: {
      gmOnly: "GM'inizden sizin için dinleyici ayarlamasını isteyin.",
      unknownCommand: 'Tüm komutları görmek için !crl help yazın.',
      badOption:
        'Seçenekler: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name ve --commands.',
      notFound: 'Dinleyici listesini görmek için !crl yazın.',
      nameInvalid:
        'En fazla {max} karakter kullanın; şunları kullanmayın: | { } [ ] \\ @ % # ? ~ veya "--". Ad "-" ile başlamamalı.',
      badOnOff: 'on veya off kullanın.',
      badType: 'Mesaj türleri: {types}.',
      badResult: 'crit, fumble, success veya fail kullanın.',
      badComparison:
        'Bir sayı, >=15 veya <3 gibi bir karşılaştırma ya da 19-20 gibi bir aralık kullanın.',
      badDice: 'auto, any veya 20 ya da d20 gibi bir zar boyutu kullanın.',
      badCooldown: '0 ile 3600 arasında tam sayı olarak saniye kullanın.',
      badSpeaker: 'default, crl veya roller kullanın.',
      badSetting: 'Ayarlar: {keys}.',
      noStore:
        "API konsolunda hata olup olmadığını kontrol edin, ardından sandbox'ı yeniden başlatın.",
    },
    help: {
      menu: 'Dinleyici listesini gösterir.',
      new: 'Dinleyici oluşturur. Seçenekler hemen eklenebilir.',
      show: 'Bir dinleyiciyi ve ayarlarını, değiştirme düğmeleriyle birlikte gösterir.',
      edit: 'Bir dinleyiciyi değiştirir. Temizlemek için değeri boş bırakın (veya - kullanın).',
      commands:
        'Dinleyicinin komutlarını değiştirir. --commands sonrasındaki her şey kullanılır, bu yüzden en sona koyun.',
      enable: 'Bir dinleyiciyi açar veya kapatır.',
      move: 'Bir dinleyiciyi kontrol sırasında öne veya arkaya taşır.',
      test: 'Dinleyicinin komutlarını, doğal 20 atılmış gibi hemen çalıştırır.',
      delete: 'Bir dinleyiciyi ve komutlarını siler (önce sorar).',
      inspect:
        'Bir sonraki sohbet mesajının dökümünü ve hangi dinleyicileri tetikleyeceğini fısıltıyla gönderir.',
      inspectOff: 'İncelenecek mesajı beklemeyi bırakır.',
      onOff: 'Tüm dinlemeyi açar veya kapatır.',
      config: 'Genel ayarları gösterir veya değiştirir.',
      journal: 'Yardım ve Komut Paneli belgelerini yeniden oluşturur.',
      help: 'Bu listeyi gösterir.',
      optionsTitle: 'Seçenekler',
      options:
        'Seçenekler: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name ve --commands. Kimlik yerine ad kullanılabilir.',
      placeholders:
        'Komutlarda şunlar kullanılabilir: ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} ve ${field:name}.',
      handouts: '"{help}" belgesi her şeyi açıklar; "{deck}" belgesinde düğmeler bulunur.',
    },
    store: {
      bio: 'Bu karakter Customizable Roll Listener moduna aittir. Her yetenek bir dinleyicidir: yetenek çalıştırılacak komutları, açıklaması ise dinleyicinin kurallarını tutar.',
      bioHelp:
        'Komutları burada düzenleyebilirsiniz. Kuralları !crl ile veya Komut Paneli belgesinden değiştirin. Bir yeteneği silmek dinleyicisini de siler.',
    },
    deck: {
      subtitle: 'Komut Paneli',
      listeners: 'Dinleyiciler',
      listenersDesc: 'Dinleyicileri görün, oluşturun, değiştirin ve test edin.',
      listening: 'Dinleme',
      listeningDesc: 'Tüm dinleyicileri tek seferde açın veya kapatın.',
      tools: 'Araçlar',
      toolsDesc:
        'Bir sohbet mesajını inceleyin, ayarları değiştirin, belgeleri yeniden oluşturun veya yardımı okuyun.',
      footer: 'Tüm komutlar yalnızca GM içindir. Ayrıntılar için "{help}" belgesine bakın.',
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'Zarları duy, aksiyonu duy',
      footer: 'Tüm komutların düğmeleri "{deck}" belgesindedir.',
      overview: {
        heading: 'Genel Bakış',
        body: 'Customizable Roll Listener (CRL) sohbeti izler ve bir mesaj bir dinleyiciyle eşleştiğinde seçtiğiniz komutları çalıştırır. Bir dinleyici atış şablonuna, metne, mesajı kimin gönderdiğine ve içindeki atışlara bakabilir: kritik vuruşlar, kritik başarısızlıklar, başarılar, başarısızlıklar, toplamlar ve doğal zar sonuçları. Komut olarak, diğer modların komutları dahil sohbete yazabileceğiniz her şey kullanılabilir; böylece CRL ses çalabilir, tablolardan atış yapabilir, emote gönderebilir, durum işaretleri ekleyebilir ve daha fazlasını yapabilir.',
      },
      quickStart: {
        heading: 'Hızlı Başlangıç',
        steps: [
          "Sohbete !crl yazın (veya Komut Paneli belgesinde Dinleyiciler'e tıklayın).",
          "Yeni Dinleyici'ye tıklayın ve Kritik Sesi gibi bir ad verin.",
          "Atış sonucu'nun yanındaki Değiştir'e tıklayın ve Kritik başarı'yı seçin.",
          "Komutları Ayarla'ya tıklayın ve çalıştırılacak komutu girin, örneğin !roll20AM --audio,play|Crit.",
          "Komutları denemek için Test Et'e tıklayın, ardından bir saldırı atışı yapın. Tetiklenmezse Sonraki Mesajı İncele'yi kullanın.",
        ],
      },
      examples: {
        heading: 'Örnekler',
        points: [
          'Herhangi bir sayfadan gelen her kritik vuruşta ses: --results crit',
          "D&D 5e 2014 saldırı şablonunda doğal 1'de kritik başarısızlık tablosu: --templates atkdmg atk --natural 1",
          'Bir atış tablosu sonucuna tepki: --text Savaş',
          'Yalnızca tek bir karakter için: --who Ayşe',
          'Bir "Strength" atışının ilk satır içi atışında 20 veya daha yüksek toplam: --text Strength && ## --total >=20',
        ],
        code: [
          '!crl new Kritik Sesi --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Kritik Başarısızlık --natural 1 --dice 20 --commands /em feci şekilde başarısız oldu! \\\\ /roll 1t[Fumbles]',
          '!crl new Anlatıcı --results crit fumble --speaker crl --commands /desc ${who} bir ${result} attı!',
        ],
      },
      matching: {
        heading: 'Dinleyici Neleri Kontrol Eder',
        points: [
          'Bir dinleyici, sahip olduğu tüm filtreler eşleştiğinde tetiklenir. Boş filtreler her şeyle eşleşir.',
          'Atış şablonları: atkdmg veya simple gibi şablon adı. "none", şablonu olmayan mesajlarla eşleşir. Birden fazla ad, bunlardan herhangi biri anlamına gelir.',
          'Mesaj türleri: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (Beacon sayfaları) ve api. Boş olduğunda api komutları dışındaki tüm türler kontrol edilir.',
          'Metin: && ile ayrılmış, hepsinin geçmesi gereken bir veya daha fazla metin parçası. Eşleştirmede büyük/küçük harf ayrımı yapılmaz. Metin, atış toplamlarında ve atış tablosu sonuçlarında da aranır.',
          'Metindeki ## bir satır içi atışı temsil eder; atış kontrolleri bu durumda yalnızca orada bulunan atışlara bakar. ## yoksa mesajdaki her atış kontrol edilir.',
          'Metin, düz metin yerine düzenli ifade olabilir (--regex on).',
          'Gönderenler / karakterler: sohbette görünen ad veya atış şablonundaki karakter adı. Oyuncular: oyuncunun görünen adı.',
        ],
      },
      templates: {
        heading: 'Atış Şablonu Adları',
        points: [
          'Atış şablonu, bir karakter sayfasının atış kartları için kullandığı düzendir. Adı, makroda template: ifadesinden sonraki kısımdır; yani &{template:atkdmg} atkdmg şablonudur. Her sayfanın kendi adları vardır.',
          "Adı bulmanın en hızlı yolu: Sonraki Mesajı İncele'ye tıklayın, sayfadan atış yapın ve CRL'nin fısıldadığı Atış şablonu satırını okuyun.",
          'Adı, sayfadaki bir düğmenin makrosunda veya her şablonun bir <rolltemplate class="sheet-rolltemplate-NAME"> olduğu GitHub\'daki sayfa kaynağında da bulabilirsiniz.',
          'Yaygın sayfaların şablonları:',
        ],
        colSheet: 'Sayfa',
        colNames: 'Şablon adları',
        links: 'Atış şablonları hakkında daha fazlası:',
        builtIn: 'Roll20: yerleşik atış şablonları',
        dnd5e2014: 'Roll20: D&D 5e (2014) atış şablonları',
        sheets: 'Roll20 karakter sayfası kaynak kodu',
      },
      rolls: {
        heading: 'Atış Kontrolleri',
        points: [
          'Atış sonucu: kritik başarı (zarın en yüksek yüzü veya cs aralığı), kritik başarısızlık (1 veya cf aralığı), başarı (en az bir zar 1d20>15 gibi bir hedefi tutturur), başarısızlık (hiç başarı olmayan hedefli atış). Birden fazla sonuç, bunlardan herhangi biri anlamına gelir.',
          'Atış toplamı: bir sayı, >=15 gibi bir karşılaştırma veya 19-20 gibi bir aralık.',
          'Doğal zar: zarın geldiği yüz, örneğin 20 veya <=2.',
          "Kontrol edilen zarlar: auto, d20 atıldıysa yalnızca d20'lere bakar; böylece en yüksek yüzü gelen hasar zarları kritik sayılmaz. Bunu değiştirmek için herhangi bir zarı ya da d100 gibi bir boyutu seçin.",
          'Düşürülen zarlar (avantaj ve dezavantaj) ve yeniden atılan zarlar dikkate alınmaz.',
          'D&D 5E by Roll20 (2014) sayfası avantaj ve dezavantajı iki ayrı d20 atışı (r1 ve r2) olarak atar, bu yüzden CRL ikisini de kontrol eder: avantajda düşük zardaki 1 yine de kritik başarısızlık, dezavantajda yüksek zardaki 20 yine de kritik başarı sayılır.',
          'Bir dinleyici, en az bir atış tüm atış kontrollerini karşıladığında tetiklenir.',
        ],
      },
      commands: {
        heading: 'Sohbet Komutları',
        intro:
          'Tüm komutlar yalnızca GM içindir. Bir dinleyici adıyla veya kimliğiyle belirtilebilir.',
        colCommand: 'Komut',
        colDesc: 'Ne yapar',
      },
      options: {
        heading: 'Dinleyici Seçenekleri',
        intro:
          'Bunları !crl new veya !crl edit komutlarına ekleyin. Bir değeri temizlemek için boş bırakın veya - kullanın. --commands en sonda olmalıdır.',
        colOption: 'Seçenek',
        colDesc: 'Anlamı',
        templates:
          'Boşlukla ayrılmış atış şablonu adları. none = şablon yok. Yukarıdaki Atış Şablonu Adları bölümüne bakın.',
        types: 'Boşlukla ayrılmış mesaj türleri: {types}.',
        text: 'Aranacak metin. Parçaları && ile ayırın. ## bir satır içi atışı işaretler.',
        regex: 'Metni düzenli ifade olarak okumak için on, düz metin için off.',
        who: 'Virgülle ayrılmış gönderen veya karakter adları.',
        players: 'Virgülle ayrılmış oyuncu görünen adları.',
        results: 'crit, fumble, success ve/veya fail.',
        total: 'Atış toplamı: 15, >=15, <5 veya 19-20.',
        natural: 'Doğal zar yüzü: 20, <=2 veya 19-20.',
        dice: 'auto, any veya 20 gibi bir zar boyutu.',
        cooldown: 'Dinleyicinin yeniden tetiklenebilmesi için geçmesi gereken saniye.',
        stop: 'on: bu dinleyici tetiklenince sonraki dinleyiciler kontrol edilmez.',
        speaker: 'default, crl veya roller.',
        enabled: 'on veya off.',
        name: 'Dinleyiciyi yeniden adlandırır.',
        commands: 'Çalıştırılacak komutlar. Satırları \\\\ ile ayırın.',
      },
      placeholders: {
        heading: 'Yer Tutucular',
        intro: 'Dinleyici tetiklendiğinde komutlarındaki bu ifadeler değiştirilir.',
        colName: 'Yer tutucu',
        colDesc: 'Yerine gelen',
        who: 'Sohbette görünen ad.',
        character: 'Atış şablonundaki karakter adı veya sohbette görünen ad.',
        player: 'Oyuncunun görünen adı.',
        template: 'Atış şablonunun adı.',
        total: 'Eşleşen atışın (veya ilk atışın) toplamı.',
        natural: "O atışın doğal d20'si (veya ilk zarı).",
        result: 'İstenmişse crit, fumble, success veya fail.',
        expression: '1d20+5 gibi atış ifadesi.',
        table: 'O atıştaki atış tablosu sonuçları.',
        listener: 'Dinleyicinin adı.',
        field:
          '${field:rname} gibi bir atış şablonu alanı (satır içi atışlar toplamlarıyla gösterilir).',
      },
      running: {
        heading: 'Komutlar Nasıl Çalışır',
        points: [
          'Her satır ayrı bir sohbet mesajı olarak gönderilir; yalnızca birkaç satıra yayılan bir {{ … }} bloğu (atış şablonu veya ScriptCards betiği) bir arada tutulur.',
          "Komutlar, dinleyicide veya ayarlarda belirlendiği gibi CRL adına ya da atışı yapan karakter adına gönderilir. Diğer modlar, CRL'nin gönderdiği komutları API'den gelmiş gibi görür.",
          'Komutlarda satır içi atışlar, atış şablonları, @{Character|attribute} ve %{Character|ability} kullanılabilir. Seçili token başvuruları (@{selected|…}) ve sorgular (?{…}) çalışmaz, çünkü soracak kimse yoktur.',
          'Dinleyiciler sırayla kontrol edilir. Bundan sonra dur seçeneği açık olan bir dinleyici, sonraki dinleyicilerin aynı mesajda tetiklenmesini engeller.',
          'Bekleme süresi, dinleyicinin o kadar saniye boyunca yeniden tetiklenmesini engeller.',
          "CRL kendi mesajlarını yok sayar. Bir dinleyici yine de 10 saniyede 20'den fazla tetiklenirse kapatılır ve GM bilgilendirilir.",
        ],
      },
      inspector: {
        heading: 'Denetleyici',
        points: [
          "Sonraki Mesajı İncele'ye tıklayın, ardından atışı yapın. CRL gördüklerini fısıldar: mesaj türü, gönderen, karakter, şablon ve alanları, zarlarıyla birlikte her atış, dinleyicilerin aradığı metin ve her dinleyicinin neden tetiklendiği ya da tetiklenmediği.",
          'Bir sayfanın şablon adını bulmak veya bir Beacon sayfasının (D&D 2024 gibi) ne gönderdiğini görmek için kullanın.',
          'Beacon sayfaları atış şablonları yerine atış kartları gönderir. CRL bunları okur: şablon, kartın ilk sınıfıdır (D&D 2024 için dnd-2024); karakter, başlık (Dexterity Check gibi) ve alt kategori alan olur; dökümdeki her atış bir atış sayılır, böylece kritik başarı, kritik başarısızlık, toplam ve doğal zar kontrolleri çalışır.',
        ],
      },
      settings: {
        heading: 'Ayarlar',
        intro:
          'Bunları !crl config ile veya Ayarlar düğmesiyle değiştirin. Bazıları modun One-Click seçeneklerinden de ayarlanabilir.',
        colKey: 'Ayar',
        colName: 'Ad',
        colDesc: 'Açıklama',
      },
      storage: {
        heading: 'Dinleyiciler Nerede Saklanır',
        body: 'Her dinleyici, arşivlenmiş "{character}" karakterindeki bir yetenektir. Yetenek komutları tutar, böylece bunları Günlük\'te tam makro düzenleyiciyle düzenleyebilirsiniz. Açıklaması ise dinleyicinin kurallarını tutar; bu sayede dinleyiciler oyun kopyalandığında da korunur. Bir yeteneği silmek dinleyicisini de siler; elle eklenen bir yetenek menüde kapalı olarak görünür.',
      },
      upgrading: {
        heading: "Sürüm 1'den Yükseltme",
        points: [
          'Sürüm 1 dinleyicileri ilk başlatmada dönüştürülür ve komutlarını korur.',
          'Yalnızca düz karakterler içeren metin düz metne dönüşür ve artık büyük/küçük harf ayrımı yapmaz. Düzenli ifade sembolleri kullanan metin düzenli ifade olarak kalır.',
          'Atış sonucu olan ama ## içermeyen dinleyiciler eskiden "not parseable" hatasıyla başarısız oluyordu; artık mesajdaki her atışı kontrol ederler.',
          'fail artık hiç başarı olmayan hedefli atış anlamına gelir; hedefi tam tutturan atış başarıdır.',
          'Sürüm 1 komutları hâlâ çalışır:',
        ],
        colV1: 'Sürüm 1',
        colV2: 'Sürüm 2',
      },
      troubleshooting: {
        heading: 'Sorun Giderme',
        points: [
          "Hiçbir şey olmuyor: Dinleme'nin ve dinleyicinin açık olduğunu kontrol edin, ardından hangi filtrenin tutmadığını görmek için denetleyiciyi kullanın.",
          'Bir sayfanın atışları tanınmıyor: birini inceleyin; gösterilen şablon adı ve alanlar filtrelemeniz gereken şeylerdir.',
          "Modların Beacon sayfalarının (D&D 2024 gibi) atışlarını görebilmesi için Experimental Mod sandbox'ı gerekir.",
          "@{…} veya %{…} kullanan komutlar !crl ile yazıldığında bunları kaybeder; bunun yerine yeteneği Günlük'te düzenleyin.",
          "Hasar zarları kritik sayılıyor: Kontrol edilen zarlar'ı d20 olarak ayarlayın.",
          'Hatalar API konsoluna "Customizable Roll Listener" önekiyle yazılır.',
        ],
      },
      languages: {
        heading: 'Diller',
        body: 'Dili !crl config language ile veya Language One-Click seçeneğiyle seçin. Desteklenen diller:',
        colCode: 'Kod',
        colName: 'Dil',
        colNative: 'Yerel adı',
      },
      credits: {
        heading: 'Emeği Geçenler',
        original: 'Orijinal mod:',
        maintainer: 'Sürüm 2:',
        support: 'Sorunları Roll20 forumlarında veya GitHub deposunda bildirin.',
        wiki: 'Sürüm 1 wiki sayfası',
      },
    },
  };

  const TRANSLATION = {
    titles: {
      ready: 'Customizable Roll Listener готовий до роботи.',
      settings: 'Налаштування CRL',
      languages: 'Вибір мови',
      help: 'Команди CRL',
      confirm: 'Підтвердьте дію',
      inspect: 'Інспектор CRL',
      listener: 'Слухач: {name}',
      listenerCommands: 'Команди: {name}',
    },
    menu: {
      listening: 'Прослуховування',
      listeners: 'Слухачі (перевіряються в такому порядку)',
      noListeners: 'Слухачів ще немає. Натисніть «Новий слухач», щоб створити його.',
      noCommands: 'Команд ще немає.',
      commandsHint:
        'Під час введення команд у чаті розділяйте рядки символами \\\\. Для посилань @{...} або %{...} редагуйте здібність у Журналі: чат підставляє їхні значення раніше, ніж їх побачить CRL.',
    },
    buttons: {
      back: 'Назад',
      change: 'Змінити',
      confirmDelete: 'Так, видалити',
      delete: 'Видалити',
      edit: 'Змінити',
      help: 'Довідка',
      inspect: 'Перевірити наступне повідомлення',
      inspectOff: 'Зупинити перевірку',
      new: 'Новий слухач',
      openJournal: 'Відкрити в Журналі',
      rebuildJournal: 'Перестворити роздаткові матеріали',
      rename: 'Перейменувати',
      setCommands: 'Задати команди',
      settings: 'Налаштування',
      test: 'Тест',
      enable: 'Увімкнути',
      disable: 'Вимкнути',
      menu: 'Слухачі',
      turnOn: 'Прослуховування увімк.',
      turnOff: 'Прослуховування вимк.',
    },
    prompts: {
      newName: 'Ім’я нового слухача',
      name: 'Нове ім’я',
      target: 'Ім’я слухача',
      commands: 'Команди — рядки розділяються двома зворотними скісними рисками',
      templates:
        'Шаблони кидків через пробіл — none, якщо без шаблону — порожньо, якщо будь-який — інспектор показує шаблон кидка',
      types: 'Типи повідомлень через пробіл — порожньо, якщо будь-який, крім api',
      text: 'Текст для пошуку — див. роздатковий матеріал «Довідка» — порожньо, якщо будь-який',
      regex: 'Як читати текст',
      who: 'Імена відправників або персонажів через кому — порожньо, якщо будь-хто',
      players: 'Імена гравців через кому — порожньо, якщо будь-хто',
      results: 'Результат кидка',
      total:
        'Сума кидка, наприклад 15 або 19-20 — див. роздатковий матеріал «Довідка» — порожньо, якщо будь-яка',
      natural: 'Натуральний результат кубика, наприклад 20 або 1-2 — порожньо, якщо будь-який',
      dice: 'Які кубики перевіряються',
      cooldown: 'Скільки секунд чекати до повторного спрацювання — 0, якщо без перезарядки',
      speaker: 'Надсилати команди від імені',
    },
    choices: {
      critOrFumble: 'Критичний успіх або провал',
    },
    values: {
      on: 'Увімк.',
      off: 'Вимк.',
      none: 'Немає',
      any: 'Будь-який',
      allButApi: 'Будь-який (крім команд API)',
      plain: 'Звичайний текст',
      regex: 'Регулярний вираз',
      diceAuto: 'Авто (d20, якщо кинуто)',
      diceAny: 'Будь-який кубик',
      seconds: '{seconds} с',
      speaker: {
        default: 'Як у налаштуваннях',
        crl: 'CRL',
        roller: 'Той, хто кидав',
      },
    },
    results: {
      crit: 'Критичний успіх',
      fumble: 'Критичний провал',
      success: 'Успіх',
      fail: 'Провал',
    },
    fields: {
      enabled: 'Увімкнено',
      templates: 'Шаблони кидків',
      types: 'Типи повідомлень',
      text: 'Текст',
      regex: 'Текст як',
      who: 'Відправники / персонажі',
      players: 'Гравці',
      results: 'Результат кидка',
      total: 'Сума кидка',
      natural: 'Натуральний результат',
      dice: 'Кубики, що перевіряються',
      cooldown: 'Перезарядка',
      stop: 'Зупинитися на цьому',
      speaker: 'Від імені',
      commands: 'Команди',
    },
    settings: {
      enabled: {
        label: 'Прослуховування',
        desc: 'Вмикає або вимикає одразу всіх слухачів.',
      },
      speaker: {
        label: 'Надсилати команди від імені',
        desc: 'Від чийого імені надсилаються команди слухачів, якщо в слухачі не вказано інше: CRL або персонаж (чи гравець), чиє повідомлення викликало спрацювання.',
      },
      listenToMods: {
        label: 'Слухати інші моди',
        desc: 'Чи можуть повідомлення інших модів викликати спрацювання слухачів. На власні повідомлення CRL ніколи не реагує.',
      },
      language: {
        label: 'Мова',
        desc: 'Мова меню, повідомлень і роздаткових матеріалів.',
      },
    },
    inspect: {
      type: 'Тип',
      who: 'Відправник',
      character: 'Персонаж',
      player: 'Гравець',
      template: 'Шаблон кидка',
      keys: 'Властивості повідомлення',
      extras: 'Додаткові дані повідомлення',
      fields: 'Поля шаблону',
      rolls: 'Кидки',
      dice: 'кубики',
      table: 'таблиця',
      target: 'є поріг успіху',
      crit: 'крит. успіх',
      fumble: 'крит. провал',
      text: 'Текст (як його бачать слухачі)',
      raw: 'Вихідний вміст',
      listeners: 'Слухачі',
      matched: 'спрацює: {result}',
      reasons: {
        disabled: 'вимкнено',
        type: 'тип повідомлення не збігається',
        template: 'шаблон кидка не збігається',
        who: 'відправник або персонаж не збігається',
        player: 'гравець не збігається',
        text: 'текст не знайдено',
        roll: 'жоден кидок не відповідає умовам кидка',
      },
    },
    messages: {
      upgraded:
        'Виконано оновлення з версії 1. Перетворено слухачів: {count}, їхні команди збережено.',
      restored: 'Відновлено слухачів із персонажа-сховища: {count}.',
      adopted:
        'У персонажа-сховища знайдено здібностей без правил слухача: {count}. Їх додано вимкненими; налаштуйте їх через меню.',
      removed: 'Видалено слухачів, чию здібність було видалено: {count}.',
      listeningOff: 'Прослуховування вимкнено. Введіть !crl on, щоб увімкнути його.',
      readyHint:
        'Слухачів: {count}. Введіть !crl, щоб відкрити меню, або !crl help, щоб побачити всі команди.',
      loopStopped:
        'Слухач «{name}» спрацьовував надто часто за короткий час — імовірно, його команди знову його запускають, — тому його вимкнено.',
      noCommands: 'Слухач «{name}» не має команд для виконання.',
      tested: 'Виконано команди слухача «{name}» (повідомлень: {count}).',
      confirmDelete: 'Видалити слухача «{name}» і його команди? Цю дію не можна скасувати.',
      deleted: 'Слухача «{name}» видалено.',
      inspectOn: 'Наступне повідомлення в чаті буде перевірено, а результат надійде вам пошепки.',
      inspectOff: 'Інспектор вимкнено.',
      journalRebuilt: 'Роздаткові матеріали «{help}» і «{deck}» перестворено.',
    },
    errors: {
      gmOnly: 'Команди Customizable Roll Listener доступні лише майстру.',
      unexpected: 'Щось пішло не так: {message}',
      unknownCommand: 'Невідома команда «{command}».',
      badOption: 'Невідомий параметр --{option}.',
      notFound: 'Слухача з ім’ям «{name}» немає.',
      nameRequired: 'Вкажіть ім’я слухача.',
      nameInvalid: 'Ім’я «{name}» використовувати не можна.',
      nameTaken: 'Слухач з ім’ям «{name}» уже існує.',
      badOnOff: 'Значення «{value}» неприпустиме для --{option}.',
      badType: 'Невідомі типи повідомлень: {value}.',
      badRegex: 'Регулярний вираз «{term}» неприпустимий: {error}',
      tooManyTerms: 'Слухач може шукати щонайбільше {max} фрагментів тексту.',
      badResult: 'Невідомі результати кидка: {value}.',
      badComparison: 'Значення «{value}» неприпустиме для --{option}.',
      badDice: 'Значення «{value}» неприпустиме для --dice.',
      badCooldown: 'Значення «{value}» неприпустиме для --cooldown.',
      badSpeaker: 'Значення «{value}» неприпустиме для --speaker.',
      noStore: 'Не вдалося створити персонажа-сховище.',
      badSetting: 'Невідоме налаштування «{key}».',
      badSettingValue: 'Значення «{value}» неприпустиме для {key}.',
    },
    hints: {
      gmOnly: 'Попросіть майстра налаштувати для вас слухачів.',
      unknownCommand: 'Введіть !crl help, щоб побачити всі команди.',
      badOption:
        'Доступні параметри: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name і --commands.',
      notFound: 'Введіть !crl, щоб побачити список слухачів.',
      nameInvalid:
        'Не більше {max} символів, без таких: | { } [ ] \\ @ % # ? ~ і «--»; ім’я не повинно починатися з «-».',
      badOnOff: 'Використовуйте on або off.',
      badType: 'Типи повідомлень: {types}.',
      badResult: 'Використовуйте crit, fumble, success або fail.',
      badComparison:
        'Використовуйте число, порівняння, наприклад >=15 або <3, або діапазон, наприклад 19-20.',
      badDice: 'Використовуйте auto, any або розмір кубика, наприклад 20 чи d20.',
      badCooldown: 'Використовуйте ціле число секунд від 0 до 3600.',
      badSpeaker: 'Використовуйте default, crl або roller.',
      badSetting: 'Налаштування: {keys}.',
      noStore: 'Перевірте консоль API на наявність помилок, потім перезапустіть пісочницю.',
    },
    help: {
      menu: 'Показати список слухачів.',
      new: 'Створити слухача. Параметри можна вказати одразу.',
      show: 'Показати слухача та його налаштування з кнопками для їх зміни.',
      edit: 'Змінити слухача. Залиште значення порожнім (або вкажіть -), щоб очистити його.',
      commands:
        'Замінити команди слухача. Використовується все, що йде після --commands, тому ставте його останнім.',
      enable: 'Увімкнути або вимкнути слухача.',
      move: 'Перемістити слухача вище або нижче в порядку перевірки.',
      test: 'Виконати команди слухача зараз, ніби випало натуральне 20.',
      delete: 'Видалити слухача та його команди (з підтвердженням).',
      inspect:
        'Надіслати пошепки розбір наступного повідомлення в чаті та список слухачів, які на нього спрацюють.',
      inspectOff: 'Перестати чекати повідомлення для перевірки.',
      onOff: 'Увімкнути або вимкнути все прослуховування.',
      config: 'Показати або змінити загальні налаштування.',
      journal: 'Перестворити роздаткові матеріали «Довідка» і «Панель команд».',
      help: 'Показати цей список.',
      optionsTitle: 'Параметри',
      options:
        'Параметри: --templates, --types, --text, --regex, --who, --players, --results, --total, --natural, --dice, --cooldown, --stop, --speaker, --enabled, --name і --commands. Замість ID можна вказувати імена.',
      placeholders:
        'У командах можна використовувати ${who}, ${character}, ${player}, ${template}, ${total}, ${natural}, ${result}, ${expression}, ${table}, ${listener} і ${field:name}.',
      handouts: 'У роздатковому матеріалі «{help}» усе докладно пояснено, а в «{deck}» є кнопки.',
    },
    store: {
      bio: 'Цей персонаж належить моду Customizable Roll Listener. Кожна здібність — це один слухач: у самій здібності зберігаються команди для виконання, а в її описі — правила слухача.',
      bioHelp:
        'Тут можна редагувати команди. Правила змінюються через !crl або в роздатковому матеріалі «Панель команд». Видалення здібності видаляє і її слухача.',
    },
    deck: {
      subtitle: 'Панель команд',
      listeners: 'Слухачі',
      listenersDesc: 'Перегляд, створення, зміна та тестування слухачів.',
      listening: 'Прослуховування',
      listeningDesc: 'Увімкнути або вимкнути одразу всіх слухачів.',
      tools: 'Інструменти',
      toolsDesc:
        'Перевірити повідомлення в чаті, змінити налаштування, перестворити роздаткові матеріали або відкрити довідку.',
      footer: 'Усі команди доступні лише майстру. Подробиці — у роздатковому матеріалі «{help}».',
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Слухай кубики — слухай дію',
      footer: 'Кнопки для всіх команд — у роздатковому матеріалі «{deck}».',
      overview: {
        heading: 'Огляд',
        body: 'Customizable Roll Listener (CRL) стежить за чатом і виконує вибрані вами команди, коли повідомлення відповідає слухачу. Слухач може враховувати шаблон кидка, текст, відправника повідомлення та кидки в ньому: критичні успіхи, критичні провали, успіхи, провали, суми й натуральні результати кубиків. Командою може бути все, що можна ввести в чат, зокрема команди інших модів, тож CRL може програвати звуки, кидати по таблицях, надсилати емоції, ставити маркери станів і багато іншого.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        steps: [
          'Введіть !crl у чаті (або натисніть «Слухачі» в роздатковому матеріалі «Панель команд»).',
          'Натисніть «Новий слухач» і задайте ім’я, наприклад «Звук крита».',
          'Натисніть «Змінити» поруч із пунктом «Результат кидка» та виберіть «Критичний успіх».',
          'Натисніть «Задати команди» та введіть, що потрібно виконати, наприклад !roll20AM --audio,play|Crit.',
          'Натисніть «Тест», щоб перевірити команди, потім зробіть кидок атаки. Якщо слухач не спрацьовує, скористайтеся кнопкою «Перевірити наступне повідомлення».',
        ],
      },
      examples: {
        heading: 'Приклади',
        points: [
          'Звук на будь-яке критичне влучання, з будь-якого аркуша: --results crit',
          'Таблиця критичних провалів на натуральній 1 у шаблоні атаки D&D 5e 2014: --templates atkdmg atk --natural 1',
          'Реакція на результат таблиці кидків: --text Бій',
          'Лише для одного персонажа: --who Аліса',
          'Сума 20 або більше в першому вбудованому кидку перевірки «Сила»: --text Сила && ## --total >=20',
        ],
        code: [
          '!crl new Звук крита --results crit --commands !roll20AM --audio,play|Crit',
          '!crl new Критпровал --natural 1 --dice 20 --commands /em провалюється! \\\\ /roll 1t[Fumbles]',
          '!crl new Оповідач --results crit fumble --speaker crl --commands /desc ${who} викидає ${result}!',
        ],
      },
      matching: {
        heading: 'Що перевіряє слухач',
        points: [
          'Слухач спрацьовує, коли збігаються всі задані в ньому фільтри. Порожній фільтр підходить під усе.',
          'Шаблони кидків: ім’я шаблону, наприклад atkdmg або simple. «none» підходить для повідомлень без шаблону. Якщо вказано кілька імен, підходить будь-яке з них.',
          'Типи повідомлень: general, rollresult, gmrollresult, emote, whisper, desc, advancedroll (аркуші Beacon) і api. Якщо поле порожнє, перевіряються всі типи, крім команд api.',
          'Текст: один або кілька фрагментів тексту через &&, які мають трапитися всі. Регістр літер не враховується. Текст шукається також у сумах кидків і результатах таблиць кидків.',
          '## у тексті позначає вбудований кидок; тоді перевірки кидка дивляться лише на знайдені там кидки. Без ## перевіряється кожен кидок у повідомленні.',
          'Замість звичайного тексту можна використати регулярний вираз (--regex on).',
          'Відправники / персонажі: ім’я, показане в чаті, або ім’я персонажа в шаблоні кидка. Гравці: відображуване ім’я гравця.',
        ],
      },
      templates: {
        heading: 'Імена шаблонів кидків',
        points: [
          'Шаблон кидка — це оформлення карток кидків, яке використовує аркуш. Його ім’я — частина після template: у макросі, тобто &{template:atkdmg} — це шаблон atkdmg. Кожен аркуш має свої імена.',
          'Найшвидше дізнатися ім’я так: натисніть «Перевірити наступне повідомлення», зробіть кидок з аркуша й прочитайте рядок «Шаблон кидка» у відповіді CRL.',
          'Ім’я також можна знайти в макросі кнопки аркуша або у вихідному коді аркуша на GitHub, де кожен шаблон — це <rolltemplate class="sheet-rolltemplate-NAME">.',
          'Шаблони поширених аркушів:',
        ],
        colSheet: 'Аркуш',
        colNames: 'Імена шаблонів',
        links: 'Докладніше про шаблони кидків:',
        builtIn: 'Roll20: вбудовані шаблони кидків',
        dnd5e2014: 'Roll20: шаблони кидків D&D 5e (2014)',
        sheets: 'Вихідний код аркушів персонажів Roll20',
      },
      rolls: {
        heading: 'Перевірки кидка',
        points: [
          'Результат кидка: критичний успіх (найвища грань кубика або діапазон cs), критичний провал (1 або діапазон cf), успіх (хоча б один кубик досяг порогу, наприклад 1d20>15), провал (кидок із порогом без жодного успіху). Якщо вказано кілька результатів, підходить будь-який.',
          'Сума кидка: число, порівняння, наприклад >=15, або діапазон, наприклад 19-20.',
          'Натуральний результат: грань, що випала на кубику, наприклад 20 або <=2.',
          'Кубики, що перевіряються: auto дивиться лише на d20, якщо їх кидали, тож найвища грань на кубиках шкоди не вважається критом. Щоб це змінити, виберіть будь-який кубик або розмір, наприклад d100.',
          'Відкинуті кубики (перевага й перешкода) та перекинуті кубики не враховуються.',
          'Аркуш D&D 5E by Roll20 (2014) кидає перевагу й перешкоду як два окремі кидки d20 (r1 і r2), тому CRL перевіряє обидва: з перевагою 1 на меншому кубику все одно вважається критичним провалом, а з перешкодою 20 на більшому кубику все одно вважається критичним успіхом.',
          'Слухач спрацьовує, коли хоча б один кидок проходить усі перевірки кидка.',
        ],
      },
      commands: {
        heading: 'Команди чату',
        intro: 'Усі команди доступні лише майстру. Слухача можна вказати за ім’ям або за ID.',
        colCommand: 'Команда',
        colDesc: 'Що робить',
      },
      options: {
        heading: 'Параметри слухача',
        intro:
          'Додавайте їх до !crl new або !crl edit. Щоб очистити значення, залиште його порожнім або вкажіть -. --commands має йти останнім.',
        colOption: 'Параметр',
        colDesc: 'Значення',
        templates:
          'Імена шаблонів кидків через пробіл. none — без шаблону. Див. «Імена шаблонів кидків» вище.',
        types: 'Типи повідомлень через пробіл: {types}.',
        text: 'Текст для пошуку. Фрагменти розділяються &&. ## позначає вбудований кидок.',
        regex: 'on — читати текст як регулярні вирази, off — як звичайний текст.',
        who: 'Імена відправників або персонажів через кому.',
        players: 'Відображувані імена гравців через кому.',
        results: 'crit, fumble, success і/або fail.',
        total: 'Сума кидка: 15, >=15, <5 або 19-20.',
        natural: 'Натуральний результат кубика: 20, <=2 або 19-20.',
        dice: 'auto, any або розмір кубика, наприклад 20.',
        cooldown: 'Скільки секунд має минути до повторного спрацювання слухача.',
        stop: 'on — не перевіряти наступних слухачів, якщо спрацював цей.',
        speaker: 'default, crl або roller.',
        enabled: 'on або off.',
        name: 'Перейменовує слухача.',
        commands: 'Команди для виконання. Рядки розділяються символами \\\\.',
      },
      placeholders: {
        heading: 'Підстановки',
        intro: 'Замінюються в командах слухача, коли він спрацьовує.',
        colName: 'Підстановка',
        colDesc: 'Замінюється на',
        who: 'Ім’я, показане в чаті.',
        character: 'Ім’я персонажа з шаблону кидка або ім’я, показане в чаті.',
        player: 'Відображуване ім’я гравця.',
        template: 'Ім’я шаблону кидка.',
        total: 'Сума кидка, що підійшов (або першого кидка).',
        natural: 'Натуральний результат d20 (або першого кубика) цього кидка.',
        result: 'crit, fumble, success або fail, якщо такий результат було задано.',
        expression: 'Вираз кидка, наприклад 1d20+5.',
        table: 'Результати таблиць кидків у цьому кидку.',
        listener: 'Ім’я слухача.',
        field:
          'Поле шаблону кидка, наприклад ${field:rname} (вбудовані кидки показуються як їхні суми).',
      },
      running: {
        heading: 'Як виконуються команди',
        points: [
          'Кожен рядок надсилається окремим повідомленням у чат; виняток — блок {{ … }} на кілька рядків (шаблон кидка або скрипт ScriptCards), він надсилається цілим.',
          'Команди надсилаються від імені CRL або персонажа, який кидав, — як задано в слухачі чи в налаштуваннях. Інші моди бачать команди, надіслані CRL, як такі, що надійшли від API.',
          'У командах можна використовувати вбудовані кидки, шаблони кидків, @{Character|attribute} і %{Character|ability}. Посилання на вибраний токен (@{selected|…}) і запити (?{…}) не працюють, бо питати нікого.',
          'Слухачі перевіряються по черзі. Слухач з увімкненим «Зупинитися на цьому» не дає наступним слухачам спрацювати на те саме повідомлення.',
          'Перезарядка не дає слухачу спрацювати повторно протягом указаної кількості секунд.',
          'CRL не реагує на власні повідомлення. Якщо слухач усе ж спрацьовує понад 20 разів за 10 секунд, його вимикають, а майстер отримує сповіщення.',
        ],
      },
      inspector: {
        heading: 'Інспектор',
        points: [
          'Натисніть «Перевірити наступне повідомлення», потім зробіть кидок. CRL пошепки повідомить, що побачив: тип повідомлення, відправника, персонажа, шаблон і його поля, кожен кидок із кубиками, текст, у якому шукають слухачі, і чому кожен слухач спрацював чи ні.',
          'Так можна дізнатися ім’я шаблону аркуша або подивитися, що надсилає аркуш Beacon (наприклад, D&D 2024).',
          'Аркуші Beacon публікують картки кидків замість шаблонів кидків. CRL їх читає: шаблоном вважається перший клас картки (dnd-2024 для D&D 2024), персонаж, заголовок (наприклад, «Перевірка Спритності») і підкатегорія стають полями, а кожен кидок із розшифровки — окремим кидком, тож перевірки критичного успіху, критичного провалу, суми й натурального результату працюють.',
        ],
      },
      settings: {
        heading: 'Налаштування',
        intro:
          'Змінюються командою !crl config або кнопкою «Налаштування». Деякі також можна задати в параметрах One-Click мода.',
        colKey: 'Налаштування',
        colName: 'Назва',
        colDesc: 'Опис',
      },
      storage: {
        heading: 'Де зберігаються слухачі',
        body: 'Кожен слухач — це здібність архівного персонажа «{character}». У здібності зберігаються команди, тож їх можна редагувати в Журналі в повноцінному редакторі макросів. В її описі зберігаються правила слухача, завдяки чому слухачі зберігаються й під час копіювання гри. Видалення здібності видаляє її слухача; здібність, додана вручну, з’являється в меню вимкненою.',
      },
      upgrading: {
        heading: 'Оновлення з версії 1',
        points: [
          'Слухачі версії 1 перетворюються під час першого запуску й зберігають свої команди.',
          'Текст лише зі звичайних символів стає звичайним текстом і тепер шукається без урахування регістру. Текст із символами регулярних виразів залишається регулярним виразом.',
          'Слухачі з результатом кидка, але без ##, раніше завершувалися помилкою «not parseable»; тепер вони перевіряють кожен кидок у повідомленні.',
          'fail тепер означає кидок із порогом без жодного успіху; кидок, що рівно досяг порогу, — успіх.',
          'Команди версії 1 досі працюють:',
        ],
        colV1: 'Версія 1',
        colV2: 'Версія 2',
      },
      troubleshooting: {
        heading: 'Усунення проблем',
        points: [
          'Нічого не відбувається: переконайтеся, що прослуховування і сам слухач увімкнені, потім за допомогою інспектора подивіться, який фільтр не проходить.',
          'Кидки аркуша не розпізнаються: перевірте один із них інспектором; фільтрувати слід за показаним ім’ям шаблону та полями.',
          'Щоб моди бачили кидки аркушів Beacon (наприклад, D&D 2024), потрібна пісочниця Experimental Mod.',
          'Команди з @{…} або %{…} втрачають їх під час введення через !crl; редагуйте здібність у Журналі.',
          'Кубики шкоди вважаються критами: встановіть «Кубики, що перевіряються» на d20.',
          'Помилки записуються в консоль API з префіксом «Customizable Roll Listener».',
        ],
      },
      languages: {
        heading: 'Мови',
        body: 'Виберіть мову командою !crl config language або в параметрі One-Click «Language». Підтримувані мови:',
        colCode: 'Код',
        colName: 'Мова',
        colNative: 'Власна назва',
      },
      credits: {
        heading: 'Автори',
        original: 'Автор оригінального мода:',
        maintainer: 'Версія 2:',
        support: 'Повідомляйте про проблеми на форумах Roll20 або в репозиторії GitHub.',
        wiki: 'Вікі-сторінка версії 1',
      },
    },
  };

  const DEFAULT_LOCALE = 'en-US';

  const LOCALE_DEFINITIONS = Object.freeze([
    {
      code: 'af',
      name: 'Afrikaans',
      direction: 'ltr',
      translationFile: 'locale/af.js',
      flag: '🇿🇦',
      flagLabel: 'Flag of South Africa',
    },
    {
      code: 'ca',
      name: 'Catalan',
      nativeName: 'Català',
      direction: 'ltr',
      translationFile: 'locale/ca.js',
      flag: '🇪🇸',
      flagLabel: 'Flag of Spain',
    },
    {
      code: 'zh-TW',
      name: 'Chinese (Traditional)',
      nativeName: '正體中文',
      direction: 'ltr',
      translationFile: 'locale/zh-TW.js',
      aliases: ['zh'],
      flag: '🇹🇼',
      flagLabel: 'Flag of Taiwan',
    },
    {
      code: 'cs',
      name: 'Czech',
      nativeName: 'Čeština',
      direction: 'ltr',
      translationFile: 'locale/cs.js',
      flag: '🇨🇿',
      flagLabel: 'Flag of Czechia',
    },
    {
      code: 'da',
      name: 'Danish',
      nativeName: 'Dansk',
      direction: 'ltr',
      translationFile: 'locale/da.js',
      flag: '🇩🇰',
      flagLabel: 'Flag of Denmark',
    },
    {
      code: 'nl',
      name: 'Dutch',
      nativeName: 'Nederlands',
      direction: 'ltr',
      translationFile: 'locale/nl.js',
      flag: '🇳🇱',
      flagLabel: 'Flag of the Netherlands',
    },
    {
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      translationFile: 'locale/en-US.js',
      aliases: ['en'],
      flag: '🇺🇸',
      flagLabel: 'Flag of the United States',
    },
    {
      code: 'fi',
      name: 'Finnish',
      nativeName: 'Suomeksi',
      direction: 'ltr',
      translationFile: 'locale/fi.js',
      flag: '🇫🇮',
      flagLabel: 'Flag of Finland',
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      direction: 'ltr',
      translationFile: 'locale/fr.js',
      flag: '🇫🇷',
      flagLabel: 'Flag of France',
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      direction: 'ltr',
      translationFile: 'locale/de.js',
      flag: '🇩🇪',
      flagLabel: 'Flag of Germany',
    },
    {
      code: 'el',
      name: 'Greek',
      nativeName: 'Ελληνικά',
      direction: 'ltr',
      translationFile: 'locale/el.js',
      flag: '🇬🇷',
      flagLabel: 'Flag of Greece',
    },
    {
      code: 'he',
      name: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl',
      translationFile: 'locale/he.js',
      flag: '🇮🇱',
      flagLabel: 'Flag of Israel',
    },
    {
      code: 'hu',
      name: 'Hungarian',
      nativeName: 'Magyar',
      direction: 'ltr',
      translationFile: 'locale/hu.js',
      flag: '🇭🇺',
      flagLabel: 'Flag of Hungary',
    },
    {
      code: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr',
      translationFile: 'locale/it.js',
      flag: '🇮🇹',
      flagLabel: 'Flag of Italy',
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      direction: 'ltr',
      translationFile: 'locale/ja.js',
      flag: '🇯🇵',
      flagLabel: 'Flag of Japan',
    },
    {
      code: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      direction: 'ltr',
      translationFile: 'locale/ko.js',
      flag: '🇰🇷',
      flagLabel: 'Flag of South Korea',
    },
    {
      code: 'pl',
      name: 'Polish',
      nativeName: 'Polski',
      direction: 'ltr',
      translationFile: 'locale/pl.js',
      flag: '🇵🇱',
      flagLabel: 'Flag of Poland',
    },
    {
      code: 'pt-PT',
      name: 'Portuguese (Portugal)',
      nativeName: 'Português - Portugal',
      direction: 'ltr',
      translationFile: 'locale/pt-PT.js',
      aliases: ['pt'],
      flag: '🇵🇹',
      flagLabel: 'Flag of Portugal',
    },
    {
      code: 'pt-BR',
      name: 'Portuguese (Brazil)',
      nativeName: 'Português - Brasil',
      direction: 'ltr',
      translationFile: 'locale/pt-BR.js',
      flag: '🇧🇷',
      flagLabel: 'Flag of Brazil',
    },
    {
      code: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      direction: 'ltr',
      translationFile: 'locale/ru.js',
      flag: '🇷🇺',
      flagLabel: 'Flag of Russia',
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      direction: 'ltr',
      translationFile: 'locale/es.js',
      flag: '🇪🇸',
      flagLabel: 'Flag of Spain',
    },
    {
      code: 'sv',
      name: 'Swedish',
      nativeName: 'Svenska',
      direction: 'ltr',
      translationFile: 'locale/sv.js',
      flag: '🇸🇪',
      flagLabel: 'Flag of Sweden',
    },
    {
      code: 'tr',
      name: 'Turkish',
      nativeName: 'Türkçe',
      direction: 'ltr',
      translationFile: 'locale/tr.js',
      flag: '🇹🇷',
      flagLabel: 'Flag of Turkey',
    },
    {
      code: 'uk',
      name: 'Ukrainian',
      nativeName: 'Українська',
      direction: 'ltr',
      translationFile: 'locale/uk.js',
      flag: '🇺🇦',
      flagLabel: 'Flag of Ukraine',
    },
  ]);

  const SUPPORTED_LOCALES = Object.freeze(LOCALE_DEFINITIONS.map(({ code }) => code));
  const VALID_LOCALES = new Set(SUPPORTED_LOCALES);
  const LOCALE_ALIASES = Object.freeze(
    LOCALE_DEFINITIONS.reduce((aliases, locale) => {
      for (const alias of locale.aliases || []) {
        aliases[alias] = locale.code;
      }
      return aliases;
    }, {})
  );
  const LOCALE_LABELS = Object.freeze(
    LOCALE_DEFINITIONS.reduce((labels, locale) => {
      const displayName = locale.nativeName
        ? `${locale.code} - ${locale.name} (${locale.nativeName})`
        : `${locale.code} - ${locale.name}`;
      labels[locale.code] = displayName;
      return labels;
    }, {})
  );
  SUPPORTED_LOCALES.map((code) => LOCALE_LABELS[code]).join(' / ');

  const TRANSLATIONS = {
    af: TRANSLATION$m,
    ca: TRANSLATION$l,
    'zh-TW': TRANSLATION$k,
    cs: TRANSLATION$j,
    da: TRANSLATION$i,
    nl: TRANSLATION$h,
    'en-US': localeEnUS,
    fi: TRANSLATION$g,
    fr: TRANSLATION$f,
    de: TRANSLATION$e,
    el: TRANSLATION$d,
    he: TRANSLATION$c,
    hu: TRANSLATION$b,
    it: TRANSLATION$a,
    ja: TRANSLATION$9,
    ko: TRANSLATION$8,
    pl: TRANSLATION$7,
    'pt-PT': TRANSLATION$6,
    'pt-BR': TRANSLATION$5,
    ru: TRANSLATION$4,
    es: TRANSLATION$3,
    sv: TRANSLATION$2,
    tr: TRANSLATION$1,
    uk: TRANSLATION,
  };

  /**
   * Returns the canonical locale for a supported locale string or alias.
   * Matching is case-insensitive after exact matches are checked.
   *
   * @param {string} lang Locale string or alias (e.g. 'en', 'fr', 'zh-TW').
   * @returns {string} Canonical locale code, or an empty string when unsupported.
   */
  function normalizeLocale(lang) {
    const s = typeof lang === 'string' ? lang.trim() : '';
    if (VALID_LOCALES.has(s)) {
      return s;
    }
    if (LOCALE_ALIASES[s]) {
      return LOCALE_ALIASES[s];
    }
    const normalized = s.toLowerCase();
    const found = Array.from(VALID_LOCALES).find((locale) => locale.toLowerCase() === normalized);
    return (
      found ||
      Object.entries(LOCALE_ALIASES).find(([alias]) => alias.toLowerCase() === normalized)?.[1] ||
      ''
    );
  }

  /**
   * Returns a valid canonical locale, falling back to the default when unsupported.
   *
   * @param {string} lang Locale string to validate.
   * @returns {string} Validated canonical locale.
   */
  function getLocale(lang) {
    return normalizeLocale(lang) || DEFAULT_LOCALE;
  }

  /**
   * Navigates a nested object following dot-separated key path segments.
   *
   * @param {object} obj Root object.
   * @param {string[]} parts Key path segments.
   * @returns {*} Value at the path, or undefined.
   */
  function getNestedValue(obj, parts) {
    let current = obj;
    for (const part of parts) {
      if (current == null || typeof current !== 'object') {
        return undefined;
      }
      current = current[part];
    }
    return current;
  }

  /**
   * Returns the raw translated value (string, array or object) for a key,
   * falling back to en-US when the key is missing in the requested locale.
   *
   * @param {string} key Dot-separated translation key.
   * @param {string} locale Locale code.
   * @returns {*} Raw value, or undefined when not found.
   */
  function tRaw(key, locale) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    const value = getNestedValue(TRANSLATIONS[lang], parts);
    return value === undefined && lang !== DEFAULT_LOCALE
      ? getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts)
      : value;
  }

  /**
   * Returns the text direction CSS for a locale.
   *
   * @param {string} locale Locale code.
   * @returns {string} CSS declarations, empty for left-to-right locales.
   */
  function getDirectionStyle(locale) {
    const lang = getLocale(locale);
    const def = LOCALE_DEFINITIONS.find((d) => d.code === lang);
    return def?.direction === 'rtl' ? 'direction:rtl;text-align:right;' : '';
  }

  /**
   * Returns the translated string for a dot-separated key, interpolating {placeholder} vars.
   * Falls back to en-US when the key is missing in the requested locale.
   * No HTML escaping is performed — callers must pre-escape HTML-unsafe values.
   *
   * @param {string} key Dot-separated translation key (e.g. 'errors.noTokensSelected').
   * @param {string} locale Locale code.
   * @param {object} [vars] Interpolation variables mapped to {placeholder} names.
   * @returns {string} Translated and interpolated string. Returns the key when not found.
   */
  function t(key, locale, vars = {}) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    let value = getNestedValue(TRANSLATIONS[lang], parts);

    if (value === undefined && lang !== DEFAULT_LOCALE) {
      value = getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts);
    }

    if (typeof value !== 'string') {
      return key;
    }

    return value.replaceAll(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
  }

  // Decides whether a listener matches an analysed chat message. Pure
  // functions only, so the inspector can explain a verdict and tests need no
  // Roll20.

  // Placeholder a listener's text uses for "an inline roll goes here".
  const ROLL_PLACEHOLDER = '##';

  const MARKER_PATTERN = '\\$\\[\\[\\d+\\]\\]';
  const MARKER_GLOBAL = /\$\[\[(\d+)\]\]/g;

  /**
   * Parses a comparison typed by the GM: "15", "=15", ">=15", ">15", "<=5",
   * "<5" or a range "19-20".
   *
   * @param {*} raw Raw text.
   * @returns {{test: (n: number) => boolean, text: string}|null} Parsed check, or
   *          null when the text is empty or invalid.
   */
  function parseComparison(raw) {
    const text = toText(raw).replaceAll(/\s+/g, '');
    if (!text) {
      return null;
    }
    const range = /^(-?\d+)(?:\.\.|-)(-?\d+)$/.exec(text);
    if (range) {
      const low = Number(range[1]);
      const high = Number(range[2]);
      const [min, max] = low <= high ? [low, high] : [high, low];
      return { test: (n) => n >= min && n <= max, text: `${min}-${max}` };
    }
    const single = /^(>=|<=|==|=|>|<)?(-?\d+)$/.exec(text);
    if (!single) {
      return null;
    }
    const comp = single[1] || '=';
    const point = Number(single[2]);
    return {
      test: (n) => compare(n, comp, point),
      text: `${comp === '==' ? '=' : comp}${point}`,
    };
  }

  /**
   * Parses a die-size filter: "auto", "any", "20" or "d20".
   *
   * @param {*} raw Raw text.
   * @returns {string|number|null} 'auto', 'any', a die size, or null when invalid.
   */
  function parseDice(raw) {
    const text = toText(raw).toLowerCase();
    if (!text || text === 'auto') {
      return 'auto';
    }
    if (text === 'any' || text === 'all') {
      return 'any';
    }
    const match = /^d?(\d+)$/.exec(text);
    return match && Number(match[1]) > 1 ? Number(match[1]) : null;
  }

  /**
   * Compiles one text term into a regular expression. In plain mode the term
   * is literal text; in either mode "##" stands for an inline roll.
   *
   * @param {string} term Term typed by the GM.
   * @param {boolean} regex Whether the term is a regular expression.
   * @returns {RegExp} Compiled pattern (case-insensitive, global).
   * @throws {SyntaxError} When a regular expression is invalid.
   */
  function compileTerm(term, regex) {
    const pieces = String(term).split(ROLL_PLACEHOLDER);
    const source = pieces
      .map((piece) => (regex ? piece : escapeRegExp(piece)))
      .join(MARKER_PATTERN);
    return new RegExp(source, 'gi');
  }

  /**
   * Returns the first invalid regular expression in a list of terms.
   *
   * @param {string[]} terms Terms.
   * @returns {{term: string, error: string}|null} The problem, or null when all compile.
   */
  function findInvalidTerm(terms) {
    for (const term of terms) {
      try {
        compileTerm(term, true);
      } catch (err) {
        return { term, error: err?.message || String(err) };
      }
    }
    return null;
  }

  /**
   * Looks for every text term in a message.
   *
   * @param {object} listener Listener rules.
   * @param {object} message Analysed message.
   * @returns {{ok: boolean, rollIndexes: Set<number>, usedPlaceholder: boolean}}
   *          Whether every term was found, and the inline rolls the terms' "##"
   *          placeholders matched.
   */
  function matchText(listener, message) {
    const rollIndexes = new Set();
    let usedPlaceholder = false;
    for (const term of listener.text) {
      let pattern;
      try {
        pattern = compileTerm(term, listener.regex);
      } catch {
        return { ok: false, rollIndexes, usedPlaceholder };
      }
      const hits = [...message.raw.matchAll(pattern)].filter((hit) => hit[0].length > 0);
      if (term.includes(ROLL_PLACEHOLDER)) {
        usedPlaceholder = true;
        for (const hit of hits) {
          for (const marker of hit[0].matchAll(MARKER_GLOBAL)) {
            rollIndexes.add(Number(marker[1]));
          }
        }
        if (hits.length === 0) {
          return { ok: false, rollIndexes, usedPlaceholder };
        }
        continue;
      }
      // Text without "##" may also be found in the readable text, so roll
      // totals and rollable table results can be matched.
      pattern.lastIndex = 0;
      if (hits.length === 0 && !pattern.test(message.text)) {
        return { ok: false, rollIndexes, usedPlaceholder };
      }
    }
    return { ok: true, rollIndexes, usedPlaceholder };
  }

  /**
   * Returns true when a name list contains a name (case-insensitive).
   *
   * @param {string[]} list Names.
   * @param {...string} names Names to look for.
   * @returns {boolean} True when one is listed.
   */
  function listHas(list, ...names) {
    const wanted = new Set(list.map((n) => n.toLowerCase()));
    return names.some((name) => name && wanted.has(name.toLowerCase()));
  }

  /**
   * Returns the dice of a roll a listener's checks look at.
   *
   * @param {object} roll Roll description.
   * @param {string|number} dice Die-size filter ('any' or a size).
   * @returns {object[]} Dice.
   */
  function diceFor(roll, dice) {
    return dice === 'any' ? roll.dice : roll.dice.filter((d) => d.sides === dice);
  }

  /**
   * Checks one roll against a listener's roll conditions.
   *
   * @param {object} roll Roll description.
   * @param {object} checks Parsed checks.
   * @returns {string|null} The matched result ('' when none was asked for), or
   *          null when the roll fails.
   */
  function checkRoll(roll, checks) {
    const dice = diceFor(roll, checks.dice);
    if (checks.total && (roll.total === null || !checks.total.test(roll.total))) {
      return null;
    }
    if (checks.natural && !dice.some((d) => checks.natural.test(d.value))) {
      return null;
    }
    if (checks.results.length === 0) {
      return '';
    }
    const scored = dice.filter((d) => d.success !== null);
    const found = checks.results.find((result) => {
      switch (result) {
        case 'crit':
          return dice.some((d) => d.crit);
        case 'fumble':
          return dice.some((d) => d.fumble);
        case 'success':
          return scored.some((d) => d.success);
        case 'fail':
          return roll.hasTarget && !scored.some((d) => d.success);
        default:
          return false;
      }
    });
    return found ?? null;
  }

  /**
   * Tests a listener against an analysed message.
   *
   * @param {object} listener Listener rules.
   * @param {object} message Analysed message.
   * @returns {{ok: boolean, reason: string, roll: object|null, result: string}}
   *          Verdict. `reason` names the first filter that failed.
   */
  function matchListener(listener, message) {
    const fail = (reason) => ({ ok: false, reason, roll: null, result: '' });

    if (!listener.enabled) {
      return fail('disabled');
    }
    if (listener.types.length > 0) {
      if (!listener.types.includes(message.type)) {
        return fail('type');
      }
    } else if (message.type === 'api') {
      return fail('type');
    }
    if (listener.templates.length > 0) {
      const template = message.template.toLowerCase();
      const ok = listener.templates.some((t) =>
        t.toLowerCase() === TEMPLATE_NONE ? !template : t.toLowerCase() === template
      );
      if (!ok) {
        return fail('template');
      }
    }
    if (listener.who.length > 0 && !listHas(listener.who, message.who, message.character)) {
      return fail('who');
    }
    if (listener.players.length > 0 && !listHas(listener.players, message.playerName)) {
      return fail('player');
    }

    const text = matchText(listener, message);
    if (!text.ok) {
      return fail('text');
    }

    const checks = {
      results: listener.results,
      total: parseComparison(listener.total),
      natural: parseComparison(listener.natural),
      dice: parseDice(listener.dice) ?? 'auto',
    };
    const needsRoll = checks.results.length > 0 || checks.total || checks.natural;
    const scope = text.usedPlaceholder
      ? message.rolls.filter((r) => text.rollIndexes.has(r.index))
      : message.rolls;
    if (!needsRoll) {
      return { ok: true, reason: '', roll: scope[0] || null, result: '' };
    }
    if (checks.dice === 'auto') {
      // Most crit and fumble rules are about the d20, so when the rolls include
      // one, damage dice rolling their highest face do not count as crits.
      // Beacon sheets post damage on its own card; its dice are never crits.
      const damageCard = /^damage$/i.test(message.fields?.subcategory || '');
      checks.dice =
        damageCard || scope.some((r) => r.dice.some((d) => d.sides === 20)) ? 20 : 'any';
    }
    for (const roll of scope) {
      const result = checkRoll(roll, checks);
      if (result !== null) {
        return { ok: true, reason: '', roll, result };
      }
    }
    return fail('roll');
  }

  // Persistent state: global settings and each listener's rules. A listener's
  // commands live in an ability on the store character (see store.js), and its
  // rules are mirrored into that ability's description so they survive a game
  // being copied (Roll20 does not copy the state object).

  /**
   * Returns the mod's state branch, creating it when missing.
   *
   * @returns {object} State.
   */
  function getState() {
    if (!isRecord(state[STATE_KEY])) {
      state[STATE_KEY] = {};
    }
    return state[STATE_KEY];
  }

  /**
   * Brings the state up to the current schema.
   *
   * @returns {number|null} 1 when a version 1 install was upgraded, otherwise null.
   */
  function initialiseState() {
    const s = getState();
    let migratedFrom = null;
    if (s.schemaVersion !== SCHEMA_VERSION) {
      // Version 1 kept {version: 1, help: characterId, listen: 'on'|'off'}.
      if (s.schemaVersion === undefined && ('help' in s || 'listen' in s || 'version' in s)) {
        migratedFrom = 1;
      }
      const config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
      if (migratedFrom === 1) {
        config.enabled = s.listen !== 'off';
      }
      const fresh = {
        schemaVersion: SCHEMA_VERSION,
        config,
        characterId: toText(s.characterId || s.help),
        listeners: isRecord(s.listeners) ? s.listeners : {},
        order: Array.isArray(s.order) ? s.order : [],
        notices: isRecord(s.notices) ? s.notices : {},
      };
      for (const key of Object.keys(s)) {
        delete s[key];
      }
      Object.assign(s, fresh);
    }
    s.config = { ...DEFAULT_CONFIG, ...(isRecord(s.config) ? s.config : {}) };
    s.config.language = getLocale(s.config.language);
    s.listeners = isRecord(s.listeners) ? s.listeners : {};
    s.order = Array.isArray(s.order) ? s.order.filter((id) => id in s.listeners) : [];
    for (const id of Object.keys(s.listeners)) {
      s.listeners[id] = normaliseListener(s.listeners[id]);
      if (!s.order.includes(id)) {
        s.order.push(id);
      }
    }
    s.notices = isRecord(s.notices) ? s.notices : {};
    return migratedFrom;
  }

  /**
   * Returns the global settings.
   *
   * @returns {object} Settings.
   */
  function getConfig() {
    return getState().config;
  }

  /**
   * Validates and stores a global setting.
   *
   * @param {string} key Setting key.
   * @param {*} raw Raw value.
   * @returns {boolean} True when stored, false when the value is invalid.
   */
  function setConfigValue(key, raw) {
    const config = getConfig();
    switch (key) {
      case 'language': {
        const lang = normalizeLocale(raw);
        if (!lang) {
          return false;
        }
        config.language = lang;
        return true;
      }
      case 'enabled':
      case 'listenToMods': {
        const value = parseBoolean(raw);
        if (value === null) {
          return false;
        }
        config[key] = value;
        return true;
      }
      case 'speaker': {
        const value = toText(raw).toLowerCase();
        if (!SPEAKER_OPTIONS.includes(value)) {
          return false;
        }
        config.speaker = value;
        return true;
      }
      default:
        return false;
    }
  }

  /**
   * Applies the One-Click useroptions when the GM has changed them.
   *
   * @returns {void}
   */
  function applyGlobalConfig() {
    if (typeof globalconfig === 'undefined' || !isRecord(globalconfig)) {
      return;
    }
    const branch =
      globalconfig.crl ||
      globalconfig.CRL ||
      globalconfig['customizable roll listener'] ||
      globalconfig['Customizable Roll Listener'];
    if (!isRecord(branch)) {
      return;
    }
    const options = isRecord(branch.useroptions) ? branch.useroptions : branch;
    const s = getState();
    // useroptions only change when the GM edits them, so remember what was last
    // applied and only re-apply on change; otherwise chat changes would be
    // overwritten on every restart.
    const applied = isRecord(s.notices.useroptions) ? s.notices.useroptions : {};
    for (const key of ['speaker', 'listenToMods', 'language']) {
      if (key in options && options[key] !== applied[key]) {
        setConfigValue(key, options[key]);
        applied[key] = options[key];
      }
    }
    s.notices.useroptions = applied;
  }

  /**
   * Returns a cleaned list of strings.
   *
   * @param {*} value Raw list.
   * @param {number} [limit] Maximum items.
   * @returns {string[]} Items.
   */
  function cleanList(value, limit = MAX_LIST_ITEMS) {
    const items = Array.isArray(value) ? value : toText(value) ? [value] : [];
    return [...new Set(items.map(toText).filter(Boolean))].slice(0, limit);
  }

  /**
   * Returns a listener record with every field present and valid.
   *
   * @param {*} raw Stored or imported rules.
   * @returns {object} Listener rules.
   */
  function normaliseListener(raw) {
    const src = isRecord(raw) ? raw : {};
    const cooldown = Number(src.cooldown);
    const results = cleanList(src.results)
      .map((r) => RESULT_ALIASES[r.toLowerCase()])
      .filter(Boolean);
    return {
      name: toText(src.name),
      enabled: src.enabled !== false,
      templates: cleanList(src.templates),
      types: cleanList(src.types).map((t) => t.toLowerCase()),
      text: cleanList(src.text, MAX_TEXT_TERMS),
      regex: src.regex === true,
      who: cleanList(src.who),
      players: cleanList(src.players),
      results: [...new Set(results)],
      total: toText(src.total),
      natural: toText(src.natural),
      dice: toText(src.dice) || DEFAULT_LISTENER.dice,
      cooldown: Number.isFinite(cooldown)
        ? Math.min(MAX_COOLDOWN_SECONDS, Math.max(0, cooldown))
        : 0,
      stop: src.stop === true,
      speaker: LISTENER_SPEAKER_OPTIONS.includes(src.speaker) ? src.speaker : 'default',
    };
  }

  /**
   * Converts the rules version 1 kept as JSON in an ability description:
   * {txt, templates, roll}. Version 1 turned the first "##" of each text into
   * the pattern \$\[\[\d\]\] and matched text as a regular expression; text
   * that only holds plain characters becomes plain text, anything else stays
   * a regular expression.
   *
   * @param {object} rules Version 1 rules.
   * @param {string} name Listener name.
   * @returns {object} Listener rules.
   */
  function convertV1Rules(rules, name) {
    const toList = (value) => (Array.isArray(value) ? value : []);
    const text = toList(rules.txt)
      .map((term) => toText(term).replaceAll(String.raw`\$\[\[\d\]\]`, ROLL_PLACEHOLDER))
      .filter(Boolean);
    const regex = text.some((term) =>
      /[\\^$.|?*+()[\]{}]/.test(term.replaceAll(ROLL_PLACEHOLDER, ''))
    );
    return normaliseListener({
      name,
      templates: toList(rules.templates),
      text,
      regex,
      results: toList(rules.roll),
    });
  }

  /**
   * Reads listener rules from an ability description: version 2 JSON, or the
   * version 1 JSON this mod used to store there.
   *
   * @param {string} description Ability description.
   * @param {string} name Ability name.
   * @returns {{rules: object, version: number}|null} Rules, or null when none are stored.
   */
  function parseStoredRules(description, name) {
    let parsed;
    try {
      parsed = JSON.parse(toText(description));
    } catch {
      return null;
    }
    if (!isRecord(parsed)) {
      return null;
    }
    if (parsed[RULES_MARKER] === SCHEMA_VERSION) {
      return { rules: normaliseListener({ ...parsed, name }), version: 2 };
    }
    if ('txt' in parsed || 'templates' in parsed || 'roll' in parsed) {
      return { rules: convertV1Rules(parsed, name), version: 1 };
    }
    return null;
  }

  /**
   * Serialises listener rules for an ability description.
   *
   * @param {object} listener Listener rules.
   * @returns {string} JSON text.
   */
  function serialiseRules(listener) {
    const { name: _name, ...rules } = listener;
    return JSON.stringify({ [RULES_MARKER]: SCHEMA_VERSION, ...rules });
  }

  /**
   * Returns every listener in evaluation order.
   *
   * @returns {{id: string, listener: object}[]} Listeners.
   */
  function getListeners() {
    const s = getState();
    return s.order
      .filter((id) => id in s.listeners)
      .map((id) => ({ id, listener: s.listeners[id] }));
  }

  /**
   * Returns a listener by ability ID.
   *
   * @param {string} id Ability ID.
   * @returns {object|null} Listener rules.
   */
  function getListener(id) {
    return getState().listeners[id] || null;
  }

  /**
   * Stores a listener's rules.
   *
   * @param {string} id Ability ID.
   * @param {object} listener Listener rules.
   * @returns {object} Stored rules.
   */
  function putListener(id, listener) {
    const s = getState();
    s.listeners[id] = normaliseListener(listener);
    if (!s.order.includes(id)) {
      s.order.push(id);
    }
    return s.listeners[id];
  }

  /**
   * Forgets a listener.
   *
   * @param {string} id Ability ID.
   * @returns {void}
   */
  function deleteListener(id) {
    const s = getState();
    delete s.listeners[id];
    s.order = s.order.filter((other) => other !== id);
  }

  /**
   * Moves a listener one place up or down the evaluation order.
   *
   * @param {string} id Ability ID.
   * @param {number} step -1 to move up, 1 to move down.
   * @returns {boolean} True when it moved.
   */
  function moveListener(id, step) {
    const s = getState();
    const from = s.order.indexOf(id);
    const to = from + step;
    if (from < 0 || to < 0 || to >= s.order.length) {
      return false;
    }
    [s.order[from], s.order[to]] = [s.order[to], s.order[from]];
    return true;
  }

  /**
   * Parses a cooldown typed by the GM.
   *
   * @param {*} raw Seconds.
   * @returns {number|null} Seconds, or null when invalid.
   */
  function parseCooldown(raw) {
    if (!toText(raw)) {
      return 0;
    }
    const value = parseStrictInt(toText(raw).replace(/s$/i, ''));
    return value === null || value < 0 || value > MAX_COOLDOWN_SECONDS ? null : value;
  }

  // Journal handouts: the Help handout and the Command Deck.

  const STYLE = {
    outer: `background:${COLOR_CARD_BG_BOTTOM};color:${COLOR_TEXT};padding:14px 18px;border:1px solid ${COLOR_BORDER};border-radius:6px;font-family:Arial,sans-serif;line-height:1.5;`,
    header: `background:${COLOR_HEADER_BG};padding:12px;border-radius:4px;text-align:center;border-bottom:3px solid ${COLOR_ACCENT};margin-bottom:12px;`,
    h1: `color:${COLOR_HEADER_TEXT};margin:0;font-size:1.7em;letter-spacing:0.04em;`,
    subtitle: `color:${COLOR_MUTED};margin:4px 0 0 0;font-size:0.9em;`,
    h2: `color:${COLOR_ACCENT};border-bottom:1px solid ${COLOR_BORDER};padding-bottom:3px;margin:18px 0 8px 0;font-size:1.25em;`,
    p: `color:${COLOR_TEXT};margin:6px 0;`,
    li: `color:${COLOR_TEXT};margin:3px 0;`,
    table: 'width:100%;border-collapse:collapse;margin:6px 0;font-size:0.92em;',
    th: `background:${COLOR_HEADER_BG};color:${COLOR_HEADER_TEXT};padding:5px 8px;text-align:left;border:1px solid ${COLOR_BORDER};`,
    td: `padding:5px 8px;border:1px solid ${COLOR_BORDER};vertical-align:top;color:${COLOR_TEXT};`,
    code: 'font-family:monospace;color:#f3d48b;',
    pre: 'font-family:monospace;color:#f3d48b;background:rgba(0,0,0,0.25);padding:6px 8px;border-radius:3px;white-space:pre-wrap;margin:6px 0;',
    link: `color:${COLOR_ACCENT};`,
    footer: `color:${COLOR_MUTED};font-size:0.85em;text-align:center;margin-top:16px;border-top:1px solid ${COLOR_BORDER};padding-top:8px;`,
    btn: `background:${COLOR_BUTTON_BG};color:${COLOR_BUTTON_TEXT};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;font-weight:bold;`,
    btnDark: `background:${COLOR_BUTTON_DARK_BG};color:${COLOR_TEXT};border:1px solid ${COLOR_BUTTON_DARK_BORDER};padding:3px 9px;border-radius:3px;text-decoration:none;font-size:0.9em;display:inline-block;margin:2px 3px;`,
    section: `background:${COLOR_HEADER_BG};color:${COLOR_ACCENT};padding:4px 8px;font-variant:small-caps;font-weight:bold;letter-spacing:0.05em;border-left:3px solid ${COLOR_ACCENT};margin:12px 0 4px 0;`,
    desc: `color:${COLOR_MUTED};font-size:0.85em;margin:0 0 4px 8px;`,
  };

  /**
   * Builds a table.
   *
   * @param {string[]} headings Column headings (escaped).
   * @param {string[][]} rows Row cells (trusted HTML).
   * @returns {string} HTML string.
   */
  function table(headings, rows) {
    const head = headings.map((h) => `<th style="${STYLE.th}">${escapeHtml(h)}</th>`).join('');
    const body = rows
      .map((cells) => `<tr>${cells.map((c) => `<td style="${STYLE.td}">${c}</td>`).join('')}</tr>`)
      .join('');
    return `<table style="${STYLE.table}"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
  }

  /**
   * Builds a list from a translated array.
   *
   * @param {*} items Translated value (array of strings expected).
   * @param {boolean} [ordered=false] Use a numbered list.
   * @returns {string} HTML string.
   */
  function list(items, ordered = false) {
    const tag = ordered ? 'ol' : 'ul';
    const lis = (Array.isArray(items) ? items : [])
      .map((item) => `<li style="${STYLE.li}">${escapeHtml(item)}</li>`)
      .join('');
    return `<${tag}>${lis}</${tag}>`;
  }

  /**
   * Builds a link.
   *
   * @param {string} url URL.
   * @param {string} label Link text.
   * @returns {string} HTML anchor.
   */
  function link(url, label) {
    return `<a href="${escapeAttr(url)}" style="${STYLE.link}">${escapeHtml(label)}</a>`;
  }

  /**
   * Builds a Twemoji asset URL for a locale flag. Roll20 does not draw flag
   * emoji (Windows shows them as letters), so handouts use the image instead.
   *
   * @param {string} flag Unicode regional-indicator flag.
   * @returns {string} SVG asset URL or an empty string.
   */
  function flagAssetUrl(flag) {
    const codepoints = Array.from(String(flag || '').trim())
      .map((character) => character.codePointAt(0).toString(16))
      .join('-');
    return codepoints
      ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
      : '';
  }

  /**
   * Builds an accessible flag image for a locale.
   *
   * @param {object} locale Locale metadata.
   * @returns {string} Flag HTML, or an empty string when the locale has no flag.
   */
  function localeFlag(locale) {
    const url = flagAssetUrl(locale.flag);
    if (!url) {
      return '';
    }
    const label = escapeAttr(locale.flagLabel || locale.name);
    return `<img src="${escapeAttr(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
  }

  /**
   * Builds the Help handout HTML.
   *
   * @param {string} locale Locale code.
   * @returns {string} HTML string.
   */
  function buildHelpHtml(locale) {
    const lang = getLocale(locale);
    const h = (key, vars) => escapeHtml(t(`handout.${key}`, lang, vars));
    const raw = (key) => tRaw(`handout.${key}`, lang);
    const code = (text) => `<span style="${STYLE.code}">${escapeHtml(text)}</span>`;
    const pre = (text) => `<div style="${STYLE.pre}">${escapeHtml(text)}</div>`;
    const section = (key, body) => `<h2 style="${STYLE.h2}">${h(`${key}.heading`)}</h2>${body}`;

    const commands = [
      ['', 'menu'],
      ['new <name> [--option value …] [--commands …]', 'new'],
      ['show <name>', 'show'],
      ['edit <name> --option value …', 'edit'],
      ['edit <name> --commands line 1 \\\\ line 2', 'commands'],
      ['enable <name> / disable <name>', 'enable'],
      ['up <name> / down <name>', 'move'],
      ['test <name>', 'test'],
      ['delete <name>', 'delete'],
      ['inspect', 'inspect'],
      ['inspect off', 'inspectOff'],
      ['on / off', 'onOff'],
      ['config [setting value]', 'config'],
      ['journal', 'journal'],
      ['help', 'help'],
    ].map(([cmd, key]) => [code(`${COMMAND} ${cmd}`.trim()), escapeHtml(t(`help.${key}`, lang))]);

    const options = [
      ['--templates', 'templates'],
      ['--types', 'types'],
      ['--text', 'text'],
      ['--regex', 'regex'],
      ['--who', 'who'],
      ['--players', 'players'],
      ['--results', 'results'],
      ['--total', 'total'],
      ['--natural', 'natural'],
      ['--dice', 'dice'],
      ['--cooldown', 'cooldown'],
      ['--stop', 'stop'],
      ['--speaker', 'speaker'],
      ['--enabled', 'enabled'],
      ['--name', 'name'],
      ['--commands', 'commands'],
    ].map(([opt, key]) => [
      code(opt),
      escapeHtml(t(`handout.options.${key}`, lang, { types: MESSAGE_TYPES.join(', ') })),
    ]);

    const placeholders = [
      'who',
      'character',
      'player',
      'template',
      'total',
      'natural',
      'result',
      'expression',
      'table',
      'listener',
    ]
      .map((name) => [code(`\${${name}}`), escapeHtml(t(`handout.placeholders.${name}`, lang))])
      .concat([[code('${field:key}'), escapeHtml(t('handout.placeholders.field', lang))]]);

    const settings = ['enabled', 'speaker', 'listenToMods', 'language'].map((key) => [
      code(key),
      escapeHtml(t(`settings.${key}.label`, lang)),
      escapeHtml(t(`settings.${key}.desc`, lang)),
    ]);

    const legacy = [
      [
        '!crl \\\\create,name=N,text=T,template=a b,roll=critical \\\\cmd',
        `${COMMAND} new N --text T --templates a b --results crit --commands cmd`,
      ],
      ['!crl \\\\edit,name=N,…', `${COMMAND} edit N --…`],
      ['!crl \\\\delete,name=N', `${COMMAND} delete N`],
      ['!crl \\\\config[,menu=N]', `${COMMAND} / ${COMMAND} show N`],
      ['!crl \\\\set,listen=on|off', `${COMMAND} on / ${COMMAND} off`],
    ].map(([v1, v2]) => [code(v1), code(v2)]);

    const templates = COMMON_TEMPLATES.map(({ sheet, names }) => [
      escapeHtml(sheet),
      names
        .split(', ')
        .map((name) => code(name))
        .join(' '),
    ]);
    const templateLinks = Object.entries(TEMPLATE_LINKS)
      .map(([key, url]) => link(url, t(`handout.templates.${key}`, lang)))
      .join(' • ');

    const locales = SUPPORTED_LOCALES.map((c) => LOCALE_DEFINITIONS.find((d) => d.code === c)).map(
      (locale) => [
        `${localeFlag(locale)}${code(locale.code)}`,
        escapeHtml(locale.name),
        escapeHtml(locale.nativeName || locale.name),
      ]
    );
    const { original, maintainer } = AUTHOR_LINKS;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">🎲 ${SCRIPT_NAME} 🎲</h1>
      <p style="${STYLE.subtitle}">${h('versionLabel')} ${SCRIPT_VERSION} • ${h('subtitle')}</p>
    </div>
    ${section('overview', `<p style="${STYLE.p}">${h('overview.body')}</p>`)}
    ${section('quickStart', list(raw('quickStart.steps'), true))}
    ${section('examples', `${list(raw('examples.points'))}${pre(raw('examples.code')?.join?.('\n') || '')}`)}
    ${section('matching', list(raw('matching.points')))}
    ${section(
      'templates',
      `${list(raw('templates.points'))}${table([t('handout.templates.colSheet', lang), t('handout.templates.colNames', lang)], templates)}
       <p style="${STYLE.p}">${h('templates.links')} ${templateLinks}</p>`
    )}
    ${section('rolls', list(raw('rolls.points')))}
    ${section('commands', `<p style="${STYLE.p}">${h('commands.intro')}</p>${table([t('handout.commands.colCommand', lang), t('handout.commands.colDesc', lang)], commands)}`)}
    ${section('options', `<p style="${STYLE.p}">${h('options.intro')}</p>${table([t('handout.options.colOption', lang), t('handout.options.colDesc', lang)], options)}`)}
    ${section('placeholders', `<p style="${STYLE.p}">${h('placeholders.intro')}</p>${table([t('handout.placeholders.colName', lang), t('handout.placeholders.colDesc', lang)], placeholders)}`)}
    ${section('running', list(raw('running.points')))}
    ${section('inspector', list(raw('inspector.points')))}
    ${section('settings', `<p style="${STYLE.p}">${h('settings.intro')}</p>${table([t('handout.settings.colKey', lang), t('handout.settings.colName', lang), t('handout.settings.colDesc', lang)], settings)}`)}
    ${section('storage', `<p style="${STYLE.p}">${h('storage.body', { character: STORE_CHARACTER_NAME })}</p>`)}
    ${section('upgrading', `${list(raw('upgrading.points'))}${table([t('handout.upgrading.colV1', lang), t('handout.upgrading.colV2', lang)], legacy)}`)}
    ${section('troubleshooting', list(raw('troubleshooting.points')))}
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p>${table([t('handout.languages.colCode', lang), t('handout.languages.colName', lang), t('handout.languages.colNative', lang)], locales)}`)}
    ${section(
      'credits',
      `<p style="${STYLE.p}">${h('credits.original')} ${link(original.profile, original.name)} • ${link(original.wiki, t('handout.credits.wiki', lang))}</p>
       <p style="${STYLE.p}">${h('credits.maintainer')} ${link(maintainer.profile, maintainer.name)} • ${link(maintainer.github, 'GitHub')}</p>
       <p style="${STYLE.p}">${h('credits.support')}</p>`
    )}
    <div style="${STYLE.footer}">${SCRIPT_NAME} ${SCRIPT_VERSION} • ${h('footer', { deck: HANDOUT_DECK_NAME })}</div>
  </div>`;
  }

  /**
   * Builds the Command Deck handout HTML.
   *
   * @param {string} locale Locale code.
   * @returns {string} HTML string.
   */
  function buildDeckHtml(locale) {
    const lang = getLocale(locale);
    const tr = (key, vars) => t(key, lang, vars);
    const q = (key) => `?{${tr(`prompts.${key}`).replaceAll(/[|{},]/g, ' ')}|}`;
    const btn = (key, cmd, dark = false) =>
      `<a href="${escapeAttr(`${COMMAND} ${cmd}`.trim())}" style="${dark ? STYLE.btnDark : STYLE.btn}">${escapeHtml(tr(`buttons.${key}`))}</a>`;
    const group = (titleKey, descKey, buttons) =>
      `<div style="${STYLE.section}">${escapeHtml(tr(titleKey))}</div><div style="${STYLE.desc}">${escapeHtml(tr(descKey))}</div><div>${buttons.join('')}</div>`;

    return `<div style="${STYLE.outer}${getDirectionStyle(lang)}">
    <div style="${STYLE.header}">
      <h1 style="${STYLE.h1}">🎲 ${SCRIPT_NAME} 🎲</h1>
      <p style="${STYLE.subtitle}">${escapeHtml(tr('deck.subtitle'))} • v${SCRIPT_VERSION}</p>
    </div>
    ${group('deck.listeners', 'deck.listenersDesc', [btn('menu', ''), btn('new', `new ${q('newName')}`), btn('edit', `show ${q('target')}`, true), btn('test', `test ${q('target')}`, true)])}
    ${group('deck.listening', 'deck.listeningDesc', [btn('turnOn', 'on'), btn('turnOff', 'off', true)])}
    ${group('deck.tools', 'deck.toolsDesc', [btn('inspect', 'inspect'), btn('inspectOff', 'inspect off', true), btn('settings', 'config', true), btn('rebuildJournal', 'journal', true), btn('help', 'help', true)])}
    <div style="${STYLE.footer}">${escapeHtml(tr('deck.footer', { help: HANDOUT_HELP_NAME }))}</div>
  </div>`;
  }

  /**
   * Creates or updates a handout, removing duplicates with the same name.
   *
   * @param {string} name Handout name.
   * @param {string} html Handout notes HTML.
   * @returns {void}
   */
  function upsertHandout(name, html) {
    const existing = findObjs({ _type: 'handout', name });
    const [primary, ...duplicates] = existing;
    const handout = primary || createObj('handout', { name });
    if (!handout) {
      return;
    }
    handout.set({ inplayerjournals: '', controlledby: '' });
    handout.set('notes', html);
    for (const dup of duplicates) {
      dup.remove();
    }
  }

  /**
   * Creates or refreshes the Help and Command Deck handouts in the current language.
   *
   * @returns {void}
   */
  function installHandouts() {
    const lang = getConfig().language;
    upsertHandout(HANDOUT_HELP_NAME, buildHelpHtml(lang));
    upsertHandout(HANDOUT_DECK_NAME, buildDeckHtml(lang));
  }

  // Version 1 command syntax, kept so existing macros, buttons and forum
  // examples still work:
  //   !crl \\create,name=Name,text=Text,template=a b,roll=critical \\cmd 1 \\cmd 2
  //   !crl \\edit,name=Name,... \\cmd    !crl \\delete,name=Name
  //   !crl \\config[,menu=Name]          !crl \\set,listen=on|off

  const ACTIONS = ['create', 'edit', 'delete', 'set', 'config'];

  /**
   * Returns true when a command uses the version 1 syntax.
   *
   * @param {string} content Message content.
   * @returns {boolean} True for "!crl \\action".
   */
  function isLegacyCommand(content) {
    return /^!crl\s+\\\\/i.test(toText(content));
  }

  /**
   * Returns true when version 1 text needs to stay a regular expression:
   * version 1 matched text as one, so anything beyond plain characters
   * (and the "##" roll placeholder) may rely on that.
   *
   * @param {string[]} terms Text terms.
   * @returns {boolean} True when regular expression mode is needed.
   */
  function needsRegex(terms) {
    return terms.some((term) => /[\\^$.|?*+()[\]{}]/.test(term.replaceAll('##', '')));
  }

  /**
   * Parses a version 1 command.
   *
   * @param {string} content Message content.
   * @returns {{action: string, name: string, menu: string, listen: string,
   *            options: object, commands: string|null}|null} Parsed command, or
   *          null when no action keyword was given.
   */
  function parseLegacyCommand(content) {
    const [, details = '', ...commands] = toText(content).split(/\s+\\\\/);
    const action = ACTIONS.find((a) => details.toLowerCase().startsWith(a));
    if (!action) {
      return null;
    }
    const values = {};
    for (const piece of details.slice(action.length).split(',')) {
      const match = /^\s*(name|template|text|roll|listen|menu)\s*[:=]([\s\S]+)$/i.exec(piece);
      if (match) {
        values[match[1].toLowerCase()] = match[2].trim();
      }
    }
    const options = {};
    if ('template' in values) {
      options.templates = values.template;
    }
    if ('text' in values) {
      const terms = values.text
        .split(/\s*&&\s*/)
        .map((term) => term.trim())
        .filter(Boolean);
      options.regex = needsRegex(terms) ? 'on' : 'off';
      options.text = terms.join(' && ');
    }
    if ('roll' in values) {
      options.results = values.roll;
    }
    const lines = commands.map((line) => line.trim()).filter(Boolean);
    return {
      action,
      name: values.name || '',
      menu: values.menu || '',
      listen: values.listen || '',
      options,
      commands: lines.length > 0 ? lines.join('\n') : null,
    };
  }

  // The store character: a hidden, archived character whose abilities hold each
  // listener's commands. Version 1 used the same character, so upgrading keeps
  // every command and any macro that calls %{Customizable Roll Listener|name}.

  /**
   * Returns the store character, finding or creating it as needed.
   *
   * @returns {object|null} Roll20 character.
   */
  function getStoreCharacter() {
    const s = getState();
    let character = s.characterId ? getObj('character', s.characterId) : null;
    if (!character) {
      character =
        findObjs({ _type: 'character', name: STORE_CHARACTER_NAME })[0] ||
        createObj('character', { name: STORE_CHARACTER_NAME, archived: true });
      s.characterId = character ? character.id : '';
    }
    return character || null;
  }

  /**
   * Returns the URL that opens the store character in the Journal.
   *
   * @returns {string} URL, or an empty string when there is no character.
   */
  function getStoreLink() {
    const character = getStoreCharacter();
    return character ? `https://journal.roll20.net/character/${character.id}` : '';
  }

  /**
   * Keeps the store character hidden from players and explains it in its bio.
   *
   * @returns {void}
   */
  function prepareStoreCharacter() {
    const character = getStoreCharacter();
    if (!character) {
      return;
    }
    const lang = getConfig().language;
    character.set({ inplayerjournals: '', controlledby: '' });
    character.set(
      'bio',
      `<p>${escapeHtml(t('store.bio', lang))}</p><p>${escapeHtml(t('store.bioHelp', lang))}</p>`
    );
  }

  /**
   * Returns every ability on the store character.
   *
   * @returns {object[]} Roll20 abilities.
   */
  function getStoreAbilities() {
    const character = getStoreCharacter();
    return character ? findObjs({ _type: 'ability', _characterid: character.id }) : [];
  }

  /**
   * Returns a listener's ability.
   *
   * @param {string} id Ability ID.
   * @returns {object|null} Roll20 ability.
   */
  function getAbility(id) {
    return getObj('ability', id) || null;
  }

  /**
   * Returns true when an ability belongs to the store character.
   *
   * @param {object} ability Roll20 ability.
   * @returns {boolean} True when it is a listener's ability.
   */
  function isStoreAbility(ability) {
    const id = getState().characterId;
    return Boolean(id) && ability?.get('_characterid') === id;
  }

  /**
   * Writes a listener's rules into its ability description.
   *
   * @param {string} id Ability ID.
   * @returns {void}
   */
  function mirrorRules(id) {
    const ability = getAbility(id);
    const listener = getListener(id);
    if (!ability || !listener) {
      return;
    }
    const text = serialiseRules(listener);
    if (ability.get('description') !== text) {
      ability.set('description', text);
    }
  }

  /**
   * Takes on an ability that has no listener record yet: rules stored in its
   * description (version 2, or version 1 JSON) are used; an ability without
   * rules becomes a switched-off listener so the GM can see and set it up.
   *
   * @param {object} ability Roll20 ability.
   * @returns {'upgraded'|'restored'|'adopted'} What happened.
   */
  function adoptAbility(ability) {
    const name = toText(ability.get('name'));
    const stored = parseStoredRules(ability.get('description'), name);
    if (stored) {
      putListener(ability.id, stored.rules);
    } else {
      putListener(ability.id, normaliseListener({ name, enabled: false }));
    }
    mirrorRules(ability.id);
    if (!stored) {
      return 'adopted';
    }
    return stored.version === 1 ? 'upgraded' : 'restored';
  }

  /**
   * Brings listener records and the store character's abilities into line.
   *
   * @returns {{upgraded: number, restored: number, adopted: number, removed: number}}
   *          Counts of what changed.
   */
  function syncListeners() {
    const counts = { upgraded: 0, restored: 0, adopted: 0, removed: 0 };
    const abilities = getStoreAbilities();
    const ids = new Set(abilities.map((a) => a.id));
    for (const { id } of getListeners()) {
      if (!ids.has(id)) {
        deleteListener(id);
        counts.removed++;
      }
    }
    for (const ability of abilities) {
      const listener = getListener(ability.id);
      if (listener) {
        listener.name = toText(ability.get('name'));
        mirrorRules(ability.id);
      } else {
        counts[adoptAbility(ability)]++;
      }
    }
    return counts;
  }

  /**
   * Creates the ability for a new listener.
   *
   * @param {string} name Listener name.
   * @param {string} commands Commands, one per line.
   * @returns {object|null} Roll20 ability.
   */
  function createListenerAbility(name, commands) {
    const character = getStoreCharacter();
    if (!character) {
      return null;
    }
    return (
      createObj('ability', {
        characterid: character.id,
        name,
        action: commands,
        description: '',
        istokenaction: false,
      }) || null
    );
  }

  /**
   * Returns a listener's commands.
   *
   * @param {string} id Ability ID.
   * @returns {string} Commands, one per line.
   */
  function getCommands(id) {
    return toText(getAbility(id)?.get('action'));
  }

  /**
   * Replaces a listener's commands.
   *
   * @param {string} id Ability ID.
   * @param {string} commands Commands, one per line.
   * @returns {void}
   */
  function setCommands(id, commands) {
    getAbility(id)?.set('action', commands);
  }

  /**
   * Renames a listener's ability.
   *
   * @param {string} id Ability ID.
   * @param {string} name New name.
   * @returns {void}
   */
  function renameAbility(id, name) {
    getAbility(id)?.set('name', name);
  }

  /**
   * Removes a listener's ability.
   *
   * @param {string} id Ability ID.
   * @returns {void}
   */
  function removeAbility(id) {
    getAbility(id)?.remove();
  }

  /**
   * Keeps records in step when the GM edits an ability in the Journal.
   *
   * @param {object} ability Roll20 ability.
   * @returns {void}
   */
  function handleAbilityChanged(ability) {
    if (!isStoreAbility(ability)) {
      return;
    }
    const listener = getListener(ability.id);
    if (!listener) {
      adoptAbility(ability);
      return;
    }
    const name = toText(ability.get('name'));
    const stored = parseStoredRules(ability.get('description'), name);
    if (stored && stored.version === 2) {
      // The GM edited the rules JSON by hand.
      putListener(ability.id, stored.rules);
    } else {
      listener.name = name;
    }
    mirrorRules(ability.id);
  }

  /**
   * Forgets a listener whose ability was deleted in the Journal.
   *
   * @param {object} ability Roll20 ability.
   * @returns {void}
   */
  function handleAbilityDestroyed(ability) {
    if (getListener(ability.id)) {
      deleteListener(ability.id);
    }
  }

  // Listens to chat: checks every message against the listeners, runs the
  // commands of those that match, and feeds the inspector.

  // Player waiting for the next chat message to be inspected.
  let inspectFor = null;

  // Callbacks registered through the public API.
  const observers = [];

  /**
   * Translates a key in the active locale.
   *
   * @param {string} key Translation key.
   * @param {object} [vars] Interpolation variables.
   * @returns {string} Translated text.
   */
  function tr$1(key, vars) {
    return t(key, getConfig().language, vars);
  }

  /**
   * Sets (or clears) the player waiting for the next message to be inspected.
   *
   * @param {string|null} playerId Player ID, or null to stop.
   * @returns {void}
   */
  function setInspector(playerId) {
    inspectFor = playerId;
  }

  /**
   * Registers a callback run whenever a listener matches.
   *
   * @param {Function} fn Callback, given {listener, id, message, verdict}.
   * @returns {void}
   */
  function addObserver(fn) {
    if (typeof fn === 'function') {
      observers.push(fn);
    }
  }

  /**
   * Returns true for messages CRL sent itself: menus, and listener commands sent as CRL.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {boolean} True when the message came from CRL.
   */
  function isOwnMessage(msg) {
    return msg.playerid === 'API' && [CRL_SPEAKER, SCRIPT_NAME].includes(toText(msg.who));
  }

  /**
   * Returns the display name of the player who sent a message.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {string} Display name, or an empty string.
   */
  function playerNameOf(msg) {
    const player = msg.playerid && msg.playerid !== 'API' ? getObj('player', msg.playerid) : null;
    return toText(player?.get('displayname'));
  }

  /**
   * Shortens text for display.
   *
   * @param {string} text Text.
   * @returns {string} Text, cut to the inspector limit.
   */
  function truncate(text) {
    return text.length > INSPECT_CONTENT_LIMIT ? `${text.slice(0, INSPECT_CONTENT_LIMIT)}…` : text;
  }

  /**
   * Describes one roll for the inspector.
   *
   * @param {object} roll Roll description.
   * @returns {string} Plain text.
   */
  function describeRollLine(roll) {
    const dice = roll.dice
      .map((d) => {
        const flags = [d.crit && tr$1('inspect.crit'), d.fumble && tr$1('inspect.fumble')]
          .filter(Boolean)
          .join(', ');
        const die = d.sides ? `d${d.sides}` : '?';
        return `${die}:${d.value}${flags ? ` (${flags})` : ''}`;
      })
      .join(' ');
    const label = roll.name ? `${roll.name}: ` : `$[[${roll.index}]] `;
    const parts = [`${label}${roll.expression || '?'} = ${roll.total ?? '?'}`];
    if (dice) {
      parts.push(`${tr$1('inspect.dice')}: ${dice}`);
    }
    if (roll.tableItems.length > 0) {
      parts.push(`${tr$1('inspect.table')}: ${roll.tableItems.join(', ')}`);
    }
    if (roll.hasTarget) {
      parts.push(tr$1('inspect.target'));
    }
    return parts.join(' • ');
  }

  /**
   * Whispers a breakdown of a message and how every listener judged it.
   *
   * @param {string} playerId Player to whisper.
   * @param {object} message Analysed message.
   * @returns {void}
   */
  function sendInspection(playerId, message) {
    const row = (label, value) =>
      `<div><span style="color:${COLOR_MUTED}">${escapeHtml(label)}:</span> ${escapeHtml(value || tr$1('values.none'))}</div>`;
    const lines = [
      row(tr$1('inspect.type'), message.type),
      row(tr$1('inspect.who'), message.who),
      row(tr$1('inspect.character'), message.character),
      row(tr$1('inspect.player'), message.playerName || (message.playerId === 'API' ? 'API' : '')),
      row(tr$1('inspect.template'), message.template),
    ];
    lines.push(row(tr$1('inspect.keys'), (message.keys || []).join(', ')));
    const fieldNames = Object.keys(message.fields);
    if (fieldNames.length > 0) {
      lines.push(
        row(
          tr$1('inspect.fields'),
          fieldNames.map((k) => `${k}=${message.fields[k].slice(0, 40)}`).join(', ')
        )
      );
    }
    lines.push(buildSectionLabel(tr$1('inspect.rolls')));
    lines.push(
      message.rolls.length > 0
        ? buildCode(message.rolls.map(describeRollLine).join('\n'))
        : `<div>${escapeHtml(tr$1('values.none'))}</div>`
    );
    lines.push(buildSectionLabel(tr$1('inspect.text')));
    lines.push(buildCode(truncate(message.text)));
    lines.push(buildSectionLabel(tr$1('inspect.raw')));
    lines.push(buildCode(truncate(message.raw)));
    lines.push(buildSectionLabel(tr$1('inspect.listeners')));
    const listeners = getListeners();
    if (listeners.length === 0) {
      lines.push(`<div>${escapeHtml(tr$1('menu.noListeners'))}</div>`);
    }
    for (const { listener } of listeners) {
      const verdict = matchListener(listener, message);
      const mark = verdict.ok
        ? `<span style="color:${COLOR_OK}">✔</span>`
        : `<span style="color:${COLOR_OFF}">✘</span>`;
      const why = verdict.ok
        ? tr$1('inspect.matched', {
            result: verdict.result ? tr$1(`results.${verdict.result}`) : '',
          })
        : tr$1(`inspect.reasons.${verdict.reason}`);
      lines.push(
        `<div>${mark} <strong>${escapeHtml(listener.name)}</strong> — ${escapeHtml(why)}</div>`
      );
    }
    lines.push(
      `<div style="margin-top:4px">${buildButton(tr$1('buttons.inspect'), `${COMMAND} inspect`)}</div>`
    );
    whisper(playerId, tr$1('titles.inspect'), lines);
    // Extra data (Beacon's roll objects and so on) goes in its own whisper to
    // keep each message a reasonable size.
    const extras = JSON.stringify(message.extras || {}, null, 1);
    if (extras !== '{}') {
      whisper(playerId, tr$1('inspect.extras'), buildCode(truncate(extras)));
    }
  }

  /**
   * Switches off a listener that keeps triggering, and tells the GM.
   *
   * @param {string} id Listener ID.
   * @param {object} listener Listener rules.
   * @returns {void}
   */
  function stopLoop(id, listener) {
    listener.enabled = false;
    mirrorRules(id);
    resetFires(id);
    const text = tr$1('messages.loopStopped', { name: listener.name });
    const gms = getGmPlayerIds();
    for (const gm of gms.length > 0 ? gms : [null]) {
      whisperWarning(gm, text);
    }
    log(`${SCRIPT_NAME}: ${text}`);
  }

  /**
   * Checks a chat message against every listener and runs those that match.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleChatMessage(msg) {
    if (isOwnMessage(msg)) {
      return;
    }
    const config = getConfig();
    const message = analyseMessage(msg, { playerName: playerNameOf(msg) });

    if (inspectFor) {
      const playerId = inspectFor;
      inspectFor = null;
      sendInspection(playerId, message);
    }

    if (!config.enabled || (!config.listenToMods && msg.playerid === 'API')) {
      return;
    }

    const now = Date.now();
    for (const { id, listener } of getListeners()) {
      const verdict = matchListener(listener, message);
      if (!verdict.ok || isCoolingDown(id, listener.cooldown, now)) {
        continue;
      }
      if (recordFire(id, now)) {
        stopLoop(id, listener);
        continue;
      }
      const mode = listener.speaker === 'default' ? config.speaker : listener.speaker;
      runCommands(
        getCommands(id),
        resolveSpeaker(mode, message),
        buildPlaceholderValues(message, verdict, listener.name)
      );
      for (const fn of observers) {
        try {
          fn({ id, listener: { ...listener }, message, verdict });
        } catch (err) {
          log(`${SCRIPT_NAME}: observer failed: ${err?.message || err}`);
        }
      }
      if (listener.stop) {
        break;
      }
    }
  }

  /**
   * Runs a listener's commands straight away with sample values, so the GM can
   * check them without rolling.
   *
   * @param {string} id Listener ID.
   * @param {object} listener Listener rules.
   * @param {string} playerId Player who asked.
   * @returns {number} Number of messages sent.
   */
  function testListener(id, listener, playerId) {
    const player = getObj('player', playerId);
    const name = toText(player?.get('displayname')) || CRL_SPEAKER;
    const sample = {
      who: name,
      playerId,
      playerName: name,
      character: name,
      template: listener.templates[0] || '',
      fields: {},
      rolls: [
        {
          index: 0,
          expression: '1d20',
          total: 20,
          dice: [{ sides: 20, value: 20, crit: true, fumble: false, success: null }],
          tableItems: [],
          hasTarget: false,
        },
      ],
    };
    const config = getConfig();
    const mode = listener.speaker === 'default' ? config.speaker : listener.speaker;
    return runCommands(
      getCommands(id),
      resolveSpeaker(mode, sample),
      buildPlaceholderValues(
        sample,
        { roll: sample.rolls[0], result: listener.results[0] || '' },
        listener.name
      )
    );
  }

  // Chat commands (!crl ...), the chat menus, and the version 1 command syntax.

  // Option names accepted after "--", mapped to listener fields.
  const OPTION_KEYS = {
    name: 'name',
    rename: 'name',
    template: 'templates',
    templates: 'templates',
    type: 'types',
    types: 'types',
    text: 'text',
    regex: 'regex',
    mode: 'regex',
    who: 'who',
    character: 'who',
    characters: 'who',
    speaker: 'speaker',
    as: 'speaker',
    sendas: 'speaker',
    player: 'players',
    players: 'players',
    result: 'results',
    results: 'results',
    roll: 'results',
    total: 'total',
    natural: 'natural',
    nat: 'natural',
    dice: 'dice',
    die: 'dice',
    cooldown: 'cooldown',
    stop: 'stop',
    enabled: 'enabled',
  };

  // Fields shown on a listener's card, in order.
  const LISTENER_ROWS = [
    'enabled',
    'templates',
    'types',
    'text',
    'regex',
    'who',
    'players',
    'results',
    'total',
    'natural',
    'dice',
    'cooldown',
    'stop',
    'speaker',
  ];

  // Typed as a value, these clear a list or comparison.
  const CLEAR_VALUES = new Set(['', '-', 'clear', 'any']);

  /**
   * Translates a key in the active locale.
   *
   * @param {string} key Translation key.
   * @param {object} [vars] Interpolation variables.
   * @returns {string} Translated text.
   */
  function tr(key, vars) {
    return t(key, getConfig().language, vars);
  }

  /**
   * Whispers a translated error with its hint.
   *
   * @param {string} playerId Player ID.
   * @param {string} key Key under `errors.` (the hint lives under `hints.`).
   * @param {object} [vars] Interpolation variables.
   * @returns {void}
   */
  function fail(playerId, key, vars) {
    const hint = t(`hints.${key}`, getConfig().language, vars);
    whisperError(playerId, tr(`errors.${key}`, vars), hint === `hints.${key}` ? '' : hint);
  }

  /**
   * Whispers a short translated confirmation.
   *
   * @param {string} playerId Player ID.
   * @param {string} key Key under `messages.`.
   * @param {object} [vars] Interpolation variables.
   * @returns {void}
   */
  function done(playerId, key, vars) {
    whisper(playerId, SCRIPT_NAME, `<div>${escapeHtml(tr(`messages.${key}`, vars))}</div>`);
  }

  /**
   * Makes text safe inside a Roll20 ?{query}.
   *
   * @param {string} text Text.
   * @returns {string} Text without query syntax characters.
   */
  function queryText(text) {
    return String(text).replaceAll(/[|{},]/g, ' ');
  }

  /**
   * Builds a free-text Roll20 query.
   *
   * @param {string} promptKey Key under `prompts.`.
   * @returns {string} Query.
   */
  function textQuery(promptKey) {
    return `?{${queryText(tr(`prompts.${promptKey}`))}|}`;
  }

  /**
   * Builds a drop-down Roll20 query.
   *
   * @param {string} promptKey Key under `prompts.`.
   * @param {[string, string][]} options Label/value pairs.
   * @returns {string} Query.
   */
  function choiceQuery(promptKey, options) {
    const list = options.map(([label, value]) => `${queryText(label)},${value}`).join('|');
    return `?{${queryText(tr(`prompts.${promptKey}`))}|${list}}`;
  }

  // ---------------------------------------------------------------------------
  // Parsing
  // ---------------------------------------------------------------------------

  /**
   * Puts back what Roll20 processed before CRL saw the command: inline rolls
   * become their [[expression]] again, and a roll template is restored, so a
   * listener's commands can contain them.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {string} Command text.
   */
  function restoreCommandText(msg) {
    let content = toText(msg.content).replaceAll(/\$\[\[(\d+)\]\]/g, (marker, index) => {
      const expression = msg.inlinerolls?.[Number(index)]?.expression;
      return expression ? `[[${expression}]]` : marker;
    });
    const template = toText(msg.rolltemplate);
    if (template && !content.includes('&{template:')) {
      const at = content.indexOf('{{');
      if (at >= 0) {
        content = `${content.slice(0, at)}&{template:${template}} ${content.slice(at)}`;
      }
    }
    return content;
  }

  /**
   * Splits "!crl <sub> <target> --option value ... --commands rest".
   *
   * @param {string} text Text after "!crl".
   * @returns {{sub: string, target: string, options: object, commands: string|null,
   *            unknown: string[]}} Parsed parts.
   */
  function parseArguments(text) {
    let body = String(text);
    let commands = null;
    const commandsAt = /(^|\s)--(?:commands|command|do)(?=\s|$)/i.exec(body);
    if (commandsAt) {
      commands = body.slice(commandsAt.index + commandsAt[0].length).trim();
      body = body.slice(0, commandsAt.index);
    }
    const [head, ...pieces] = body.split(/(?:^|\s)--(?=[a-z])/i);
    const options = {};
    const unknown = [];
    for (const piece of pieces) {
      const match = /^([a-z]+)\s*([\s\S]*)$/i.exec(piece.trim());
      const key = match ? OPTION_KEYS[match[1].toLowerCase()] : null;
      if (key) {
        options[key] = match[2].trim();
      } else if (match) {
        unknown.push(match[1]);
      }
    }
    const trimmed = head.trim();
    const sub = trimmed.split(/\s+/, 1)[0] || '';
    return {
      sub: sub.toLowerCase(),
      target: trimmed.slice(sub.length).trim(),
      options,
      commands,
      unknown,
    };
  }

  /**
   * Splits commands typed in chat into lines: "\\" separates lines, as in
   * version 1, and so do real line breaks.
   *
   * @param {string} text Commands text.
   * @returns {string} Commands, one per line.
   */
  function commandLines(text) {
    return String(text)
      .split(/\s*\\\\\s*|\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Finds a listener by ability ID or (case-insensitive) name.
   *
   * @param {string} target ID or name.
   * @returns {{id: string, listener: object}|null} Listener.
   */
  function findListener(target) {
    const text = toText(target);
    if (!text) {
      return null;
    }
    const byId = getListener(text);
    if (byId) {
      return { id: text, listener: byId };
    }
    const lower = text.toLowerCase();
    return getListeners().find(({ listener }) => listener.name.toLowerCase() === lower) || null;
  }

  /**
   * Checks a listener name.
   *
   * @param {string} name Proposed name.
   * @param {string|null} ownId The listener being renamed, if any.
   * @returns {string|null} Error key, or null when the name is fine.
   */
  function nameProblem(name, ownId) {
    if (!name) {
      return 'nameRequired';
    }
    if (
      name.length > MAX_NAME_LENGTH ||
      name.startsWith('-') ||
      name.includes('--') ||
      /[|{}\\[\]@%#?~\r\n]/.test(name)
    ) {
      return 'nameInvalid';
    }
    const lower = name.toLowerCase();
    const taken = getListeners().some(
      ({ id, listener }) => id !== ownId && listener.name.toLowerCase() === lower
    );
    return taken ? 'nameTaken' : null;
  }

  /**
   * Applies typed options to a copy of a listener.
   *
   * @param {object} base Listener rules.
   * @param {object} options Options from parseArguments.
   * @param {string|null} ownId Listener ID when editing.
   * @returns {{listener: object, errors: {key: string, vars: object}[]}} The
   *          updated copy and any problems.
   */
  function applyOptions(base, options, ownId) {
    const next = { ...base };
    const errors = [];
    const problem = (key, vars = {}) => errors.push({ key, vars });
    const cleared = (value) => CLEAR_VALUES.has(toText(value).toLowerCase());

    if ('name' in options) {
      const name = toText(options.name);
      const err = nameProblem(name, ownId);
      if (err) {
        problem(err, { name, max: MAX_NAME_LENGTH });
      } else {
        next.name = name;
      }
    }
    if ('regex' in options) {
      const value = parseBoolean(options.regex);
      if (value === null) {
        problem('badOnOff', { option: 'regex', value: options.regex });
      } else {
        next.regex = value;
      }
    }
    if ('templates' in options) {
      next.templates = cleared(options.templates) ? [] : splitList(options.templates);
    }
    if ('types' in options) {
      const types = cleared(options.types) ? [] : splitList(options.types.toLowerCase());
      const bad = types.filter((type) => !MESSAGE_TYPES.includes(type));
      if (bad.length > 0) {
        problem('badType', { value: bad.join(', '), types: MESSAGE_TYPES.join(', ') });
      } else {
        next.types = types;
      }
    }
    if ('text' in options) {
      const terms =
        cleared(options.text) && toText(options.text) !== 'any'
          ? []
          : toText(options.text)
              .split(/\s*&&\s*/)
              .map((term) => term.trim())
              .filter(Boolean);
      const invalid = next.regex ? findInvalidTerm(terms) : null;
      if (terms.length > MAX_TEXT_TERMS) {
        problem('tooManyTerms', { max: MAX_TEXT_TERMS });
      } else if (invalid) {
        problem('badRegex', invalid);
      } else {
        next.text = terms;
      }
    } else if ('regex' in options && next.regex) {
      const invalid = findInvalidTerm(next.text);
      if (invalid) {
        problem('badRegex', invalid);
      }
    }
    for (const key of ['who', 'players']) {
      if (key in options) {
        next[key] = cleared(options[key]) ? [] : splitList(options[key], /\s*,\s*/);
      }
    }
    if ('results' in options) {
      const words = cleared(options.results) ? [] : splitList(options.results.toLowerCase());
      const bad = words.filter((word) => !RESULT_ALIASES[word]);
      if (bad.length > 0) {
        problem('badResult', { value: bad.join(', ') });
      } else {
        next.results = [...new Set(words.map((word) => RESULT_ALIASES[word]))];
      }
    }
    for (const key of ['total', 'natural']) {
      if (key in options) {
        if (cleared(options[key])) {
          next[key] = '';
        } else {
          const parsed = parseComparison(options[key]);
          if (parsed) {
            next[key] = parsed.text;
          } else {
            problem('badComparison', { option: key, value: options[key] });
          }
        }
      }
    }
    if ('dice' in options) {
      const dice = parseDice(options.dice);
      if (dice === null) {
        problem('badDice', { value: options.dice });
      } else {
        next.dice = String(dice);
      }
    }
    if ('cooldown' in options) {
      const cooldown = parseCooldown(options.cooldown);
      if (cooldown === null) {
        problem('badCooldown', { value: options.cooldown });
      } else {
        next.cooldown = cooldown;
      }
    }
    for (const key of ['stop', 'enabled']) {
      if (key in options) {
        const value = parseBoolean(options[key]);
        if (value === null) {
          problem('badOnOff', { option: key, value: options[key] });
        } else {
          next[key] = value;
        }
      }
    }
    if ('speaker' in options) {
      const value = toText(options.speaker).toLowerCase();
      if (LISTENER_SPEAKER_OPTIONS.includes(value)) {
        next.speaker = value;
      } else {
        problem('badSpeaker', { value: options.speaker });
      }
    }
    return { listener: normaliseListener(next), errors };
  }

  /**
   * Whispers every problem found in a command.
   *
   * @param {string} playerId Player ID.
   * @param {{key: string, vars: object}[]} errors Problems.
   * @returns {void}
   */
  function reportErrors(playerId, errors) {
    for (const { key, vars } of errors) {
      fail(playerId, key, vars);
    }
  }

  // ---------------------------------------------------------------------------
  // Menus
  // ---------------------------------------------------------------------------

  /**
   * Formats a listener field for display.
   *
   * @param {object} listener Listener rules.
   * @param {string} key Field.
   * @returns {string} Display text.
   */
  function formatField(listener, key) {
    const value = listener[key];
    switch (key) {
      case 'enabled':
      case 'stop':
        return tr(value ? 'values.on' : 'values.off');
      case 'regex':
        return tr(value ? 'values.regex' : 'values.plain');
      case 'text':
        return value.length > 0 ? value.join(' && ') : tr('values.any');
      case 'results':
        return value.length > 0
          ? value.map((r) => tr(`results.${r}`)).join(', ')
          : tr('values.any');
      case 'types':
        return value.length > 0 ? value.join(', ') : tr('values.allButApi');
      case 'dice':
        return value === 'auto'
          ? tr('values.diceAuto')
          : value === 'any'
            ? tr('values.diceAny')
            : `d${value}`;
      case 'cooldown':
        return value > 0 ? tr('values.seconds', { seconds: value }) : tr('values.off');
      case 'speaker':
        return tr(`values.speaker.${value}`);
      default:
        if (Array.isArray(value)) {
          return value.length > 0 ? value.join(', ') : tr('values.any');
        }
        return toText(value) || tr('values.any');
    }
  }

  /**
   * Returns the command a listener card's Change button runs for a field.
   *
   * @param {string} id Listener ID.
   * @param {object} listener Listener rules.
   * @param {string} key Field.
   * @returns {string} Command.
   */
  function changeCommand(id, listener, key) {
    const edit = (option, value) => `${COMMAND} edit ${id} --${option} ${value}`;
    switch (key) {
      case 'enabled':
        return edit('enabled', listener.enabled ? 'off' : 'on');
      case 'stop':
        return edit('stop', listener.stop ? 'off' : 'on');
      case 'regex':
        return edit(
          'regex',
          choiceQuery('regex', [
            [tr('values.plain'), 'off'],
            [tr('values.regex'), 'on'],
          ])
        );
      case 'results':
        return edit(
          'results',
          choiceQuery('results', [
            [tr('values.any'), '-'],
            [tr('results.crit'), 'crit'],
            [tr('results.fumble'), 'fumble'],
            [tr('choices.critOrFumble'), 'crit fumble'],
            [tr('results.success'), 'success'],
            [tr('results.fail'), 'fail'],
          ])
        );
      case 'dice':
        return edit(
          'dice',
          choiceQuery('dice', [
            [tr('values.diceAuto'), 'auto'],
            [tr('values.diceAny'), 'any'],
            ...[20, 100, 12, 10, 8, 6, 4].map((n) => [`d${n}`, String(n)]),
          ])
        );
      case 'speaker':
        return edit(
          'speaker',
          choiceQuery(
            'speaker',
            LISTENER_SPEAKER_OPTIONS.map((value) => [tr(`values.speaker.${value}`), value])
          )
        );
      default:
        return edit(key, textQuery(key));
    }
  }

  /**
   * Whispers the main menu: global switch and the list of listeners.
   *
   * @param {string|null} playerId Player ID.
   * @returns {void}
   */
  function showMainMenu(playerId) {
    const config = getConfig();
    const lines = [
      buildRow(
        tr('menu.listening'),
        buildSecondaryButton(
          tr(config.enabled ? 'values.on' : 'values.off'),
          `${COMMAND} ${config.enabled ? 'off' : 'on'}`
        )
      ),
      buildSectionLabel(tr('menu.listeners')),
    ];
    const listeners = getListeners();
    if (listeners.length === 0) {
      lines.push(`<div style="color:${COLOR_MUTED}">${escapeHtml(tr('menu.noListeners'))}</div>`);
    }
    for (const { id, listener } of listeners) {
      const colour = listener.enabled ? COLOR_OK : COLOR_OFF;
      const label = `<span style="color:${colour}">●</span> ${escapeHtml(listener.name)}`;
      lines.push(
        [
          '<table style="width:100%;border-collapse:collapse;margin:1px 0"><tr>',
          `<td>${label}</td>`,
          '<td style="text-align:right;white-space:nowrap">',
          buildSecondaryButton(tr('buttons.edit'), `${COMMAND} show ${id}`),
          buildSecondaryButton(
            tr(listener.enabled ? 'buttons.disable' : 'buttons.enable'),
            `${COMMAND} ${listener.enabled ? 'disable' : 'enable'} ${id}`
          ),
          buildSecondaryButton('▲', `${COMMAND} up ${id}`),
          buildSecondaryButton('▼', `${COMMAND} down ${id}`),
          '</td></tr></table>',
        ].join('')
      );
    }
    lines.push(buildDivider());
    lines.push(
      [
        buildButton(tr('buttons.new'), `${COMMAND} new ${textQuery('newName')}`),
        buildButton(tr('buttons.inspect'), `${COMMAND} inspect`),
        buildSecondaryButton(tr('buttons.settings'), `${COMMAND} config`),
        buildSecondaryButton(tr('buttons.help'), `${COMMAND} help`),
      ].join('')
    );
    whisper(playerId, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
  }

  /**
   * Whispers a listener's card.
   *
   * @param {string|null} playerId Player ID.
   * @param {string} id Listener ID.
   * @returns {void}
   */
  function showListener(playerId, id) {
    const listener = getListener(id);
    if (!listener) {
      showMainMenu(playerId);
      return;
    }
    const lines = [];
    for (const key of LISTENER_ROWS) {
      lines.push(
        buildRow(
          tr(`fields.${key}`),
          `${escapeHtml(formatField(listener, key))} ${buildSecondaryButton(tr('buttons.change'), changeCommand(id, listener, key))}`
        )
      );
    }
    // Roll20 silently drops very long chat messages, so the card is sent in
    // two parts: the rules, then the commands and actions.
    whisper(playerId, tr('titles.listener', { name: listener.name }), lines);
    lines.length = 0;
    const commands = getCommands(id);
    lines.push(
      commands
        ? buildCode(commands)
        : `<div style="color:${COLOR_MUTED}">${escapeHtml(tr('menu.noCommands'))}</div>`
    );
    const link = getStoreLink();
    lines.push(
      [
        buildSecondaryButton(
          tr('buttons.setCommands'),
          `${COMMAND} edit ${id} --commands ${textQuery('commands')}`
        ),
        link ? buildSecondaryButton(tr('buttons.openJournal'), link) : '',
      ].join('')
    );
    lines.push(
      `<div style="font-size:0.85em;color:${COLOR_MUTED}">${escapeHtml(tr('menu.commandsHint'))}</div>`
    );
    lines.push(buildDivider());
    lines.push(
      [
        buildButton(tr('buttons.test'), `${COMMAND} test ${id}`),
        buildSecondaryButton(
          tr('buttons.rename'),
          `${COMMAND} edit ${id} --name ${textQuery('name')}`
        ),
        buildSecondaryButton(tr('buttons.delete'), `${COMMAND} delete ${id}`),
        buildSecondaryButton(tr('buttons.back'), COMMAND),
      ].join('')
    );
    whisper(playerId, tr('titles.listenerCommands', { name: listener.name }), lines);
  }

  /**
   * Whispers the global settings.
   *
   * @param {string|null} playerId Player ID.
   * @returns {void}
   */
  function showConfig(playerId) {
    const config = getConfig();
    const row = (key, value, command) =>
      buildRow(
        tr(`settings.${key}.label`),
        `${escapeHtml(value)} ${buildSecondaryButton(tr('buttons.change'), command)}`
      );
    const lines = [
      row(
        'enabled',
        tr(config.enabled ? 'values.on' : 'values.off'),
        `${COMMAND} config enabled ${config.enabled ? 'off' : 'on'}`
      ),
      row(
        'speaker',
        tr(`values.speaker.${config.speaker}`),
        `${COMMAND} config speaker ${choiceQuery(
          'speaker',
          SPEAKER_OPTIONS.map((value) => [tr(`values.speaker.${value}`), value])
        )}`
      ),
      row(
        'listenToMods',
        tr(config.listenToMods ? 'values.on' : 'values.off'),
        `${COMMAND} config listenToMods ${config.listenToMods ? 'off' : 'on'}`
      ),
      row(
        'language',
        LOCALE_LABELS[config.language] || config.language,
        `${COMMAND} config language ?{${queryText(tr('settings.language.label'))}|${SUPPORTED_LOCALES.join('|')}}`
      ),
    ];
    for (const key of ['enabled', 'speaker', 'listenToMods', 'language']) {
      lines.push(
        `<div style="font-size:0.8em;color:${COLOR_MUTED}">${escapeHtml(tr(`settings.${key}.label`))}: ${escapeHtml(tr(`settings.${key}.desc`))}</div>`
      );
    }
    lines.push(buildDivider());
    lines.push(
      [
        buildSecondaryButton(tr('buttons.rebuildJournal'), `${COMMAND} journal`),
        buildSecondaryButton(tr('buttons.back'), COMMAND),
      ].join('')
    );
    whisper(playerId, tr('titles.settings'), lines);
  }

  /**
   * Whispers the command reference.
   *
   * @param {string|null} playerId Player ID.
   * @returns {void}
   */
  function showHelp(playerId) {
    const rows = [
      ['', 'menu'],
      ['new <name> [--option value]', 'new'],
      ['show <name>', 'show'],
      ['edit <name> --option value', 'edit'],
      ['edit <name> --commands …', 'commands'],
      ['enable <name> / disable <name>', 'enable'],
      ['up <name> / down <name>', 'move'],
      ['test <name>', 'test'],
      ['delete <name>', 'delete'],
      ['inspect', 'inspect'],
      ['on / off', 'onOff'],
      ['config [setting value]', 'config'],
      ['journal', 'journal'],
      ['help', 'help'],
    ];
    const lines = rows.map(
      ([cmd, key]) =>
        `<div><code>${escapeHtml(`${COMMAND} ${cmd}`.trim())}</code><br><span style="font-size:0.9em;color:${COLOR_MUTED}">${escapeHtml(tr(`help.${key}`))}</span></div>`
    );
    lines.push(buildSectionLabel(tr('help.optionsTitle')));
    lines.push(
      `<div style="font-size:0.9em">${escapeHtml(tr('help.options'))}</div>`,
      `<div style="font-size:0.9em;margin-top:3px">${escapeHtml(tr('help.placeholders'))}</div>`,
      `<div style="font-size:0.9em;margin-top:3px">${escapeHtml(tr('help.handouts', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))}</div>`
    );
    whisper(playerId, tr('titles.help'), lines);
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * Creates a listener.
   *
   * @param {string} playerId Player ID.
   * @param {string} name Listener name.
   * @param {object} options Options.
   * @param {string|null} commands Commands text.
   * @returns {string|null} New listener ID.
   */
  function createListener(playerId, name, options, commands) {
    const { listener, errors } = applyOptions({ ...DEFAULT_LISTENER }, { ...options, name }, null);
    if (errors.length > 0) {
      reportErrors(playerId, errors);
      return null;
    }
    const ability = createListenerAbility(listener.name, commands ? commandLines(commands) : '');
    if (!ability) {
      fail(playerId, 'noStore');
      return null;
    }
    putListener(ability.id, listener);
    mirrorRules(ability.id);
    showListener(playerId, ability.id);
    return ability.id;
  }

  /**
   * Changes a listener.
   *
   * @param {string} playerId Player ID.
   * @param {string} id Listener ID.
   * @param {object} options Options.
   * @param {string|null} commands Commands text, or null to keep them.
   * @param {boolean} [show=true] Show the listener's card afterwards.
   * @returns {boolean} True when saved.
   */
  function editListener(playerId, id, options, commands, show = true) {
    const current = getListener(id);
    const { listener, errors } = applyOptions(current, options, id);
    if (errors.length > 0) {
      reportErrors(playerId, errors);
      return false;
    }
    if (listener.name !== current.name) {
      renameAbility(id, listener.name);
    }
    if (commands !== null) {
      setCommands(id, commandLines(commands));
    }
    if (!listener.enabled || listener.cooldown !== current.cooldown) {
      resetFires(id);
    }
    putListener(id, listener);
    mirrorRules(id);
    if (show) {
      showListener(playerId, id);
    }
    return true;
  }

  /**
   * Deletes a listener and its ability.
   *
   * @param {string} id Listener ID.
   * @returns {void}
   */
  function removeListener(id) {
    removeAbility(id);
    deleteListener(id);
    resetFires(id);
  }

  /**
   * Changes a global setting from chat.
   *
   * @param {string} playerId Player ID.
   * @param {string} key Setting key as typed.
   * @param {string} value Value.
   * @returns {void}
   */
  function changeConfig(playerId, key, value) {
    const keys = {
      enabled: 'enabled',
      speaker: 'speaker',
      listentomods: 'listenToMods',
      language: 'language',
    };
    const setting = keys[key.toLowerCase()];
    if (!setting) {
      fail(playerId, 'badSetting', { key, keys: Object.values(keys).join(', ') });
      return;
    }
    if (!value && setting === 'language') {
      whisper(
        playerId,
        tr('titles.languages'),
        SUPPORTED_LOCALES.map((code) =>
          buildSecondaryButton(LOCALE_LABELS[code], `${COMMAND} config language ${code}`)
        )
      );
      return;
    }
    if (!setConfigValue(setting, value)) {
      fail(playerId, 'badSettingValue', { key: setting, value });
      return;
    }
    if (setting === 'language') {
      installHandouts();
      prepareStoreCharacter();
    }
    showConfig(playerId);
  }

  /**
   * Runs a version 1 command.
   *
   * @param {string} playerId Player ID.
   * @param {string} content Restored command text.
   * @returns {void}
   */
  function routeLegacy(playerId, content) {
    const parsed = parseLegacyCommand(content);
    if (!parsed) {
      showHelp(playerId);
      return;
    }
    const found = findListener(parsed.name);
    switch (parsed.action) {
      case 'create':
        if (!parsed.name) {
          fail(playerId, 'nameRequired');
        } else if (found) {
          fail(playerId, 'nameTaken', { name: parsed.name });
        } else {
          createListener(playerId, parsed.name, parsed.options, parsed.commands);
        }
        return;
      case 'edit':
        if (!found) {
          fail(playerId, 'notFound', { name: parsed.name });
        } else {
          editListener(playerId, found.id, parsed.options, parsed.commands);
        }
        return;
      case 'delete':
        if (!found) {
          fail(playerId, 'notFound', { name: parsed.name });
        } else {
          removeListener(found.id);
          showMainMenu(playerId);
        }
        return;
      case 'config': {
        const menu = findListener(parsed.menu);
        if (menu) {
          showListener(playerId, menu.id);
        } else {
          showMainMenu(playerId);
        }
        return;
      }
      case 'set': {
        const value = parseBoolean(parsed.listen);
        if (value !== null) {
          setConfigValue('enabled', value);
        }
        showMainMenu(playerId);
        return;
      }
      default:
        showHelp(playerId);
    }
  }

  /**
   * Runs a "!crl" command.
   *
   * @param {string} playerId Player ID.
   * @param {string} content Restored command text.
   * @returns {void}
   */
  function routeCommand(playerId, content) {
    const args = parseArguments(content.slice(COMMAND.length));
    if (args.unknown.length > 0) {
      fail(playerId, 'badOption', { option: args.unknown.join(', --') });
      return;
    }
    // "delete <name> confirm" is the second step of deleting.
    const confirmed = ['delete', 'remove'].includes(args.sub) && /\s+confirm$/i.test(args.target);
    if (confirmed) {
      args.target = args.target.replace(/\s+confirm$/i, '');
    }
    const needsTarget = [
      'show',
      'view',
      'edit',
      'set',
      'delete',
      'remove',
      'enable',
      'disable',
      'toggle',
      'up',
      'down',
      'test',
    ];
    const found = needsTarget.includes(args.sub) ? findListener(args.target) : null;
    if (needsTarget.includes(args.sub) && !found) {
      fail(playerId, args.target ? 'notFound' : 'nameRequired', { name: args.target });
      return;
    }
    const hasOptions = Object.keys(args.options).length > 0 || args.commands !== null;

    switch (args.sub) {
      case '':
      case 'menu':
      case 'list':
        showMainMenu(playerId);
        return;
      case 'help':
        showHelp(playerId);
        return;
      case 'new':
      case 'create':
      case 'add':
        createListener(playerId, args.target, args.options, args.commands);
        return;
      case 'show':
      case 'view':
        showListener(playerId, found.id);
        return;
      case 'edit':
      case 'set':
        if (hasOptions) {
          editListener(playerId, found.id, args.options, args.commands);
        } else {
          showListener(playerId, found.id);
        }
        return;
      case 'enable':
      case 'disable':
        editListener(
          playerId,
          found.id,
          { enabled: args.sub === 'enable' ? 'on' : 'off' },
          null,
          false
        );
        showMainMenu(playerId);
        return;
      case 'toggle':
        editListener(playerId, found.id, { enabled: found.listener.enabled ? 'off' : 'on' }, null);
        return;
      case 'up':
      case 'down':
        moveListener(found.id, args.sub === 'up' ? -1 : 1);
        showMainMenu(playerId);
        return;
      case 'test': {
        const sent = testListener(found.id, found.listener, playerId);
        if (sent === 0) {
          whisperWarning(playerId, tr('messages.noCommands', { name: found.listener.name }));
        } else {
          done(playerId, 'tested', { name: found.listener.name, count: sent });
        }
        return;
      }
      case 'delete':
      case 'remove': {
        if (!confirmed) {
          whisper(playerId, tr('titles.confirm'), [
            `<div>${escapeHtml(tr('messages.confirmDelete', { name: found.listener.name }))}</div>`,
            `<div style="margin-top:4px">${buildButton(tr('buttons.confirmDelete'), `${COMMAND} delete ${found.id} confirm`)}${buildSecondaryButton(tr('buttons.back'), `${COMMAND} show ${found.id}`)}</div>`,
          ]);
          return;
        }
        removeListener(found.id);
        done(playerId, 'deleted', { name: found.listener.name });
        showMainMenu(playerId);
        return;
      }
      case 'inspect':
        if (/^(off|stop|cancel)$/i.test(args.target)) {
          setInspector(null);
          done(playerId, 'inspectOff');
        } else {
          setInspector(playerId);
          done(playerId, 'inspectOn');
        }
        return;
      case 'on':
      case 'off':
        setConfigValue('enabled', args.sub);
        showMainMenu(playerId);
        return;
      case 'config':
      case 'settings': {
        const [key = '', ...value] = args.target.split(/\s+/).filter(Boolean);
        if (!key) {
          showConfig(playerId);
        } else {
          changeConfig(playerId, key, value.join(' '));
        }
        return;
      }
      case 'journal':
      case 'handouts':
        installHandouts();
        prepareStoreCharacter();
        done(playerId, 'journalRebuilt', { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME });
        return;
      default:
        fail(playerId, 'unknownCommand', { command: args.sub });
    }
  }

  /**
   * Handles "!crl" chat commands.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {boolean} True when the message was a CRL command.
   */
  function handleCommand(msg) {
    if (msg.type !== 'api') {
      return false;
    }
    const content = toText(msg.content);
    if (!/^!crl(?:\s|$)/i.test(content)) {
      return false;
    }
    if (!playerIsGM(msg.playerid)) {
      fail(msg.playerid, 'gmOnly');
      return true;
    }
    try {
      const restored = restoreCommandText(msg);
      if (isLegacyCommand(restored)) {
        routeLegacy(msg.playerid, restored);
      } else {
        routeCommand(msg.playerid, restored);
      }
    } catch (err) {
      log(`${SCRIPT_NAME} ERROR: ${err?.message || err}`);
      if (err?.stack) {
        log(err.stack);
      }
      fail(msg.playerid, 'unexpected', { message: err?.message || String(err) });
    }
    return true;
  }

  let ready = false;

  /**
   * Runs a handler, logging instead of crashing the sandbox on errors.
   *
   * @param {string} label Handler name for the log.
   * @param {Function} fn Handler.
   * @returns {Function} Wrapped handler.
   */
  function guarded(label, fn) {
    return (...args) => {
      if (!ready) {
        return;
      }
      try {
        fn(...args);
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR in ${label}: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      }
    };
  }

  /**
   * Handles every chat message: CRL commands first, then the listeners.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleChat(msg) {
    if (!handleCommand(msg)) {
      handleChatMessage(msg);
    }
  }

  /**
   * Publishes the API other mods can call.
   *
   * @returns {void}
   */
  function publishApi() {
    globalThis.CRL = Object.freeze({
      version: SCRIPT_VERSION,
      /**
       * Describes a chat message the way listeners see it.
       *
       * @param {object} msg Roll20 chat message.
       * @returns {object} Message description.
       */
      analyse(msg) {
        return analyseMessage(msg);
      },
      /**
       * Returns the names of the listeners a chat message would trigger.
       *
       * @param {object} msg Roll20 chat message.
       * @returns {string[]} Listener names.
       */
      matches(msg) {
        const message = analyseMessage(msg);
        return getListeners()
          .filter(({ listener }) => matchListener(listener, message).ok)
          .map(({ listener }) => listener.name);
      },
      /**
       * Registers a callback run whenever a listener matches.
       *
       * @param {Function} fn Callback, given {id, listener, message, verdict}.
       * @returns {void}
       */
      onMatch(fn) {
        addObserver(fn);
      },
    });
  }

  /**
   * Startup: migrate state, take on the store character, install handouts and
   * greet the GM.
   *
   * @returns {void}
   */
  function checkInstall() {
    const migratedFrom = initialiseState();
    applyGlobalConfig();
    prepareStoreCharacter();
    const counts = syncListeners();
    installHandouts();
    publishApi();
    ready = true;

    log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`);

    const config = getConfig();
    const lang = config.language;
    const lines = [`<div><strong>${escapeHtml(t('titles.ready', lang))}</strong></div>`];
    const note = (key, vars) =>
      lines.push(`<div style="margin-top:3px">${escapeHtml(t(key, lang, vars))}</div>`);
    if (migratedFrom === 1 || counts.upgraded > 0) {
      note('messages.upgraded', { count: counts.upgraded });
    }
    if (counts.restored > 0) {
      note('messages.restored', { count: counts.restored });
    }
    if (counts.adopted > 0) {
      note('messages.adopted', { count: counts.adopted });
    }
    if (counts.removed > 0) {
      note('messages.removed', { count: counts.removed });
    }
    if (!config.enabled) {
      note('messages.listeningOff');
    }
    lines.push(
      `<div style="font-size:0.85em;margin-top:3px">${escapeHtml(t('messages.readyHint', lang, { count: getListeners().length }))}</div>`
    );
    whisper(null, `${SCRIPT_NAME} v${SCRIPT_VERSION}`, lines);
    if (migratedFrom === 1 || counts.upgraded > 0) {
      showMainMenu(null);
    }
  }

  /**
   * Registers all Roll20 event handlers.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    on('ready', () => {
      try {
        checkInstall();
      } catch (err) {
        log(`${SCRIPT_NAME} ERROR during startup: ${err?.message || err}`);
        if (err?.stack) {
          log(err.stack);
        }
      }
    });
    on('chat:message', guarded('chat:message', handleChat));
    on('add:ability', guarded('add:ability', handleAbilityChanged));
    on('change:ability', guarded('change:ability', handleAbilityChanged));
    on('destroy:ability', guarded('destroy:ability', handleAbilityDestroyed));
  }

  registerEventHandlers();
})();
