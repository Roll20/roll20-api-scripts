import localeAf from "./locale/af.js";
import localeCa from "./locale/ca.js";
import localeZhTW from "./locale/zh-TW.js";
import localeCs from "./locale/cs.js";
import localeDa from "./locale/da.js";
import localeNl from "./locale/nl.js";
import localeEnUS from "./locale/en-US.js";
import localeFi from "./locale/fi.js";
import localeFr from "./locale/fr.js";
import localeDe from "./locale/de.js";
import localeEl from "./locale/el.js";
import localeHe from "./locale/he.js";
import localeHu from "./locale/hu.js";
import localeIt from "./locale/it.js";
import localeJa from "./locale/ja.js";
import localeKo from "./locale/ko.js";
import localePl from "./locale/pl.js";
import localePtPT from "./locale/pt-PT.js";
import localePtBR from "./locale/pt-BR.js";
import localeRu from "./locale/ru.js";
import localeEs from "./locale/es.js";
import localeSv from "./locale/sv.js";
import localeTr from "./locale/tr.js";
import localeUk from "./locale/uk.js";

export {
  DEFAULT_LOCALE,
  LOCALE_ALIASES,
  LOCALE_DEFINITIONS,
  LOCALE_LABELS,
  SUPPORTED_LOCALE_LIST,
  SUPPORTED_LOCALES,
  VALID_LOCALES,
} from "./metadata.js";

export const TRANSLATIONS = {
  af: localeAf,
  ca: localeCa,
  "zh-TW": localeZhTW,
  cs: localeCs,
  da: localeDa,
  nl: localeNl,
  "en-US": localeEnUS,
  fi: localeFi,
  fr: localeFr,
  de: localeDe,
  el: localeEl,
  he: localeHe,
  hu: localeHu,
  it: localeIt,
  ja: localeJa,
  ko: localeKo,
  pl: localePl,
  "pt-PT": localePtPT,
  "pt-BR": localePtBR,
  ru: localeRu,
  es: localeEs,
  sv: localeSv,
  tr: localeTr,
  uk: localeUk,
};
