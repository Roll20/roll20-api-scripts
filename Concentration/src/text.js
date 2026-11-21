// Translation helpers bound to the language chosen in the settings.

import { getDirectionStyle, t } from './i18n.js';
import { getConfig } from './state.js';
import { escapeHtml } from './utils.js';

/**
 * Returns the active locale.
 *
 * @returns {string} Locale code.
 */
export function lang() {
  return getConfig().language;
}

/**
 * Translates a key in the active locale.
 *
 * @param {string} key Translation key.
 * @param {object} [vars] Interpolation variables.
 * @returns {string} Translated text.
 */
export function tr(key, vars) {
  return t(key, lang(), vars);
}

/**
 * Translates a key into HTML: the text is escaped and each {placeholder} is
 * replaced by its value in bold (also escaped).
 *
 * @param {string} key Translation key.
 * @param {object} [vars] Interpolation variables.
 * @returns {string} HTML.
 */
export function rich(key, vars = {}) {
  const template = t(key, lang());
  return template
    .split(/(\{\w+\})/)
    .map((part) => {
      const name = part.match(/^\{(\w+)\}$/)?.[1];
      if (name && name in vars) {
        return `<strong>${escapeHtml(vars[name])}</strong>`;
      }
      return escapeHtml(part);
    })
    .join('');
}

/**
 * Returns the text direction CSS for the active locale.
 *
 * @returns {string} CSS declarations, empty for left-to-right languages.
 */
export function dirStyle() {
  return getDirectionStyle(lang());
}
