// Translates v4 `!tc` / `!token-control` subcommands into v5 commands, so
// existing macros, the T-Cntrl_ macros and old chat buttons keep working.
// v5 subcommands typed after `!tc` pass through unchanged.

import { getConfig, findRoute } from './state.js';

/**
 * Builds an unquoted word.
 *
 * @param {string} text Word text.
 * @returns {{text: string, quoted: boolean}} Word.
 */
function word(text) {
  return { text: String(text), quoted: false };
}

/**
 * Returns a route's reference word for a v4 path name, falling back to the
 * name itself so the v5 command reports "not found".
 *
 * @param {object[]} nameWords Words of the path name.
 * @returns {{route: object|null, ref: object}} Route and reference word.
 */
function routeRef(nameWords) {
  const name = nameWords.map((w) => w.text).join(' ');
  const route = findRoute(name);
  return { route, ref: route ? word(`#${route.id}`) : { text: name, quoted: true } };
}

/**
 * Translates a v4 subcommand.
 *
 * @param {{text: string, quoted: boolean}[]} words Words after the prefix.
 * @returns {{words: {text: string, quoted: boolean}[], raw?: boolean}} v5 words.
 */
export function translateLegacy(words) {
  if (words.length === 0) {
    return { words: [] };
  }
  const [first, ...rest] = words;
  const sub = first.text.toLowerCase();
  const config = getConfig();
  const pass = { words };

  switch (sub) {
    case 'setup':
      return { words: [word('journal'), word('rebuild')] };
    case 'hide':
      return { words: [] };
    case 'usage':
      return { words: [word('help')] };
    case 'list': {
      const what = rest[0]?.text.toLowerCase();
      const name = rest.slice(1);
      if (what === 'paths' && name.length > 0) {
        return { words: [word('show'), routeRef(name).ref] };
      }
      if (what === 'tokens') {
        return { words: [word('list'), word('tokens'), ...name] };
      }
      if (what === 'draft') {
        return { words: [word('record'), word('status')] };
      }
      if (what === 'tick' || what === 'vars') {
        return { words: [word('status')] };
      }
      return { words: [word('list'), word('routes')] };
    }
    case 'set':
      return { words: [word('edit'), ...rest] };
    case 'setstart':
    case 'clearstart':
      return {
        words: [
          word('route'),
          routeRef(rest).ref,
          word('start'),
          word(sub === 'setstart' ? 'set' : 'clear'),
        ],
      };
    case 'build': {
      // v4: !tc Build <tokenId> <name>
      return { words: [word('record'), ...rest] };
    }
    case 'draft': {
      // v4: !tc draft <name> <U|D|L|R|W|S|Set|Rmv> [units]
      if (rest.length < 2) {
        return { words: [word('record'), word('status')] };
      }
      const [name, op, units] = rest;
      const opText = op.text.toLowerCase();
      const mapped = opText === 'set' ? 'save' : opText === 'rmv' ? 'cancel' : op.text;
      return { words: [word('record'), name, word(mapped), ...(units ? [units] : [])] };
    }
    case 'unit':
      return { words: [word('set'), word('buttonStep'), ...rest] };
    case 'unitpx':
      return { words: [word('unitpx')] };
    case 'tick':
      return { words: [word('set'), word('interval'), ...rest] };
    case 'reset':
      return rest.length === 0 ? { words: [word('reset'), word('all')] } : pass;
    case 'rotate':
      return {
        words: [word('set'), word('facing'), word(config.facing === 'off' ? 'down' : 'off')],
      };
    case 'combat':
      return {
        words: [
          word('set'),
          word('combatBehaviour'),
          word(config.combatBehaviour === 'step' ? 'pause' : 'step'),
        ],
      };
    case 'substeps':
      return {
        words: [
          word('set'),
          word('movement'),
          word(config.movement === 'cell' ? 'segment' : 'cell'),
        ],
      };
    case 'pathinterval':
    case 'maxtokens': {
      const value = rest.at(-1);
      const { ref } = routeRef(rest.slice(0, -1));
      return {
        words: [word('route'), ref, word(sub === 'pathinterval' ? 'interval' : 'max'), value],
      };
    }
    case 'runonce':
    case 'cycle':
    case 'randomstart': {
      const { route, ref } = routeRef(rest);
      if (sub === 'randomstart') {
        return { words: [word('route'), ref, word('random'), word('toggle')] };
      }
      let mode;
      if (sub === 'runonce') {
        mode = route?.mode === 'once' ? 'pingpong' : 'once';
      } else {
        mode = route?.mode === 'loop' ? 'pingpong' : 'loop';
      }
      return { words: [word('route'), ref, word('mode'), word(mode)] };
    }
    case 'duplicate':
      return { words: [word('copy'), ...rest] };
    case 'exportpaths':
      return { words: [word('export')] };
    case 'importpaths':
      return { words: [word('import'), ...rest], raw: true };
    default:
      return pass;
  }
}
