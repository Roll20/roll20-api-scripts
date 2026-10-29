export const DEFAULT_LOCALE = 'en-US';

// Add a locale here, create src/locales/locale/<code>.js (copy en-US.js) and
// import it in index.js, then run `npm run sync-locales` to translate it.
export const LOCALE_DEFINITIONS = Object.freeze([
  {
    code: 'en-US',
    name: 'English (US)',
    direction: 'ltr',
    translationFile: 'locale/en-US.js',
    aliases: ['en'],
    flag: '🇺🇸',
    flagLabel: 'Flag of the United States',
  },
]);

export const SUPPORTED_LOCALES = Object.freeze(LOCALE_DEFINITIONS.map(({ code }) => code));
export const VALID_LOCALES = new Set(SUPPORTED_LOCALES);
export const LOCALE_ALIASES = Object.freeze(
  LOCALE_DEFINITIONS.reduce((aliases, locale) => {
    for (const alias of locale.aliases || []) {
      aliases[alias] = locale.code;
    }
    return aliases;
  }, {})
);
export const LOCALE_LABELS = Object.freeze(
  LOCALE_DEFINITIONS.reduce((labels, locale) => {
    const displayName = locale.nativeName
      ? `${locale.code} - ${locale.name} (${locale.nativeName})`
      : `${locale.code} - ${locale.name}`;
    labels[locale.code] = displayName;
    return labels;
  }, {})
);
export const SUPPORTED_LOCALE_LIST = SUPPORTED_LOCALES.map((code) => LOCALE_LABELS[code]).join(
  ' / '
);
