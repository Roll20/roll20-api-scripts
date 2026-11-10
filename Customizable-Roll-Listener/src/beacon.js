// Reads the roll cards Beacon sheets (such as D&D 2024) post to chat. They
// arrive as 'advancedroll' messages whose content is HTML inside a
// <rolltemplate class="..."> element, with no inline rolls and no roll
// template name, so the rolls are read from the HTML itself. Pure functions
// only.

import { decodeEntities, toText } from './utils.js';

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
export function isBeaconCard(content) {
  return /<rolltemplate\s[^>]*class="/i.test(String(content));
}

/**
 * Reads a Beacon roll card.
 *
 * @param {string} content Message content.
 * @returns {{template: string, character: string, fields: object, rolls: object[]}}
 *          What the card shows.
 */
export function parseBeaconCard(content) {
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
