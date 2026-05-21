import { COMMAND } from './constants.js';
import { toText } from './utils.js';

const WHISPER_PREFIX = /^\/w\s+(?:"[^"]+"|'[^']+'|\S+)\s*$/i;

/**
 * Extracts the Condition Tracker command segment from raw chat content.
 *
 * Supports direct API commands and whisper-wrapped commands (for example
 * `/w gm !condition-tracker ...`) so button clicks from whispers and macro
 * executions still route through the parser.
 *
 * @param {string} content Raw chat content.
 * @returns {string} Full command text starting with the namespace, or empty string.
 */
export function extractConditionTrackerCommand(content) {
  const text = toText(content).trim();
  if (!text) {
    return '';
  }

  if (text.startsWith(COMMAND)) {
    return text;
  }

  const commandIndex = text.indexOf(COMMAND);
  if (commandIndex < 0) {
    return '';
  }

  const prefix = text.slice(0, commandIndex).trim();
  if (!WHISPER_PREFIX.test(prefix)) {
    return '';
  }

  return text.slice(commandIndex).trim();
}

/**
 * Parses an API chat message into command arguments.
 *
 * @param {string} content Raw chat content.
 * @returns {object} Parsed command details.
 */
export function parseCommand(content) {
  const command = extractConditionTrackerCommand(content);
  const body = command ? command.slice(COMMAND.length).trim() : '';
  const tokens = tokenize(body);
  return collectFlags(tokens);
}

/**
 * Splits command text into shell-like tokens.
 *
 * @param {string} text Command text without namespace.
 * @returns {string[]} Token list.
 */
export function tokenize(text) {
  const tokens = [];
  let current = '';
  let quote = '';

  for (let index = 0; index < text.length; index += 1) {
    const character = text.charAt(index);
    if (isQuote(character)) {
      quote = updateQuote(quote, character);
      continue;
    }

    if (!quote && /\s/.test(character)) {
      pushToken(tokens, current);
      current = '';
      continue;
    }

    current += character;
  }

  pushToken(tokens, current);
  return tokens;
}

/**
 * Collects flag tokens into a command argument object.
 *
 * @param {string[]} tokens Token list.
 * @returns {object} Parsed flags.
 */
export function collectFlags(tokens) {
  const args = { raw: tokens.slice(0) };
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index];
    if (!token.startsWith('--')) {
      index += 1;
      continue;
    }

    const key = token.slice(2);
    const valueTokens = [];
    index += 1;

    while (index < tokens.length && !tokens[index].startsWith('--')) {
      valueTokens.push(tokens[index]);
      index += 1;
    }

    args[key] = valueTokens.length > 0 ? valueTokens.join(' ') : true;
  }

  return args;
}

/**
 * Returns true when a character is a supported quote.
 *
 * @param {string} character Character to inspect.
 * @returns {boolean} True for single or double quotes.
 */
export function isQuote(character) {
  return character === '"' || character === "'";
}

/**
 * Updates the active quote state.
 *
 * @param {string} activeQuote Current quote character.
 * @param {string} character Current character.
 * @returns {string} Next quote state.
 */
export function updateQuote(activeQuote, character) {
  if (!activeQuote) {
    return character;
  }

  if (activeQuote === character) {
    return '';
  }

  return activeQuote;
}

/**
 * Adds a non-empty token to a token list.
 *
 * @param {string[]} tokens Token list to mutate.
 * @param {string} token Token candidate.
 * @returns {void}
 */
export function pushToken(tokens, token) {
  const trimmed = toText(token);
  if (trimmed) {
    tokens.push(trimmed);
  }
}
