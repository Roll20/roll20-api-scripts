import {
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
  LOCALE_DEFINITIONS,
  SUPPORTED_LOCALE_LIST,
  TRANSLATIONS,
  VALID_LOCALES,
} from "./locales/index.js";

export {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  LOCALE_LABELS,
  SUPPORTED_LOCALE_LIST,
  SUPPORTED_LOCALES,
  VALID_LOCALES,
} from "./locales/index.js";

for (const translation of Object.values(TRANSLATIONS)) {
  const rows = translation?.handout?.configuration?.rows;
  const languageRow = Array.isArray(rows)
    ? rows.find((row) => Array.isArray(row) && row[0] === "language")
    : null;
  if (languageRow) {
    languageRow[1] = SUPPORTED_LOCALE_LIST;
  }
}

/**
 * Returns the canonical locale for a supported locale or alias.
 * Matching is case-insensitive after exact matches are checked.
 *
 * @param {string} lang Locale string or supported alias.
 * @returns {string} Canonical locale, or an empty string when unsupported.
 */
export function normalizeLocale(lang) {
  const s = typeof lang === "string" ? lang.trim() : "";
  if (VALID_LOCALES.has(s)) {
    return s;
  }
  if (LOCALE_ALIASES[s]) {
    return LOCALE_ALIASES[s];
  }

  const normalized = s.toLowerCase();
  const supportedLocale = Array.from(VALID_LOCALES).find(
    (locale) => locale.toLowerCase() === normalized,
  );
  return (
    supportedLocale ||
    Object.entries(LOCALE_ALIASES).find(
      ([alias]) => alias.toLowerCase() === normalized,
    )?.[1] ||
    ""
  );
}

/**
 * Returns a valid locale string, falling back to the default.
 *
 * @param {string} lang Locale string to validate.
 * @returns {string} Validated locale.
 */
export function getLocale(lang) {
  return normalizeLocale(lang) || DEFAULT_LOCALE;
}

/**
 * Returns a locale definition by canonical code.
 *
 * @param {string} locale Locale code.
 * @returns {object|null} Locale metadata or null.
 */
function getLocaleDefinition(locale) {
  const lang = getLocale(locale);
  return (
    LOCALE_DEFINITIONS.find((definition) => definition.code === lang) || null
  );
}

/**
 * Returns a language name localized to the active display locale.
 *
 * Uses a locale-provided `languageNames` map first, then `Intl.DisplayNames`
 * when available, then the English metadata name.
 *
 * @param {string} locale Locale code to name.
 * @param {string} displayLocale Locale to use for the language name.
 * @returns {string} Localized language name with native fallback context.
 */
export function getLocalizedLanguageName(locale, displayLocale) {
  const definition = getLocaleDefinition(locale);
  if (!definition) {
    return locale;
  }

  const lang = getLocale(displayLocale);
  let localizedName =
    TRANSLATIONS[lang]?.languageNames?.[definition.code] || "";
  try {
    localizedName =
      localizedName ||
      new Intl.DisplayNames([lang], { type: "language" }).of(definition.code);
  } catch (error) {
    if (!localizedName) {
      throw error;
    }
  }

  const name = localizedName || definition.name;
  const nativeName =
    definition.nativeName &&
    definition.nativeName !== name &&
    definition.nativeName !== definition.name
      ? ` (${definition.nativeName})`
      : "";
  return `${name}${nativeName}`;
}

/**
 * Returns true when a locale should render right-to-left.
 *
 * @param {string} locale Locale string.
 * @returns {boolean} True for right-to-left locales.
 */
export function isRtlLocale(locale) {
  const lang = getLocale(locale);
  return LOCALE_DEFINITIONS.some(
    (definition) => definition.code === lang && definition.direction === "rtl",
  );
}

/**
 * Navigates a nested object by splitting key on dots.
 *
 * @param {object} obj Root object.
 * @param {string[]} parts Key path segments.
 * @returns {*} Value at the key path, or undefined.
 */
function getNestedValue(obj, parts) {
  let current = obj;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Returns the translated string for a dot-separated key, interpolating {placeholder} vars.
 * Falls back to en-US when the key is missing in the requested locale.
 * No HTML escaping is performed — callers must pre-escape HTML-unsafe values.
 *
 * @param {string} key Dot-separated translation key.
 * @param {string} locale Locale string.
 * @param {object} [vars] Interpolation variables.
 * @returns {string} Translated and interpolated string.
 */
export function t(key, locale, vars = {}) {
  const lang = getLocale(locale);
  const parts = key.split(".");
  let value = getNestedValue(TRANSLATIONS[lang], parts);

  if (value === undefined && lang !== DEFAULT_LOCALE) {
    value = getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts);
  }

  if (typeof value !== "string") return key;

  return value.replaceAll(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

/**
 * Returns the raw translation value at a dot-separated key (any type).
 * Falls back to en-US when the key is missing in the requested locale.
 *
 * @param {string} key Dot-separated translation key.
 * @param {string} locale Locale string.
 * @returns {*} Raw translation value, or undefined.
 */
export function tRaw(key, locale) {
  const lang = getLocale(locale);
  const parts = key.split(".");
  let value = getNestedValue(TRANSLATIONS[lang], parts);
  if (value === undefined && lang !== DEFAULT_LOCALE) {
    value = getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts);
  }
  return value;
}

/**
 * Returns locale-specific condition verb data, or null if not available.
 *
 * @param {string} condition Canonical condition name.
 * @param {string} locale Locale string.
 * @returns {{past: string, verb: string, suffix?: string, noBy?: boolean}|null}
 */
export function getConditionLocalData(condition, locale) {
  const lang = getLocale(locale);
  const data = TRANSLATIONS[lang]?.conditions?.[condition];
  return data || null;
}
