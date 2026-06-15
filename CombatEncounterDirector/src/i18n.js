import {
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
  SUPPORTED_LOCALE_LIST,
  TRANSLATIONS,
  VALID_LOCALES,
} from './locales/index.js';

export {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  LOCALE_LABELS,
  SUPPORTED_LOCALE_LIST,
  SUPPORTED_LOCALES,
  VALID_LOCALES,
} from './locales/index.js';

/**
 * Returns the canonical locale for a supported locale string or alias.
 * Matching is case-insensitive after exact matches are checked.
 *
 * @param {string} lang Locale string or alias (e.g. 'en', 'fr', 'zh-TW').
 * @returns {string} Canonical locale code, or an empty string when unsupported.
 */
export function normalizeLocale(lang) {
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
export function getLocale(lang) {
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
 * Returns the translated string for a dot-separated key, interpolating {placeholder} vars.
 * Falls back to en-US when the key is missing in the requested locale.
 * No HTML escaping is performed — callers must pre-escape HTML-unsafe values.
 *
 * @param {string} key Dot-separated translation key (e.g. 'errors.noTokensSelected').
 * @param {string} locale Locale code.
 * @param {object} [vars] Interpolation variables mapped to {placeholder} names.
 * @returns {string} Translated and interpolated string. Returns the key when not found.
 */
export function t(key, locale, vars = {}) {
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
