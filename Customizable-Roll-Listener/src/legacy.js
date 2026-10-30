// Version 1 command syntax, kept so existing macros, buttons and forum
// examples still work:
//   !crl \\create,name=Name,text=Text,template=a b,roll=critical \\cmd 1 \\cmd 2
//   !crl \\edit,name=Name,... \\cmd    !crl \\delete,name=Name
//   !crl \\config[,menu=Name]          !crl \\set,listen=on|off

import { toText } from './utils.js';

const ACTIONS = ['create', 'edit', 'delete', 'set', 'config'];

/**
 * Returns true when a command uses the version 1 syntax.
 *
 * @param {string} content Message content.
 * @returns {boolean} True for "!crl \\action".
 */
export function isLegacyCommand(content) {
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
export function needsRegex(terms) {
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
export function parseLegacyCommand(content) {
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
