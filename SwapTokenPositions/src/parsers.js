import { whisperSenderError } from "./messages.js";

/**
 * Parses a string flag and validates it against an allowed set.
 *
 * @param {string} content Full command content.
 * @param {RegExp} flagRegex Regex for the flag name.
 * @param {string[]} allowedValues Allowed lower-case values.
 * @returns {{found:boolean, valid:boolean, value:(string|null)}} Parse result.
 */
export function parseStringFlag(content, flagRegex, allowedValues) {
  const match = new RegExp(String.raw`${flagRegex.source}\s+(\S+)`, "i").exec(content);
  if (!match) {
    return { found: false, valid: false, value: null };
  }
  const normalized = match[1]
    .trim()
    .replaceAll(/(^['"]|['"]$)/g, "")
    .replaceAll(/[.,;]+$/g, "")
    .toLowerCase();
  if (allowedValues.includes(normalized)) {
    return { found: true, valid: true, value: normalized };
  }
  return { found: true, valid: false, value: match[1] };
}

/**
 * Parses a numeric flag and validates it against an inclusive range.
 *
 * @param {string} content Full command content.
 * @param {RegExp} flagRegex Regex for the flag name.
 * @param {number} min Minimum allowed value.
 * @param {number} max Maximum allowed value.
 * @returns {{found:boolean, valid:boolean, value:(number|null)}} Parse result.
 */
export function parseFloatFlag(content, flagRegex, min, max) {
  const match = new RegExp(String.raw`${flagRegex.source}\s+([\d.]+)`, "i").exec(content);
  if (!match) {
    return { found: false, valid: false, value: null };
  }
  const value = Number.parseFloat(match[1]);
  if (!Number.isNaN(value) && value >= min && value <= max) {
    return { found: true, valid: true, value };
  }
  return { found: true, valid: false, value: null };
}

/**
 * Applies a parsed string flag result to config and update tracking.
 *
 * @param {{found:boolean, valid:boolean, value:(string|null)}} result Parse result.
 * @param {string} key Config key to set.
 * @param {object} config Mutable config object.
 * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
 * @param {object} msg Roll20 chat message object.
 * @param {string} errorMsg Error message shown when invalid.
 * @returns {void}
 */
export function applyStringFlagResult(result, key, config, updateTracker, msg, errorMsg) {
  if (result.valid) {
    config[key] = result.value;
    updateTracker.valid++;
  } else {
    updateTracker.invalid++;
    whisperSenderError(msg, errorMsg, "Invalid Input");
  }
}

/**
 * Applies a parsed numeric flag result to config and update tracking.
 *
 * @param {{found:boolean, valid:boolean, value:(number|null)}} result Parse result.
 * @param {string} key Config key to set.
 * @param {object} config Mutable config object.
 * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
 * @param {object} msg Roll20 chat message object.
 * @param {string} label Human-readable field label.
 * @param {{min:number,max:number}} range Allowed numeric range.
 * @returns {void}
 */
export function applyNumericFlagResult(result, key, config, updateTracker, msg, label, range) {
  if (result.valid) {
    config[key] = result.value;
    updateTracker.valid++;
  } else {
    updateTracker.invalid++;
    whisperSenderError(
      msg,
      `Invalid ${label}: must be between ${range.min} and ${range.max} seconds.`,
      "Invalid Input",
    );
  }
}

/**
 * Parses and applies a collection of string flags.
 *
 * @param {string} content Full command content.
 * @param {Array<{flag:RegExp,key:string,allowed:string[],label:string}>} flagConfigs Flag specs.
 * @param {object} config Mutable config object.
 * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
 * @param {object} msg Roll20 chat message object.
 * @returns {void}
 */
export function processStringFlags(content, flagConfigs, config, updateTracker, msg) {
  for (const { flag, key, allowed, label } of flagConfigs) {
    const result = parseStringFlag(content, flag, allowed);
    if (!result.found) {
      continue;
    }
    const errorMsg = `Invalid ${label}: '${result.value}'.<br><br>Valid: ${allowed.join(", ")}`;
    applyStringFlagResult(result, key, config, updateTracker, msg, errorMsg);
  }
}

/**
 * Parses and applies a collection of numeric flags.
 *
 * @param {string} content Full command content.
 * @param {Array<{flag:RegExp,key:string,label:string,min:number,max:number}>} flagConfigs Flag specs.
 * @param {(content:string, flagRegex:RegExp, min:number, max:number)=>{found:boolean, valid:boolean, value:(number|null)}} parseFunc Numeric parser.
 * @param {object} config Mutable config object.
 * @param {{valid:number, invalid:number}} updateTracker Valid/invalid counters.
 * @param {object} msg Roll20 chat message object.
 * @returns {void}
 */
export function processNumericFlags(content, flagConfigs, parseFunc, config, updateTracker, msg) {
  for (const { flag, key, label, min, max } of flagConfigs) {
    const result = parseFunc(content, flag, min, max);
    if (!result.found) {
      continue;
    }
    applyNumericFlagResult(result, key, config, updateTracker, msg, label, { min, max });
  }
}
