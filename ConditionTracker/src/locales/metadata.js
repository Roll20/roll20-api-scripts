export const DEFAULT_LOCALE = "en-US";

export const LOCALE_DEFINITIONS = Object.freeze([
  {
    code: "af",
    name: "Afrikaans",
    direction: "ltr",
    translationFile: "locale/af.js",
    flag: "🇿🇦",
    flagLabel: "Flag of South Africa",
  },
  {
    code: "ca",
    name: "Catalan",
    nativeName: "Català",
    direction: "ltr",
    translationFile: "locale/ca.js",
    flag: "🇪🇸",
    flagLabel: "Flag of Spain",
  },
  {
    code: "zh-TW",
    name: "Chinese (Traditional)",
    nativeName: "正體中文",
    direction: "ltr",
    translationFile: "locale/zh-TW.js",
    aliases: ["zh"],
    flag: "🇹🇼",
    flagLabel: "Flag of Taiwan",
  },
  {
    code: "cs",
    name: "Czech",
    nativeName: "Čeština",
    direction: "ltr",
    translationFile: "locale/cs.js",
    flag: "🇨🇿",
    flagLabel: "Flag of Czechia",
  },
  {
    code: "da",
    name: "Danish",
    nativeName: "Dansk",
    direction: "ltr",
    translationFile: "locale/da.js",
    flag: "🇩🇰",
    flagLabel: "Flag of Denmark",
  },
  {
    code: "nl",
    name: "Dutch",
    nativeName: "Nederlands",
    direction: "ltr",
    translationFile: "locale/nl.js",
    flag: "🇳🇱",
    flagLabel: "Flag of the Netherlands",
  },
  {
    code: "en-US",
    name: "English",
    nativeName: "English",
    direction: "ltr",
    translationFile: "locale/en-US.js",
    aliases: ["en"],
    flag: "🇺🇸",
    flagLabel: "Flag of the United States",
  },
  {
    code: "fi",
    name: "Finnish",
    nativeName: "Suomeksi",
    direction: "ltr",
    translationFile: "locale/fi.js",
    flag: "🇫🇮",
    flagLabel: "Flag of Finland",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    translationFile: "locale/fr.js",
    flag: "🇫🇷",
    flagLabel: "Flag of France",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    direction: "ltr",
    translationFile: "locale/de.js",
    flag: "🇩🇪",
    flagLabel: "Flag of Germany",
  },
  {
    code: "el",
    name: "Greek",
    nativeName: "Ελληνικά",
    direction: "ltr",
    translationFile: "locale/el.js",
    flag: "🇬🇷",
    flagLabel: "Flag of Greece",
  },
  {
    code: "he",
    name: "Hebrew",
    nativeName: "עברית",
    direction: "rtl",
    translationFile: "locale/he.js",
    flag: "🇮🇱",
    flagLabel: "Flag of Israel",
  },
  {
    code: "hu",
    name: "Hungarian",
    nativeName: "Magyar",
    direction: "ltr",
    translationFile: "locale/hu.js",
    flag: "🇭🇺",
    flagLabel: "Flag of Hungary",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    direction: "ltr",
    translationFile: "locale/it.js",
    flag: "🇮🇹",
    flagLabel: "Flag of Italy",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    direction: "ltr",
    translationFile: "locale/ja.js",
    flag: "🇯🇵",
    flagLabel: "Flag of Japan",
  },
  {
    code: "ko",
    name: "Korean",
    nativeName: "한국어",
    direction: "ltr",
    translationFile: "locale/ko.js",
    flag: "🇰🇷",
    flagLabel: "Flag of South Korea",
  },
  {
    code: "pl",
    name: "Polish",
    nativeName: "Polski",
    direction: "ltr",
    translationFile: "locale/pl.js",
    flag: "🇵🇱",
    flagLabel: "Flag of Poland",
  },
  {
    code: "pt-PT",
    name: "Portuguese (Portugal)",
    nativeName: "Português - Portugal",
    direction: "ltr",
    translationFile: "locale/pt-PT.js",
    aliases: ["pt"],
    flag: "🇵🇹",
    flagLabel: "Flag of Portugal",
  },
  {
    code: "pt-BR",
    name: "Portuguese (Brazil)",
    nativeName: "Português - Brasil",
    direction: "ltr",
    translationFile: "locale/pt-BR.js",
    flag: "🇧🇷",
    flagLabel: "Flag of Brazil",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    direction: "ltr",
    translationFile: "locale/ru.js",
    flag: "🇷🇺",
    flagLabel: "Flag of Russia",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    translationFile: "locale/es.js",
    flag: "🇪🇸",
    flagLabel: "Flag of Spain",
  },
  {
    code: "sv",
    name: "Swedish",
    nativeName: "Svenska",
    direction: "ltr",
    translationFile: "locale/sv.js",
    flag: "🇸🇪",
    flagLabel: "Flag of Sweden",
  },
  {
    code: "tr",
    name: "Turkish",
    nativeName: "Türkçe",
    direction: "ltr",
    translationFile: "locale/tr.js",
    flag: "🇹🇷",
    flagLabel: "Flag of Turkey",
  },
  {
    code: "uk",
    name: "Ukrainian",
    nativeName: "український",
    direction: "ltr",
    translationFile: "locale/uk.js",
    flag: "🇺🇦",
    flagLabel: "Flag of Ukraine",
  },
]);

export const SUPPORTED_LOCALES = Object.freeze(
  LOCALE_DEFINITIONS.map(({ code }) => code),
);
export const VALID_LOCALES = new Set(SUPPORTED_LOCALES);
export const LOCALE_ALIASES = Object.freeze(
  LOCALE_DEFINITIONS.reduce((aliases, locale) => {
    for (const alias of locale.aliases || []) {
      aliases[alias] = locale.code;
    }
    return aliases;
  }, {}),
);
export const LOCALE_LABELS = Object.freeze(
  LOCALE_DEFINITIONS.reduce((labels, locale) => {
    const displayName = locale.nativeName
      ? `${locale.code} - ${locale.name} (${locale.nativeName})`
      : `${locale.code} - ${locale.name}`;
    labels[locale.code] = displayName;
    return labels;
  }, {}),
);
export const SUPPORTED_LOCALE_LIST = SUPPORTED_LOCALES.map(
  (code) => LOCALE_LABELS[code],
).join(" / ");
