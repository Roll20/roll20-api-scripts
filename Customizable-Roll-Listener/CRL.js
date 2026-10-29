/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Customizable Roll Listener
 * Script: CRL.js
 * Version: 2.0.0
 * Built: 2026-10-29T14:08:20.230Z
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
  const SCRIPT_LAST_UPDATED = '2026-10-29T14:08:20.230Z';

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
      names: 'simple, atk, dmg, atkdmg, spell, desc, npcaction, npcatk, npcdmg',
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
   * Sends a styled card whispered to a player, or to every GM when no player is given.
   *
   * @param {string|null} playerId Roll20 player ID.
   * @param {string} title Card header text.
   * @param {string|string[]} content HTML body content.
   * @returns {void}
   */
  function whisper(playerId, title, content) {
    const body = Array.isArray(content) ? content.join('') : content;
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${buildCard(title, body)}`, null, {
      noarchive: true,
    });
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
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${html}`, null, { noarchive: true });
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
    sendChat(SCRIPT_NAME, `/w ${whisperTarget(playerId)} ${html}`, null, { noarchive: true });
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
    return `<div style="${style}">${escapeHtml(text)}</div>`;
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

  const TRANSLATION$m = {};

  const TRANSLATION$l = {};

  const TRANSLATION$k = {};

  const TRANSLATION$j = {};

  const TRANSLATION$i = {};

  const TRANSLATION$h = {};

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

  const TRANSLATION$g = {};

  const TRANSLATION$f = {};

  const TRANSLATION$e = {};

  const TRANSLATION$d = {};

  const TRANSLATION$c = {};

  const TRANSLATION$b = {};

  const TRANSLATION$a = {};

  const TRANSLATION$9 = {};

  const TRANSLATION$8 = {};

  const TRANSLATION$7 = {};

  const TRANSLATION$6 = {};

  const TRANSLATION$5 = {};

  const TRANSLATION$4 = {};

  const TRANSLATION$3 = {};

  const TRANSLATION$2 = {};

  const TRANSLATION$1 = {};

  const TRANSLATION = {};

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

    const locales = SUPPORTED_LOCALES.map((c) => escapeHtml(LOCALE_LABELS[c])).join(', ');
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
    ${section('languages', `<p style="${STYLE.p}">${h('languages.body')}</p><p style="${STYLE.p};font-size:0.85em">${locales}</p>`)}
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
