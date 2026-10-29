// Typed task errors (plan §10, §14). Commands, run journals and the dashboard
// distinguish these codes so every failure says what kind of problem it is.

import { ERROR_CODES } from './constants.js';

// Codes that may succeed if tried again later.
const TRANSIENT = new Set([
  ERROR_CODES.UNAVAILABLE,
  ERROR_CODES.TIMEOUT,
  ERROR_CODES.RESOURCE_LIMIT,
]);

/**
 * Creates a typed error.
 *
 * @param {string} code One of ERROR_CODES.
 * @param {string} reason Translation key suffix under `runErrors.`.
 * @param {object} [vars] Interpolation values (IDs, names; never secrets).
 * @param {{transient?: boolean, uncertain?: boolean}} [flags] Overrides.
 * @returns {Error} Error with code, reason, vars, transient and uncertain.
 */
export function taskError(code, reason, vars = {}, flags = {}) {
  const err = new Error(`${code}:${reason}`);
  err.taskError = true;
  err.code = code;
  err.reason = reason;
  err.vars = vars;
  err.transient = flags.transient ?? TRANSIENT.has(code);
  err.uncertain = flags.uncertain ?? code === ERROR_CODES.UNCERTAIN;
  return err;
}

/**
 * Converts anything thrown into a typed error.
 *
 * @param {*} err Thrown value.
 * @returns {Error} Typed error.
 */
export function asTaskError(err) {
  if (err?.taskError) {
    return err;
  }
  return taskError(ERROR_CODES.INTERNAL, 'internal', {
    message: String(err?.message || err).slice(0, 200),
  });
}

/**
 * Returns a compact, storable description of an error.
 *
 * @param {Error} err Typed error.
 * @param {string} [stepId] Step that failed.
 * @returns {{code: string, reason: string, vars: object, stepId: string|null}} Record.
 */
export function errorRecord(err, stepId) {
  const typed = asTaskError(err);
  return { code: typed.code, reason: typed.reason, vars: typed.vars, stepId: stepId || null };
}
