/**
 * NOTE: GENERATED FILE - DO NOT EDIT DIRECTLY.
 * NOTE: Source files live under src/ and are bundled with `npm run build`.
 * ------------------------------------------------
 * Name: Condition Tracker
 * Script: ConditionTracker.js
 * Version: 1.0.0
 * Built: 2026-04-30T12:20:54.036Z
 */
const ConditionTrackerMod = (() => {
  'use strict';

  const DEFAULT_LOCALE = 'en-US';

  const LOCALE_DEFINITIONS = Object.freeze([
    {
      code: 'af',
      name: 'Afrikaans',
      direction: 'ltr',
      translationFile: 'locale/af.js',
      flag: '🇿🇦',
      flagLabel: 'Flag of South Africa',
    },
    {
      code: 'ca',
      name: 'Catalan',
      nativeName: 'Català',
      direction: 'ltr',
      translationFile: 'locale/ca.js',
      flag: '🇪🇸',
      flagLabel: 'Flag of Spain',
    },
    {
      code: 'zh-TW',
      name: 'Chinese (Traditional)',
      nativeName: '正體中文',
      direction: 'ltr',
      translationFile: 'locale/zh-TW.js',
      aliases: ['zh'],
      flag: '🇹🇼',
      flagLabel: 'Flag of Taiwan',
    },
    {
      code: 'cs',
      name: 'Czech',
      nativeName: 'Čeština',
      direction: 'ltr',
      translationFile: 'locale/cs.js',
      flag: '🇨🇿',
      flagLabel: 'Flag of Czechia',
    },
    {
      code: 'da',
      name: 'Danish',
      nativeName: 'Dansk',
      direction: 'ltr',
      translationFile: 'locale/da.js',
      flag: '🇩🇰',
      flagLabel: 'Flag of Denmark',
    },
    {
      code: 'nl',
      name: 'Dutch',
      nativeName: 'Nederlands',
      direction: 'ltr',
      translationFile: 'locale/nl.js',
      flag: '🇳🇱',
      flagLabel: 'Flag of the Netherlands',
    },
    {
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      direction: 'ltr',
      translationFile: 'locale/en-US.js',
      aliases: ['en'],
      flag: '🇺🇸',
      flagLabel: 'Flag of the United States',
    },
    {
      code: 'fi',
      name: 'Finnish',
      nativeName: 'Suomeksi',
      direction: 'ltr',
      translationFile: 'locale/fi.js',
      flag: '🇫🇮',
      flagLabel: 'Flag of Finland',
    },
    {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
      direction: 'ltr',
      translationFile: 'locale/fr.js',
      flag: '🇫🇷',
      flagLabel: 'Flag of France',
    },
    {
      code: 'de',
      name: 'German',
      nativeName: 'Deutsch',
      direction: 'ltr',
      translationFile: 'locale/de.js',
      flag: '🇩🇪',
      flagLabel: 'Flag of Germany',
    },
    {
      code: 'el',
      name: 'Greek',
      nativeName: 'Ελληνικά',
      direction: 'ltr',
      translationFile: 'locale/el.js',
      flag: '🇬🇷',
      flagLabel: 'Flag of Greece',
    },
    {
      code: 'he',
      name: 'Hebrew',
      nativeName: 'עברית',
      direction: 'rtl',
      translationFile: 'locale/he.js',
      flag: '🇮🇱',
      flagLabel: 'Flag of Israel',
    },
    {
      code: 'hu',
      name: 'Hungarian',
      nativeName: 'Magyar',
      direction: 'ltr',
      translationFile: 'locale/hu.js',
      flag: '🇭🇺',
      flagLabel: 'Flag of Hungary',
    },
    {
      code: 'it',
      name: 'Italian',
      nativeName: 'Italiano',
      direction: 'ltr',
      translationFile: 'locale/it.js',
      flag: '🇮🇹',
      flagLabel: 'Flag of Italy',
    },
    {
      code: 'ja',
      name: 'Japanese',
      nativeName: '日本語',
      direction: 'ltr',
      translationFile: 'locale/ja.js',
      flag: '🇯🇵',
      flagLabel: 'Flag of Japan',
    },
    {
      code: 'ko',
      name: 'Korean',
      nativeName: '한국어',
      direction: 'ltr',
      translationFile: 'locale/ko.js',
      flag: '🇰🇷',
      flagLabel: 'Flag of South Korea',
    },
    {
      code: 'pl',
      name: 'Polish',
      nativeName: 'Polski',
      direction: 'ltr',
      translationFile: 'locale/pl.js',
      flag: '🇵🇱',
      flagLabel: 'Flag of Poland',
    },
    {
      code: 'pt-PT',
      name: 'Portuguese (Portugal)',
      nativeName: 'Português - Portugal',
      direction: 'ltr',
      translationFile: 'locale/pt-PT.js',
      aliases: ['pt'],
      flag: '🇵🇹',
      flagLabel: 'Flag of Portugal',
    },
    {
      code: 'pt-BR',
      name: 'Portuguese (Brazil)',
      nativeName: 'Português - Brasil',
      direction: 'ltr',
      translationFile: 'locale/pt-BR.js',
      flag: '🇧🇷',
      flagLabel: 'Flag of Brazil',
    },
    {
      code: 'ru',
      name: 'Russian',
      nativeName: 'Русский',
      direction: 'ltr',
      translationFile: 'locale/ru.js',
      flag: '🇷🇺',
      flagLabel: 'Flag of Russia',
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      direction: 'ltr',
      translationFile: 'locale/es.js',
      flag: '🇪🇸',
      flagLabel: 'Flag of Spain',
    },
    {
      code: 'sv',
      name: 'Swedish',
      nativeName: 'Svenska',
      direction: 'ltr',
      translationFile: 'locale/sv.js',
      flag: '🇸🇪',
      flagLabel: 'Flag of Sweden',
    },
    {
      code: 'tr',
      name: 'Turkish',
      nativeName: 'Türkçe',
      direction: 'ltr',
      translationFile: 'locale/tr.js',
      flag: '🇹🇷',
      flagLabel: 'Flag of Turkey',
    },
    {
      code: 'uk',
      name: 'Ukrainian',
      nativeName: 'український',
      direction: 'ltr',
      translationFile: 'locale/uk.js',
      flag: '🇺🇦',
      flagLabel: 'Flag of Ukraine',
    },
  ]);

  const SUPPORTED_LOCALES = Object.freeze(
    LOCALE_DEFINITIONS.map(({ code }) => code),
  );
  const VALID_LOCALES = new Set(SUPPORTED_LOCALES);
  const LOCALE_ALIASES = Object.freeze(
    LOCALE_DEFINITIONS.reduce((aliases, locale) => {
      for (const alias of locale.aliases || []) {
        aliases[alias] = locale.code;
      }
      return aliases;
    }, {}),
  );
  const LOCALE_LABELS = Object.freeze(
    LOCALE_DEFINITIONS.reduce((labels, locale) => {
      const displayName = locale.nativeName
        ? `${locale.code} - ${locale.name} (${locale.nativeName})`
        : `${locale.code} - ${locale.name}`;
      labels[locale.code] = displayName;
      return labels;
    }, {}),
  );
  const SUPPORTED_LOCALE_LIST = SUPPORTED_LOCALES.map(
    (code) => LOCALE_LABELS[code],
  ).join(' / ');

  const SCRIPT_NAME = 'Condition Tracker';
  const SCRIPT_VERSION = '1.0.0';
  const SCRIPT_LAST_UPDATED = '2026-04-30T12:20:54.036Z';

  const COLOR_BG_SOFT_BLACK = '#0A0A12';
  const COLOR_TEXT_ARCANE_SILVER = '#E6DFFF';
  const COLOR_TEXT_DIM_SILVER = '#B8AFCF';
  const COLOR_ACCENT_LIGHT = '#FF4D6D';
  const COLOR_ACCENT_DARK = '#5B21B6';
  const COLOR_HEADER_LIGHT = '#E9D5FF';
  const COLOR_HEADER_DARK = '#1E40AF';
  const COLOR_TEXT_WHITE = '#FFFFFF';

  const STATE_KEY = SCRIPT_NAME.replaceAll(/\s+/g, '');
  const HANDOUT_NAME = `${SCRIPT_NAME} — Help & Reference`;
  const MACRO_NAME = `${STATE_KEY}Wizard`;
  const MACRO_NAME_MULTI_TARGET = `${STATE_KEY}MultiTarget`;
  const COMMAND = '!condition-tracker';
  const COMMAND_PROMPT = `${COMMAND} --prompt`;
  const COMMAND_MULTI_TARGET = `${COMMAND} --multi-target`;
  const TURN_ORDER_PREFIX = `${STATE_KEY}:`;
  const TOKEN_MARKER_SEPARATOR = ',';
  const EMPTY_TURN_ORDER = '[]';
  const VALID_HEALTH_BARS = ['bar1_value', 'bar2_value', 'bar3_value'];
  const BOOLEAN_TEXT = new Set(['true', 'false']);
  const DURATION_UNTIL_REMOVED = 'untilRemoved';
  const DURATION_TURN_END = 'turnEnd';
  const DURATION_ROUNDS = 'rounds';
  const MENU_REMOVE = 'remove';
  const CONDITION_OTHER = 'Other';
  const CONDITION_SPELL = 'Spell';
  const CONDITION_ABILITY = 'Ability';
  const CONDITION_ADVANTAGE = 'Advantage';
  const CONDITION_DISADVANTAGE = 'Disadvantage';
  const DEFAULT_MACRO_BODY = `${COMMAND_PROMPT}`;
  const DEFAULT_MULTI_TARGET_MACRO_BODY = `${COMMAND_MULTI_TARGET}`;

  const DEFAULT_MARKERS = Object.freeze({
    Grappled: 'grab',
    Restrained: 'padlock',
    Prone: 'back-pain',
    Poisoned: 'chemical-bolt',
    Stunned: 'pummeled',
    Blinded: 'bleeding-eye',
    Charmed: 'chained-heart',
    Frightened: 'screaming',
    Incapacitated: 'interdiction',
    Invisible: 'ninja-mask',
    Paralyzed: 'frozen-orb',
    Petrified: 'fossil',
    Unconscious: 'sleepy',
    Spell: 'lightning-helix',
    Ability: 'fist',
    Advantage: 'three-leaves',
    Disadvantage: 'broken-heart',
  });

  const CONDITION_DATA = Object.freeze({
    Grappled: { past: 'grappled', verb: 'grapples', icon: '[G]', emoji: '🤛' },
    Restrained: {
      past: 'restrained',
      verb: 'restrains',
      icon: '[R]',
      emoji: '🔒',
    },
    Prone: {
      past: 'knocked prone',
      verb: 'knocks',
      suffix: 'prone',
      icon: '[P]',
      emoji: '🛌',
    },
    Poisoned: { past: 'poisoned', verb: 'poisons', icon: '[Psn]', emoji: '☠️' },
    Stunned: { past: 'stunned', verb: 'stuns', icon: '[Stn]', emoji: '😵' },
    Blinded: { past: 'blinded', verb: 'blinds', icon: '[B]', emoji: '🙈' },
    Charmed: { past: 'charmed', verb: 'charms', icon: '[C]', emoji: '😍' },
    Frightened: {
      past: 'frightened',
      verb: 'frightens',
      icon: '[F]',
      emoji: '😱',
    },
    Incapacitated: {
      past: 'incapacitated',
      verb: 'incapacitates',
      icon: '[I]',
      emoji: '🚫',
    },
    Invisible: {
      past: 'invisible',
      verb: 'makes',
      suffix: 'invisible',
      icon: '[Inv]',
      emoji: '🥷',
    },
    Paralyzed: {
      past: 'paralyzed',
      verb: 'paralyzes',
      icon: '[Pz]',
      emoji: '❄️',
    },
    Petrified: {
      past: 'petrified',
      verb: 'petrifies',
      icon: '[Pet]',
      emoji: '🪨',
    },
    Unconscious: {
      past: 'unconscious',
      verb: 'knocks',
      suffix: 'unconscious',
      icon: '[U]',
      emoji: '💤',
    },
    Spell: {
      past: 'affected by a spell',
      verb: 'casts a spell on',
      icon: '[Spl]',
      emoji: '🔮',
    },
    Ability: {
      past: 'affected by an ability',
      verb: 'uses an ability on',
      icon: '[Abl]',
      emoji: '🎯',
    },
    Advantage: {
      past: 'has advantage',
      verb: 'grants advantage to',
      icon: '[Adv]',
      emoji: '🍀',
      noBy: true,
    },
    Disadvantage: {
      past: 'has disadvantage',
      verb: 'imposes disadvantage on',
      icon: '[Dis]',
      emoji: '⬇️',
      noBy: true,
    },
  });

  const STANDARD_CONDITIONS = Object.freeze(
    [
      'Grappled',
      'Restrained',
      'Prone',
      'Poisoned',
      'Stunned',
      'Blinded',
      'Charmed',
      'Frightened',
      'Incapacitated',
      'Invisible',
      'Paralyzed',
      'Petrified',
      'Unconscious',
    ].sort((a, b) => a.localeCompare(b)),
  );
  const CUSTOM_EFFECT_TYPES = Object.freeze([
    CONDITION_SPELL,
    CONDITION_ABILITY,
    CONDITION_ADVANTAGE,
    CONDITION_DISADVANTAGE,
    CONDITION_OTHER,
  ]);
  const CUSTOM_EFFECT_TYPE_SET = Object.freeze(new Set(CUSTOM_EFFECT_TYPES));
  const CUSTOM_TEXT_CONDITIONS = Object.freeze(
    new Set([CONDITION_SPELL, CONDITION_ABILITY, CONDITION_OTHER]),
  );
  Object.freeze([...STANDARD_CONDITIONS, ...CUSTOM_EFFECT_TYPES]);

  const DURATION_OPTIONS = Object.freeze([
    'Until removed',
    'End of target next turn',
    'End of source next turn',
    '1 round',
    '2 rounds',
    '3 rounds',
    '10 rounds',
  ]);

  const LOGO_URL_256 =
    'https://files.d20.io/images/485066521/0h0oZF8g-5RuLMztE7mTSw/original.png';
  const LOGO_URL_512 =
    'https://files.d20.io/images/485066393/v9LJk9VFfPohrzbTJ3b51Q/original.png';

  const TRANSLATION$n = {
    conditions: {
      Grappled: {
        past: 'vasgegryp',
        verb: 'gryp',
      },
      Restrained: {
        past: 'beperk',
        verb: 'beperk',
      },
      Prone: {
        past: 'platgeslaan',
        verb: 'slaan',
        suffix: 'plat',
      },
      Poisoned: {
        past: 'vergiftig',
        verb: 'vergiftig',
      },
      Stunned: {
        past: 'verdoof',
        verb: 'verdoof',
      },
      Blinded: {
        past: 'verblind',
        verb: 'verblind',
      },
      Charmed: {
        past: 'bekoor',
        verb: 'bekoor',
      },
      Frightened: {
        past: 'banggemaak',
        verb: 'maak',
        suffix: 'bang',
      },
      Incapacitated: {
        past: 'onbekwaam',
        verb: 'maak',
        suffix: 'onbekwaam',
      },
      Invisible: {
        past: 'onsigbaar',
        verb: 'maak',
        suffix: 'onsigbaar',
      },
      Paralyzed: {
        past: 'verlam',
        verb: 'verlam',
      },
      Petrified: {
        past: 'versteen',
        verb: 'versteen',
      },
      Unconscious: {
        past: 'bewusteloos',
        verb: 'maak',
        suffix: 'bewusteloos',
      },
      Spell: {
        past: "deur 'n towerspreuk geraak",
        verb: "spreek 'n towerspreuk uit op",
      },
      Ability: {
        past: "deur 'n vermoë geraak",
        verb: "gebruik 'n vermoë op",
      },
      Advantage: {
        past: 'het voordeel',
        verb: 'gee voordeel aan',
        noBy: true,
      },
      Disadvantage: {
        past: 'het nadeel',
        verb: 'gee nadeel aan',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Vasgegryp',
      Restrained: 'Beperk',
      Prone: 'Neergewerp',
      Poisoned: 'Vergiftig',
      Stunned: 'Verdoof',
      Blinded: 'Verblind',
      Charmed: 'Bekoor',
      Frightened: 'Bang',
      Incapacitated: 'Onbekwaam',
      Invisible: 'Onsigbaar',
      Paralyzed: 'Verlam',
      Petrified: 'Versteen',
      Unconscious: 'Bewusteloos',
      Spell: 'Towerspreuk',
      Ability: 'Vermoë',
      Advantage: 'Voordeel',
      Disadvantage: 'Nadeel',
      Other: 'Ander',
    },
    templates: {
      display: {
        custom: '{emoji} {target} geraak deur {effect} ({source})',
        advantage: '{emoji} {source} het voordeel teen {target}{subject}',
        disadvantage: '{emoji} {source} het nadeel teen {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} is {past}',
        standard: '{emoji} {target} {past} deur {source}',
      },
      apply: {
        custom: '{source} pas {effect} toe op {target}.',
        advantage: '{source} het voordeel teen {target}{subject}.',
        disadvantage: '{source} het nadeel teen {target}{subject}.',
        self: '{target} is {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} word nie meer deur {effect} geraak nie.',
        advantage: '{source} het nie meer voordeel teen {target}{subject} nie.',
        disadvantage:
          '{source} het nie meer nadeel teen {target}{subject} nie.',
        noBy: '{target} is nie meer {past} nie.',
        self: '{target} is nie meer {past} nie.',
        standard: '{target} word nie meer {past} deur {source} nie.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Kies Toestand',
        selectSource: 'Kies Bron-token',
        selectTarget: 'Kies Teikentoken',
        selectSubject: 'Kies Onderwerp',
        selectDuration: 'Kies Duur',
        confirmTargetTitle: 'Bevestig Teikenslys',
        applyEffectTitle: 'Pas {condition}-effek toe',
        noTokens: 'Geen benoemde tokens gevind op die aktiewe bladsy nie.',
        confirmIntro: 'Die volgende tokens sal die toestand ontvang:',
        confirmBtn: 'Bevestig teikenslys',
        enterDetails: 'Voer effekbesonderhede in',
        noneBtn: 'Geen',
        noneOrSourceBtn: 'Geen of pas op bron toe',
        subjectDesc: 'Kies wie of wat die effek toepas.',
        sourceDesc: 'Kies die wese wat die toestand of effek skep.',
        targetDesc: 'Kies die wese wat die toestand of effek ontvang.',
        otherText: 'Aangepaste toestandteks',
        effectDetails: '{condition}-besonderhede',
      },
      col: {
        players: 'Spelers',
        npcs: "NPS'e",
        conditions: 'Toestande',
        customEffects: 'Aangepaste Effekte',
        permanentTurnEnd: 'Permanent / Beurt Einde',
        rounds: 'Rondtes',
        command: 'Opdrag',
        result: 'Resultaat',
        field: 'Veld',
        value: 'Waarde',
        option: 'Opsie',
        condition: 'Toestand',
        marker: 'Merker',
        item: 'Item',
        removed: 'Verwyder',
        details: 'Besonderhede',
        description: 'Beskrywing',
        scenario: 'Scenario',
      },
      dur: {
        untilRemoved: 'Tot verwydering',
        endOfTargetTurn: 'Einde van teiken se volgende beurt',
        endOfSourceTurn: 'Einde van bron se volgende beurt',
        round1: '1 rondte',
        round2: '2 rondtes',
        round3: '3 rondtes',
        round10: '10 rondtes',
        custom: 'Aangepas',
        customPrompt: 'Aantal rondtes',
        untilRemovedDisplay: 'Tot verwydering',
        turnsRemaining: '{n} beurt-einde(s) wat gevolg word, oor',
      },
      btn: {
        openWizard: 'Maak Towenaar Oop',
        openMultiTarget: 'Maak Multiteiken-towenaar Oop',
        openRemovalList: 'Maak Verwyderlys Oop',
        showConfig: 'Wys Konfigurasie',
        runCleanup: 'Voer Opruiming Uit',
        reinstallMacro: 'Herinstalleer Makro',
        reinstallHandout: 'Herinstalleer Handout',
        showHelp: 'Wys Hulp',
        reorderConditions: 'Herrangskik Toestandrye',
      },
      title: {
        menu: 'Kieslys',
        removalMenu: 'Condition Tracker — Verwydering',
        config: 'Konfigurasie',
        configTracker: 'Condition Tracker — Konfigurasie',
        help: 'Hulp',
        applied: 'Toegepas',
        removed: 'Toestand Verwyder',
        cleanup: 'Opruiming Voltooi',
        macroReinstalled: 'Makro Herinstalleer',
        handoutReinstalled: 'Handout Herinstalleer',
        warning: 'Waarskuwing',
        error: 'Fout',
        turnOrder: 'Beurtorde',
        noConditions: 'Geen Toestande',
        tokenMoved: 'Token Verskuif',
        markedDead: 'As Dood Gemerk',
        zeroHp: '{name} — 0 LP',
        moveToken: '{name} — Verskuif Token?',
        scriptReady: 'Skrip Gereed',
        conditionReorder: 'Beurtorde Verander',
      },
      heading: {
        quickActions: 'Vinnige Aksies',
        settings: 'Instellings',
        markerMappings: 'Merkertoewysings',
        result: 'Resultaat',
        info: 'Inligting',
        commandOptions: 'Opdragopsies',
        promptUi: 'Towenaar-koppelvlak',
        examples: 'Voorbeelde',
        summary: 'Opsomming',
      },
      msg: {
        noActive: 'Geen aktiewe toestande word gevolg nie.',
        configReset: 'Konfigurasie terugstel na verstekwaardes.',
        unknownConfig:
          'Onbekende konfigurasieopsie. Gebruik --config om ondersteunde instellings te sien.',
        macroReinstalled:
          'Die {wizard}- en {multiTarget}-makros is herinstalleer vir alle huidige GM-spelers.',
        handoutReinstalled: 'Die hulp-handout {handout} is herinstalleer.',
        duplicate:
          'Hierdie presiese kombinasie van bron, onderwerp, teiken, toestand en aangepaste teks is reeds aktief.',
        noTargets:
          'Geen teikentoken gespesifiseer vir multiteiken-toepassing nie.',
        noSelection:
          'Kies ten minste een token op die bord voordat jy --multi-target gebruik.',
        invalidIds: "Geen geldige token-ID's gevind in die huidige keuse nie.",
        reSelectTokens:
          'Nie een van die oorspronklik gekose tokens kon gevind word nie. Kies tokens weer en probeer opnuut.',
        conditionNotFound: 'Toestand-ID nie gevind nie.',
        gmOnly: 'Condition Tracker-opdragte is slegs vir die GM.',
        commandFailed:
          'Die opdrag kon nie veilig voltooi word nie. Kyk die API-konsole vir besonderhede.',
        sourceTokenNotFound: 'Bron-token kon nie gevind word nie.',
        targetTokenNotFound: 'Teikentoken kon nie gevind word nie.',
        subjectTokenNotFound: 'Onderwerp-token kon nie gevind word nie.',
        invalidCondition:
          'Toestand moet een van die vooraf bepaalde toestande of Ander wees.',
        subjectOnlyCustom:
          '--subject is slegs geldig vir Towerspreuk, Vermoë, Voordeel, Nadeel en Ander.',
        subjectBypassInvalid:
          "--subjectPromptBypass verwag true of false wanneer 'n waarde verskaf word.",
        customDetailsRequired:
          '{condition}-besonderhede is vereis. Gebruik --other om dit te verskaf.',
        markerConfigFormat:
          'Merker-konfigurasieformaat is: --config marker Grappled=grab',
        markerPredefinedRequired:
          "Merkerkonfigurasie vereis 'n vooraf bepaalde toestandnaam.",
        markerNameRequired: "Merkerkonfigurasie vereis 'n nie-leë merkernaam.",
        markerSet: '{condition}-merker gestel op {marker}.',
        healthBarSet: 'Gesondheidsstaaf gestel op {bar}.',
        boolSet: '{key} gestel op {value}.',
        expectedBoolean: 'true of false verwag.',
        invalidHealthBar:
          'Gesondheidsstaaf moet bar1_value, bar2_value of bar3_value wees.',
        markersDisabled: 'Merkers is gedeaktiveer.',
        noMarkerConfigured: 'Geen merker is opgestel vir hierdie toestand nie.',
        markerApplied: 'Merker toegepas: {marker}',
        markerPresent: 'Merker reeds teenwoordig: {marker}',
        langSet: 'Taal gestel op {locale}.',
        invalidLocale: 'Ongeldige lokaal. Ondersteunde lokale: {locales}.',
        otherDurationRequiresRounds:
          "Ander-duur vereis 'n numeriese rondte-telling, byvoorbeeld --duration 5 rounds.",
        invalidDuration:
          "Duur moet Tot verwydering, 'n beurt-einde-opsie of 'n positiewe rondte-telling wees.",
        zeroHpNoConditions:
          '{name} het 0 LP bereik en het geen aktiewe toestande nie.',
        zeroHpConditions:
          '{name} het 0 LP bereik. Kies toestande om te verwyder:',
        removeAllBtn: 'Verwyder Alle Toestande vir {name}',
        markIncapacitated: 'Merk as Onbekwaam',
        removeFromTurnOrder: 'Verwyder uit Beurtorde',
        alreadyIncapacitated: '{name} is reeds Onbekwaam.',
        tokenRemovedFromTurn: '{name} is uit die beurtorde verwyder.',
        tokenNotInTurn: '{name} is nie in die beurtorde gevind nie.',
        moveTokenPrompt:
          'Verskuif {name} na die kaartlaag sodat dit sigbaar bly maar ander tokens nie steur nie?',
        moveTokenBtn: 'Verskuif {name} na Kaartlaag',
        tokenMoved: '{name} is na die kaartlaag verskuif.',
        tokenNotFound: 'Token nie gevind nie.',
        noActiveConditions:
          '{name} het geen aktiewe toestande om te verwyder nie.',
        deadNoConditions:
          '{name} is as dood gemerk. Geen toestande was aktief nie.',
        scriptReady: '{name} is aktief en jy gebruik weergawe {version}.',
        reachedZeroHp: '{name} het 0 LP bereik',
        manuallyRemoved: 'dit is handmatig verwyder',
        durationExpired: 'die duur het verstryk',
        markedAsDead: '{name} is as dood gemerk',
        conditionReorder:
          'Die beurtorde het verander en {count} gevolge toestandry(e) mag nou buite plek wees. Klik hieronder om hulle ná hul toegewysde tokens te herstel.',
        conditionsReordered:
          'Toestandrye is herposisioneer ná hul toegewysde tokens.',
      },
      removal: {
        conditionField: 'Toestand',
        reasonField: 'Rede',
        turnRowField: 'Beurtorde-ry',
        markerField: 'Merker',
        notConfigured: 'Nie opgestel nie',
        markerRemoved: 'Verwyder ({marker})',
        markerRetained: 'Behou ({marker})',
        rowRemoved: 'Verwyder',
        rowMissing: 'Reeds ontbreek',
        manualReason: 'Handmatige verwydering',
      },
      cleanup: {
        orphaned: 'Weesagtige toestandinskrywings',
        stale: 'Verouderde toestandinskrywings',
        orphanedRows: 'Weesagtige beurtorde-rye',
        unusedMarkers: 'Ongebruikte merkers',
      },
      apply: {
        turnAppended:
          'Teiken was nie in die beurtorde nie; toestandry is aangeheg.',
        turnInserted: 'Toestandry ingevoeg onder die teikentoken.',
      },
    },
    handout: {
      versionLabel: 'Weergawe',
      subtitle: 'D&D 5e Statuseffek-bestuurder',
      footerNote:
        'Hierdie handout word outomaties geskep en bygewerk elke keer as die skrip laai.',
      overview: {
        heading: 'Oorsig',
        body: "Condition Tracker bestuur D&D 5e-statustoestande en aangepaste effekte as geëtiketteerde rye in die Roll20 Beurtopvolger. Pas toestande toe op tokens, volg duurtes op inisiatieford en verwyder verstekde effekte outomaties wanneer 'n beurt eindig. Alle opdragte is slegs vir die GM en kan vanuit die klets of via die geïnstalleerde makros uitgevoer word.",
      },
      quickStart: {
        heading: 'Vinnige Begin',
        colCommand: 'Opdrag',
        colDesc: 'Beskrywing',
        rows: [
          [
            '!condition-tracker --prompt',
            'Stap-vir-stap towenaar — kies toestand, tokens en duur interaktief. Ook beskikbaar as die ConditionTrackerWizard-makro.',
          ],
          [
            '!condition-tracker --multi-target',
            'Pas een toestand gelyktydig op verskeie tokens toe. Ook beskikbaar as die ConditionTrackerMultiTarget-makro.',
          ],
          [
            '!condition-tracker --menu',
            'Maak die hoofbestuurskieslys oop met knoppies om toestande toe te pas, te hersien of te verwyder.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Opdragreferensie',
        colFlag: 'Vlag',
        colDesc: 'Beskrywing',
        rows: [
          ['--prompt', 'Interaktiewe stap-vir-stap towenaar-koppelvlak'],
          [
            '--multi-target',
            "Pas 'n toestand op verskeie teikentoken gelyktydig toe",
          ],
          [
            '--menu',
            'Wys hoofkieslys (voeg remove by vir verwyderingskieslys)',
          ],
          [
            '--source X --target Y --condition Z',
            "Pas 'n toestand direk toe sonder die towenaar",
          ],
          [
            '--duration &lt;waarde&gt;',
            "Duur vir 'n direkte toepassing (bv. 2 rounds)",
          ],
          [
            '--other &lt;teks&gt;',
            'Aangepaste teks vir Towerspreuk / Vermoë / Ander effektipes',
          ],
          [
            '--remove &lt;toestand-ID&gt;',
            "Verwyder 'n spesifieke toestand met sy unieke ID",
          ],
          [
            '--config &lt;opsie&gt; &lt;waarde&gt;',
            'Pas konfigurasie-instellings aan (sien Konfigurasie-afdeling hieronder)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Oorskryf subjectPromptBypass slegs vir hierdie opdrag (ondersteun ook --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Versoen toestand — verwyder weesagtige toestande en beurtorde-rye',
          ],
          [
            '--reorder-conditions',
            'Verskuif toestandrye handmatig agter hul aangewese tokens in die beurtorde',
          ],
          ['--reinstall-macro', 'Herskep of dateer GM-makros op'],
          [
            '--reinstall-handout',
            'Herskep of dateer die gelokaliseerde hulp-handout op',
          ],
          [
            '--lang &lt;lokaal&gt;',
            "Gee hierdie opdrag se boodskappe in 'n bykomende lokaal uit (tweetalige modus)",
          ],
          ['--help', "Wys 'n kort hulpkaart in die klets"],
        ],
      },
      standardConditions: {
        heading: 'Standaard Toestande (D&amp;D 5e)',
        colCondition: 'Toestand',
      },
      customEffects: {
        heading: 'Aangepaste Effektipes',
        colType: 'Tipe',
        colNotes: 'Notas',
        rows: [
          [
            '🔮 Towerspreuk',
            "Volg 'n benoemde towerspreukeffek — jy sal gevra word vir die spreukse naam",
          ],
          [
            '🎯 Vermoë',
            "Volg 'n benoemde klas- of rasvermoë — jy sal gevra word vir die naam",
          ],
          [
            '🍀 Voordeel',
            "Teken voordeel op van een token na 'n ander; gegroepeer met die bron in inisiatief",
          ],
          [
            '⬇️ Nadeel',
            'Teken opgelegde nadeel op; gegroepeer met die bron in inisiatief',
          ],
          [
            '📝 Ander',
            "Vryvorm aangepaste etiket — jy sal gevra word vir 'n beskrywing",
          ],
        ],
      },
      durationOptions: {
        heading: 'Duuropsies',
        intro:
          'Die oorblywende telling word in die pr-kolom van die Beurtopvolger gewys en verminder wanneer die ankerteken se beurt eindig.',
        colOption: 'Opsie',
        colBehaviour: 'Gedrag',
        rows: [
          [
            'Tot verwydering',
            'Permanent — moet handmatig verwyder word via die kieslys of --remove',
          ],
          [
            'Einde van teiken se volgende beurt',
            'Verval wanneer die teikentoken se volgende beurt in inisiatief eindig',
          ],
          [
            'Einde van bron se volgende beurt',
            'Verval wanneer die bron-token se volgende beurt in inisiatief eindig',
          ],
          [
            '1 / 2 / 3 / 10 rondtes',
            'Vaste aftelrekening; een vermindering per ankerteken-beurt-einde',
          ],
        ],
      },
      configuration: {
        heading: 'Konfigurasie',
        intro:
          'Gebruik !condition-tracker --config &lt;opsie&gt; &lt;waarde&gt; of die Konfigurasie-knoppie in die hoofkieslys.',
        colOption: 'Opsie',
        colValues: 'Waardes',
        colDesc: 'Beskrywing',
        rows: [
          [
            'useMarkers',
            'true / false',
            "Pas Roll20-statusmerkers op tokens toe wanneer 'n toestand bygevoeg word",
          ],
          [
            'useIcons',
            'true / false',
            'Wys kort ikonskodes (bv. [G]) in plaas van emoji in Beurtopvolger-rye',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Slaan die opsionele onderwerp-tokenstap oor vir Towerspreuk / Vermoë / Ander effekte',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Tokenstaaf om te monitor; wanneer dit op 0 daal, word die GM gevra om toestande op te ruim',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Uitvoertaal vir kletsberoepe en die hulp-handout',
          ],
          [
            'marker',
            '&lt;Toestand&gt;=&lt;merkernaam&gt;',
            "Oorskryf die statusmerker wat gebruik word vir 'n spesifieke toestand (bv. marker Grappled=grab)",
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Verstek Statusmerkers',
        colCondition: 'Toestand',
        colMarker: 'Merkernaam',
      },
      availableLocales: {
        heading: 'Beskikbare Vertalings',
        intro:
          "Gebruik die taal-konfigurasie-opsie om kletsberoepe en die hulp-handout op 'n ondersteunde lokaal in te stel. Kort aliasse word ook aanvaar vir en, zh en pt.",
        colLocale: 'Locale',
        colLanguage: 'Taal',
        colFile: 'Vertaallêer',
      },
    },
  };

  const TRANSLATION$m = {
    conditions: {
      Grappled: {
        past: 'agafat',
        verb: 'agafa',
      },
      Restrained: {
        past: 'retingut',
        verb: 'reté',
      },
      Prone: {
        past: 'tombat',
        verb: 'tomba',
      },
      Poisoned: {
        past: 'enverinat',
        verb: 'enverina',
      },
      Stunned: {
        past: 'atordit',
        verb: 'atordeix',
      },
      Blinded: {
        past: 'cec',
        verb: 'encega',
      },
      Charmed: {
        past: 'encisat',
        verb: 'encisa',
      },
      Frightened: {
        past: 'espantat',
        verb: 'espanta',
      },
      Incapacitated: {
        past: 'incapacitat',
        verb: 'incapacita',
      },
      Invisible: {
        past: 'invisible',
        verb: 'torna',
        suffix: 'invisible',
      },
      Paralyzed: {
        past: 'paralitzat',
        verb: 'paralitza',
      },
      Petrified: {
        past: 'petrificat',
        verb: 'petrifica',
      },
      Unconscious: {
        past: 'inconscient',
        verb: 'deixa',
        suffix: 'inconscient',
      },
      Spell: {
        past: 'afectat per un encanteri',
        verb: 'llança un encanteri sobre',
      },
      Ability: {
        past: 'afectat per una habilitat',
        verb: 'usa una habilitat sobre',
      },
      Advantage: {
        past: 'té avantatge',
        verb: 'atorga avantatge a',
        noBy: true,
      },
      Disadvantage: {
        past: 'té desavantatge',
        verb: 'imposa desavantatge a',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Agafat',
      Restrained: 'Restringit',
      Prone: 'Tombat',
      Poisoned: 'Enverinat',
      Stunned: 'Atordit',
      Blinded: 'Cec',
      Charmed: 'Encisat',
      Frightened: 'Espantat',
      Incapacitated: 'Incapacitat',
      Invisible: 'Invisible',
      Paralyzed: 'Paralitzat',
      Petrified: 'Petrificat',
      Unconscious: 'Inconscient',
      Spell: 'Encanteri',
      Ability: 'Habilitat',
      Advantage: 'Avantatge',
      Disadvantage: 'Desavantatge',
      Other: 'Altres',
    },
    templates: {
      display: {
        custom: '{emoji} {target} afectat per {effect} ({source})',
        advantage: '{emoji} {source} té avantatge contra {target}{subject}',
        disadvantage:
          '{emoji} {source} té desavantatge contra {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} està {past}',
        standard: '{emoji} {target} {past} per {source}',
      },
      apply: {
        custom: '{source} aplica {effect} a {target}.',
        advantage: '{source} té avantatge contra {target}{subject}.',
        disadvantage: '{source} té desavantatge contra {target}{subject}.',
        self: '{target} està {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} ja no està afectat per {effect}.',
        advantage: '{source} ja no té avantatge contra {target}{subject}.',
        disadvantage:
          '{source} ja no té desavantatge contra {target}{subject}.',
        noBy: '{target} ja no {past}.',
        self: '{target} ja no està {past}.',
        standard: '{target} ja no està {past} per {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Selecciona una condició',
        selectSource: 'Selecciona el testimoni origen',
        selectTarget: 'Selecciona el testimoni destinatari',
        selectSubject: 'Selecciona el subjecte',
        selectDuration: 'Selecciona la durada',
        confirmTargetTitle: 'Confirma la llista de destinataris',
        applyEffectTitle: "Aplica l'efecte {condition}",
        noTokens: "No s'han trobat testimonis amb nom a la pàgina activa.",
        confirmIntro: 'Els testimonis següents rebran la condició:',
        confirmBtn: 'Confirma la llista de destinataris',
        enterDetails: "Introdueix els detalls de l'efecte",
        noneBtn: 'Cap',
        noneOrSourceBtn: "Cap o aplica a l'origen",
        subjectDesc: "Selecciona qui o què aplica l'efecte.",
        sourceDesc:
          "Selecciona la criatura que crea o genera la condició o l'efecte.",
        targetDesc: "Selecciona la criatura que rebrà la condició o l'efecte.",
        otherText: 'Text de condició personalitzat',
        effectDetails: 'Detalls de {condition}',
      },
      col: {
        players: 'Jugadors',
        npcs: 'PNJ',
        conditions: 'Condicions',
        customEffects: 'Efectes personalitzats',
        permanentTurnEnd: 'Permanent / Fi de torn',
        rounds: 'Rondes',
        command: 'Ordre',
        result: 'Resultat',
        field: 'Camp',
        value: 'Valor',
        option: 'Opció',
        condition: 'Condició',
        marker: 'Marcador',
        item: 'Element',
        removed: 'Eliminat',
        details: 'Detalls',
        description: 'Descripció',
        scenario: 'Escenari',
      },
      dur: {
        untilRemoved: "Fins que s'elimini",
        endOfTargetTurn: 'Fi del proper torn del destinatari',
        endOfSourceTurn: "Fi del proper torn de l'origen",
        round1: '1 ronda',
        round2: '2 rondes',
        round3: '3 rondes',
        round10: '10 rondes',
        custom: 'Personalitzat',
        customPrompt: 'Nombre de rondes',
        untilRemovedDisplay: "Fins que s'elimini",
        turnsRemaining: '{n} fi(ns) de torn restant(s)',
      },
      btn: {
        openWizard: "Obre l'assistent",
        openMultiTarget: "Obre l'assistent multi-destinatari",
        openRemovalList: "Obre la llista d'eliminació",
        showConfig: 'Mostra la configuració',
        runCleanup: 'Executa la neteja',
        reinstallMacro: 'Reinstal·la la macro',
        reinstallHandout: 'Reinstal·la el fullet',
        showHelp: "Mostra l'ajuda",
        reorderConditions: 'Reordena les files de condicions',
      },
      title: {
        menu: 'Menú',
        removalMenu: 'Eliminació — Condition Tracker',
        config: 'Configuració',
        configTracker: 'Configuració — Condition Tracker',
        help: 'Ajuda',
        applied: 'Aplicat',
        removed: 'Condició eliminada',
        cleanup: 'Neteja completada',
        macroReinstalled: 'Macro reinstal·lada',
        handoutReinstalled: 'Fullet reinstal·lat',
        warning: 'Avís',
        error: 'Error',
        turnOrder: "Ordre d'iniciativa",
        noConditions: 'Sense condicions',
        tokenMoved: 'Testimoni mogut',
        markedDead: 'Marcat com a mort',
        zeroHp: '{name} — 0 PV',
        moveToken: '{name} — Mou el testimoni?',
        scriptReady: 'Script llest',
        conditionReorder: 'Ordre de torn modificat',
      },
      heading: {
        quickActions: 'Accions ràpides',
        settings: 'Paràmetres',
        markerMappings: 'Correspondències dels marcadors',
        result: 'Resultat',
        info: 'Informació',
        commandOptions: "Opcions d'ordre",
        promptUi: "Interfície de l'assistent",
        examples: 'Exemples',
        summary: 'Resum',
      },
      msg: {
        noActive: 'No hi ha cap condició activa en seguiment.',
        configReset: 'Configuració restablerta als valors predeterminats.',
        unknownConfig:
          'Opció de configuració desconeguda. Usa --config per veure els paràmetres disponibles.',
        macroReinstalled:
          "Les macros {wizard} i {multiTarget} s'han reinstal·lat per a tots els MJ actius.",
        handoutReinstalled: "El fullet d'ajuda {handout} s'ha reinstal·lat.",
        duplicate:
          "Aquesta combinació d'origen, subjecte, destinatari, condició i text personalitzat ja és activa.",
        noTargets:
          "No s'ha especificat cap testimoni destinatari per a l'aplicació multi-destinatari.",
        noSelection:
          "Selecciona almenys un testimoni al tauler abans d'usar --multi-target.",
        invalidIds:
          "No s'han trobat identificadors de testimoni vàlids a la selecció actual.",
        reSelectTokens:
          "No s'ha pogut trobar cap dels testimonis seleccionats originalment. Torna a seleccionar els testimonis i intenta-ho de nou.",
        conditionNotFound: "No s'ha trobat l'identificador de condició.",
        gmOnly: 'Les ordres de Condition Tracker són exclusives del MJ.',
        commandFailed:
          "L'ordre no s'ha pogut completar de manera segura. Comprova la consola de l'API per obtenir detalls.",
        sourceTokenNotFound: "No s'ha trobat el testimoni origen.",
        targetTokenNotFound: "No s'ha trobat el testimoni destinatari.",
        subjectTokenNotFound: "No s'ha trobat el testimoni subjecte.",
        invalidCondition:
          'La condició ha de ser una de les condicions predefinides o Altres.',
        subjectOnlyCustom:
          '--subject només és vàlid per a Encanteri, Habilitat, Avantatge, Desavantatge i Altres.',
        subjectBypassInvalid:
          '--subjectPromptBypass espera true o false quan es proporciona un valor.',
        customDetailsRequired:
          'Es requereixen detalls de {condition}. Usa --other per proporcionar-los.',
        markerConfigFormat:
          'El format de configuració del marcador és: --config marker Grappled=grab',
        markerPredefinedRequired:
          'La configuració del marcador requereix un nom de condició predefinit.',
        markerNameRequired:
          'La configuració del marcador requereix un nom de marcador no buit.',
        markerSet: "El marcador de {condition} s'ha establert a {marker}.",
        healthBarSet: "La barra de salut s'ha establert a {bar}.",
        boolSet: "{key} s'ha establert a {value}.",
        expectedBoolean: "S'esperava true o false.",
        invalidHealthBar:
          'La barra de salut ha de ser bar1_value, bar2_value o bar3_value.',
        markersDisabled: 'Els marcadors estan desactivats.',
        noMarkerConfigured:
          'No hi ha cap marcador configurat per a aquesta condició.',
        markerApplied: 'Marcador aplicat: {marker}',
        markerPresent: 'Marcador ja present: {marker}',
        langSet: 'Idioma establert a {locale}.',
        invalidLocale:
          'Configuració regional no vàlida. Configuracions regionals admeses: {locales}.',
        otherDurationRequiresRounds:
          'La durada Altre requereix un nombre de rondes, per exemple --duration 5 rounds.',
        invalidDuration:
          "La durada ha de ser Fins que s'elimini, una opció de fi de torn o un nombre de rondes positiu.",
        zeroHpNoConditions:
          '{name} ha arribat a 0 PV i no té cap condició activa.',
        zeroHpConditions:
          '{name} ha arribat a 0 PV. Tria les condicions a eliminar:',
        removeAllBtn: 'Elimina totes les condicions de {name}',
        markIncapacitated: 'Marca com a Incapacitat',
        removeFromTurnOrder: "Elimina de l'ordre d'iniciativa",
        alreadyIncapacitated: '{name} ja és Incapacitat.',
        tokenRemovedFromTurn: "{name} s'ha eliminat de l'ordre d'iniciativa.",
        tokenNotInTurn: "No s'ha trobat {name} a l'ordre d'iniciativa.",
        moveTokenPrompt:
          'Mou {name} al calque del mapa perquè romangui visible sense interferir amb altres testimonis?',
        moveTokenBtn: 'Mou {name} al calque del mapa',
        tokenMoved: "{name} s'ha mogut al calque del mapa.",
        tokenNotFound: "No s'ha trobat el testimoni.",
        noActiveConditions: '{name} no té cap condició activa a eliminar.',
        deadNoConditions:
          "{name} s'ha marcat com a mort. No hi havia cap condició activa.",
        scriptReady: '{name} és actiu i estàs usant la versió {version}.',
        reachedZeroHp: '{name} ha arribat a 0 PV',
        manuallyRemoved: "s'ha eliminat manualment",
        durationExpired: 'la seva durada ha expirat',
        markedAsDead: "{name} s'ha marcat com a mort",
        conditionReorder:
          "L'ordre de torn ha canviat i {count} fila(es) de condició seguida(es) pot estar fora de lloc. Fes clic a continuació per restaurar-les després dels seus testimonis assignats.",
        conditionsReordered:
          "Les files de condicions s'han reposicionat després dels seus testimonis assignats.",
      },
      removal: {
        conditionField: 'Condició',
        reasonField: 'Motiu',
        turnRowField: 'Fila del registre de torns',
        markerField: 'Marcador',
        notConfigured: 'No configurat',
        markerRemoved: 'Eliminat ({marker})',
        markerRetained: 'Conservat ({marker})',
        rowRemoved: 'Eliminat',
        rowMissing: 'Ja absent',
        manualReason: 'Eliminació manual',
      },
      cleanup: {
        orphaned: 'Entrades de condició òrfenes',
        stale: 'Entrades de condició obsoletes',
        orphanedRows: 'Files del registre de torns òrfenes',
        unusedMarkers: 'Marcadors no usats',
      },
      apply: {
        turnAppended:
          "El destinatari no era a l'ordre d'iniciativa; la fila de condició s'ha afegit al final.",
        turnInserted:
          'Fila de condició inserida sota el testimoni destinatari.',
      },
    },
    handout: {
      versionLabel: 'Versió',
      subtitle: "Gestor d'estats de D&D 5e",
      footerNote:
        "Aquest fullet es crea i s'actualitza automàticament cada vegada que es carrega el script.",
      overview: {
        heading: 'Visió general',
        body: "Condition Tracker gestiona les condicions d'estat de D&D 5e i els efectes personalitzats com a files etiquetades al registre de torns de Roll20. Aplica condicions als testimonis, fes un seguiment de les durades per ordre d'iniciativa i elimina automàticament els efectes expirats quan acaba un torn. Totes les ordres són exclusives del MJ i es poden executar des del xat o mitjançant les macros instal·lades.",
      },
      quickStart: {
        heading: 'Inici ràpid',
        colCommand: 'Ordre',
        colDesc: 'Descripció',
        rows: [
          [
            '!condition-tracker --prompt',
            'Assistent pas a pas — tria la condició, els testimonis i la durada de manera interactiva. També disponible com a macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Aplica una condició a diversos testimonis simultàniament. També disponible com a macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Obre el menú principal de gestió amb botons per aplicar, revisar o eliminar condicions.',
          ],
        ],
      },
      commandsRef: {
        heading: "Referència d'ordres",
        colFlag: 'Opció',
        colDesc: 'Descripció',
        rows: [
          ['--prompt', "Interfície de l'assistent pas a pas"],
          [
            '--multi-target',
            'Aplica una condició a diversos testimonis destinataris alhora',
          ],
          [
            '--menu',
            "Mostra el menú principal (afegeix remove per al menú d'eliminació)",
          ],
          [
            '--source X --target Y --condition Z',
            "Aplica una condició directament sense l'assistent",
          ],
          [
            '--duration &lt;valor&gt;',
            'Durada per a una aplicació directa (p. ex. 2 rounds)',
          ],
          [
            '--other &lt;text&gt;',
            "Text personalitzat per als tipus d'efecte Encanteri / Habilitat / Altres",
          ],
          [
            '--remove &lt;id-condició&gt;',
            'Elimina una condició específica pel seu identificador únic',
          ],
          [
            '--config &lt;opció&gt; &lt;valor&gt;',
            'Ajusta els paràmetres de configuració (vegeu la secció Configuració)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Substitueix subjectPromptBypass per a aquesta ordre únicament (també admet --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            "Reconcilia l'estat — elimina les condicions i files del registre de torns òrfenes",
          ],
          [
            '--reorder-conditions',
            "Reposiciona manualment les files de condicions darrere dels seus tokens assignats a l'ordre de torns",
          ],
          ['--reinstall-macro', 'Torna a crear o actualitza les macros del MJ'],
          [
            '--reinstall-handout',
            "Torna a crear o actualitza el fullet d'ajuda localitzat",
          ],
          [
            '--lang &lt;locale&gt;',
            "Mostra els missatges d'aquesta ordre en una configuració regional addicional (mode bilingüe)",
          ],
          ['--help', "Mostra una targeta d'ajuda breu al xat"],
        ],
      },
      standardConditions: {
        heading: 'Condicions estàndard (D&amp;D 5e)',
        colCondition: 'Condició',
      },
      customEffects: {
        heading: "Tipus d'efectes personalitzats",
        colType: 'Tipus',
        colNotes: 'Notes',
        rows: [
          [
            '🔮 Encanteri',
            "Segueix un efecte d'encanteri amb nom — se't demanarà el nom de l'encanteri",
          ],
          [
            '🎯 Habilitat',
            "Segueix una habilitat de classe o raça amb nom — se't demanarà el nom",
          ],
          [
            '🍀 Avantatge',
            "Registra un avantatge atorgat d'un testimoni a un altre; agrupat amb l'origen a la iniciativa",
          ],
          [
            '⬇️ Desavantatge',
            "Registra un desavantatge imposat; agrupat amb l'origen a la iniciativa",
          ],
          [
            '📝 Altres',
            "Etiqueta personalitzada de forma lliure — se't demanarà una descripció",
          ],
        ],
      },
      durationOptions: {
        heading: 'Opcions de durada',
        intro:
          'El recompte restant es mostra a la columna pr del registre de torns i disminueix quan acaba el torn del testimoni ancla.',
        colOption: 'Opció',
        colBehaviour: 'Comportament',
        rows: [
          [
            "Fins que s'elimini",
            "Permanent — s'ha d'eliminar manualment mitjançant el menú o --remove",
          ],
          [
            'Fi del proper torn del destinatari',
            'Expira quan acaba el proper torn del testimoni destinatari a la iniciativa',
          ],
          [
            "Fi del proper torn de l'origen",
            'Expira quan acaba el proper torn del testimoni origen a la iniciativa',
          ],
          [
            '1 / 2 / 3 / 10 rondes',
            'Compte enrere fix; un decrement per fi de torn del testimoni ancla',
          ],
        ],
      },
      configuration: {
        heading: 'Configuració',
        intro:
          'Usa !condition-tracker --config &lt;opció&gt; &lt;valor&gt; o el botó Configuració del menú principal.',
        colOption: 'Opció',
        colValues: 'Valors',
        colDesc: 'Descripció',
        rows: [
          [
            'useMarkers',
            'true / false',
            "Aplica marcadors d'estat de Roll20 als testimonis quan s'afegeix una condició",
          ],
          [
            'useIcons',
            'true / false',
            "Mostra codis d'icona curts (p. ex. [G]) en lloc d'emojis a les files del registre de torns",
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Omet el pas del testimoni subjecte opcional per als efectes Encanteri / Habilitat / Altres',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Barra del testimoni a vigilar; quan arriba a 0 el MJ rep un avís per netejar les condicions',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            "Idioma dels missatges del xat i del fullet d'ajuda",
          ],
          [
            'marker',
            '&lt;Condició&gt;=&lt;nom del marcador&gt;',
            "Substitueix el marcador d'estat usat per a una condició específica (p. ex. marker Grappled=grab)",
          ],
        ],
      },
      defaultMarkers: {
        heading: "Marcadors d'estat predeterminats",
        colCondition: 'Condició',
        colMarker: 'Nom del marcador',
      },
      availableLocales: {
        heading: 'Traduccions disponibles',
        intro:
          "Usa l'opció de configuració language per establir els missatges del xat i el fullet d'ajuda en qualsevol configuració regional admesa. Els àlies curts també s'accepten per a en, zh i pt.",
        colLocale: 'Locale',
        colLanguage: 'Idioma',
        colFile: 'Fitxer de traducció',
      },
    },
  };

  const TRANSLATION$l = {
    conditions: {
      Grappled: {
        past: '被擒抱',
        verb: '擒抱',
      },
      Restrained: {
        past: '受束縛',
        verb: '束縛',
      },
      Prone: {
        past: '倒地',
        verb: '擊倒',
      },
      Poisoned: {
        past: '中毒',
        verb: '使中毒',
      },
      Stunned: {
        past: '震懾',
        verb: '使震懾',
      },
      Blinded: {
        past: '目盲',
        verb: '使目盲',
      },
      Charmed: {
        past: '被魅惑',
        verb: '魅惑',
      },
      Frightened: {
        past: '恐懼',
        verb: '使恐懼',
      },
      Incapacitated: {
        past: '失能',
        verb: '使失能',
      },
      Invisible: {
        past: '隱形',
        verb: '使',
        suffix: '隱形',
      },
      Paralyzed: {
        past: '麻痺',
        verb: '使麻痺',
      },
      Petrified: {
        past: '石化',
        verb: '使石化',
      },
      Unconscious: {
        past: '昏迷',
        verb: '使',
        suffix: '昏迷',
      },
      Spell: {
        past: '受到法術影響',
        verb: '對其施放法術',
      },
      Ability: {
        past: '受到能力影響',
        verb: '對其使用能力',
      },
      Advantage: {
        past: '具有優勢',
        verb: '給予優勢',
        noBy: true,
      },
      Disadvantage: {
        past: '具有劣勢',
        verb: '施加劣勢',
        noBy: true,
      },
    },
    condNames: {
      Grappled: '擒抱',
      Restrained: '束縛',
      Prone: '倒地',
      Poisoned: '中毒',
      Stunned: '震懾',
      Blinded: '目盲',
      Charmed: '魅惑',
      Frightened: '恐懼',
      Incapacitated: '失能',
      Invisible: '隱形',
      Paralyzed: '麻痺',
      Petrified: '石化',
      Unconscious: '昏迷',
      Spell: '法術',
      Ability: '能力',
      Advantage: '優勢',
      Disadvantage: '劣勢',
      Other: '其他',
    },
    languageNames: {
      af: '南非荷蘭文',
      ca: '加泰蘭文',
      'zh-TW': '中文（台灣）',
      cs: '捷克文',
      da: '丹麥文',
      nl: '荷蘭文',
      'en-US': '英文（美國）',
      fi: '芬蘭文',
      fr: '法文',
      de: '德文',
      el: '希臘文',
      he: '希伯來文',
      hu: '匈牙利文',
      it: '義大利文',
      ja: '日文',
      ko: '韓文',
      pl: '波蘭文',
      'pt-PT': '葡萄牙文（葡萄牙）',
      'pt-BR': '葡萄牙文（巴西）',
      ru: '俄文',
      es: '西班牙文',
      sv: '瑞典文',
      tr: '土耳其文',
      uk: '烏克蘭文',
    },
    ui: {
      choice: {
        selectCondition: '選擇狀態',
        selectSource: '選擇來源 Token',
        selectTarget: '選擇目標 Token',
        selectSubject: '選擇主體',
        selectDuration: '選擇持續時間',
        confirmTargetTitle: '確認目標列表',
        applyEffectTitle: '套用 {condition} 效果',
        noTokens: '目前頁面沒有找到已命名的 Token。',
        confirmIntro: '下列 Token 將受到此狀態影響：',
        confirmBtn: '確認目標列表',
        enterDetails: '輸入效果詳細資料',
        noneBtn: '無',
        noneOrSourceBtn: '無或套用至來源',
        subjectDesc: '選擇由誰或什麼造成此效果。',
        sourceDesc: '選擇產生此狀態或效果的生物。',
        targetDesc: '選擇要受到此狀態或效果影響的生物。',
        otherText: '其他狀態文字',
        effectDetails: '{condition} 詳細資料',
      },
      col: {
        players: '玩家',
        npcs: 'NPC',
        conditions: '狀態',
        customEffects: '自訂效果',
        permanentTurnEnd: '永久 / 回合結束',
        rounds: '輪數',
        command: '指令',
        result: '結果',
        field: '欄位',
        value: '值',
        option: '選項',
        condition: '狀態',
        marker: '標記',
        item: '項目',
        removed: '已移除',
        details: '詳細資料',
        description: '描述',
        scenario: '情境',
      },
      dur: {
        untilRemoved: '直到移除',
        endOfTargetTurn: '目標下個回合結束',
        endOfSourceTurn: '來源下個回合結束',
        round1: '1 輪',
        round2: '2 輪',
        round3: '3 輪',
        round10: '10 輪',
        custom: '自訂',
        customPrompt: '輪數',
        untilRemovedDisplay: '直到移除',
        turnsRemaining: '剩餘 {n} 個追蹤回合結束',
      },
      btn: {
        openWizard: '開啟精靈',
        openMultiTarget: '開啟多目標精靈',
        openRemovalList: '開啟移除列表',
        showConfig: '顯示設定',
        runCleanup: '執行清理',
        reinstallMacro: '重新安裝巨集',
        reinstallHandout: '重新安裝講義',
        showHelp: '顯示說明',
        reorderConditions: '重新排列狀態列',
      },
      title: {
        menu: '選單',
        removalMenu: 'Condition Tracker 移除',
        config: '設定',
        configTracker: 'Condition Tracker 設定',
        help: '說明',
        applied: '已套用',
        removed: '狀態已移除',
        cleanup: '清理完成',
        macroReinstalled: '巨集已重新安裝',
        handoutReinstalled: '講義已重新安裝',
        warning: '警告',
        error: '錯誤',
        turnOrder: '回合順序',
        noConditions: '沒有狀態',
        tokenMoved: 'Token 已移動',
        markedDead: '已標記為死亡',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — 移動 Token？',
        scriptReady: '腳本已就緒',
        conditionReorder: '行動順序已變更',
      },
      heading: {
        quickActions: '快速動作',
        settings: '設定',
        markerMappings: '標記對應',
        result: '結果',
        info: '資訊',
        commandOptions: '指令選項',
        promptUi: '精靈介面',
        examples: '範例',
        summary: '摘要',
      },
      msg: {
        noActive: '目前沒有追蹤中的狀態。',
        configReset: '設定已重設為模組預設值。',
        unknownConfig: '未知的設定選項。使用 --config 查看支援的設定。',
        macroReinstalled:
          '{wizard} 和 {multiTarget} 巨集已為目前所有 GM 玩家重新安裝。',
        handoutReinstalled: '說明講義 {handout} 已重新安裝。',
        duplicate: '相同的來源、主體、目標、狀態和自訂文字已經存在。',
        noTargets: '未指定多目標套用的目標 Token。',
        noSelection: '使用 --multi-target 前，請先在地圖上選擇至少一個 Token。',
        invalidIds: '目前選取項目中沒有有效的 Token ID。',
        reSelectTokens: '找不到原本選取的 Token。請重新選擇 Token 後再試一次。',
        conditionNotFound: '找不到狀態 ID。',
        gmOnly: 'Condition Tracker 指令僅限 GM 使用。',
        commandFailed: '無法安全完成此指令。請檢查 API 主控台。',
        sourceTokenNotFound: '找不到來源 Token。',
        targetTokenNotFound: '找不到目標 Token。',
        subjectTokenNotFound: '找不到主體 Token。',
        invalidCondition: '狀態必須是預先定義的狀態之一或 Other。',
        subjectOnlyCustom:
          '--subject 僅適用於 Spell、Ability、Advantage、Disadvantage 和 Other。',
        subjectBypassInvalid:
          '提供值時，--subjectPromptBypass 需為 true 或 false。',
        customDetailsRequired:
          '{condition} 需要詳細資料。使用 --other 提供內容。',
        markerConfigFormat: '標記設定格式：--config marker Grappled=grab',
        markerPredefinedRequired: '標記設定需要預先定義的狀態名稱。',
        markerNameRequired: '標記設定需要非空白的標記名稱。',
        markerSet: '{condition} 標記已設定為 {marker}。',
        healthBarSet: '生命值欄位已設定為 {bar}。',
        boolSet: '{key} 已設定為 {value}。',
        expectedBoolean: '應為 true 或 false。',
        invalidHealthBar:
          '生命值欄位必須是 bar1_value、bar2_value 或 bar3_value。',
        markersDisabled: '標記已停用。',
        noMarkerConfigured: '此狀態未設定標記。',
        markerApplied: '已套用標記：{marker}',
        markerPresent: '標記已存在：{marker}',
        langSet: '語言已設定為 {locale}。',
        invalidLocale: '無效的語言環境。支援的語言環境：{locales}。',
        otherDurationRequiresRounds:
          '其他持續時間需要數字輪數，例如 --duration 5 rounds。',
        invalidDuration: '持續時間必須是直到移除、回合結束選項，或正數輪數。',
        zeroHpNoConditions: '{name} 已降至 0 HP，且沒有 active 狀態。',
        zeroHpConditions: '{name} 已降至 0 HP。選擇要移除的狀態：',
        removeAllBtn: '移除 {name} 的所有狀態',
        markIncapacitated: '標記為失能',
        removeFromTurnOrder: '從回合順序移除',
        alreadyIncapacitated: '{name} 已經失能。',
        tokenRemovedFromTurn: '{name} 已從回合順序移除。',
        tokenNotInTurn: '在回合順序中找不到 {name}。',
        moveTokenPrompt:
          '要將 {name} 移至地圖圖層，使其保持可見但不干擾其他 Token 嗎？',
        moveTokenBtn: '將 {name} 移至地圖圖層',
        tokenMoved: '{name} 已移至地圖圖層。',
        tokenNotFound: '找不到 Token。',
        noActiveConditions: '{name} 沒有可移除的 active 狀態。',
        deadNoConditions: '{name} 已標記為死亡。沒有 active 狀態。',
        scriptReady: '{name} 已啟用，版本為 {version}。',
        reachedZeroHp: '{name} 達到 0 HP',
        manuallyRemoved: '已手動移除',
        durationExpired: '持續時間已結束',
        markedAsDead: '{name} 已標記為死亡',
        conditionReorder:
          '行動順序已變更，{count} 個追蹤中的狀態列可能已不在正確位置。點擊下方將其還原至指定代幣之後。',
        conditionsReordered: '狀態列已重新排列至其指定代幣之後。',
      },
      removal: {
        conditionField: '狀態',
        reasonField: '原因',
        turnRowField: '回合追蹤列',
        markerField: '標記',
        notConfigured: '未設定',
        markerRemoved: '已移除（{marker}）',
        markerRetained: '保留（{marker}）',
        rowRemoved: '已移除',
        rowMissing: '已不存在',
        manualReason: '手動移除',
      },
      cleanup: {
        orphaned: '孤立狀態項目',
        stale: '過期狀態項目',
        orphanedRows: '孤立回合追蹤列',
        unusedMarkers: '未使用標記',
      },
      apply: {
        turnAppended: '目標不在回合順序中；狀態列已附加。',
        turnInserted: '狀態列已插入目標 Token 下方。',
      },
    },
    handout: {
      versionLabel: '版本',
      subtitle: 'D&D 5e 狀態效果管理器',
      footerNote: '此講義會在每次腳本載入時自動建立並更新。',
      overview: {
        heading: '總覽',
        body: 'Condition Tracker 會在 Roll20 回合追蹤器中以標籤列管理 D&D 5e 狀態與自訂效果。你可以將狀態套用到 Token、依照先攻順序追蹤持續時間，並在回合結束時自動移除到期效果。所有指令僅限 GM 使用，可由聊天或已安裝的巨集觸發。',
      },
      quickStart: {
        heading: '快速開始',
        colCommand: '指令',
        colDesc: '描述',
        rows: [
          [
            '!condition-tracker --prompt',
            '逐步精靈 — 互動式選擇狀態、Token 與持續時間。也可使用 ConditionTrackerWizard 巨集。',
          ],
          [
            '!condition-tracker --multi-target',
            '同時將一個狀態套用到多個 Token。也可使用 ConditionTrackerMultiTarget 巨集。',
          ],
          [
            '!condition-tracker --menu',
            '開啟主要管理選單，可套用、檢視或移除狀態。',
          ],
        ],
      },
      commandsRef: {
        heading: '指令參考',
        colFlag: '參數',
        colDesc: '描述',
        rows: [
          ['--prompt', '互動式逐步精靈介面'],
          ['--multi-target', '一次將狀態套用到多個目標 Token'],
          ['--menu', '顯示主選單（加入 remove 可開啟移除選單）'],
          ['--source X --target Y --condition Z', '不使用精靈直接套用狀態'],
          ['--duration &lt;value&gt;', '直接套用時的持續時間（例如 2 rounds）'],
          [
            '--other &lt;text&gt;',
            'Spell / Ability / Other 效果類型的自訂文字',
          ],
          ['--remove &lt;condition-id&gt;', '依唯一 ID 移除特定狀態'],
          [
            '--config &lt;option&gt; &lt;value&gt;',
            '調整設定（見下方設定章節）',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            '僅對此指令覆寫 subjectPromptBypass（也支援 --subject-prompt-bypass）',
          ],
          ['--cleanup', '校正狀態 — 移除孤立狀態與回合追蹤列'],
          [
            '--reorder-conditions',
            '手動將狀態列重新排列到輪序中其對應代幣之後',
          ],
          ['--reinstall-macro', '重新建立或更新 GM 巨集'],
          ['--reinstall-handout', '重新建立或更新本地化說明講義'],
          ['--lang &lt;locale&gt;', '以額外語言環境輸出此指令訊息（雙語模式）'],
          ['--help', '在聊天中顯示簡短說明卡'],
        ],
      },
      standardConditions: {
        heading: '標準狀態（D&amp;D 5e）',
        colCondition: '狀態',
      },
      customEffects: {
        heading: '自訂效果類型',
        colType: '類型',
        colNotes: '備註',
        rows: [
          ['🔮 Spell', '追蹤具名法術效果 — 會提示輸入法術名稱'],
          ['🎯 Ability', '追蹤具名職業或種族能力 — 會提示輸入能力名稱'],
          [
            '🍀 Advantage',
            '記錄一個 Token 對另一個 Token 的優勢；在先攻中與來源分組',
          ],
          ['⬇️ Disadvantage', '記錄劣勢；在先攻中與來源分組'],
          ['📝 Other', '自由格式自訂標籤 — 會提示輸入描述'],
        ],
      },
      durationOptions: {
        heading: '持續時間選項',
        intro:
          '剩餘數會顯示在回合追蹤器的 pr 欄位，並在錨定 Token 的回合結束時遞減。',
        colOption: '選項',
        colBehaviour: '行為',
        rows: [
          ['Until removed', '永久 — 必須透過選單或 --remove 手動移除'],
          ["End of target's next turn", '目標 Token 的下一個回合結束時到期'],
          ["End of source's next turn", '來源 Token 的下一個回合結束時到期'],
          [
            '1 / 2 / 3 / 10 rounds',
            '固定倒數；每次錨定 Token 回合結束遞減一次',
          ],
        ],
      },
      configuration: {
        heading: '設定',
        intro:
          '使用 !condition-tracker --config &lt;option&gt; &lt;value&gt;，或主選單中的設定按鈕。',
        colOption: '選項',
        colValues: '值',
        colDesc: '描述',
        rows: [
          [
            'useMarkers',
            'true / false',
            '新增狀態時將 Roll20 狀態標記套用到 Token',
          ],
          [
            'useIcons',
            'true / false',
            '在回合追蹤列中顯示短圖示代碼（例如 [G]）而非 emoji',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            '略過 Spell / Ability / Other 效果的可選主體 Token 步驟',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            '要監控的 Token 欄位；降至 0 時提示 GM 清理狀態',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            '聊天訊息與說明講義的輸出語言',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            '覆寫特定狀態使用的狀態標記（例如 marker Grappled=grab）',
          ],
        ],
      },
      defaultMarkers: {
        heading: '預設狀態標記',
        colCondition: '狀態',
        colMarker: '標記名稱',
      },
      availableLocales: {
        heading: '可用翻譯',
        intro:
          '使用 language 設定選項，可將聊天訊息與說明講義切換到任何支援的語言環境。也接受 en、zh、pt 等短別名。',
        colLocale: '語言環境',
        colLanguage: '語言',
        colFile: '翻譯檔案',
      },
    },
    templates: {
      display: {
        custom: '{emoji} {target} 受到 {effect} 影響（{source}）',
        advantage: '{emoji} {source} 對 {target}{subject} 具有優勢',
        disadvantage: '{emoji} {source} 對 {target}{subject} 具有劣勢',
        noBy: '{emoji} {target} {past}（{source}）',
        self: '{target} {past}',
        standard: '{emoji} {target} 因 {source} 而{past}',
      },
      apply: {
        custom: '{source} 對 {target} 施加 {effect}。',
        advantage: '{source} 對 {target}{subject} 具有優勢。',
        disadvantage: '{source} 對 {target}{subject} 具有劣勢。',
        self: '{target} {past}。',
        withSuffix: '{source} {verb} {target} {suffix}。',
        standard: '{source} {verb} {target}。',
      },
      remove: {
        custom: '{target} 不再受到 {effect} 影響。',
        advantage: '{source} 不再對 {target}{subject} 具有優勢。',
        disadvantage: '{source} 不再對 {target}{subject} 具有劣勢。',
        noBy: '{target} 不再{past}。',
        self: '{target} 不再{past}。',
        standard: '{target} 不再因 {source} 而{past}。',
      },
    },
  };

  const TRANSLATION$k = {
    conditions: {
      Grappled: {
        past: 'uchvácený',
        verb: 'uchvátí',
      },
      Restrained: {
        past: 'omezený',
        verb: 'omezí',
      },
      Prone: {
        past: 'sražený k zemi',
        verb: 'srazí',
        suffix: 'k zemi',
      },
      Poisoned: {
        past: 'otrávený',
        verb: 'otráví',
      },
      Stunned: {
        past: 'omráčený',
        verb: 'omráčí',
      },
      Blinded: {
        past: 'oslepený',
        verb: 'oslepí',
      },
      Charmed: {
        past: 'okouzlený',
        verb: 'okouzlí',
      },
      Frightened: {
        past: 'vystrašený',
        verb: 'vystraší',
      },
      Incapacitated: {
        past: 'vyřazený',
        verb: 'vyřadí',
      },
      Invisible: {
        past: 'neviditelný',
        verb: 'učiní',
        suffix: 'neviditelným',
      },
      Paralyzed: {
        past: 'paralyzovaný',
        verb: 'paralyzuje',
      },
      Petrified: {
        past: 'zkamenělý',
        verb: 'zkamení',
      },
      Unconscious: {
        past: 'v bezvědomí',
        verb: 'uvede',
        suffix: 'do bezvědomí',
      },
      Spell: {
        past: 'ovlivněný kouzlem',
        verb: 'sesílá kouzlo na',
      },
      Ability: {
        past: 'ovlivněný schopností',
        verb: 'použije schopnost na',
      },
      Advantage: {
        past: 'má výhodu',
        verb: 'udělí výhodu',
        noBy: true,
      },
      Disadvantage: {
        past: 'má nevýhodu',
        verb: 'udělí nevýhodu',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Uchvácený',
      Restrained: 'Omezený',
      Prone: 'Sražený',
      Poisoned: 'Otrávený',
      Stunned: 'Omráčený',
      Blinded: 'Oslepený',
      Charmed: 'Okouzlený',
      Frightened: 'Vystrašený',
      Incapacitated: 'Vyřazený',
      Invisible: 'Neviditelný',
      Paralyzed: 'Paralyzovaný',
      Petrified: 'Zkamenělý',
      Unconscious: 'V bezvědomí',
      Spell: 'Kouzlo',
      Ability: 'Schopnost',
      Advantage: 'Výhoda',
      Disadvantage: 'Nevýhoda',
      Other: 'Jiné',
    },
    templates: {
      display: {
        custom: '{emoji} {target} ovlivněný {effect} ({source})',
        advantage: '{emoji} {source} má výhodu proti {target}{subject}',
        disadvantage: '{emoji} {source} má nevýhodu proti {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} je {past}',
        standard: '{emoji} {target} {past} od {source}',
      },
      apply: {
        custom: '{source} uplatní {effect} na {target}.',
        advantage: '{source} má výhodu proti {target}{subject}.',
        disadvantage: '{source} má nevýhodu proti {target}{subject}.',
        self: '{target} je {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} již není ovlivněný {effect}.',
        advantage: '{source} již nemá výhodu proti {target}{subject}.',
        disadvantage: '{source} již nemá nevýhodu proti {target}{subject}.',
        noBy: '{target} již není {past}.',
        self: '{target} již není {past}.',
        standard: '{target} již není {past} od {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Vybrat stav',
        selectSource: 'Vybrat zdrojový žeton',
        selectTarget: 'Vybrat cílový žeton',
        selectSubject: 'Vybrat subjekt',
        selectDuration: 'Vybrat trvání',
        confirmTargetTitle: 'Potvrdit seznam cílů',
        applyEffectTitle: 'Uplatnit efekt {condition}',
        noTokens:
          'Na aktivní stránce nebyly nalezeny žádné pojmenované žetony.',
        confirmIntro: 'Následující žetony obdrží stav:',
        confirmBtn: 'Potvrdit seznam cílů',
        enterDetails: 'Zadat podrobnosti efektu',
        noneBtn: 'Žádný',
        noneOrSourceBtn: 'Žádný nebo použít na zdroj',
        subjectDesc: 'Vyberte, kdo nebo co efekt způsobuje.',
        sourceDesc: 'Vyberte bytost, která stav nebo efekt vytváří.',
        targetDesc: 'Vyberte bytost, která stav nebo efekt obdrží.',
        otherText: 'Vlastní text stavu',
        effectDetails: 'Podrobnosti {condition}',
      },
      col: {
        players: 'Hráči',
        npcs: 'Nestvůry',
        conditions: 'Stavy',
        customEffects: 'Vlastní efekty',
        permanentTurnEnd: 'Trvalý / Konec tahu',
        rounds: 'Kola',
        command: 'Příkaz',
        result: 'Výsledek',
        field: 'Pole',
        value: 'Hodnota',
        option: 'Možnost',
        condition: 'Stav',
        marker: 'Značka',
        item: 'Položka',
        removed: 'Odstraněno',
        details: 'Podrobnosti',
        description: 'Popis',
        scenario: 'Scénář',
      },
      dur: {
        untilRemoved: 'Do odebrání',
        endOfTargetTurn: 'Konec příštího tahu cíle',
        endOfSourceTurn: 'Konec příštího tahu zdroje',
        round1: '1 kolo',
        round2: '2 kola',
        round3: '3 kola',
        round10: '10 kol',
        custom: 'Vlastní',
        customPrompt: 'Počet kol',
        untilRemovedDisplay: 'Do odebrání',
        turnsRemaining: 'Zbývá {n} konec (konců) tahu',
      },
      btn: {
        openWizard: 'Otevřít průvodce',
        openMultiTarget: 'Otevřít průvodce více cílů',
        openRemovalList: 'Otevřít seznam odebrání',
        showConfig: 'Zobrazit konfiguraci',
        runCleanup: 'Spustit vyčištění',
        reinstallMacro: 'Přeinstalovat makro',
        reinstallHandout: 'Přeinstalovat příručku',
        showHelp: 'Zobrazit nápovědu',
        reorderConditions: 'Přeuspořádat řádky stavů',
      },
      title: {
        menu: 'Nabídka',
        removalMenu: 'Odebrání stavů',
        config: 'Konfigurace',
        configTracker: 'Konfigurace Condition Trackeru',
        help: 'Nápověda',
        applied: 'Uplatněno',
        removed: 'Stav odebrán',
        cleanup: 'Vyčištění dokončeno',
        macroReinstalled: 'Makro přeinstalováno',
        handoutReinstalled: 'Příručka přeinstalována',
        warning: 'Varování',
        error: 'Chyba',
        turnOrder: 'Pořadí tahů',
        noConditions: 'Žádné stavy',
        tokenMoved: 'Žeton přesunut',
        markedDead: 'Označen jako mrtvý',
        zeroHp: '{name} — 0 životů',
        moveToken: '{name} — Přesunout žeton?',
        scriptReady: 'Skript připraven',
        conditionReorder: 'Pořadí tahů změněno',
      },
      heading: {
        quickActions: 'Rychlé akce',
        settings: 'Nastavení',
        markerMappings: 'Mapování značek',
        result: 'Výsledek',
        info: 'Informace',
        commandOptions: 'Možnosti příkazů',
        promptUi: 'Rozhraní průvodce',
        examples: 'Příklady',
        summary: 'Souhrn',
      },
      msg: {
        noActive: 'Nejsou sledovány žádné aktivní stavy.',
        configReset: 'Konfigurace obnovena na výchozí hodnoty modulu.',
        unknownConfig:
          'Neznámá možnost konfigurace. Použijte --config pro zobrazení podporovaných nastavení.',
        macroReinstalled:
          'Makra {wizard} a {multiTarget} byla přeinstalována pro všechny aktuální hráče s GM rolí.',
        handoutReinstalled: 'Pomocná příručka {handout} byla přeinstalována.',
        duplicate:
          'Tato přesná kombinace zdroje, subjektu, cíle, stavu a vlastního textu je již aktivní.',
        noTargets: 'Pro hromadné uplatnění nebyly zadány žádné cílové žetony.',
        noSelection:
          'Před použitím --multi-target vyberte alespoň jeden žeton na hrací ploše.',
        invalidIds:
          'V aktuálním výběru nebyla nalezena žádná platná ID žetonů.',
        reSelectTokens:
          'Žádný z původně vybraných žetonů nebylo možné nalézt. Vyberte žetony znovu a zkuste to znovu.',
        conditionNotFound: 'ID stavu nebylo nalezeno.',
        gmOnly: 'Příkazy Condition Trackeru jsou určeny pouze pro GM.',
        commandFailed:
          'Příkaz nebylo možné bezpečně dokončit. Zkontrolujte konzoli API.',
        sourceTokenNotFound: 'Zdrojový žeton nebylo možné nalézt.',
        targetTokenNotFound: 'Cílový žeton nebylo možné nalézt.',
        subjectTokenNotFound: 'Žeton subjektu nebylo možné nalézt.',
        invalidCondition:
          'Stav musí být jedním z předdefinovaných stavů nebo Jiné.',
        subjectOnlyCustom:
          '--subject je platný pouze pro Kouzlo, Schopnost, Výhodu, Nevýhodu a Jiné.',
        subjectBypassInvalid:
          '--subjectPromptBypass očekává true nebo false, pokud je zadána hodnota.',
        customDetailsRequired:
          'Podrobnosti {condition} jsou povinné. Použijte --other pro jejich zadání.',
        markerConfigFormat:
          'Formát konfigurace značky: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Konfigurace značky vyžaduje předdefinovaný název stavu.',
        markerNameRequired:
          'Konfigurace značky vyžaduje neprázdný název značky.',
        markerSet: 'Značka {condition} nastavena na {marker}.',
        healthBarSet: 'Lišta zdraví nastavena na {bar}.',
        boolSet: '{key} nastaveno na {value}.',
        expectedBoolean: 'Očekáváno true nebo false.',
        invalidHealthBar:
          'Lišta zdraví musí být bar1_value, bar2_value nebo bar3_value.',
        markersDisabled: 'Značky jsou zakázány.',
        noMarkerConfigured: 'Pro tento stav není nakonfigurována žádná značka.',
        markerApplied: 'Značka uplatněna: {marker}',
        markerPresent: 'Značka již přítomna: {marker}',
        langSet: 'Jazyk nastaven na {locale}.',
        invalidLocale: 'Neplatný jazyk. Podporované jazyky: {locales}.',
        otherDurationRequiresRounds:
          'Jiné trvání vyžaduje číselný počet kol, například --duration 5 rounds.',
        invalidDuration:
          'Trvání musí být Do odebrání, možnost konce tahu nebo kladný počet kol.',
        zeroHpNoConditions:
          '{name} dosáhl 0 životů a nemá žádné aktivní stavy.',
        zeroHpConditions: '{name} dosáhl 0 životů. Vyberte stavy k odebrání:',
        removeAllBtn: 'Odebrat všechny stavy pro {name}',
        markIncapacitated: 'Označit jako vyřazeného',
        removeFromTurnOrder: 'Odebrat z pořadí tahů',
        alreadyIncapacitated: '{name} je již vyřazený.',
        tokenRemovedFromTurn: '{name} byl odebrán z pořadí tahů.',
        tokenNotInTurn: '{name} nebyl nalezen v pořadí tahů.',
        moveTokenPrompt:
          'Přesunout {name} na vrstvu mapy, aby zůstal viditelný, ale nerušil ostatní žetony?',
        moveTokenBtn: 'Přesunout {name} na vrstvu mapy',
        tokenMoved: '{name} byl přesunut na vrstvu mapy.',
        tokenNotFound: 'Žeton nenalezen.',
        noActiveConditions: '{name} nemá žádné aktivní stavy k odebrání.',
        deadNoConditions:
          '{name} byl označen jako mrtvý. Nebyly aktivní žádné stavy.',
        scriptReady: '{name} je aktivní a používáte verzi {version}.',
        reachedZeroHp: '{name} dosáhl 0 životů',
        manuallyRemoved: 'bylo ručně odebráno',
        durationExpired: 'trvání vypršelo',
        markedAsDead: '{name} byl označen jako mrtvý',
        conditionReorder:
          'Pořadí tahů se změnilo a {count} sledovaný (sledovaných) řádek stavů může být mimo pořadí. Klikněte níže pro jejich obnovení za přiřazené žetony.',
        conditionsReordered:
          'Řádky stavů byly přesunuty za jejich přiřazené žetony.',
      },
      removal: {
        conditionField: 'Stav',
        reasonField: 'Důvod',
        turnRowField: 'Řádek sledování tahů',
        markerField: 'Značka',
        notConfigured: 'Nenakonfigurováno',
        markerRemoved: 'Odebráno ({marker})',
        markerRetained: 'Zachováno ({marker})',
        rowRemoved: 'Odebráno',
        rowMissing: 'Již chybí',
        manualReason: 'Ruční odebrání',
      },
      cleanup: {
        orphaned: 'Osiřelé záznamy stavů',
        stale: 'Zastaralé záznamy stavů',
        orphanedRows: 'Osiřelé řádky sledování tahů',
        unusedMarkers: 'Nepoužívané značky',
      },
      apply: {
        turnAppended:
          'Cíl nebyl v pořadí tahů; řádek stavu byl připojen na konec.',
        turnInserted: 'Řádek stavu vložen pod žeton cíle.',
      },
    },
    handout: {
      versionLabel: 'Verze',
      subtitle: 'Správce stavových efektů pro D&D 5e',
      footerNote:
        'Tato příručka je automaticky vytvářena a aktualizována při každém načtení skriptu.',
      overview: {
        heading: 'Přehled',
        body: 'Condition Tracker spravuje stavy D&D 5e a vlastní efekty jako pojmenované řádky ve sledovači tahů Roll20. Uplatňujte stavy na žetony, sledujte doby trvání podle iniciativního pořadí a automaticky odstraňujte vypršelé efekty na konci tahu. Všechny příkazy jsou určeny pouze pro GM a lze je spouštět z chatu nebo prostřednictvím nainstalovaných maker.',
      },
      quickStart: {
        heading: 'Rychlý start',
        colCommand: 'Příkaz',
        colDesc: 'Popis',
        rows: [
          [
            '!condition-tracker --prompt',
            'Průvodce krok za krokem — interaktivně vyberte stav, žetony a dobu trvání. Dostupné také jako makro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Uplatnit jeden stav na více žetonů současně. Dostupné také jako makro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Otevřít hlavní nabídku správy s tlačítky pro uplatnění, prohlížení nebo odebrání stavů.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Přehled příkazů',
        colFlag: 'Přepínač',
        colDesc: 'Popis',
        rows: [
          ['--prompt', 'Interaktivní průvodce krok za krokem'],
          ['--multi-target', 'Uplatnit stav na více cílových žetonů najednou'],
          [
            '--menu',
            'Zobrazit hlavní nabídku (přidat remove pro nabídku odebrání)',
          ],
          [
            '--source X --target Y --condition Z',
            'Uplatnit stav přímo bez průvodce',
          ],
          [
            '--duration &lt;hodnota&gt;',
            'Trvání pro přímé uplatnění (např. 2 rounds)',
          ],
          [
            '--other &lt;text&gt;',
            'Vlastní text pro typy efektů Kouzlo / Schopnost / Jiné',
          ],
          [
            '--remove &lt;ID stavu&gt;',
            'Odebrat konkrétní stav podle jeho jedinečného ID',
          ],
          [
            '--config &lt;možnost&gt; &lt;hodnota&gt;',
            'Upravit nastavení konfigurace (viz sekce Konfigurace níže)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Přepsat subjectPromptBypass pouze pro tento příkaz (podporuje také --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Sladit stav — odebrat osiřelé stavy a řádky sledování tahů',
          ],
          [
            '--reorder-conditions',
            'Ručně přemístit řádky podmínek za přiřazené tokeny v pořadí kol',
          ],
          ['--reinstall-macro', 'Znovu vytvořit nebo aktualizovat makra GM'],
          [
            '--reinstall-handout',
            'Znovu vytvořit nebo aktualizovat lokalizovanou pomocnou příručku',
          ],
          [
            '--lang &lt;jazyk&gt;',
            'Výstup zpráv tohoto příkazu v dalším jazyce (dvojjazyčný režim)',
          ],
          ['--help', 'Zobrazit stručnou nápovědní kartu v chatu'],
        ],
      },
      standardConditions: {
        heading: 'Standardní stavy (D&amp;D 5e)',
        colCondition: 'Stav',
      },
      customEffects: {
        heading: 'Vlastní typy efektů',
        colType: 'Typ',
        colNotes: 'Poznámky',
        rows: [
          [
            '🔮 Kouzlo',
            'Sledování pojmenovaného kouzlového efektu — budete vyzváni k zadání názvu kouzla',
          ],
          [
            '🎯 Schopnost',
            'Sledování pojmenované schopnosti třídy nebo rasy — budete vyzváni k zadání názvu',
          ],
          [
            '🍀 Výhoda',
            'Zaznamenat výhodu udělenou od jednoho žetonu druhému; seskupeno se zdrojem v iniciativě',
          ],
          [
            '⬇️ Nevýhoda',
            'Zaznamenat uloženou nevýhodu; seskupeno se zdrojem v iniciativě',
          ],
          ['📝 Jiné', 'Volný vlastní popisek — budete vyzváni k zadání popisu'],
        ],
      },
      durationOptions: {
        heading: 'Možnosti trvání',
        intro:
          'Zbývající počet je zobrazen ve sloupci pr sledovače tahů a snižuje se, když skončí tah kotevního žetonu.',
        colOption: 'Možnost',
        colBehaviour: 'Chování',
        rows: [
          [
            'Do odebrání',
            'Trvalé — musí být odebrán ručně přes nabídku nebo --remove',
          ],
          [
            'Konec příštího tahu cíle',
            'Vyprší na konci příštího tahu cílového žetonu v iniciativě',
          ],
          [
            'Konec příštího tahu zdroje',
            'Vyprší na konci příštího tahu zdrojového žetonu v iniciativě',
          ],
          [
            '1 / 2 / 3 / 10 kol',
            'Pevný odpočet; jedno snížení za konec tahu kotevního žetonu',
          ],
        ],
      },
      configuration: {
        heading: 'Konfigurace',
        intro:
          'Použijte !condition-tracker --config &lt;možnost&gt; &lt;hodnota&gt; nebo tlačítko Konfigurace v hlavní nabídce.',
        colOption: 'Možnost',
        colValues: 'Hodnoty',
        colDesc: 'Popis',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Uplatnit stavové značky Roll20 na žetony při přidání stavu',
          ],
          [
            'useIcons',
            'true / false',
            'Zobrazovat krátké kódy ikon (např. [G]) místo emoji v řádcích sledovače tahů',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Přeskočit volitelný krok výběru subjektu pro efekty Kouzlo / Schopnost / Jiné',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Sledovaná lišta; když klesne na 0, GM je vyzván k vyčištění stavů',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Výstupní jazyk pro chatové zprávy a pomocnou příručku',
          ],
          [
            'marker',
            '&lt;Stav&gt;=&lt;název značky&gt;',
            'Přepsat stavovou značku použitou pro konkrétní stav (např. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Výchozí stavové značky',
        colCondition: 'Stav',
        colMarker: 'Název značky',
      },
      availableLocales: {
        heading: 'Dostupné překlady',
        intro:
          'Použijte možnost konfigurace jazyka k nastavení chatových zpráv a pomocné příručky na jakýkoliv podporovaný jazyk. Pro en, zh a pt jsou také přijímány krátké aliasy.',
        colLocale: 'Locale',
        colLanguage: 'Jazyk',
        colFile: 'Soubor překladu',
      },
    },
  };

  const TRANSLATION$j = {
    conditions: {
      Grappled: {
        past: 'fastholdt',
        verb: 'fastholder',
      },
      Restrained: {
        past: 'bundet',
        verb: 'binder',
      },
      Prone: {
        past: 'væltet omkuld',
        verb: 'vælter',
        suffix: 'omkuld',
      },
      Poisoned: {
        past: 'forgiftet',
        verb: 'forgifter',
      },
      Stunned: {
        past: 'lammet',
        verb: 'lammer',
      },
      Blinded: {
        past: 'blindet',
        verb: 'blinder',
      },
      Charmed: {
        past: 'charmet',
        verb: 'charmerer',
      },
      Frightened: {
        past: 'skræmt',
        verb: 'skræmmer',
      },
      Incapacitated: {
        past: 'ukampdygtig',
        verb: 'gør',
        suffix: 'ukampdygtig',
      },
      Invisible: {
        past: 'usynlig',
        verb: 'gør',
        suffix: 'usynlig',
      },
      Paralyzed: {
        past: 'paralyseret',
        verb: 'paralyserer',
      },
      Petrified: {
        past: 'forstenet',
        verb: 'forstener',
      },
      Unconscious: {
        past: 'bevidstløs',
        verb: 'gør',
        suffix: 'bevidstløs',
      },
      Spell: {
        past: 'påvirket af en besværgelse',
        verb: 'kaster en besværgelse på',
      },
      Ability: {
        past: 'påvirket af en evne',
        verb: 'bruger en evne på',
      },
      Advantage: {
        past: 'har fordel',
        verb: 'giver fordel til',
        noBy: true,
      },
      Disadvantage: {
        past: 'har ulempe',
        verb: 'giver ulempe til',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Fastholdt',
      Restrained: 'Bundet',
      Prone: 'Omkuld',
      Poisoned: 'Forgiftet',
      Stunned: 'Lammet',
      Blinded: 'Blindet',
      Charmed: 'Charmed',
      Frightened: 'Skræmt',
      Incapacitated: 'Ukampdygtig',
      Invisible: 'Usynlig',
      Paralyzed: 'Paralyseret',
      Petrified: 'Forstenet',
      Unconscious: 'Bevidstløs',
      Spell: 'Besværgelse',
      Ability: 'Evne',
      Advantage: 'Fordel',
      Disadvantage: 'Ulempe',
      Other: 'Andet',
    },
    templates: {
      display: {
        custom: '{emoji} {target} påvirket af {effect} ({source})',
        advantage: '{emoji} {source} har fordel mod {target}{subject}',
        disadvantage: '{emoji} {source} har ulempe mod {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} er {past}',
        standard: '{emoji} {target} {past} af {source}',
      },
      apply: {
        custom: '{source} påfører {effect} på {target}.',
        advantage: '{source} har fordel mod {target}{subject}.',
        disadvantage: '{source} har ulempe mod {target}{subject}.',
        self: '{target} er {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} er ikke længere påvirket af {effect}.',
        advantage: '{source} har ikke længere fordel mod {target}{subject}.',
        disadvantage: '{source} har ikke længere ulempe mod {target}{subject}.',
        noBy: '{target} er ikke længere {past}.',
        self: '{target} er ikke længere {past}.',
        standard: '{target} er ikke længere {past} af {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Vælg tilstand',
        selectSource: 'Vælg kildetoken',
        selectTarget: 'Vælg måltoken',
        selectSubject: 'Vælg subjekt',
        selectDuration: 'Vælg varighed',
        confirmTargetTitle: 'Bekræft målliste',
        applyEffectTitle: 'Anvend {condition}-effekt',
        noTokens: 'Ingen navngivne tokens fundet på den aktive side.',
        confirmIntro: 'Følgende tokens vil modtage tilstanden:',
        confirmBtn: 'Bekræft målliste',
        enterDetails: 'Indtast effektdetaljer',
        noneBtn: 'Ingen',
        noneOrSourceBtn: 'Ingen eller anvend på kilde',
        subjectDesc: 'Vælg hvem eller hvad der leverer effekten.',
        sourceDesc:
          'Vælg den skabning, der opretter/genererer tilstanden eller effekten.',
        targetDesc:
          'Vælg den skabning, der vil modtage tilstanden eller effekten.',
        otherText: 'Brugerdefineret tilstandstekst',
        effectDetails: '{condition}-detaljer',
      },
      col: {
        players: 'Spillere',
        npcs: "NPC'er",
        conditions: 'Tilstande',
        customEffects: 'Brugerdefinerede effekter',
        permanentTurnEnd: 'Permanent / Rundeslutten',
        rounds: 'Runder',
        command: 'Kommando',
        result: 'Resultat',
        field: 'Felt',
        value: 'Værdi',
        option: 'Indstilling',
        condition: 'Tilstand',
        marker: 'Markør',
        item: 'Element',
        removed: 'Fjernet',
        details: 'Detaljer',
        description: 'Beskrivelse',
        scenario: 'Scenarie',
      },
      dur: {
        untilRemoved: 'Indtil fjernet',
        endOfTargetTurn: 'Slutningen af målets næste tur',
        endOfSourceTurn: 'Slutningen af kildens næste tur',
        round1: '1 runde',
        round2: '2 runder',
        round3: '3 runder',
        round10: '10 runder',
        custom: 'Brugerdefineret',
        customPrompt: 'Antal runder',
        untilRemovedDisplay: 'Indtil fjernet',
        turnsRemaining: '{n} sporing(er) af turslut tilbage',
      },
      btn: {
        openWizard: 'Åbn guide',
        openMultiTarget: 'Åbn guide til flere mål',
        openRemovalList: 'Åbn fjernelsesliste',
        showConfig: 'Vis konfiguration',
        runCleanup: 'Kør oprydning',
        reinstallMacro: 'Geninstaller makro',
        reinstallHandout: 'Geninstaller handout',
        showHelp: 'Vis hjælp',
        reorderConditions: 'Omarranger tilstandsrækker',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Condition Tracker — fjernelse',
        config: 'Konfiguration',
        configTracker: 'Condition Tracker — konfiguration',
        help: 'Hjælp',
        applied: 'Anvendt',
        removed: 'Tilstand fjernet',
        cleanup: 'Oprydning fuldført',
        macroReinstalled: 'Makro geninstalleret',
        handoutReinstalled: 'Handout geninstalleret',
        warning: 'Advarsel',
        error: 'Fejl',
        turnOrder: 'Turrækkefølge',
        noConditions: 'Ingen tilstande',
        tokenMoved: 'Token flyttet',
        markedDead: 'Markeret som død',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — Flyt token?',
        scriptReady: 'Script klar',
        conditionReorder: 'Turrækkefølge ændret',
      },
      heading: {
        quickActions: 'Hurtighandlinger',
        settings: 'Indstillinger',
        markerMappings: 'Markørtilknytninger',
        result: 'Resultat',
        info: 'Info',
        commandOptions: 'Kommandoindstillinger',
        promptUi: 'Guide-brugerflade',
        examples: 'Eksempler',
        summary: 'Oversigt',
      },
      msg: {
        noActive: 'Ingen aktive tilstande spores.',
        configReset: 'Konfiguration nulstillet til modstandarder.',
        unknownConfig:
          'Ukendt konfigurationsindstilling. Brug --config for at se understøttede indstillinger.',
        macroReinstalled:
          'Makroerne {wizard} og {multiTarget} er geninstalleret for alle nuværende GM-spillere.',
        handoutReinstalled: 'Hjælpe-handouttet {handout} er geninstalleret.',
        duplicate:
          'Den præcise kombination af kilde, subjekt, mål, tilstand og brugerdefineret tekst er allerede aktiv.',
        noTargets: 'Ingen måltoken angivet til multi-mål-anvendelse.',
        noSelection:
          'Vælg mindst ét token på brættet, før du bruger --multi-target.',
        invalidIds:
          "Ingen gyldige token-id'er fundet i den aktuelle markering.",
        reSelectTokens:
          'Ingen af de oprindeligt valgte tokens kunne findes. Vælg tokens igen og prøv på ny.',
        conditionNotFound: 'Tilstands-id blev ikke fundet.',
        gmOnly: "Condition Tracker-kommandoer er kun for GM'er.",
        commandFailed:
          'Kommandoen kunne ikke gennemføres sikkert. Tjek API-konsollen for detaljer.',
        sourceTokenNotFound: 'Kildetoken kunne ikke findes.',
        targetTokenNotFound: 'Måltoken kunne ikke findes.',
        subjectTokenNotFound: 'Subjekttoken kunne ikke findes.',
        invalidCondition:
          'Tilstanden skal være en af de foruddefinerede tilstande eller Andet.',
        subjectOnlyCustom:
          '--subject er kun gyldigt for Besværgelse, Evne, Fordel, Ulempe og Andet.',
        subjectBypassInvalid:
          '--subjectPromptBypass forventer true eller false, når en værdi angives.',
        customDetailsRequired:
          '{condition}-detaljer er påkrævet. Brug --other til at angive dem.',
        markerConfigFormat:
          'Markørkonfigurationsformat: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Markørkonfiguration kræver et foruddefineret tilstandsnavn.',
        markerNameRequired:
          'Markørkonfiguration kræver et ikke-tomt markørnavn.',
        markerSet: '{condition}-markør sat til {marker}.',
        healthBarSet: 'Helsebjælke sat til {bar}.',
        boolSet: '{key} sat til {value}.',
        expectedBoolean: 'Forventede true eller false.',
        invalidHealthBar:
          'Helsebjælken skal være bar1_value, bar2_value eller bar3_value.',
        markersDisabled: 'Markører er deaktiverede.',
        noMarkerConfigured: 'Ingen markør er konfigureret for denne tilstand.',
        markerApplied: 'Markør anvendt: {marker}',
        markerPresent: 'Markør allerede til stede: {marker}',
        langSet: 'Sprog sat til {locale}.',
        invalidLocale: 'Ugyldig locale. Understøttede locales: {locales}.',
        otherDurationRequiresRounds:
          'Anden varighed kræver et numerisk rundeantal, for eksempel --duration 5 rounds.',
        invalidDuration:
          'Varighed skal være Indtil fjernet, en turslut-indstilling eller et positivt rundeantal.',
        zeroHpNoConditions:
          '{name} har nået 0 HP og har ingen aktive tilstande.',
        zeroHpConditions:
          '{name} har nået 0 HP. Vælg tilstande, der skal fjernes:',
        removeAllBtn: 'Fjern alle tilstande for {name}',
        markIncapacitated: 'Markér som ukampdygtig',
        removeFromTurnOrder: 'Fjern fra turrækkefølge',
        alreadyIncapacitated: '{name} er allerede ukampdygtig.',
        tokenRemovedFromTurn: '{name} er fjernet fra turrækkefølgen.',
        tokenNotInTurn: '{name} blev ikke fundet i turrækkefølgen.',
        moveTokenPrompt:
          'Flyt {name} til kortlaget, så det forbliver synligt men ikke forstyrrer andre tokens?',
        moveTokenBtn: 'Flyt {name} til kortlaget',
        tokenMoved: '{name} er blevet flyttet til kortlaget.',
        tokenNotFound: 'Token ikke fundet.',
        noActiveConditions: '{name} har ingen aktive tilstande at fjerne.',
        deadNoConditions:
          '{name} blev markeret som død. Ingen tilstande var aktive.',
        scriptReady: '{name} er aktiv, og du bruger version {version}.',
        reachedZeroHp: '{name} nåede 0 HP',
        manuallyRemoved: 'manuelt fjernet',
        durationExpired: 'varighed udløbet',
        markedAsDead: '{name} blev markeret som død',
        conditionReorder:
          'Turrækkefølgen ændrede sig, og {count} sporet tilstandsrække(r) kan nu være fejlplaceret. Klik nedenfor for at gendanne dem efter deres tildelte tokens.',
        conditionsReordered:
          'Tilstandsrækker er omplaceret efter deres tildelte tokens.',
      },
      removal: {
        conditionField: 'Tilstand',
        reasonField: 'Årsag',
        turnRowField: 'Tursporing-række',
        markerField: 'Markør',
        notConfigured: 'Ikke konfigureret',
        markerRemoved: 'Fjernet ({marker})',
        markerRetained: 'Beholdt ({marker})',
        rowRemoved: 'Fjernet',
        rowMissing: 'Allerede manglende',
        manualReason: 'Manuel fjernelse',
      },
      cleanup: {
        orphaned: 'Forladte tilstandsposter',
        stale: 'Forældede tilstandsposter',
        orphanedRows: 'Forladte tursporing-rækker',
        unusedMarkers: 'Ubrugte markører',
      },
      apply: {
        turnAppended:
          'Mål var ikke i turrækkefølgen; tilstandsrække tilføjet til sidst.',
        turnInserted: 'Tilstandsrække indsat under måltoken.',
      },
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'D&D 5e-statuseffektstyring',
      footerNote:
        'Dette handout oprettes og opdateres automatisk, hver gang scriptet indlæses.',
      overview: {
        heading: 'Oversigt',
        body: "Condition Tracker styrer D&D 5e-statustilstande og brugerdefinerede effekter som mærkede rækker i Roll20's tursporing. Anvend tilstande på tokens, spor varigheder efter initiativrækkefølge, og fjern automatisk udløbne effekter, når en tur slutter. Alle kommandoer er kun tilgængelige for GM'en og kan udløses fra chatten eller via de installerede makroer.",
      },
      quickStart: {
        heading: 'Hurtig start',
        colCommand: 'Kommando',
        colDesc: 'Beskrivelse',
        rows: [
          [
            '!condition-tracker --prompt',
            'Trin-for-trin-guide — vælg tilstand, tokens og varighed interaktivt. Også tilgængelig som makroen ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Anvend én tilstand på flere tokens samtidig. Også tilgængelig som makroen ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Åbn hovedmenuen med knapper til at anvende, gennemse eller fjerne tilstande.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Kommandoreference',
        colFlag: 'Flag',
        colDesc: 'Beskrivelse',
        rows: [
          ['--prompt', 'Interaktiv trin-for-trin-guide'],
          ['--multi-target', 'Anvend en tilstand på flere måltoken på én gang'],
          ['--menu', 'Vis hovedmenu (tilføj remove for fjernelsesmenu)'],
          [
            '--source X --target Y --condition Z',
            'Anvend en tilstand direkte uden guiden',
          ],
          [
            '--duration &lt;værdi&gt;',
            'Varighed for direkte anvendelse (f.eks. 2 rounds)',
          ],
          [
            '--other &lt;tekst&gt;',
            'Brugerdefineret tekst til Besværgelse / Evne / Anden effekttype',
          ],
          [
            '--remove &lt;tilstands-id&gt;',
            'Fjern en bestemt tilstand via dens unikke id',
          ],
          [
            '--config &lt;indstilling&gt; &lt;værdi&gt;',
            'Juster konfigurationsindstillinger (se afsnittet Konfiguration nedenfor)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Tilsidesæt subjectPromptBypass kun for denne kommando (understøtter også --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Afstem tilstand — fjern forladte tilstande og tursporing-rækker',
          ],
          [
            '--reorder-conditions',
            'Flyt betingelsesrækker manuelt bag de tilknyttede tokens i turordenen',
          ],
          ['--reinstall-macro', 'Genopret eller opdater GM-makroerne'],
          [
            '--reinstall-handout',
            'Genopret eller opdater det lokaliserede hjælpe-handout',
          ],
          [
            '--lang &lt;locale&gt;',
            'Udsend denne kommandos meddelelser på en yderligere locale (tosproget tilstand)',
          ],
          ['--help', 'Vis et kort hjælpekort i chatten'],
        ],
      },
      standardConditions: {
        heading: 'Standardtilstande (D&amp;D 5e)',
        colCondition: 'Tilstand',
      },
      customEffects: {
        heading: 'Brugerdefinerede effekttyper',
        colType: 'Type',
        colNotes: 'Noter',
        rows: [
          [
            '🔮 Besværgelse',
            'Spor en navngiven besværgelseseffekt — du vil blive bedt om besværgelsens navn',
          ],
          [
            '🎯 Evne',
            'Spor en navngiven klasse- eller raceevne — du vil blive bedt om evnens navn',
          ],
          [
            '🍀 Fordel',
            'Registrer fordel givet fra ét token til et andet; grupperet med kilden i initiativet',
          ],
          [
            '⬇️ Ulempe',
            'Registrer pålagt ulempe; grupperet med kilden i initiativet',
          ],
          [
            '📝 Andet',
            'Friform brugerdefineret etiket — du vil blive bedt om en beskrivelse',
          ],
        ],
      },
      durationOptions: {
        heading: 'Varighedsindstillinger',
        intro:
          'Det resterende antal vises i pr-kolonnen i tursporing og nedsættes, når ankertokenets tur slutter.',
        colOption: 'Indstilling',
        colBehaviour: 'Adfærd',
        rows: [
          [
            'Indtil fjernet',
            'Permanent — skal fjernes manuelt via menuen eller --remove',
          ],
          [
            'Slutningen af målets næste tur',
            "Udløber, når måltoken's næste tur slutter i initiativet",
          ],
          [
            'Slutningen af kildens næste tur',
            "Udløber, når kildetoken's næste tur slutter i initiativet",
          ],
          [
            '1 / 2 / 3 / 10 runder',
            'Fast nedtælling; ét trin per ankertokens turslut',
          ],
        ],
      },
      configuration: {
        heading: 'Konfiguration',
        intro:
          'Brug !condition-tracker --config &lt;indstilling&gt; &lt;værdi&gt; eller knappen Konfiguration i hovedmenuen.',
        colOption: 'Indstilling',
        colValues: 'Værdier',
        colDesc: 'Beskrivelse',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Anvend Roll20-statusmarkører på tokens, når en tilstand tilføjes',
          ],
          [
            'useIcons',
            'true / false',
            'Vis korte ikonkoder (f.eks. [G]) i stedet for emoji i tursporing-rækker',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Spring det valgfrie subjekttrin over for Besværgelse / Evne / Andre effekter',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Tokenbjælke der overvåges; når den når 0, bliver GM bedt om at rydde op i tilstande',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Outputsprog for chatbeskeder og hjælpe-handouttet',
          ],
          [
            'marker',
            '&lt;Tilstand&gt;=&lt;markørnavn&gt;',
            'Tilsidesæt statusmarkøren for en bestemt tilstand (f.eks. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Standardstatusmarkører',
        colCondition: 'Tilstand',
        colMarker: 'Markørnavn',
      },
      availableLocales: {
        heading: 'Tilgængelige oversættelser',
        intro:
          'Brug sprogkonfigurationsindstillingen til at indstille chatbeskeder og hjælpe-handouttet til en understøttet locale. Korte aliaser accepteres også for en, zh og pt.',
        colLocale: 'Locale',
        colLanguage: 'Sprog',
        colFile: 'Oversættelsesfil',
      },
    },
  };

  const TRANSLATION$i = {
    conditions: {
      Grappled: {
        past: 'gegrepen',
        verb: 'grijpt',
      },
      Restrained: {
        past: 'vastgebonden',
        verb: 'bindt vast',
      },
      Prone: {
        past: 'neergehaald',
        verb: 'haalt',
        suffix: 'neer',
      },
      Poisoned: {
        past: 'vergiftigd',
        verb: 'vergiftigt',
      },
      Stunned: {
        past: 'verdoofd',
        verb: 'verdooft',
      },
      Blinded: {
        past: 'verblind',
        verb: 'verblindt',
      },
      Charmed: {
        past: 'gecharmeerd',
        verb: 'charmeert',
      },
      Frightened: {
        past: 'bang',
        verb: 'maakt',
        suffix: 'bang',
      },
      Incapacitated: {
        past: 'uitgeschakeld',
        verb: 'schakelt uit',
      },
      Invisible: {
        past: 'onzichtbaar',
        verb: 'maakt',
        suffix: 'onzichtbaar',
      },
      Paralyzed: {
        past: 'verlamd',
        verb: 'verlamt',
      },
      Petrified: {
        past: 'versteend',
        verb: 'versteent',
      },
      Unconscious: {
        past: 'bewusteloos',
        verb: 'maakt',
        suffix: 'bewusteloos',
      },
      Spell: {
        past: 'beïnvloed door een spreuk',
        verb: 'spreekt een spreuk uit over',
      },
      Ability: {
        past: 'beïnvloed door een vaardigheid',
        verb: 'gebruikt een vaardigheid op',
      },
      Advantage: {
        past: 'heeft voordeel',
        verb: 'geeft voordeel aan',
        noBy: true,
      },
      Disadvantage: {
        past: 'heeft nadeel',
        verb: 'geeft nadeel aan',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Gegrepen',
      Restrained: 'Vastgebonden',
      Prone: 'Liggend',
      Poisoned: 'Vergiftigd',
      Stunned: 'Verdoofd',
      Blinded: 'Verblind',
      Charmed: 'Gecharmeerd',
      Frightened: 'Bang',
      Incapacitated: 'Uitgeschakeld',
      Invisible: 'Onzichtbaar',
      Paralyzed: 'Verlamd',
      Petrified: 'Versteend',
      Unconscious: 'Bewusteloos',
      Spell: 'Spreuk',
      Ability: 'Vaardigheid',
      Advantage: 'Voordeel',
      Disadvantage: 'Nadeel',
      Other: 'Overig',
    },
    templates: {
      display: {
        custom: '{emoji} {target} beïnvloed door {effect} ({source})',
        advantage: '{emoji} {source} heeft voordeel tegen {target}{subject}',
        disadvantage: '{emoji} {source} heeft nadeel tegen {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} is {past}',
        standard: '{emoji} {target} {past} door {source}',
      },
      apply: {
        custom: '{source} past {effect} toe op {target}.',
        advantage: '{source} heeft voordeel tegen {target}{subject}.',
        disadvantage: '{source} heeft nadeel tegen {target}{subject}.',
        self: '{target} is {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} wordt niet langer beïnvloed door {effect}.',
        advantage:
          '{source} heeft niet langer voordeel tegen {target}{subject}.',
        disadvantage:
          '{source} heeft niet langer nadeel tegen {target}{subject}.',
        noBy: '{target} is niet langer {past}.',
        self: '{target} is niet langer {past}.',
        standard: '{target} wordt niet langer {past} door {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Kies Conditie',
        selectSource: 'Kies Brontoken',
        selectTarget: 'Kies Doeltoken',
        selectSubject: 'Kies Onderwerp',
        selectDuration: 'Kies Duur',
        confirmTargetTitle: 'Bevestig Doellijst',
        applyEffectTitle: 'Pas {condition}-effect toe',
        noTokens: 'Geen benoemde tokens gevonden op de actieve pagina.',
        confirmIntro: 'De volgende tokens ontvangen de conditie:',
        confirmBtn: 'Bevestig doellijst',
        enterDetails: 'Voer effectdetails in',
        noneBtn: 'Geen',
        noneOrSourceBtn: 'Geen of toepassen op bron',
        subjectDesc: 'Selecteer wie of wat het effect veroorzaakt.',
        sourceDesc:
          'Selecteer het wezen dat de conditie of het effect creëert.',
        targetDesc:
          'Selecteer het wezen dat de conditie of het effect ontvangt.',
        otherText: 'Aangepaste conditietekst',
        effectDetails: '{condition}-details',
      },
      col: {
        players: 'Spelers',
        npcs: "NPC's",
        conditions: 'Condities',
        customEffects: 'Aangepaste Effecten',
        permanentTurnEnd: 'Permanent / Beurt Einde',
        rounds: 'Rondes',
        command: 'Opdracht',
        result: 'Resultaat',
        field: 'Veld',
        value: 'Waarde',
        option: 'Optie',
        condition: 'Conditie',
        marker: 'Markering',
        item: 'Item',
        removed: 'Verwijderd',
        details: 'Details',
        description: 'Beschrijving',
        scenario: 'Scenario',
      },
      dur: {
        untilRemoved: 'Tot verwijdering',
        endOfTargetTurn: 'Einde van de volgende beurt van het doel',
        endOfSourceTurn: 'Einde van de volgende beurt van de bron',
        round1: '1 ronde',
        round2: '2 rondes',
        round3: '3 rondes',
        round10: '10 rondes',
        custom: 'Aangepast',
        customPrompt: 'Aantal rondes',
        untilRemovedDisplay: 'Tot verwijdering',
        turnsRemaining: '{n} bijgehouden beurteinde(s) resterend',
      },
      btn: {
        openWizard: 'Open Wizard',
        openMultiTarget: 'Open Multidoel-wizard',
        openRemovalList: 'Open Verwijderlijst',
        showConfig: 'Toon Configuratie',
        runCleanup: 'Voer Opruiming Uit',
        reinstallMacro: 'Macro Herinstalleren',
        reinstallHandout: 'Handout Herinstalleren',
        showHelp: 'Toon Help',
        reorderConditions: 'Conditierijen Herordenen',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Condition Tracker — Verwijdering',
        config: 'Configuratie',
        configTracker: 'Condition Tracker — Configuratie',
        help: 'Help',
        applied: 'Toegepast',
        removed: 'Conditie Verwijderd',
        cleanup: 'Opruiming Voltooid',
        macroReinstalled: 'Macro Herinstalleerd',
        handoutReinstalled: 'Handout Herinstalleerd',
        warning: 'Waarschuwing',
        error: 'Fout',
        turnOrder: 'Beurtenvolgorde',
        noConditions: 'Geen Condities',
        tokenMoved: 'Token Verplaatst',
        markedDead: 'Gemarkeerd als Dood',
        zeroHp: '{name} — 0 LP',
        moveToken: '{name} — Token Verplaatsen?',
        scriptReady: 'Script Gereed',
        conditionReorder: 'Beurtenvolgorde Gewijzigd',
      },
      heading: {
        quickActions: 'Snelle Acties',
        settings: 'Instellingen',
        markerMappings: 'Markeertoewijzingen',
        result: 'Resultaat',
        info: 'Informatie',
        commandOptions: 'Opdrachtopties',
        promptUi: 'Wizard-interface',
        examples: 'Voorbeelden',
        summary: 'Samenvatting',
      },
      msg: {
        noActive: 'Er worden geen actieve condities bijgehouden.',
        configReset: 'Configuratie teruggezet naar standaardwaarden.',
        unknownConfig:
          'Onbekende configuratieoptie. Gebruik --config om ondersteunde instellingen te bekijken.',
        macroReinstalled:
          "De {wizard}- en {multiTarget}-macro's zijn herinstalleerd voor alle huidige GM-spelers.",
        handoutReinstalled: 'De help-handout {handout} is herinstalleerd.',
        duplicate:
          'Deze exacte combinatie van bron, onderwerp, doel, conditie en aangepaste tekst is al actief.',
        noTargets: 'Geen doeltokens opgegeven voor multidoel-toepassing.',
        noSelection:
          'Selecteer ten minste één token op het bord voordat je --multi-target gebruikt.',
        invalidIds: "Geen geldige token-ID's gevonden in de huidige selectie.",
        reSelectTokens:
          'Geen van de oorspronkelijk geselecteerde tokens kon worden gevonden. Selecteer tokens opnieuw en probeer het nogmaals.',
        conditionNotFound: 'Conditie-ID niet gevonden.',
        gmOnly: 'Condition Tracker-opdrachten zijn alleen voor de GM.',
        commandFailed:
          'De opdracht kon niet veilig worden voltooid. Controleer de API-console voor details.',
        sourceTokenNotFound: 'Brontoken kon niet worden gevonden.',
        targetTokenNotFound: 'Doeltoken kon niet worden gevonden.',
        subjectTokenNotFound: 'Onderwerptoken kon niet worden gevonden.',
        invalidCondition:
          'Conditie moet een van de voorgedefinieerde condities of Overig zijn.',
        subjectOnlyCustom:
          '--subject is alleen geldig voor Spreuk, Vaardigheid, Voordeel, Nadeel en Overig.',
        subjectBypassInvalid:
          '--subjectPromptBypass verwacht true of false wanneer een waarde wordt opgegeven.',
        customDetailsRequired:
          '{condition}-details zijn vereist. Gebruik --other om deze op te geven.',
        markerConfigFormat:
          'Markeringsconfiguratieformaat is: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Markeringsconfiguratie vereist een voorgedefinieerde conditienaam.',
        markerNameRequired:
          'Markeringsconfiguratie vereist een niet-lege markeringsnaam.',
        markerSet: '{condition}-markering ingesteld op {marker}.',
        healthBarSet: 'Gezondheidsbalk ingesteld op {bar}.',
        boolSet: '{key} ingesteld op {value}.',
        expectedBoolean: 'true of false verwacht.',
        invalidHealthBar:
          'Gezondheidsbalk moet bar1_value, bar2_value of bar3_value zijn.',
        markersDisabled: 'Markeringen zijn uitgeschakeld.',
        noMarkerConfigured:
          'Er is geen markering geconfigureerd voor deze conditie.',
        markerApplied: 'Markering toegepast: {marker}',
        markerPresent: 'Markering al aanwezig: {marker}',
        langSet: 'Taal ingesteld op {locale}.',
        invalidLocale: 'Ongeldige locale. Ondersteunde locales: {locales}.',
        otherDurationRequiresRounds:
          'Overige duur vereist een numeriek aantal rondes, bijvoorbeeld --duration 5 rounds.',
        invalidDuration:
          'Duur moet Tot verwijdering, een beurteindeoptie of een positief aantal rondes zijn.',
        zeroHpNoConditions:
          '{name} heeft 0 LP bereikt en heeft geen actieve condities.',
        zeroHpConditions:
          '{name} heeft 0 LP bereikt. Kies condities om te verwijderen:',
        removeAllBtn: 'Verwijder Alle Condities voor {name}',
        markIncapacitated: 'Markeer als Uitgeschakeld',
        removeFromTurnOrder: 'Verwijder uit Beurtenvolgorde',
        alreadyIncapacitated: '{name} is al Uitgeschakeld.',
        tokenRemovedFromTurn: '{name} is verwijderd uit de beurtenvolgorde.',
        tokenNotInTurn: '{name} werd niet gevonden in de beurtenvolgorde.',
        moveTokenPrompt:
          'Verplaats {name} naar de kaartlaag zodat het zichtbaar blijft maar andere tokens niet hindert?',
        moveTokenBtn: 'Verplaats {name} naar Kaartlaag',
        tokenMoved: '{name} is verplaatst naar de kaartlaag.',
        tokenNotFound: 'Token niet gevonden.',
        noActiveConditions:
          '{name} heeft geen actieve condities om te verwijderen.',
        deadNoConditions:
          '{name} is gemarkeerd als dood. Er waren geen actieve condities.',
        scriptReady: '{name} is actief en je gebruikt versie {version}.',
        reachedZeroHp: '{name} heeft 0 LP bereikt',
        manuallyRemoved: 'het is handmatig verwijderd',
        durationExpired: 'de duur is verlopen',
        markedAsDead: '{name} is gemarkeerd als dood',
        conditionReorder:
          'De beurtenvolgorde is gewijzigd en {count} bijgehouden conditierij(en) staan mogelijk op de verkeerde plek. Klik hieronder om ze te herstellen na hun toegewezen tokens.',
        conditionsReordered:
          'Conditierijen zijn hergeplaatst na hun toegewezen tokens.',
      },
      removal: {
        conditionField: 'Conditie',
        reasonField: 'Reden',
        turnRowField: 'Beurtenvolgorde-rij',
        markerField: 'Markering',
        notConfigured: 'Niet geconfigureerd',
        markerRemoved: 'Verwijderd ({marker})',
        markerRetained: 'Behouden ({marker})',
        rowRemoved: 'Verwijderd',
        rowMissing: 'Al ontbrekend',
        manualReason: 'Handmatige verwijdering',
      },
      cleanup: {
        orphaned: 'Verweesde conditie-items',
        stale: 'Verouderde conditie-items',
        orphanedRows: 'Verweesde beurtenvolgorde-rijen',
        unusedMarkers: 'Ongebruikte markeringen',
      },
      apply: {
        turnAppended:
          'Doel stond niet in de beurtenvolgorde; conditierij is toegevoegd.',
        turnInserted: 'Conditierij ingevoegd onder het doeltoken.',
      },
    },
    handout: {
      versionLabel: 'Versie',
      subtitle: 'D&D 5e Statuseffect-beheerder',
      footerNote:
        'Deze handout wordt automatisch aangemaakt en bijgewerkt telkens wanneer het script wordt geladen.',
      overview: {
        heading: 'Overzicht',
        body: "Condition Tracker beheert D&D 5e-statuscondities en aangepaste effecten als gelabelde rijen in de Roll20-beurtopvolger. Pas condities toe op tokens, volg duur bij aan de hand van initiatiefvolgorde, en verwijder verlopen effecten automatisch wanneer een beurt eindigt. Alle opdrachten zijn alleen voor de GM en kunnen worden geactiveerd via de chat of de geïnstalleerde macro's.",
      },
      quickStart: {
        heading: 'Snel Starten',
        colCommand: 'Opdracht',
        colDesc: 'Beschrijving',
        rows: [
          [
            '!condition-tracker --prompt',
            'Stap-voor-stap wizard — kies conditie, tokens en duur interactief. Ook beschikbaar als de ConditionTrackerWizard-macro.',
          ],
          [
            '!condition-tracker --multi-target',
            'Pas één conditie tegelijkertijd toe op meerdere tokens. Ook beschikbaar als de ConditionTrackerMultiTarget-macro.',
          ],
          [
            '!condition-tracker --menu',
            'Open het hoofdbeheermenu met knoppen om condities toe te passen, te bekijken of te verwijderen.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Opdrachtenoverzicht',
        colFlag: 'Vlag',
        colDesc: 'Beschrijving',
        rows: [
          ['--prompt', 'Interactieve stap-voor-stap wizard-interface'],
          [
            '--multi-target',
            'Pas een conditie tegelijkertijd toe op meerdere doeltokens',
          ],
          ['--menu', 'Toon hoofdmenu (voeg remove toe voor verwijdermenu)'],
          [
            '--source X --target Y --condition Z',
            'Pas een conditie direct toe zonder de wizard',
          ],
          [
            '--duration &lt;waarde&gt;',
            'Duur voor directe toepassing (bijv. 2 rounds)',
          ],
          [
            '--other &lt;tekst&gt;',
            'Aangepaste tekst voor Spreuk / Vaardigheid / Overige effecttypen',
          ],
          [
            '--remove &lt;conditie-ID&gt;',
            'Verwijder een specifieke conditie via zijn unieke ID',
          ],
          [
            '--config &lt;optie&gt; &lt;waarde&gt;',
            'Pas configuratie-instellingen aan (zie het Configuratie-gedeelte hieronder)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Overschrijf subjectPromptBypass alleen voor deze opdracht (ondersteunt ook --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Herstel staat — verwijder verweesde condities en beurtenvolgorde-rijen',
          ],
          [
            '--reorder-conditions',
            'Conditierijen handmatig herpositioneren achter hun toegewezen tokens in de beurtvolgorde',
          ],
          ['--reinstall-macro', "Maak GM-macro's opnieuw aan of werk ze bij"],
          [
            '--reinstall-handout',
            'Maak de gelokaliseerde help-handout opnieuw aan of werk deze bij',
          ],
          [
            '--lang &lt;locale&gt;',
            'Geef de berichten van deze opdracht uit in een aanvullende locale (tweetalige modus)',
          ],
          ['--help', 'Toon een beknopte helpkaart in de chat'],
        ],
      },
      standardConditions: {
        heading: 'Standaard Condities (D&amp;D 5e)',
        colCondition: 'Conditie',
      },
      customEffects: {
        heading: 'Aangepaste Effecttypen',
        colType: 'Type',
        colNotes: 'Notities',
        rows: [
          [
            '🔮 Spreuk',
            'Volg een benoemd spreukeneffect — je wordt gevraagd naar de spreuknaam',
          ],
          [
            '🎯 Vaardigheid',
            'Volg een benoemde klasse- of rasvaardigheid — je wordt gevraagd naar de naam',
          ],
          [
            '🍀 Voordeel',
            'Registreer voordeel van het ene token naar het andere; gegroepeerd bij de bron in initiatief',
          ],
          [
            '⬇️ Nadeel',
            'Registreer opgelegd nadeel; gegroepeerd bij de bron in initiatief',
          ],
          [
            '📝 Overig',
            'Vrij aangepast label — je wordt gevraagd naar een beschrijving',
          ],
        ],
      },
      durationOptions: {
        heading: 'Duuropties',
        intro:
          'Het resterende aantal wordt weergegeven in de pr-kolom van de beurtopvolger en vermindert telkens wanneer de beurt van het ankertToken eindigt.',
        colOption: 'Optie',
        colBehaviour: 'Gedrag',
        rows: [
          [
            'Tot verwijdering',
            'Permanent — moet handmatig worden verwijderd via het menu of --remove',
          ],
          [
            'Einde van de volgende beurt van het doel',
            'Verloopt wanneer de volgende beurt van het doeltoken eindigt in het initiatief',
          ],
          [
            'Einde van de volgende beurt van de bron',
            'Verloopt wanneer de volgende beurt van het brontoken eindigt in het initiatief',
          ],
          [
            '1 / 2 / 3 / 10 rondes',
            'Vaste aftelling; één vermindering per beurteindigng van het ankertoken',
          ],
        ],
      },
      configuration: {
        heading: 'Configuratie',
        intro:
          'Gebruik !condition-tracker --config &lt;optie&gt; &lt;waarde&gt; of de Configuratie-knop in het hoofdmenu.',
        colOption: 'Optie',
        colValues: 'Waarden',
        colDesc: 'Beschrijving',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Pas Roll20-statusmarkeringen toe op tokens wanneer een conditie wordt toegevoegd',
          ],
          [
            'useIcons',
            'true / false',
            'Toon korte pictogramcodes (bijv. [G]) in plaats van emoji in beurtopvolger-rijen',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Sla de optionele onderwerptokenstap over voor Spreuk / Vaardigheid / Overige effecten',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Token-balk om te bewaken; wanneer deze op 0 komt, wordt de GM gevraagd condities op te ruimen',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Uitvoertaal voor chatberichten en de help-handout',
          ],
          [
            'marker',
            '&lt;Conditie&gt;=&lt;markeringsnaam&gt;',
            'Overschrijf de statusmarkering voor een specifieke conditie (bijv. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Standaard Statusmarkeringen',
        colCondition: 'Conditie',
        colMarker: 'Markeringsnaam',
      },
      availableLocales: {
        heading: 'Beschikbare Vertalingen',
        intro:
          'Gebruik de taalconfiguratieopties om chatberichten en de help-handout in te stellen op een ondersteunde locale. Korte aliassen worden ook geaccepteerd voor en, zh en pt.',
        colLocale: 'Locale',
        colLanguage: 'Taal',
        colFile: 'Vertaalbestand',
      },
    },
  };

  const TRANSLATION$h = {
    conditions: {
      Grappled: {
        past: 'grappled',
        verb: 'grapples',
      },
      Restrained: {
        past: 'restrained',
        verb: 'restrains',
      },
      Prone: {
        past: 'knocked prone',
        verb: 'knocks',
        suffix: 'prone',
      },
      Poisoned: {
        past: 'poisoned',
        verb: 'poisons',
      },
      Stunned: {
        past: 'stunned',
        verb: 'stuns',
      },
      Blinded: {
        past: 'blinded',
        verb: 'blinds',
      },
      Charmed: {
        past: 'charmed',
        verb: 'charms',
      },
      Frightened: {
        past: 'frightened',
        verb: 'frightens',
      },
      Incapacitated: {
        past: 'incapacitated',
        verb: 'incapacitates',
      },
      Invisible: {
        past: 'invisible',
        verb: 'makes',
        suffix: 'invisible',
      },
      Paralyzed: {
        past: 'paralyzed',
        verb: 'paralyzes',
      },
      Petrified: {
        past: 'petrified',
        verb: 'petrifies',
      },
      Unconscious: {
        past: 'unconscious',
        verb: 'knocks',
        suffix: 'unconscious',
      },
      Spell: {
        past: 'affected by a spell',
        verb: 'casts a spell on',
      },
      Ability: {
        past: 'affected by an ability',
        verb: 'uses an ability on',
      },
      Advantage: {
        past: 'has advantage',
        verb: 'grants advantage to',
        noBy: true,
      },
      Disadvantage: {
        past: 'has disadvantage',
        verb: 'imposes disadvantage on',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Grappled',
      Restrained: 'Restrained',
      Prone: 'Prone',
      Poisoned: 'Poisoned',
      Stunned: 'Stunned',
      Blinded: 'Blinded',
      Charmed: 'Charmed',
      Frightened: 'Frightened',
      Incapacitated: 'Incapacitated',
      Invisible: 'Invisible',
      Paralyzed: 'Paralyzed',
      Petrified: 'Petrified',
      Unconscious: 'Unconscious',
      Spell: 'Spell',
      Ability: 'Ability',
      Advantage: 'Advantage',
      Disadvantage: 'Disadvantage',
      Other: 'Other',
    },
    templates: {
      display: {
        custom: '{emoji} {target} affected by {effect} ({source})',
        advantage: '{emoji} {source} has advantage against {target}{subject}',
        disadvantage:
          '{emoji} {source} has disadvantage against {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} is {past}',
        standard: '{emoji} {target} {past} by {source}',
      },
      apply: {
        custom: '{source} applies {effect} to {target}.',
        advantage: '{source} has advantage against {target}{subject}.',
        disadvantage: '{source} has disadvantage against {target}{subject}.',
        self: '{target} is {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} is no longer affected by {effect}.',
        advantage:
          '{source} no longer has advantage against {target}{subject}.',
        disadvantage:
          '{source} no longer has disadvantage against {target}{subject}.',
        noBy: '{target} no longer {past}.',
        self: '{target} is no longer {past}.',
        standard: '{target} is no longer {past} by {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Select Condition',
        selectSource: 'Select Source Token',
        selectTarget: 'Select Target Token',
        selectSubject: 'Select Subject',
        selectDuration: 'Select Duration',
        confirmTargetTitle: 'Confirm Target List',
        applyEffectTitle: 'Apply {condition} Effect',
        noTokens: 'No named tokens found on the active page.',
        confirmIntro: 'The following tokens will receive the condition:',
        confirmBtn: 'Confirm target list',
        enterDetails: 'Enter effect details',
        noneBtn: 'None',
        noneOrSourceBtn: 'None or Apply to Source',
        subjectDesc: 'Select who or what delivers the effect.',
        sourceDesc:
          'Select the creature that is creating / generating the condition or effect.',
        targetDesc:
          'Select the creature that will receive the condition or effect.',
        otherText: 'Other condition text',
        effectDetails: '{condition} details',
      },
      col: {
        players: 'Players',
        npcs: 'NPCs',
        conditions: 'Conditions',
        customEffects: 'Custom Effects',
        permanentTurnEnd: 'Permanent / Turn End',
        rounds: 'Rounds',
        command: 'Command',
        result: 'Result',
        field: 'Field',
        value: 'Value',
        option: 'Option',
        condition: 'Condition',
        marker: 'Marker',
        item: 'Item',
        removed: 'Removed',
        details: 'Details',
        description: 'Description',
        scenario: 'Scenario',
      },
      dur: {
        untilRemoved: 'Until removed',
        endOfTargetTurn: 'End of target next turn',
        endOfSourceTurn: 'End of source next turn',
        round1: '1 round',
        round2: '2 rounds',
        round3: '3 rounds',
        round10: '10 rounds',
        custom: 'Custom',
        customPrompt: 'Number of rounds',
        untilRemovedDisplay: 'Until removed',
        turnsRemaining: '{n} tracked turn end(s) remaining',
      },
      btn: {
        openWizard: 'Open Wizard',
        openMultiTarget: 'Open Multi-Target Wizard',
        openRemovalList: 'Open Removal List',
        showConfig: 'Show Config',
        runCleanup: 'Run Cleanup',
        reinstallMacro: 'Reinstall Macro',
        reinstallHandout: 'Reinstall Handout',
        showHelp: 'Show Help',
        reorderConditions: 'Reorder Condition Rows',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Condition Tracker removal',
        config: 'Config',
        configTracker: 'Condition Tracker config',
        help: 'Help',
        applied: 'Applied',
        removed: 'Condition Removed',
        cleanup: 'Cleanup Complete',
        macroReinstalled: 'Macro Reinstalled',
        handoutReinstalled: 'Handout Reinstalled',
        warning: 'Warning',
        error: 'Error',
        turnOrder: 'Turn Order',
        noConditions: 'No Conditions',
        tokenMoved: 'Token Moved',
        markedDead: 'Marked as Dead',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — Move Token?',
        scriptReady: 'Script Ready',
        conditionReorder: 'Turn Order Changed',
      },
      heading: {
        quickActions: 'Quick Actions',
        settings: 'Settings',
        markerMappings: 'Marker Mappings',
        result: 'Result',
        info: 'Info',
        commandOptions: 'Command Options',
        promptUi: 'Prompt UI',
        examples: 'Examples',
        summary: 'Summary',
      },
      msg: {
        noActive: 'No active conditions are tracked.',
        configReset: 'Configuration reset to mod defaults.',
        unknownConfig:
          'Unknown config option. Use --config to view supported settings.',
        macroReinstalled:
          'The {wizard} and {multiTarget} macros have been reinstalled for all current GM players.',
        handoutReinstalled: 'The help handout {handout} has been reinstalled.',
        duplicate:
          'That exact source, subject, target, condition, and custom text is already active.',
        noTargets: 'No target tokens specified for multi-target apply.',
        noSelection:
          'Select at least one token on the board before using --multi-target.',
        invalidIds: 'No valid token ids found in the current selection.',
        reSelectTokens:
          'None of the originally-selected tokens could be found. Re-select tokens and try again.',
        conditionNotFound: 'Condition id was not found.',
        gmOnly: 'Condition Tracker commands are GM-only.',
        commandFailed:
          'The command could not be completed safely. Check the API console for details.',
        sourceTokenNotFound: 'Source token could not be found.',
        targetTokenNotFound: 'Target token could not be found.',
        subjectTokenNotFound: 'Subject token could not be found.',
        invalidCondition:
          'Condition must be one of the predefined conditions or Other.',
        subjectOnlyCustom:
          '--subject is only valid for Spell, Ability, Advantage, Disadvantage, and Other.',
        subjectBypassInvalid:
          '--subjectPromptBypass expects true or false when a value is provided.',
        customDetailsRequired:
          '{condition} details are required. Use --other to provide them.',
        markerConfigFormat:
          'Marker config format is: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Marker configuration requires a predefined condition name.',
        markerNameRequired:
          'Marker configuration requires a non-empty marker name.',
        markerSet: '{condition} marker set to {marker}.',
        healthBarSet: 'Health bar set to {bar}.',
        boolSet: '{key} set to {value}.',
        expectedBoolean: 'Expected true or false.',
        invalidHealthBar:
          'Health bar must be bar1_value, bar2_value, or bar3_value.',
        markersDisabled: 'Markers are disabled.',
        noMarkerConfigured: 'No marker is configured for this condition.',
        markerApplied: 'Marker applied: {marker}',
        markerPresent: 'Marker already present: {marker}',
        langSet: 'Language set to {locale}.',
        invalidLocale: 'Invalid locale. Supported locales: {locales}.',
        otherDurationRequiresRounds:
          'Other duration requires a numeric round count, for example --duration 5 rounds.',
        invalidDuration:
          'Duration must be Until removed, an end-of-turn option, or a positive round count.',
        zeroHpNoConditions:
          '{name} has reached 0 HP and has no active conditions.',
        zeroHpConditions:
          '{name} has reached 0 HP. Choose conditions to remove:',
        removeAllBtn: 'Remove All Conditions for {name}',
        markIncapacitated: 'Mark as Incapacitated',
        removeFromTurnOrder: 'Remove from Turn Order',
        alreadyIncapacitated: '{name} is already Incapacitated.',
        tokenRemovedFromTurn: '{name} has been removed from the turn order.',
        tokenNotInTurn: '{name} was not found in the turn order.',
        moveTokenPrompt:
          "Move {name} to the map layer so it remains visible but won't interfere with other tokens?",
        moveTokenBtn: 'Move {name} to Map Layer',
        tokenMoved: '{name} has been moved to the map layer.',
        tokenNotFound: 'Token not found.',
        noActiveConditions: '{name} has no active conditions to remove.',
        deadNoConditions:
          '{name} was marked as dead. No conditions were active.',
        scriptReady: '{name} is active and you are using version {version}.',
        reachedZeroHp: '{name} reached 0 HP',
        manuallyRemoved: 'it was manually removed',
        durationExpired: 'its duration expired',
        markedAsDead: '{name} was marked as dead',
        conditionReorder:
          'The turn order changed and {count} tracked condition row(s) may now be out of place. Click below to restore them after their assigned tokens.',
        conditionsReordered:
          'Condition rows have been repositioned after their assigned tokens.',
      },
      removal: {
        conditionField: 'Condition',
        reasonField: 'Reason',
        turnRowField: 'Turn Tracker row',
        markerField: 'Marker',
        notConfigured: 'Not configured',
        markerRemoved: 'Removed ({marker})',
        markerRetained: 'Retained ({marker})',
        rowRemoved: 'Removed',
        rowMissing: 'Already missing',
        manualReason: 'Manual removal',
      },
      cleanup: {
        orphaned: 'Orphaned condition entries',
        stale: 'Stale condition entries',
        orphanedRows: 'Orphaned Turn Tracker rows',
        unusedMarkers: 'Unused markers',
      },
      apply: {
        turnAppended:
          'Target was not in turn order; condition row was appended.',
        turnInserted: 'Condition row inserted below target token.',
      },
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'D&D 5e Status Effect Manager',
      footerNote:
        'This handout is automatically created and updated each time the script loads.',
      overview: {
        heading: 'Overview',
        body: 'Condition Tracker manages D&D 5e status conditions and custom effects as labelled rows in the Roll20 Turn Tracker. Apply conditions to tokens, track durations by initiative order, and automatically remove expired effects when a turn ends. All commands are GM-only and can be triggered from chat or via the installed macros.',
      },
      quickStart: {
        heading: 'Quick Start',
        colCommand: 'Command',
        colDesc: 'Description',
        rows: [
          [
            '!condition-tracker --prompt',
            'Step-by-step wizard — pick condition, tokens & duration interactively. Also available as the ConditionTrackerWizard macro.',
          ],
          [
            '!condition-tracker --multi-target',
            'Apply one condition to several tokens simultaneously. Also available as the ConditionTrackerMultiTarget macro.',
          ],
          [
            '!condition-tracker --menu',
            'Open the main management menu with buttons to apply, review, or remove conditions.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Commands Reference',
        colFlag: 'Flag',
        colDesc: 'Description',
        rows: [
          ['--prompt', 'Interactive step-by-step wizard UI'],
          [
            '--multi-target',
            'Apply a condition to multiple target tokens at once',
          ],
          ['--menu', 'Show main menu (add remove for removal menu)'],
          [
            '--source X --target Y --condition Z',
            'Apply a condition directly without the wizard',
          ],
          [
            '--duration &lt;value&gt;',
            'Duration for a direct apply (e.g. 2 rounds)',
          ],
          [
            '--other &lt;text&gt;',
            'Custom text for Spell / Ability / Other effect types',
          ],
          [
            '--remove &lt;condition-id&gt;',
            'Remove a specific condition by its unique ID',
          ],
          [
            '--config &lt;option&gt; &lt;value&gt;',
            'Adjust configuration settings (see Config section below)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Override subjectPromptBypass for this command only (also supports --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Reconcile state — remove orphaned conditions and Turn Tracker rows',
          ],
          [
            '--reorder-conditions',
            'Manually reposition condition rows after their assigned tokens in the Turn Tracker',
          ],
          ['--reinstall-macro', 'Recreate or update the GM macros'],
          [
            '--reinstall-handout',
            'Recreate or update the localized help handout',
          ],
          [
            '--lang &lt;locale&gt;',
            "Output this command's messages in an additional locale (bilingual mode)",
          ],
          ['--help', 'Show a brief help card in chat'],
        ],
      },
      standardConditions: {
        heading: 'Standard Conditions (D&amp;D 5e)',
        colCondition: 'Condition',
      },
      customEffects: {
        heading: 'Custom Effect Types',
        colType: 'Type',
        colNotes: 'Notes',
        rows: [
          [
            '🔮 Spell',
            'Track a named spell effect — you will be prompted for the spell name',
          ],
          [
            '🎯 Ability',
            'Track a named class or racial ability — you will be prompted for the ability name',
          ],
          [
            '🍀 Advantage',
            'Record advantage granted from one token to another; grouped with the source in initiative',
          ],
          [
            '⬇️ Disadvantage',
            'Record disadvantage imposed; grouped with the source in initiative',
          ],
          [
            '📝 Other',
            'Freeform custom label — you will be prompted for a description',
          ],
        ],
      },
      durationOptions: {
        heading: 'Duration Options',
        intro:
          "The remaining count is shown in the Turn Tracker pr column and decrements when the anchor token's turn ends.",
        colOption: 'Option',
        colBehaviour: 'Behaviour',
        rows: [
          [
            'Until removed',
            'Permanent — must be removed manually via the menu or --remove',
          ],
          [
            "End of target's next turn",
            "Expires when the target token's next turn ends in initiative",
          ],
          [
            "End of source's next turn",
            "Expires when the source token's next turn ends in initiative",
          ],
          [
            '1 / 2 / 3 / 10 rounds',
            'Fixed countdown; one decrement per anchor-token turn-end',
          ],
        ],
      },
      configuration: {
        heading: 'Configuration',
        intro:
          'Use !condition-tracker --config &lt;option&gt; &lt;value&gt; or the Config button in the main menu.',
        colOption: 'Option',
        colValues: 'Values',
        colDesc: 'Description',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Apply Roll20 status markers to tokens when a condition is added',
          ],
          [
            'useIcons',
            'true / false',
            'Show short icon codes (e.g. [G]) instead of emoji in Turn Tracker rows',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Skip the optional subject-token step for Spell / Ability / Other effects',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Token bar to watch; when it drops to 0 the GM is prompted to clean up conditions',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Output language for chat messages and the help handout',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            'Override the status marker used for a specific condition (e.g. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Default Status Markers',
        colCondition: 'Condition',
        colMarker: 'Marker Name',
      },
      availableLocales: {
        heading: 'Available Translations',
        intro:
          'Use the language config option to set chat messages and the help handout to any supported locale. Short aliases are also accepted for en, zh, and pt.',
        colLocale: 'Locale',
        colLanguage: 'Language',
        colFile: 'Translation File',
      },
    },
  };

  const TRANSLATION$g = {
    conditions: {
      Grappled: {
        past: 'painissa',
        verb: 'ottaa painiin',
      },
      Restrained: {
        past: 'sidottu',
        verb: 'sitoo',
      },
      Prone: {
        past: 'kaadettu',
        verb: 'kaataa',
      },
      Poisoned: {
        past: 'myrkytetty',
        verb: 'myrkyttää',
      },
      Stunned: {
        past: 'tainnutettu',
        verb: 'tainnuttaa',
      },
      Blinded: {
        past: 'sokaistu',
        verb: 'sokaisee',
      },
      Charmed: {
        past: 'lumottu',
        verb: 'lumoaa',
      },
      Frightened: {
        past: 'pelästynyt',
        verb: 'pelästyttää',
      },
      Incapacitated: {
        past: 'toimintakyvytön',
        verb: 'tekee',
        suffix: 'toimintakyvyttömäksi',
      },
      Invisible: {
        past: 'näkymätön',
        verb: 'tekee',
        suffix: 'näkymättömäksi',
      },
      Paralyzed: {
        past: 'halvaantunut',
        verb: 'halvaannuttaa',
      },
      Petrified: {
        past: 'kivettynyt',
        verb: 'kivettää',
      },
      Unconscious: {
        past: 'tajuton',
        verb: 'tekee',
        suffix: 'tajuttomaksi',
      },
      Spell: {
        past: 'loitsun vaikutuksen alainen',
        verb: 'langettaa loitsun kohteeseen',
      },
      Ability: {
        past: 'kyvyn vaikutuksen alainen',
        verb: 'käyttää kykyä kohteeseen',
      },
      Advantage: {
        past: 'on etu',
        verb: 'antaa edun',
        noBy: true,
      },
      Disadvantage: {
        past: 'on haitta',
        verb: 'antaa haitan',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Painissa',
      Restrained: 'Sidottu',
      Prone: 'Maassa',
      Poisoned: 'Myrkytetty',
      Stunned: 'Tainnutettu',
      Blinded: 'Sokaistu',
      Charmed: 'Lumottu',
      Frightened: 'Peloissaan',
      Incapacitated: 'Toimintakyvytön',
      Invisible: 'Näkymätön',
      Paralyzed: 'Halvaantunut',
      Petrified: 'Kivettynyt',
      Unconscious: 'Tajuton',
      Spell: 'Loitsu',
      Ability: 'Kyky',
      Advantage: 'Etu',
      Disadvantage: 'Haitta',
      Other: 'Muu',
    },
    templates: {
      display: {
        custom: '{emoji} {target} vaikutuksen alainen: {effect} ({source})',
        advantage: '{emoji} {source} on etu {target}{subject} vastaan',
        disadvantage: '{emoji} {source} on haitta {target}{subject} vastaan',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} on {past}',
        standard: '{emoji} {target} {past} — {source}',
      },
      apply: {
        custom: '{source} soveltaa {effect} kohteeseen {target}.',
        advantage: '{source} on etu {target}{subject} vastaan.',
        disadvantage: '{source} on haitta {target}{subject} vastaan.',
        self: '{target} on {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} ei enää ole {effect} vaikutuksen alainen.',
        advantage: '{source} ei enää ole etu {target}{subject} vastaan.',
        disadvantage: '{source} ei enää ole haitta {target}{subject} vastaan.',
        noBy: '{target} ei enää ole {past}.',
        self: '{target} ei enää ole {past}.',
        standard: '{target} ei enää ole {past} — {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Valitse tila',
        selectSource: 'Valitse lähde-token',
        selectTarget: 'Valitse kohde-token',
        selectSubject: 'Valitse kohde',
        selectDuration: 'Valitse kesto',
        confirmTargetTitle: 'Vahvista kohdelista',
        applyEffectTitle: 'Käytä {condition}-vaikutus',
        noTokens: 'Aktiiviselta sivulta ei löydy nimettyjä tokeneita.',
        confirmIntro: 'Seuraavat tokenit saavat tilan:',
        confirmBtn: 'Vahvista kohdelista',
        enterDetails: 'Syötä vaikutuksen tiedot',
        noneBtn: 'Ei mitään',
        noneOrSourceBtn: 'Ei mitään tai käytä lähteeseen',
        subjectDesc: 'Valitse kuka tai mikä tuottaa vaikutuksen.',
        sourceDesc:
          'Valitse olento, joka luo tai tuottaa tilan tai vaikutuksen.',
        targetDesc: 'Valitse olento, joka vastaanottaa tilan tai vaikutuksen.',
        otherText: 'Mukautettu tilateksti',
        effectDetails: '{condition}-tiedot',
      },
      col: {
        players: 'Pelaajat',
        npcs: 'HMH',
        conditions: 'Tilat',
        customEffects: 'Mukautetut vaikutukset',
        permanentTurnEnd: 'Pysyvä / Vuoron loppu',
        rounds: 'Kierrokset',
        command: 'Komento',
        result: 'Tulos',
        field: 'Kenttä',
        value: 'Arvo',
        option: 'Asetus',
        condition: 'Tila',
        marker: 'Merkki',
        item: 'Kohde',
        removed: 'Poistettu',
        details: 'Tiedot',
        description: 'Kuvaus',
        scenario: 'Tilanne',
      },
      dur: {
        untilRemoved: 'Kunnes poistetaan',
        endOfTargetTurn: 'Kohteen seuraavan vuoron lopussa',
        endOfSourceTurn: 'Lähteen seuraavan vuoron lopussa',
        round1: '1 kierros',
        round2: '2 kierrosta',
        round3: '3 kierrosta',
        round10: '10 kierrosta',
        custom: 'Mukautettu',
        customPrompt: 'Kierrosten määrä',
        untilRemovedDisplay: 'Kunnes poistetaan',
        turnsRemaining: '{n} jäljellä olevaa vuoron loppua',
      },
      btn: {
        openWizard: 'Avaa ohjattu toiminto',
        openMultiTarget: 'Avaa monikohde-ohjattu toiminto',
        openRemovalList: 'Avaa poistolistaus',
        showConfig: 'Näytä asetukset',
        runCleanup: 'Suorita siivous',
        reinstallMacro: 'Asenna makro uudelleen',
        reinstallHandout: 'Asenna handout uudelleen',
        showHelp: 'Näytä ohje',
        reorderConditions: 'Järjestä tilarivit uudelleen',
      },
      title: {
        menu: 'Valikko',
        removalMenu: 'Condition Tracker — poisto',
        config: 'Asetukset',
        configTracker: 'Condition Tracker — asetukset',
        help: 'Ohje',
        applied: 'Sovellettu',
        removed: 'Tila poistettu',
        cleanup: 'Siivous valmis',
        macroReinstalled: 'Makro asennettu uudelleen',
        handoutReinstalled: 'Handout asennettu uudelleen',
        warning: 'Varoitus',
        error: 'Virhe',
        turnOrder: 'Vuorojärjestys',
        noConditions: 'Ei tiloja',
        tokenMoved: 'Token siirretty',
        markedDead: 'Merkitty kuolleeksi',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — siirretäänkö token?',
        scriptReady: 'Skripti valmis',
        conditionReorder: 'Vuorojärjestys muuttui',
      },
      heading: {
        quickActions: 'Pikavalinnat',
        settings: 'Asetukset',
        markerMappings: 'Merkkimääritykset',
        result: 'Tulos',
        info: 'Tiedot',
        commandOptions: 'Komentovaihtoehdot',
        promptUi: 'Ohjatun toiminnon käyttöliittymä',
        examples: 'Esimerkit',
        summary: 'Yhteenveto',
      },
      msg: {
        noActive: 'Aktiivisia tiloja ei seurata.',
        configReset: 'Asetukset palautettu oletuksiin.',
        unknownConfig:
          'Tuntematon asetusvaihtoehto. Käytä --config nähdäksesi tuetut asetukset.',
        macroReinstalled:
          'Makrot {wizard} ja {multiTarget} on asennettu uudelleen kaikille nykyisille GM-pelaajille.',
        handoutReinstalled: 'Ohje-handout {handout} on asennettu uudelleen.',
        duplicate:
          'Täsmälleen sama lähde, kohde, tila ja mukautettu teksti on jo aktiivinen.',
        noTargets: 'Monikohdesovellukselle ei määritetty kohde-tokeneita.',
        noSelection:
          'Valitse vähintään yksi token laudalta ennen --multi-target-komennon käyttöä.',
        invalidIds:
          'Nykyisestä valinnasta ei löydy kelvollisia token-tunnuksia.',
        reSelectTokens:
          'Yhtään alun perin valituista tokeneista ei löydy. Valitse tokenit uudelleen ja yritä uudelleen.',
        conditionNotFound: 'Tilatunnusta ei löydy.',
        gmOnly: 'Condition Tracker -komennot ovat vain GM:n käytettävissä.',
        commandFailed:
          'Komentoa ei voitu suorittaa turvallisesti. Tarkista API-konsoli lisätietoja varten.',
        sourceTokenNotFound: 'Lähde-tokenia ei löydy.',
        targetTokenNotFound: 'Kohde-tokenia ei löydy.',
        subjectTokenNotFound: 'Kohde-tokenia ei löydy.',
        invalidCondition:
          'Tilan on oltava jokin ennalta määritetyistä tiloista tai Muu.',
        subjectOnlyCustom:
          '--subject on kelvollinen vain Loitsulle, Kyvylle, Edulle, Haitalle ja Muulle.',
        subjectBypassInvalid:
          '--subjectPromptBypass odottaa arvoa true tai false.',
        customDetailsRequired:
          '{condition}-tiedot ovat pakollisia. Käytä --other antaaksesi ne.',
        markerConfigFormat:
          'Merkkimäärityksen muoto: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Merkkimääritys edellyttää ennalta määritettyä tilanimeä.',
        markerNameRequired: 'Merkkimääritys edellyttää ei-tyhjää merkin nimeä.',
        markerSet: 'Tilan {condition} merkiksi asetettu {marker}.',
        healthBarSet: 'Elämäpalkki asetettu: {bar}.',
        boolSet: '{key} asetettu arvoon {value}.',
        expectedBoolean: 'Odotettiin true tai false.',
        invalidHealthBar:
          'Elämäpalkin on oltava bar1_value, bar2_value tai bar3_value.',
        markersDisabled: 'Merkit ovat poistettu käytöstä.',
        noMarkerConfigured: 'Tälle tilalle ei ole määritetty merkkiä.',
        markerApplied: 'Merkki sovellettu: {marker}',
        markerPresent: 'Merkki on jo olemassa: {marker}',
        langSet: 'Kieleksi asetettu {locale}.',
        invalidLocale: 'Virheellinen locale. Tuetut localet: {locales}.',
        otherDurationRequiresRounds:
          'Mukautettu kesto edellyttää numeerista kierrosmäärää, esim. --duration 5 rounds.',
        invalidDuration:
          'Keston on oltava Kunnes poistetaan, vuoron loppuvaihtoehto tai positiivinen kierrosmäärä.',
        zeroHpNoConditions:
          '{name} saavutti 0 HP eikä sillä ole aktiivisia tiloja.',
        zeroHpConditions: '{name} saavutti 0 HP. Valitse poistettavat tilat:',
        removeAllBtn: 'Poista kaikki {name}-tilat',
        markIncapacitated: 'Merkitse toimintakyvyttömäksi',
        removeFromTurnOrder: 'Poista vuorojärjestyksestä',
        alreadyIncapacitated: '{name} on jo toimintakyvytön.',
        tokenRemovedFromTurn: '{name} poistettiin vuorojärjestyksestä.',
        tokenNotInTurn: '{name} ei löydy vuorojärjestyksestä.',
        moveTokenPrompt:
          'Siirretäänkö {name} karttatasolle niin, että se pysyy näkyvänä eikä häiritse muita tokeneita?',
        moveTokenBtn: 'Siirrä {name} karttatasolle',
        tokenMoved: '{name} siirrettiin karttatasolle.',
        tokenNotFound: 'Tokenia ei löydy.',
        noActiveConditions:
          '{name}:llä ei ole aktiivisia tiloja poistettavaksi.',
        deadNoConditions:
          '{name} merkittiin kuolleeksi. Aktiivisia tiloja ei ollut.',
        scriptReady: '{name} on aktiivinen ja käytät versiota {version}.',
        reachedZeroHp: '{name} saavutti 0 HP',
        manuallyRemoved: 'poistettiin manuaalisesti',
        durationExpired: 'kesto päättyi',
        markedAsDead: '{name} merkittiin kuolleeksi',
        conditionReorder:
          'Vuorojärjestys muuttui ja {count} seurattu tilarivi voi nyt olla väärässä paikassa. Palauta ne klikkaamalla alla niille kuuluvien tokeneiden jälkeen.',
        conditionsReordered:
          'Tilarivit on sijoitettu uudelleen niille kuuluvien tokeneiden jälkeen.',
      },
      removal: {
        conditionField: 'Tila',
        reasonField: 'Syy',
        turnRowField: 'Turn Tracker -rivi',
        markerField: 'Merkki',
        notConfigured: 'Ei määritetty',
        markerRemoved: 'Poistettu ({marker})',
        markerRetained: 'Säilytetty ({marker})',
        rowRemoved: 'Poistettu',
        rowMissing: 'Jo puuttuu',
        manualReason: 'Manuaalinen poisto',
      },
      cleanup: {
        orphaned: 'Orpoja tilamerkintöjä',
        stale: 'Vanhentuneita tilamerkintöjä',
        orphanedRows: 'Orpoja Turn Tracker -rivejä',
        unusedMarkers: 'Käyttämättömiä merkkejä',
      },
      apply: {
        turnAppended:
          'Kohde ei ollut vuorojärjestyksessä; tilarivi lisättiin loppuun.',
        turnInserted: 'Tilarivi lisätty kohde-tokenin alapuolelle.',
      },
    },
    handout: {
      versionLabel: 'Versio',
      subtitle: 'D&D 5e -tilavaikutusten hallinta',
      footerNote:
        'Tämä handout luodaan ja päivitetään automaattisesti aina, kun skripti latautuu.',
      overview: {
        heading: 'Yleiskatsaus',
        body: 'Condition Tracker hallitsee D&D 5e -tiloja ja mukautettuja vaikutuksia nimettyinä riveinä Roll20:n Turn Trackerissa. Sovella tiloja tokeneihin, seuraa kestoja aloitejärjestyksessä ja poista vanhentuneet vaikutukset automaattisesti vuoron päättyessä. Kaikki komennot ovat vain GM:n käytettävissä ja ne voidaan käynnistää chatissa tai asennettujen makrojen kautta.',
      },
      quickStart: {
        heading: 'Pika-aloitus',
        colCommand: 'Komento',
        colDesc: 'Kuvaus',
        rows: [
          [
            '!condition-tracker --prompt',
            'Vaiheittainen ohjattu toiminto — valitse tila, tokenit ja kesto vuorovaikutteisesti. Saatavilla myös ConditionTrackerWizard-makrona.',
          ],
          [
            '!condition-tracker --multi-target',
            'Sovella yksi tila useisiin tokeneihin samanaikaisesti. Saatavilla myös ConditionTrackerMultiTarget-makrona.',
          ],
          [
            '!condition-tracker --menu',
            'Avaa päähallinnointi valikko, jossa on painikkeet tilojen soveltamiseen, tarkasteluun tai poistamiseen.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Komentoviite',
        colFlag: 'Lippu',
        colDesc: 'Kuvaus',
        rows: [
          ['--prompt', 'Vuorovaikutteinen vaiheittainen ohjaustoiminto'],
          ['--multi-target', 'Sovella tila useisiin kohde-tokeneihin kerralla'],
          ['--menu', 'Näytä päävalikko (lisää remove poistovalikkoa varten)'],
          [
            '--source X --target Y --condition Z',
            'Sovella tila suoraan ilman ohjaustoimintoa',
          ],
          [
            '--duration &lt;arvo&gt;',
            'Kesto suoraa soveltamista varten (esim. 2 rounds)',
          ],
          [
            '--other &lt;teksti&gt;',
            'Mukautettu teksti Loitsu / Kyky / Muu -vaikutustyypeille',
          ],
          [
            '--remove &lt;condition-id&gt;',
            'Poista tietty tila sen yksilöllisellä tunnuksella',
          ],
          [
            '--config &lt;option&gt; &lt;value&gt;',
            'Muuta asetuksia (katso alla oleva Asetukset-osio)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Ohita subjectPromptBypass vain tätä komentoa varten (tukee myös --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Täsmäytä tila — poista orpot tilat ja Turn Tracker -rivit',
          ],
          [
            '--reorder-conditions',
            'Siirrä ehtoriviä manuaalisesti niille määrättyjen pelinappuloiden taakse vuorojärjestyksessä',
          ],
          ['--reinstall-macro', 'Luo GM-makrot uudelleen tai päivitä ne'],
          [
            '--reinstall-handout',
            'Luo lokalisoitu ohje-handout uudelleen tai päivitä se',
          ],
          [
            '--lang &lt;locale&gt;',
            'Tulosta tämän komennon viestit lisälocalella (kaksikielinen tila)',
          ],
          ['--help', 'Näytä lyhyt ohjekortti chatissa'],
        ],
      },
      standardConditions: {
        heading: 'Vakiotilat (D&amp;D 5e)',
        colCondition: 'Tila',
      },
      customEffects: {
        heading: 'Mukautetut vaikutustyypit',
        colType: 'Tyyppi',
        colNotes: 'Huomautukset',
        rows: [
          [
            '🔮 Loitsu',
            'Seuraa nimettyä loitsuvaikutusta — sinulta pyydetään loitsun nimi',
          ],
          [
            '🎯 Kyky',
            'Seuraa nimettyä luokka- tai rotukyvykkyyttä — sinulta pyydetään kyvyn nimi',
          ],
          [
            '🍀 Etu',
            'Kirjaa etulyöntiasema, joka annetaan tokenilta toiselle; ryhmitellään lähteen kanssa aloitejärjestyksessä',
          ],
          [
            '⬇️ Haitta',
            'Kirjaa asetettu haitta; ryhmitellään lähteen kanssa aloitejärjestyksessä',
          ],
          [
            '📝 Muu',
            'Vapaamuotoinen mukautettu tunniste — sinulta pyydetään kuvaus',
          ],
        ],
      },
      durationOptions: {
        heading: 'Kestovaihtoehdot',
        intro:
          'Jäljellä oleva laskuri näkyy Turn Trackerin pr-sarakkeessa ja pienenee ankkuri-tokenin vuoron päättyessä.',
        colOption: 'Vaihtoehto',
        colBehaviour: 'Toiminta',
        rows: [
          [
            'Kunnes poistetaan',
            'Pysyvä — on poistettava manuaalisesti valikon tai --remove-komennon kautta',
          ],
          [
            'Kohteen seuraavan vuoron lopussa',
            'Vanhenee kun kohde-tokenin seuraava vuoro päättyy aloitejärjestyksessä',
          ],
          [
            'Lähteen seuraavan vuoron lopussa',
            'Vanhenee kun lähde-tokenin seuraava vuoro päättyy aloitejärjestyksessä',
          ],
          [
            '1 / 2 / 3 / 10 kierrosta',
            'Kiinteä laskuri; yksi pienennys ankkuri-tokenin vuoron päättyessä',
          ],
        ],
      },
      configuration: {
        heading: 'Asetukset',
        intro:
          'Käytä !condition-tracker --config &lt;option&gt; &lt;value&gt; tai päävalikon Asetukset-painiketta.',
        colOption: 'Vaihtoehto',
        colValues: 'Arvot',
        colDesc: 'Kuvaus',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Lisää Roll20-tilamarkerit tokeneihin, kun tila lisätään',
          ],
          [
            'useIcons',
            'true / false',
            'Näytä lyhyet kuvakekoodit (esim. [G]) emojien sijaan Turn Tracker -riveillä',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Ohita valinnainen kohde-tokenin vaihe Loitsu / Kyky / Muu -vaikutuksille',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Seurattava tokenpalkki; kun se tippuu 0:aan, GM:ää kehotetaan siivoamaan tilat',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Chat-viestien ja ohje-handoutin tulostuskieli',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            'Korvaa tietyn tilan tilamerkki (esim. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Oletustilamarkerit',
        colCondition: 'Tila',
        colMarker: 'Merkin nimi',
      },
      availableLocales: {
        heading: 'Saatavilla olevat käännökset',
        intro:
          'Käytä language-asetusta asettaaksesi chat-viestit ja ohje-handoutin mihin tahansa tuettuun localeen. Lyhyet aliakset ovat myös hyväksyttyjä muodoille en, zh ja pt.',
        colLocale: 'Locale',
        colLanguage: 'Kieli',
        colFile: 'Käännöstiedosto',
      },
    },
  };

  const TRANSLATION$f = {
    conditions: {
      Grappled: {
        past: 'agrippé',
        verb: 'agrippe',
      },
      Restrained: {
        past: 'entravé',
        verb: 'entrave',
      },
      Prone: {
        past: 'mis à terre',
        verb: 'met',
        suffix: 'à terre',
      },
      Poisoned: {
        past: 'empoisonné',
        verb: 'empoisonne',
      },
      Stunned: {
        past: 'étourdi',
        verb: 'étourdit',
      },
      Blinded: {
        past: 'aveuglé',
        verb: 'aveugle',
      },
      Charmed: {
        past: 'charmé',
        verb: 'charme',
      },
      Frightened: {
        past: 'effrayé',
        verb: 'effraie',
      },
      Incapacitated: {
        past: 'incapacité',
        verb: 'incapacite',
      },
      Invisible: {
        past: 'invisible',
        verb: 'rend',
        suffix: 'invisible',
      },
      Paralyzed: {
        past: 'paralysé',
        verb: 'paralyse',
      },
      Petrified: {
        past: 'pétrifié',
        verb: 'pétrifie',
      },
      Unconscious: {
        past: 'inconscient',
        verb: 'rend',
        suffix: 'inconscient',
      },
      Spell: {
        past: 'affecté par un sort',
        verb: 'lance un sort sur',
      },
      Ability: {
        past: 'affecté par une capacité',
        verb: 'utilise une capacité sur',
      },
      Advantage: {
        past: 'a l’avantage',
        verb: 'accorde l’avantage à',
        noBy: true,
      },
      Disadvantage: {
        past: 'a le désavantage',
        verb: 'impose le désavantage à',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Agrippé',
      Restrained: 'Entravé',
      Prone: 'À terre',
      Poisoned: 'Empoisonné',
      Stunned: 'Étourdi',
      Blinded: 'Aveuglé',
      Charmed: 'Charmé',
      Frightened: 'Effrayé',
      Incapacitated: 'Incapacité',
      Invisible: 'Invisible',
      Paralyzed: 'Paralysé',
      Petrified: 'Pétrifié',
      Unconscious: 'Inconscient',
      Spell: 'Sort',
      Ability: 'Capacité',
      Advantage: 'Avantage',
      Disadvantage: 'Désavantage',
      Other: 'Autre',
    },
    templates: {
      display: {
        custom: '{emoji} {target} affecté par {effect} ({source})',
        advantage: '{emoji} {source} a l’avantage contre {target}{subject}',
        disadvantage:
          '{emoji} {source} a le désavantage contre {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} est {past}',
        standard: '{emoji} {target} {past} par {source}',
      },
      apply: {
        custom: '{source} applique {effect} à {target}.',
        advantage: '{source} a l’avantage contre {target}{subject}.',
        disadvantage: '{source} a le désavantage contre {target}{subject}.',
        self: '{target} est {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} n’est plus affecté par {effect}.',
        advantage: '{source} n’a plus l’avantage contre {target}{subject}.',
        disadvantage:
          '{source} n’a plus le désavantage contre {target}{subject}.',
        noBy: '{target} n’est plus {past}.',
        self: '{target} n’est plus {past}.',
        standard: '{target} n’est plus {past} par {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Sélectionner une condition',
        selectSource: 'Sélectionner le jeton source',
        selectTarget: 'Sélectionner le jeton cible',
        selectSubject: 'Sélectionner le sujet',
        selectDuration: 'Sélectionner la durée',
        confirmTargetTitle: 'Confirmer la liste de cibles',
        applyEffectTitle: 'Appliquer l’effet {condition}',
        noTokens: 'Aucun jeton nommé trouvé sur la page active.',
        confirmIntro: 'Les jetons suivants recevront la condition :',
        confirmBtn: 'Confirmer la liste de cibles',
        enterDetails: 'Saisir les détails de l’effet',
        noneBtn: 'Aucun',
        noneOrSourceBtn: 'Aucun ou appliquer à la source',
        subjectDesc: 'Sélectionnez qui ou quoi délivre l’effet.',
        sourceDesc:
          'Sélectionnez la créature qui crée ou génère la condition ou l’effet.',
        targetDesc:
          'Sélectionnez la créature qui recevra la condition ou l’effet.',
        otherText: 'Texte de condition personnalisé',
        effectDetails: 'Détails de {condition}',
      },
      col: {
        players: 'Joueurs',
        npcs: 'PNJ',
        conditions: 'Conditions',
        customEffects: 'Effets personnalisés',
        permanentTurnEnd: 'Permanent / Fin de tour',
        rounds: 'Rounds',
        command: 'Commande',
        result: 'Résultat',
        field: 'Champ',
        value: 'Valeur',
        option: 'Option',
        condition: 'Condition',
        marker: 'Marqueur',
        item: 'Élément',
        removed: 'Supprimé',
        details: 'Détails',
        description: 'Description',
        scenario: 'Scénario',
      },
      dur: {
        untilRemoved: 'Jusqu’à suppression',
        endOfTargetTurn: 'Fin du prochain tour de la cible',
        endOfSourceTurn: 'Fin du prochain tour de la source',
        round1: '1 round',
        round2: '2 rounds',
        round3: '3 rounds',
        round10: '10 rounds',
        custom: 'Personnalisé',
        customPrompt: 'Nombre de rounds',
        untilRemovedDisplay: 'Jusqu’à suppression',
        turnsRemaining: '{n} fin(s) de tour restante(s)',
      },
      btn: {
        openWizard: 'Ouvrir l’assistant',
        openMultiTarget: 'Ouvrir l’assistant multi-cibles',
        openRemovalList: 'Ouvrir la liste de suppression',
        showConfig: 'Afficher la configuration',
        runCleanup: 'Lancer le nettoyage',
        reinstallMacro: 'Réinstaller la macro',
        reinstallHandout: 'Réinstaller le livret',
        showHelp: 'Afficher l’aide',
        reorderConditions: 'Réorganiser les lignes de condition',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Suppression — Condition Tracker',
        config: 'Configuration',
        configTracker: 'Configuration — Condition Tracker',
        help: 'Aide',
        applied: 'Appliqué',
        removed: 'Condition supprimée',
        cleanup: 'Nettoyage terminé',
        macroReinstalled: 'Macro réinstallée',
        handoutReinstalled: 'Livret réinstallé',
        warning: 'Avertissement',
        error: 'Erreur',
        turnOrder: 'Ordre d’initiative',
        noConditions: 'Aucune condition',
        tokenMoved: 'Jeton déplacé',
        markedDead: 'Marqué comme mort',
        zeroHp: '{name} — 0 PV',
        moveToken: '{name} — Déplacer le jeton ?',
        scriptReady: 'Script prêt',
        conditionReorder: 'Ordre de tour modifié',
      },
      heading: {
        quickActions: 'Actions rapides',
        settings: 'Paramètres',
        markerMappings: 'Correspondances des marqueurs',
        result: 'Résultat',
        info: 'Informations',
        commandOptions: 'Options de commande',
        promptUi: 'Interface de l’assistant',
        examples: 'Exemples',
        summary: 'Résumé',
      },
      msg: {
        noActive: 'Aucune condition active n’est suivie.',
        configReset: 'Configuration réinitialisée aux valeurs par défaut.',
        unknownConfig:
          'Option de configuration inconnue. Utilisez --config pour voir les paramètres disponibles.',
        macroReinstalled:
          'Les macros {wizard} et {multiTarget} ont été réinstallées pour tous les MJ actifs.',
        handoutReinstalled: 'Le livret d’aide {handout} a été réinstallé.',
        duplicate:
          'Cette combinaison source, sujet, cible, condition et texte personnalisé est déjà active.',
        noTargets:
          'Aucun jeton cible spécifié pour l’application multi-cibles.',
        noSelection:
          'Sélectionnez au moins un jeton sur le plateau avant d’utiliser --multi-target.',
        invalidIds:
          'Aucun identifiant de jeton valide trouvé dans la sélection actuelle.',
        reSelectTokens:
          'Aucun des jetons initialement sélectionnés n’a pu être trouvé. Veuillez resélectionner les jetons et réessayer.',
        conditionNotFound: 'Identifiant de condition introuvable.',
        gmOnly: 'Les commandes de Condition Tracker sont réservées au MJ.',
        commandFailed:
          'La commande n’a pas pu être exécutée. Vérifiez la console API pour plus de détails.',
        sourceTokenNotFound: 'Le jeton source est introuvable.',
        targetTokenNotFound: 'Le jeton cible est introuvable.',
        subjectTokenNotFound: 'Le jeton sujet est introuvable.',
        invalidCondition:
          'La condition doit être une condition prédéfinie ou Autre.',
        subjectOnlyCustom:
          '--subject est uniquement valide pour Sort, Capacité, Avantage, Désavantage et Autre.',
        subjectBypassInvalid:
          '--subjectPromptBypass attend true ou false si une valeur est fournie.',
        customDetailsRequired:
          'Les détails de {condition} sont requis. Utilisez --other pour les fournir.',
        markerConfigFormat:
          'Format de configuration du marqueur : --config marker Grappled=grab',
        markerPredefinedRequired:
          'La configuration du marqueur requiert un nom de condition prédéfini.',
        markerNameRequired:
          'La configuration du marqueur requiert un nom de marqueur non vide.',
        markerSet: 'Marqueur de {condition} défini sur {marker}.',
        healthBarSet: 'Barre de santé définie sur {bar}.',
        boolSet: '{key} défini sur {value}.',
        expectedBoolean: 'true ou false est attendu.',
        invalidHealthBar:
          'La barre de santé doit être bar1_value, bar2_value ou bar3_value.',
        markersDisabled: 'Les marqueurs sont désactivés.',
        noMarkerConfigured:
          'Aucun marqueur n’est configuré pour cette condition.',
        markerApplied: 'Marqueur appliqué : {marker}',
        markerPresent: 'Marqueur déjà présent : {marker}',
        langSet: 'Langue définie sur {locale}.',
        invalidLocale: 'Locale invalide. Locales disponibles : {locales}.',
        otherDurationRequiresRounds:
          'La durée Autre requiert un nombre de rounds, par exemple --duration 5 rounds.',
        invalidDuration:
          'La durée doit être Jusqu’à suppression, une option de fin de tour ou un nombre de rounds positif.',
        zeroHpNoConditions:
          '{name} a atteint 0 PV et n’a aucune condition active.',
        zeroHpConditions:
          '{name} a atteint 0 PV. Choisissez les conditions à supprimer :',
        removeAllBtn: 'Supprimer toutes les conditions de {name}',
        markIncapacitated: 'Marquer comme Incapacité',
        removeFromTurnOrder: 'Retirer de l’ordre d’initiative',
        alreadyIncapacitated: '{name} est déjà Incapacité.',
        tokenRemovedFromTurn: '{name} a été retiré de l’ordre d’initiative.',
        tokenNotInTurn: '{name} n’a pas été trouvé dans l’ordre d’initiative.',
        moveTokenPrompt:
          'Déplacer {name} vers le calque carte pour qu’il reste visible sans interférer avec les autres jetons ?',
        moveTokenBtn: 'Déplacer {name} vers le calque carte',
        tokenMoved: '{name} a été déplacé vers le calque carte.',
        tokenNotFound: 'Jeton introuvable.',
        noActiveConditions: '{name} n’a aucune condition active à supprimer.',
        deadNoConditions:
          '{name} a été marqué comme mort. Aucune condition n’était active.',
        scriptReady: '{name} est actif et vous utilisez la version {version}.',
        reachedZeroHp: '{name} a atteint 0 PV',
        manuallyRemoved: 'suppression manuelle',
        durationExpired: 'sa durée a expiré',
        markedAsDead: '{name} a été marqué comme mort',
        conditionReorder:
          "L'ordre de tour a changé et {count} ligne(s) de condition suivie(s) peut être mal placée. Cliquez ci-dessous pour les restaurer après leurs tokens assignés.",
        conditionsReordered:
          'Les lignes de condition ont été repositionnées après leurs tokens assignés.',
      },
      removal: {
        conditionField: 'Condition',
        reasonField: 'Raison',
        turnRowField: 'Ligne d’initiative',
        markerField: 'Marqueur',
        notConfigured: 'Non configuré',
        markerRemoved: 'Supprimé ({marker})',
        markerRetained: 'Conservé ({marker})',
        rowRemoved: 'Supprimé',
        rowMissing: 'Déjà absent',
        manualReason: 'Suppression manuelle',
      },
      cleanup: {
        orphaned: 'Entrées de condition orphelines',
        stale: 'Entrées de condition obsolètes',
        orphanedRows: 'Lignes d’initiative orphelines',
        unusedMarkers: 'Marqueurs inutilisés',
      },
      apply: {
        turnAppended:
          'La cible n’était pas dans l’ordre d’initiative ; la ligne de condition a été ajoutée.',
        turnInserted: 'Ligne de condition insérée sous le jeton cible.',
      },
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'Gestionnaire d’états D&D 5e',
      footerNote:
        'Ce livret est créé et mis à jour automatiquement à chaque chargement du script.',
      overview: {
        heading: 'Présentation',
        body: 'Condition Tracker gère les conditions de statut D&D 5e et les effets personnalisés sous forme de lignes dans le suivi d’initiative Roll20. Appliquez des conditions aux jetons, suivez les durées par ordre d’initiative et supprimez automatiquement les effets expirés à la fin d’un tour. Toutes les commandes sont réservées au MJ.',
      },
      quickStart: {
        heading: 'Démarrage rapide',
        colCommand: 'Commande',
        colDesc: 'Description',
        rows: [
          [
            '!condition-tracker --prompt',
            'Assistant pas à pas — choisissez condition, jetons et durée de façon interactive. Disponible aussi via la macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Appliquer une condition à plusieurs jetons simultanément. Disponible aussi via la macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Ouvrir le menu principal pour appliquer, consulter ou supprimer des conditions.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Référence des commandes',
        colFlag: 'Option',
        colDesc: 'Description',
        rows: [
          ['--prompt', 'Interface de l’assistant pas à pas'],
          [
            '--multi-target',
            'Appliquer une condition à plusieurs jetons cibles',
          ],
          [
            '--menu',
            'Afficher le menu principal (ajouter remove pour le menu de suppression)',
          ],
          [
            '--source X --target Y --condition Z',
            'Appliquer une condition directement sans l’assistant',
          ],
          [
            '--duration &lt;valeur&gt;',
            'Durée pour une application directe (ex. 2 rounds)',
          ],
          [
            '--other &lt;texte&gt;',
            'Texte personnalisé pour les types Sort / Capacité / Autre',
          ],
          [
            '--remove &lt;id-condition&gt;',
            'Supprimer une condition spécifique par son identifiant unique',
          ],
          [
            '--config &lt;option&gt; &lt;valeur&gt;',
            'Modifier les paramètres de configuration',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Remplacer subjectPromptBypass pour cette commande uniquement (prend aussi en charge --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Nettoyer l’état — supprimer les conditions et lignes orphelines',
          ],
          [
            '--reorder-conditions',
            'Repositionner manuellement les lignes de condition après leurs jetons assignés dans l’ordre d’initiative',
          ],
          ['--reinstall-macro', 'Recréer ou mettre à jour les macros MJ'],
          [
            '--reinstall-handout',
            'Recréer ou mettre à jour le livret d’aide localisé',
          ],
          [
            '--lang &lt;locale&gt;',
            'Afficher les messages de cette commande dans une locale supplémentaire (mode bilingue)',
          ],
          ['--help', 'Afficher une carte d’aide rapide dans le chat'],
        ],
      },
      standardConditions: {
        heading: 'Conditions standard (D&D 5e)',
        colCondition: 'Condition',
      },
      customEffects: {
        heading: 'Types d’effets personnalisés',
        colType: 'Type',
        colNotes: 'Notes',
        rows: [
          [
            '🔮 Sort',
            'Suivre un effet de sort nommé — vous serez invité à saisir le nom du sort',
          ],
          [
            '🎯 Capacité',
            'Suivre une capacité de classe ou raciale — vous serez invité à saisir le nom',
          ],
          [
            '🍀 Avantage',
            'Enregistrer un avantage accordé d’un jeton à un autre ; groupé avec la source dans l’initiative',
          ],
          [
            '⬇️ Désavantage',
            'Enregistrer un désavantage imposé ; groupé avec la source dans l’initiative',
          ],
          [
            '📝 Autre',
            'Étiquette personnalisée libre — vous serez invité à saisir une description',
          ],
        ],
      },
      durationOptions: {
        heading: 'Options de durée',
        intro:
          'Le compteur restant est affiché dans la colonne pr du suivi d’initiative et décrémente à la fin du tour du jeton ancre.',
        colOption: 'Option',
        colBehaviour: 'Comportement',
        rows: [
          [
            'Jusqu’à suppression',
            'Permanent — doit être supprimé manuellement via le menu ou --remove',
          ],
          [
            'Fin du prochain tour de la cible',
            'Expire à la fin du prochain tour du jeton cible dans l’initiative',
          ],
          [
            'Fin du prochain tour de la source',
            'Expire à la fin du prochain tour du jeton source dans l’initiative',
          ],
          [
            '1 / 2 / 3 / 10 rounds',
            'Compte à rebours fixe ; un décrément par fin de tour du jeton ancre',
          ],
        ],
      },
      configuration: {
        heading: 'Configuration',
        intro:
          'Utilisez !condition-tracker --config &lt;option&gt; &lt;valeur&gt; ou le bouton Config dans le menu principal.',
        colOption: 'Option',
        colValues: 'Valeurs',
        colDesc: 'Description',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Appliquer des marqueurs de statut Roll20 aux jetons lors de l’ajout d’une condition',
          ],
          [
            'useIcons',
            'true / false',
            'Afficher des codes d’icônes courts (ex. [G]) dans les lignes du suivi d’initiative',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Ignorer l’étape sujet optionnelle pour les effets Sort / Capacité / Autre',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Barre à surveiller ; quand elle atteint 0 le MJ est invité à nettoyer les conditions',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Langue des messages de chat et du livret d’aide',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;nom du marqueur&gt;',
            'Remplacer le marqueur utilisé pour une condition spécifique (ex. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Marqueurs de statut par défaut',
        colCondition: 'Condition',
        colMarker: 'Nom du marqueur',
      },
      availableLocales: {
        heading: 'Traductions disponibles',
        intro:
          "Utilisez l'option de configuration language pour définir les messages de chat et le livret d'aide sur n'importe quelle locale prise en charge. Les alias courts sont également acceptés pour en, zh et pt.",
        colLocale: 'Locale',
        colLanguage: 'Langue',
        colFile: 'Fichier de traduction',
      },
    },
  };

  const TRANSLATION$e = {
    conditions: {
      Grappled: {
        past: 'gepackt',
        verb: 'packt',
      },
      Restrained: {
        past: 'gefesselt',
        verb: 'fesselt',
      },
      Prone: {
        past: 'niedergeworfen',
        verb: 'wirft',
        suffix: 'nieder',
      },
      Poisoned: {
        past: 'vergiftet',
        verb: 'vergiftet',
      },
      Stunned: {
        past: 'betäubt',
        verb: 'betäubt',
      },
      Blinded: {
        past: 'geblendet',
        verb: 'blendet',
      },
      Charmed: {
        past: 'bezaubert',
        verb: 'bezaubert',
      },
      Frightened: {
        past: 'verängstigt',
        verb: 'verängstigt',
      },
      Incapacitated: {
        past: 'kampfunfähig',
        verb: 'macht kampfunfähig',
      },
      Invisible: {
        past: 'unsichtbar',
        verb: 'macht',
        suffix: 'unsichtbar',
      },
      Paralyzed: {
        past: 'gelähmt',
        verb: 'lähmt',
      },
      Petrified: {
        past: 'versteinert',
        verb: 'versteinert',
      },
      Unconscious: {
        past: 'bewusstlos',
        verb: 'macht',
        suffix: 'bewusstlos',
      },
      Spell: {
        past: 'von einem Zauber betroffen',
        verb: 'wirkt einen Zauber auf',
      },
      Ability: {
        past: 'von einer Fähigkeit betroffen',
        verb: 'setzt eine Fähigkeit gegen',
      },
      Advantage: {
        past: 'hat Vorteil',
        verb: 'gewährt Vorteil für',
        noBy: true,
      },
      Disadvantage: {
        past: 'hat Nachteil',
        verb: 'verhängt Nachteil gegen',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Gepackt',
      Restrained: 'Gefesselt',
      Prone: 'Liegend',
      Poisoned: 'Vergiftet',
      Stunned: 'Betäubt',
      Blinded: 'Geblendet',
      Charmed: 'Bezaubert',
      Frightened: 'Verängstigt',
      Incapacitated: 'Kampfunfähig',
      Invisible: 'Unsichtbar',
      Paralyzed: 'Gelähmt',
      Petrified: 'Versteinert',
      Unconscious: 'Bewusstlos',
      Spell: 'Zauber',
      Ability: 'Fähigkeit',
      Advantage: 'Vorteil',
      Disadvantage: 'Nachteil',
      Other: 'Sonstiges',
    },
    templates: {
      display: {
        custom: '{emoji} {target} betroffen von {effect} ({source})',
        advantage: '{emoji} {source} hat Vorteil gegen {target}{subject}',
        disadvantage: '{emoji} {source} hat Nachteil gegen {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} ist {past}',
        standard: '{emoji} {target} {past} durch {source}',
      },
      apply: {
        custom: '{source} wendet {effect} auf {target} an.',
        advantage: '{source} hat Vorteil gegen {target}{subject}.',
        disadvantage: '{source} hat Nachteil gegen {target}{subject}.',
        self: '{target} ist {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} ist nicht mehr von {effect} betroffen.',
        advantage: '{source} hat keinen Vorteil mehr gegen {target}{subject}.',
        disadvantage:
          '{source} hat keinen Nachteil mehr gegen {target}{subject}.',
        noBy: '{target} ist nicht mehr {past}.',
        self: '{target} ist nicht mehr {past}.',
        standard: '{target} ist nicht mehr {past} durch {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Zustand wählen',
        selectSource: 'Quell-Token wählen',
        selectTarget: 'Ziel-Token wählen',
        selectSubject: 'Subjekt wählen',
        selectDuration: 'Dauer wählen',
        reinstallHandout: 'Handout neu installieren',
        confirmTargetTitle: 'Zielliste bestätigen',
        applyEffectTitle: 'Effekt {condition} anwenden',
        noTokens: 'Keine benannten Tokens auf der aktiven Seite gefunden.',
        confirmIntro: 'Die folgenden Tokens erhalten die Bedingung:',
        confirmBtn: 'Zielliste bestätigen',
        enterDetails: 'Effektdetails eingeben',
        noneBtn: 'Keines',
        noneOrSourceBtn: 'Keines oder auf Quelle anwenden',
        subjectDesc: 'Wähle aus, wer oder was den Effekt auslöst.',
        sourceDesc:
          'Wähle das Wesen, das die Bedingung oder den Effekt erzeugt.',
        targetDesc:
          'Wähle das Wesen, das die Bedingung oder den Effekt erhält.',
        otherText: 'Benutzerdefinierter Bedingungstext',
        effectDetails: 'Details zu {condition}',
      },
      col: {
        players: 'Spieler',
        npcs: 'NSC',
        conditions: 'Zustände',
        customEffects: 'Benutzerdefinierte Effekte',
        permanentTurnEnd: 'Permanent / Rundende',
        rounds: 'Runden',
        command: 'Befehl',
        result: 'Ergebnis',
        field: 'Feld',
        value: 'Wert',
        option: 'Option',
        condition: 'Zustand',
        marker: 'Marker',
        item: 'Eintrag',
        removed: 'Entfernt',
        details: 'Details',
        description: 'Beschreibung',
        scenario: 'Szenario',
      },
      dur: {
        untilRemoved: 'Bis zur Entfernung',
        endOfTargetTurn: 'Ende des nächsten Zugs des Ziels',
        endOfSourceTurn: 'Ende des nächsten Zugs der Quelle',
        round1: '1 Runde',
        round2: '2 Runden',
        round3: '3 Runden',
        round10: '10 Runden',
        custom: 'Benutzerdefiniert',
        customPrompt: 'Anzahl der Runden',
        untilRemovedDisplay: 'Bis zur Entfernung',
        turnsRemaining: '{n} verbleibende Zugende(n)',
      },
      btn: {
        openWizard: 'Assistent öffnen',
        openMultiTarget: 'Mehrfachziel-Assistent öffnen',
        openRemovalList: 'Entfernungsliste öffnen',
        showConfig: 'Konfiguration anzeigen',
        runCleanup: 'Bereinigung starten',
        reinstallMacro: 'Makro neu installieren',
        reinstallHandout: 'Handout neu installieren',
        showHelp: 'Hilfe anzeigen',
        reorderConditions: 'Bedingungszeilen neu anordnen',
      },
      title: {
        menu: 'Menü',
        removalMenu: 'Condition Tracker — Entfernen',
        config: 'Konfiguration',
        configTracker: 'Condition Tracker — Konfiguration',
        help: 'Hilfe',
        applied: 'Angewendet',
        removed: 'Zustand entfernt',
        cleanup: 'Bereinigung abgeschlossen',
        macroReinstalled: 'Makro neu installiert',
        handoutReinstalled: 'Handout neu installiert',
        warning: 'Warnung',
        error: 'Fehler',
        turnOrder: 'Rundenreihenfolge',
        noConditions: 'Keine Zustände',
        tokenMoved: 'Token verschoben',
        markedDead: 'Als tot markiert',
        zeroHp: '{name} — 0 TP',
        moveToken: '{name} — Token verschieben?',
        scriptReady: 'Skript bereit',
        conditionReorder: 'Rundenreihenfolge geändert',
      },
      heading: {
        quickActions: 'Schnellaktionen',
        settings: 'Einstellungen',
        markerMappings: 'Markerzuordnungen',
        result: 'Ergebnis',
        info: 'Informationen',
        commandOptions: 'Befehlsoptionen',
        promptUi: 'Assistent-Oberfläche',
        examples: 'Beispiele',
        summary: 'Zusammenfassung',
      },
      msg: {
        noActive: 'Es werden keine aktiven Zustände verfolgt.',
        configReset: 'Konfiguration auf Standardwerte zurückgesetzt.',
        unknownConfig:
          'Unbekannte Konfigurationsoption. Verwende --config, um unterstützte Einstellungen anzuzeigen.',
        macroReinstalled:
          'Die Makros {wizard} und {multiTarget} wurden für alle aktuellen GM-Spieler neu installiert.',
        handoutReinstalled:
          'Das Hilfe-Handout {handout} wurde neu installiert.',
        duplicate:
          'Diese exakte Kombination aus Quelle, Subjekt, Ziel, Zustand und benutzerdefiniertem Text ist bereits aktiv.',
        noTargets: 'Keine Ziel-Tokens für die Mehrfachanwendung angegeben.',
        noSelection:
          'Wähle mindestens einen Token auf dem Spielfeld aus, bevor du --multi-target verwendest.',
        invalidIds:
          'Keine gültigen Token-IDs in der aktuellen Auswahl gefunden.',
        reSelectTokens:
          'Keiner der ursprünglich ausgewählten Tokens konnte gefunden werden. Tokens neu auswählen und erneut versuchen.',
        conditionNotFound: 'Zustands-ID nicht gefunden.',
        gmOnly: 'Condition Tracker-Befehle sind nur für GMs verfügbar.',
        commandFailed:
          'Der Befehl konnte nicht sicher ausgeführt werden. Bitte API-Konsole prüfen.',
        sourceTokenNotFound: 'Quell-Token konnte nicht gefunden werden.',
        targetTokenNotFound: 'Ziel-Token konnte nicht gefunden werden.',
        subjectTokenNotFound: 'Subjekt-Token konnte nicht gefunden werden.',
        invalidCondition:
          'Der Zustand muss einer der vordefinierten Zustände oder Sonstiges sein.',
        subjectOnlyCustom:
          '--subject ist nur für Zauber, Fähigkeit, Vorteil, Nachteil und Sonstiges gültig.',
        subjectBypassInvalid:
          '--subjectPromptBypass erwartet true oder false, wenn ein Wert angegeben wird.',
        customDetailsRequired:
          'Details für {condition} sind erforderlich. Verwende --other, um sie anzugeben.',
        markerConfigFormat:
          'Marker-Konfigurationsformat: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Die Marker-Konfiguration erfordert einen vordefinierten Zustandsnamen.',
        markerNameRequired:
          'Die Marker-Konfiguration erfordert einen nicht-leeren Markernamen.',
        markerSet: 'Marker für {condition} auf {marker} gesetzt.',
        healthBarSet: 'Gesundheitsleiste auf {bar} gesetzt.',
        boolSet: '{key} auf {value} gesetzt.',
        expectedBoolean: 'true oder false erwartet.',
        invalidHealthBar:
          'Die Gesundheitsleiste muss bar1_value, bar2_value oder bar3_value sein.',
        markersDisabled: 'Marker sind deaktiviert.',
        noMarkerConfigured: 'Für diesen Zustand ist kein Marker konfiguriert.',
        markerApplied: 'Marker angewendet: {marker}',
        markerPresent: 'Marker bereits vorhanden: {marker}',
        langSet: 'Sprache auf {locale} gesetzt.',
        invalidLocale: 'Ungültige Locale. Unterstützte Locales: {locales}.',
        otherDurationRequiresRounds:
          'Die Dauer Sonstiges erfordert eine numerische Rundenzahl, zum Beispiel --duration 5 rounds.',
        invalidDuration:
          'Die Dauer muss Bis zur Entfernung, eine Zugende-Option oder eine positive Rundenzahl sein.',
        zeroHpNoConditions:
          '{name} hat 0 TP erreicht und hat keine aktiven Zustände.',
        zeroHpConditions:
          '{name} hat 0 TP erreicht. Zustände zum Entfernen auswählen:',
        removeAllBtn: 'Alle Zustände für {name} entfernen',
        markIncapacitated: 'Als kampfunfähig markieren',
        removeFromTurnOrder: 'Aus Rundenreihenfolge entfernen',
        alreadyIncapacitated: '{name} ist bereits kampfunfähig.',
        tokenRemovedFromTurn:
          '{name} wurde aus der Rundenreihenfolge entfernt.',
        tokenNotInTurn: '{name} wurde nicht in der Rundenreihenfolge gefunden.',
        moveTokenPrompt:
          '{name} auf die Kartenebene verschieben, damit es sichtbar bleibt, aber andere Tokens nicht stört?',
        moveTokenBtn: '{name} auf Kartenebene verschieben',
        tokenMoved: '{name} wurde auf die Kartenebene verschoben.',
        tokenNotFound: 'Token nicht gefunden.',
        noActiveConditions: '{name} hat keine aktiven Zustände zum Entfernen.',
        deadNoConditions:
          '{name} wurde als tot markiert. Keine Zustände waren aktiv.',
        scriptReady: '{name} ist aktiv und du verwendest Version {version}.',
        reachedZeroHp: '{name} hat 0 TP erreicht',
        manuallyRemoved: 'manuell entfernt',
        durationExpired: 'Dauer abgelaufen',
        markedAsDead: '{name} wurde als tot markiert',
        conditionReorder:
          'Die Rundenreihenfolge wurde geändert und {count} verfolgte Bedingungszeile(n) könnte(n) nun falsch platziert sein. Klicke unten, um sie hinter ihre zugewiesenen Tokens zu verschieben.',
        conditionsReordered:
          'Bedingungszeilen wurden hinter ihre zugewiesenen Tokens verschoben.',
      },
      removal: {
        conditionField: 'Zustand',
        reasonField: 'Grund',
        turnRowField: 'Rundenreihenfolge-Zeile',
        markerField: 'Marker',
        notConfigured: 'Nicht konfiguriert',
        markerRemoved: 'Entfernt ({marker})',
        markerRetained: 'Beibehalten ({marker})',
        rowRemoved: 'Entfernt',
        rowMissing: 'Bereits fehlend',
        manualReason: 'Manuelle Entfernung',
      },
      cleanup: {
        orphaned: 'Verwaiste Zustandseinträge',
        stale: 'Verältete Zustandseinträge',
        orphanedRows: 'Verwaiste Rundenreihenfolge-Zeilen',
        unusedMarkers: 'Unbenutzte Marker',
      },
      apply: {
        turnAppended:
          'Ziel war nicht in der Rundenreihenfolge; Zustandszeile wurde angehängt.',
        turnInserted: 'Zustandszeile unterhalb des Ziel-Tokens eingefügt.',
      },
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'D&D 5e Statuseffekt-Verwaltung',
      footerNote:
        'Dieses Handout wird bei jedem Skriptstart automatisch erstellt und aktualisiert.',
      overview: {
        heading: 'Übersicht',
        body: 'Condition Tracker verwaltet D&D 5e-Statuszustände und benutzerdefinierte Effekte als beschriftete Zeilen im Roll20-Rundenvählungstracker. Wende Zustände auf Tokens an, verfolge Dauern nach Initiativereihenfolge und entferne abgelaufene Effekte am Zugende automatisch. Alle Befehle sind GM-exklusiv.',
      },
      quickStart: {
        heading: 'Schnellstart',
        colCommand: 'Befehl',
        colDesc: 'Beschreibung',
        rows: [
          [
            '!condition-tracker --prompt',
            'Schritt-für-Schritt-Assistent — Zustand, Tokens und Dauer interaktiv auswählen. Auch als Makro ConditionTrackerWizard verfügbar.',
          ],
          [
            '!condition-tracker --multi-target',
            'Einen Zustand gleichzeitig auf mehrere Tokens anwenden. Auch als Makro ConditionTrackerMultiTarget verfügbar.',
          ],
          [
            '!condition-tracker --menu',
            'Hauptmenü öffnen, um Zustände anzuwenden, anzusehen oder zu entfernen.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Befehlsreferenz',
        colFlag: 'Option',
        colDesc: 'Beschreibung',
        rows: [
          ['--prompt', 'Schritt-für-Schritt-Assistent-Oberfläche'],
          ['--multi-target', 'Zustand auf mehrere Ziel-Tokens anwenden'],
          [
            '--menu',
            'Hauptmenü anzeigen (remove für Entfernungsmenü hinzufügen)',
          ],
          [
            '--source X --target Y --condition Z',
            'Zustand direkt ohne Assistenten anwenden',
          ],
          [
            '--duration &lt;Wert&gt;',
            'Dauer für direkte Anwendung (z. B. 2 rounds)',
          ],
          [
            '--other &lt;Text&gt;',
            'Benutzerdefinierter Text für Zauber / Fähigkeit / Sonstiges',
          ],
          [
            '--remove &lt;Zustands-ID&gt;',
            'Bestimmten Zustand per eindeutiger ID entfernen',
          ],
          [
            '--config &lt;Option&gt; &lt;Wert&gt;',
            'Konfigurationseinstellungen anpassen',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'subjectPromptBypass nur für diesen Befehl überschreiben (unterstützt auch --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Status bereinigen — verwaiste Zustände und Zeilen entfernen',
          ],
          [
            '--reorder-conditions',
            'Bedingungszeilen manuell hinter ihre zugewiesenen Tokens in der Rundenreihenfolge verschieben',
          ],
          ['--reinstall-macro', 'GM-Makros neu erstellen oder aktualisieren'],
          [
            '--reinstall-handout',
            'Lokalisiertes Hilfe-Handout neu erstellen oder aktualisieren',
          ],
          [
            '--lang &lt;Locale&gt;',
            'Nachrichten dieses Befehls in einer zusätzlichen Locale ausgeben (zweisprachiger Modus)',
          ],
          ['--help', 'Kurze Hilfekarte im Chat anzeigen'],
        ],
      },
      standardConditions: {
        heading: 'Standardzustände (D&D 5e)',
        colCondition: 'Zustand',
      },
      customEffects: {
        heading: 'Benutzerdefinierte Effekttypen',
        colType: 'Typ',
        colNotes: 'Hinweise',
        rows: [
          [
            '🔮 Zauber',
            'Benannten Zaubereffekt verfolgen — du wirst nach dem Zaubernamen gefragt',
          ],
          [
            '🎯 Fähigkeit',
            'Benannte Klassen- oder Rassafähigkeit verfolgen — du wirst nach dem Namen gefragt',
          ],
          [
            '🍀 Vorteil',
            'Vorteil von einem Token auf einen anderen aufzeichnen; in der Initiative mit der Quelle gruppiert',
          ],
          [
            '⬇️ Nachteil',
            'Nachteil aufzeichnen; in der Initiative mit der Quelle gruppiert',
          ],
          [
            '📝 Sonstiges',
            'Freies benutzerdefiniertes Etikett — du wirst nach einer Beschreibung gefragt',
          ],
        ],
      },
      durationOptions: {
        heading: 'Daueroptionen',
        intro:
          'Die verbleibende Anzahl wird in der pr-Spalte des Rundentracker angezeigt und verringert sich, wenn der Ankerzug des Tokens endet.',
        colOption: 'Option',
        colBehaviour: 'Verhalten',
        rows: [
          [
            'Bis zur Entfernung',
            'Dauerhaft — muss manuell über das Menü oder --remove entfernt werden',
          ],
          [
            'Ende des nächsten Zugs des Ziels',
            'Verfällt am Ende des nächsten Zugs des Ziel-Tokens',
          ],
          [
            'Ende des nächsten Zugs der Quelle',
            'Verfällt am Ende des nächsten Zugs des Quell-Tokens',
          ],
          [
            '1 / 2 / 3 / 10 Runden',
            'Fester Countdown; ein Dekrement pro Zugende des Ankertokens',
          ],
        ],
      },
      configuration: {
        heading: 'Konfiguration',
        intro:
          'Verwende !condition-tracker --config &lt;Option&gt; &lt;Wert&gt; oder die Schaltfläche Konfiguration im Hauptmenü.',
        colOption: 'Option',
        colValues: 'Werte',
        colDesc: 'Beschreibung',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Roll20-Statusmarker auf Tokens anwenden, wenn ein Zustand hinzugefügt wird',
          ],
          [
            'useIcons',
            'true / false',
            'Kurze Symbolcodes (z. B. [G]) statt Emojis in Rundentracker-Zeilen anzeigen',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Den optionalen Subjektschritt für Zauber / Fähigkeit / Sonstiges überspringen',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Zu überwachende Leiste; wenn sie auf 0 fällt, wird der GM zur Bereinigung aufgefordert',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Ausgabesprache für Chat-Nachrichten und das Hilfe-Handout',
          ],
          [
            'marker',
            '&lt;Zustand&gt;=&lt;Markername&gt;',
            'Den Marker für einen bestimmten Zustand überschreiben (z. B. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Standard-Statusmarker',
        colCondition: 'Zustand',
        colMarker: 'Markername',
      },
      availableLocales: {
        heading: 'Verfügbare Übersetzungen',
        intro:
          'Verwende die Konfigurationsoption language, um Chat-Nachrichten und das Hilfe-Handout auf eine unterstützte Locale einzustellen. Kurze Aliase werden auch für en, zh und pt akzeptiert.',
        colLocale: 'Locale',
        colLanguage: 'Sprache',
        colFile: 'Übersetzungsdatei',
      },
    },
  };

  const TRANSLATION$d = {
    conditions: {
      Grappled: {
        past: 'αρπαγμένος',
        verb: 'αρπάζει',
      },
      Restrained: {
        past: 'περιορισμένος',
        verb: 'περιορίζει',
      },
      Prone: {
        past: 'πεσμένος πρηνηδόν',
        verb: 'ρίχνει',
        suffix: 'πρηνηδόν',
      },
      Poisoned: {
        past: 'δηλητηριασμένος',
        verb: 'δηλητηριάζει',
      },
      Stunned: {
        past: 'ζαλισμένος',
        verb: 'ζαλίζει',
      },
      Blinded: {
        past: 'τυφλωμένος',
        verb: 'τυφλώνει',
      },
      Charmed: {
        past: 'γοητευμένος',
        verb: 'γοητεύει',
      },
      Frightened: {
        past: 'φοβισμένος',
        verb: 'φοβίζει',
      },
      Incapacitated: {
        past: 'ανίκανος',
        verb: 'καθιστά',
        suffix: 'ανίκανο',
      },
      Invisible: {
        past: 'αόρατος',
        verb: 'καθιστά',
        suffix: 'αόρατο',
      },
      Paralyzed: {
        past: 'παραλυμένος',
        verb: 'παραλύει',
      },
      Petrified: {
        past: 'πετρωμένος',
        verb: 'πετρώνει',
      },
      Unconscious: {
        past: 'αναίσθητος',
        verb: 'καθιστά',
        suffix: 'αναίσθητο',
      },
      Spell: {
        past: 'υπό επίδραση ξορκιού',
        verb: 'ρίχνει ξόρκι σε',
      },
      Ability: {
        past: 'υπό επίδραση ικανότητας',
        verb: 'χρησιμοποιεί ικανότητα σε',
      },
      Advantage: {
        past: 'έχει πλεονέκτημα',
        verb: 'δίνει πλεονέκτημα σε',
        noBy: true,
      },
      Disadvantage: {
        past: 'έχει μειονέκτημα',
        verb: 'επιβάλλει μειονέκτημα σε',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Αρπαγμένος',
      Restrained: 'Περιορισμένος',
      Prone: 'Πρηνής',
      Poisoned: 'Δηλητηριασμένος',
      Stunned: 'Ζαλισμένος',
      Blinded: 'Τυφλωμένος',
      Charmed: 'Γοητευμένος',
      Frightened: 'Φοβισμένος',
      Incapacitated: 'Ανίκανος',
      Invisible: 'Αόρατος',
      Paralyzed: 'Παραλυμένος',
      Petrified: 'Πετρωμένος',
      Unconscious: 'Αναίσθητος',
      Spell: 'Ξόρκι',
      Ability: 'Ικανότητα',
      Advantage: 'Πλεονέκτημα',
      Disadvantage: 'Μειονέκτημα',
      Other: 'Άλλο',
    },
    templates: {
      display: {
        custom: '{emoji} {target} υπό επίδραση {effect} ({source})',
        advantage:
          '{emoji} {source} έχει πλεονέκτημα εναντίον {target}{subject}',
        disadvantage:
          '{emoji} {source} έχει μειονέκτημα εναντίον {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} είναι {past}',
        standard: '{emoji} {target} {past} από {source}',
      },
      apply: {
        custom: '{source} εφαρμόζει {effect} στον {target}.',
        advantage: '{source} έχει πλεονέκτημα εναντίον {target}{subject}.',
        disadvantage: '{source} έχει μειονέκτημα εναντίον {target}{subject}.',
        self: '{target} είναι {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} δεν επηρεάζεται πλέον από {effect}.',
        advantage:
          '{source} δεν έχει πλέον πλεονέκτημα εναντίον {target}{subject}.',
        disadvantage:
          '{source} δεν έχει πλέον μειονέκτημα εναντίον {target}{subject}.',
        noBy: '{target} δεν είναι πλέον {past}.',
        self: '{target} δεν είναι πλέον {past}.',
        standard: '{target} δεν είναι πλέον {past} από {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Επιλογή Κατάστασης',
        selectSource: 'Επιλογή Token Πηγής',
        selectTarget: 'Επιλογή Token Στόχου',
        selectSubject: 'Επιλογή Υποκειμένου',
        selectDuration: 'Επιλογή Διάρκειας',
        confirmTargetTitle: 'Επιβεβαίωση Λίστας Στόχων',
        applyEffectTitle: 'Εφαρμογή Εφέ {condition}',
        noTokens: 'Δεν βρέθηκαν ονομαστά tokens στην ενεργή σελίδα.',
        confirmIntro: 'Τα παρακάτω tokens θα λάβουν την κατάσταση:',
        confirmBtn: 'Επιβεβαίωση λίστας στόχων',
        enterDetails: 'Εισαγωγή λεπτομερειών εφέ',
        noneBtn: 'Κανένα',
        noneOrSourceBtn: 'Κανένα ή εφαρμογή στην πηγή',
        subjectDesc: 'Επιλέξτε ποιος ή τι παράγει το εφέ.',
        sourceDesc:
          'Επιλέξτε το πλάσμα που δημιουργεί ή παράγει την κατάσταση ή το εφέ.',
        targetDesc: 'Επιλέξτε το πλάσμα που θα λάβει την κατάσταση ή το εφέ.',
        otherText: 'Προσαρμοσμένο κείμενο κατάστασης',
        effectDetails: 'Λεπτομέρειες {condition}',
      },
      col: {
        players: 'Παίκτες',
        npcs: 'ΜΠΧ',
        conditions: 'Καταστάσεις',
        customEffects: 'Προσαρμοσμένα Εφέ',
        permanentTurnEnd: 'Μόνιμο / Τέλος Γύρου',
        rounds: 'Γύροι',
        command: 'Εντολή',
        result: 'Αποτέλεσμα',
        field: 'Πεδίο',
        value: 'Τιμή',
        option: 'Επιλογή',
        condition: 'Κατάσταση',
        marker: 'Δείκτης',
        item: 'Στοιχείο',
        removed: 'Αφαιρέθηκε',
        details: 'Λεπτομέρειες',
        description: 'Περιγραφή',
        scenario: 'Σενάριο',
      },
      dur: {
        untilRemoved: 'Μέχρι αφαίρεσης',
        endOfTargetTurn: 'Τέλος επόμενης σειράς στόχου',
        endOfSourceTurn: 'Τέλος επόμενης σειράς πηγής',
        round1: '1 γύρος',
        round2: '2 γύροι',
        round3: '3 γύροι',
        round10: '10 γύροι',
        custom: 'Προσαρμοσμένο',
        customPrompt: 'Αριθμός γύρων',
        untilRemovedDisplay: 'Μέχρι αφαίρεσης',
        turnsRemaining: '{n} εναπομείναντα τέλη σειράς',
      },
      btn: {
        openWizard: 'Άνοιγμα Οδηγού',
        openMultiTarget: 'Άνοιγμα Οδηγού Πολλών Στόχων',
        openRemovalList: 'Άνοιγμα Λίστας Αφαίρεσης',
        showConfig: 'Εμφάνιση Ρυθμίσεων',
        runCleanup: 'Εκτέλεση Εκκαθάρισης',
        reinstallMacro: 'Επανεγκατάσταση Macro',
        reinstallHandout: 'Επανεγκατάσταση Handout',
        showHelp: 'Εμφάνιση Βοήθειας',
        reorderConditions: 'Αναδιάταξη Σειρών Κατάστασης',
      },
      title: {
        menu: 'Μενού',
        removalMenu: 'Condition Tracker — Αφαίρεση',
        config: 'Ρυθμίσεις',
        configTracker: 'Condition Tracker — Ρυθμίσεις',
        help: 'Βοήθεια',
        applied: 'Εφαρμόστηκε',
        removed: 'Κατάσταση Αφαιρέθηκε',
        cleanup: 'Εκκαθάριση Ολοκληρώθηκε',
        macroReinstalled: 'Το Macro Επανεγκαταστάθηκε',
        handoutReinstalled: 'Το Handout Επανεγκαταστάθηκε',
        warning: 'Προειδοποίηση',
        error: 'Σφάλμα',
        turnOrder: 'Σειρά Πρωτοβουλίας',
        noConditions: 'Καμία Κατάσταση',
        tokenMoved: 'Το Token Μετακινήθηκε',
        markedDead: 'Σημειώθηκε ως Νεκρός',
        zeroHp: '{name} — 0 ΒΖ',
        moveToken: '{name} — Μετακίνηση Token;',
        scriptReady: 'Το Script Είναι Έτοιμο',
        conditionReorder: 'Η Σειρά Πρωτοβουλίας Άλλαξε',
      },
      heading: {
        quickActions: 'Γρήγορες Ενέργειες',
        settings: 'Ρυθμίσεις',
        markerMappings: 'Αντιστοιχίσεις Δεικτών',
        result: 'Αποτέλεσμα',
        info: 'Πληροφορίες',
        commandOptions: 'Επιλογές Εντολών',
        promptUi: 'Διεπαφή Οδηγού',
        examples: 'Παραδείγματα',
        summary: 'Σύνοψη',
      },
      msg: {
        noActive: 'Δεν παρακολουθούνται ενεργές καταστάσεις.',
        configReset: 'Οι ρυθμίσεις επαναφέρθηκαν στις προεπιλογές.',
        unknownConfig:
          'Άγνωστη επιλογή ρύθμισης. Χρησιμοποιήστε --config για να δείτε τις υποστηριζόμενες ρυθμίσεις.',
        macroReinstalled:
          'Τα macros {wizard} και {multiTarget} επανεγκαταστάθηκαν για όλους τους τρέχοντες παίκτες-DM.',
        handoutReinstalled: 'Το handout βοήθειας {handout} επανεγκαταστάθηκε.',
        duplicate:
          'Αυτός ακριβώς ο συνδυασμός πηγής, υποκειμένου, στόχου, κατάστασης και προσαρμοσμένου κειμένου είναι ήδη ενεργός.',
        noTargets: 'Δεν ορίστηκαν tokens-στόχοι για πολλαπλή εφαρμογή.',
        noSelection:
          'Επιλέξτε τουλάχιστον ένα token στο ταμπλό πριν χρησιμοποιήσετε --multi-target.',
        invalidIds: 'Δεν βρέθηκαν έγκυρα IDs tokens στην τρέχουσα επιλογή.',
        reSelectTokens:
          'Κανένα από τα αρχικά επιλεγμένα tokens δεν βρέθηκε. Επαναλάβετε την επιλογή tokens και προσπαθήστε ξανά.',
        conditionNotFound: 'Το ID κατάστασης δεν βρέθηκε.',
        gmOnly: 'Οι εντολές Condition Tracker είναι αποκλειστικά για DM.',
        commandFailed:
          'Η εντολή δεν μπόρεσε να ολοκληρωθεί με ασφάλεια. Ελέγξτε την κονσόλα API για λεπτομέρειες.',
        sourceTokenNotFound: 'Το token πηγής δεν βρέθηκε.',
        targetTokenNotFound: 'Το token στόχου δεν βρέθηκε.',
        subjectTokenNotFound: 'Το token υποκειμένου δεν βρέθηκε.',
        invalidCondition:
          'Η κατάσταση πρέπει να είναι μία από τις προκαθορισμένες καταστάσεις ή Άλλο.',
        subjectOnlyCustom:
          '--subject ισχύει μόνο για Ξόρκι, Ικανότητα, Πλεονέκτημα, Μειονέκτημα και Άλλο.',
        subjectBypassInvalid:
          '--subjectPromptBypass αναμένει true ή false όταν παρέχεται τιμή.',
        customDetailsRequired:
          'Απαιτούνται λεπτομέρειες για {condition}. Χρησιμοποιήστε --other για να τις δώσετε.',
        markerConfigFormat:
          'Μορφή ρύθμισης δείκτη: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Η ρύθμιση δείκτη απαιτεί προκαθορισμένο όνομα κατάστασης.',
        markerNameRequired: 'Η ρύθμιση δείκτη απαιτεί μη κενό όνομα δείκτη.',
        markerSet: 'Ο δείκτης για {condition} ορίστηκε σε {marker}.',
        healthBarSet: 'Η μπάρα υγείας ορίστηκε σε {bar}.',
        boolSet: 'Το {key} ορίστηκε σε {value}.',
        expectedBoolean: 'Αναμένεται true ή false.',
        invalidHealthBar:
          'Η μπάρα υγείας πρέπει να είναι bar1_value, bar2_value ή bar3_value.',
        markersDisabled: 'Οι δείκτες είναι απενεργοποιημένοι.',
        noMarkerConfigured:
          'Δεν έχει ρυθμιστεί δείκτης για αυτήν την κατάσταση.',
        markerApplied: 'Ο δείκτης εφαρμόστηκε: {marker}',
        markerPresent: 'Ο δείκτης υπάρχει ήδη: {marker}',
        langSet: 'Η γλώσσα ορίστηκε σε {locale}.',
        invalidLocale: 'Μη έγκυρη locale. Υποστηριζόμενες locales: {locales}.',
        otherDurationRequiresRounds:
          'Η προσαρμοσμένη διάρκεια απαιτεί αριθμητικό πλήθος γύρων, π.χ. --duration 5 rounds.',
        invalidDuration:
          'Η διάρκεια πρέπει να είναι Μέχρι αφαίρεσης, επιλογή τέλους σειράς ή θετικός αριθμός γύρων.',
        zeroHpNoConditions:
          '{name} έφτασε στα 0 ΒΖ και δεν έχει ενεργές καταστάσεις.',
        zeroHpConditions:
          '{name} έφτασε στα 0 ΒΖ. Επιλέξτε καταστάσεις για αφαίρεση:',
        removeAllBtn: 'Αφαίρεση Όλων των Καταστάσεων για τον {name}',
        markIncapacitated: 'Σήμανση ως Ανίκανος',
        removeFromTurnOrder: 'Αφαίρεση από τη Σειρά Πρωτοβουλίας',
        alreadyIncapacitated: '{name} είναι ήδη Ανίκανος.',
        tokenRemovedFromTurn: '{name} αφαιρέθηκε από τη σειρά πρωτοβουλίας.',
        tokenNotInTurn: '{name} δεν βρέθηκε στη σειρά πρωτοβουλίας.',
        moveTokenPrompt:
          'Μετακίνηση του {name} στο επίπεδο χάρτη ώστε να παραμένει ορατό χωρίς να παρεμβάλλεται με άλλα tokens;',
        moveTokenBtn: 'Μετακίνηση {name} στο Επίπεδο Χάρτη',
        tokenMoved: '{name} μετακινήθηκε στο επίπεδο χάρτη.',
        tokenNotFound: 'Το token δεν βρέθηκε.',
        noActiveConditions: '{name} δεν έχει ενεργές καταστάσεις για αφαίρεση.',
        deadNoConditions:
          '{name} σημειώθηκε ως νεκρός. Δεν υπήρχαν ενεργές καταστάσεις.',
        scriptReady: '{name} είναι ενεργό και χρησιμοποιείτε έκδοση {version}.',
        reachedZeroHp: '{name} έφτασε στα 0 ΒΖ',
        manuallyRemoved: 'αφαιρέθηκε χειροκίνητα',
        durationExpired: 'η διάρκεια έληξε',
        markedAsDead: '{name} σημειώθηκε ως νεκρός',
        conditionReorder:
          'Η σειρά πρωτοβουλίας άλλαξε και {count} παρακολουθούμενη/ες σειρά/ές κατάστασης μπορεί να είναι εκτός θέσης. Κάντε κλικ παρακάτω για να τις επαναφέρετε μετά τα αντίστοιχα tokens.',
        conditionsReordered:
          'Οι σειρές κατάστασης επανατοποθετήθηκαν μετά τα αντίστοιχα tokens.',
      },
      removal: {
        conditionField: 'Κατάσταση',
        reasonField: 'Αιτία',
        turnRowField: 'Σειρά Turn Tracker',
        markerField: 'Δείκτης',
        notConfigured: 'Μη ρυθμισμένο',
        markerRemoved: 'Αφαιρέθηκε ({marker})',
        markerRetained: 'Διατηρήθηκε ({marker})',
        rowRemoved: 'Αφαιρέθηκε',
        rowMissing: 'Ήδη απούσα',
        manualReason: 'Χειροκίνητη αφαίρεση',
      },
      cleanup: {
        orphaned: 'Ορφανές καταχωρήσεις κατάστασης',
        stale: 'Παλιές καταχωρήσεις κατάστασης',
        orphanedRows: 'Ορφανές σειρές Turn Tracker',
        unusedMarkers: 'Αχρησιμοποίητοι δείκτες',
      },
      apply: {
        turnAppended:
          'Ο στόχος δεν ήταν στη σειρά πρωτοβουλίας· η σειρά κατάστασης προστέθηκε στο τέλος.',
        turnInserted: 'Η σειρά κατάστασης εισήχθη κάτω από το token στόχου.',
      },
    },
    handout: {
      versionLabel: 'Έκδοση',
      subtitle: 'Διαχειριστής Καταστάσεων D&D 5e',
      footerNote:
        'Αυτό το handout δημιουργείται και ενημερώνεται αυτόματα κάθε φορά που φορτώνει το script.',
      overview: {
        heading: 'Επισκόπηση',
        body: 'Το Condition Tracker διαχειρίζεται καταστάσεις D&D 5e και προσαρμοσμένα εφέ ως επονομαζόμενες σειρές στον Turn Tracker του Roll20. Εφαρμόστε καταστάσεις σε tokens, παρακολουθήστε διάρκειες κατά σειρά πρωτοβουλίας και αφαιρέστε αυτόματα τα εφέ που έληξαν όταν τελειώνει μια σειρά. Όλες οι εντολές είναι αποκλειστικά για DM και μπορούν να εκτελεστούν από το chat ή μέσω των εγκατεστημένων macros.',
      },
      quickStart: {
        heading: 'Γρήγορη Έναρξη',
        colCommand: 'Εντολή',
        colDesc: 'Περιγραφή',
        rows: [
          [
            '!condition-tracker --prompt',
            'Οδηγός βήμα-βήμα — επιλέξτε κατάσταση, tokens και διάρκεια διαδραστικά. Διατίθεται επίσης ως macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Εφαρμογή μιας κατάστασης σε πολλά tokens ταυτόχρονα. Διατίθεται επίσης ως macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Άνοιγμα του κύριου μενού διαχείρισης με κουμπιά για εφαρμογή, εξέταση ή αφαίρεση καταστάσεων.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Αναφορά Εντολών',
        colFlag: 'Σημαία',
        colDesc: 'Περιγραφή',
        rows: [
          ['--prompt', 'Διαδραστικός οδηγός βήμα-βήμα'],
          [
            '--multi-target',
            'Εφαρμογή κατάστασης σε πολλά tokens-στόχους ταυτόχρονα',
          ],
          [
            '--menu',
            'Εμφάνιση κύριου μενού (προσθέστε remove για μενού αφαίρεσης)',
          ],
          [
            '--source X --target Y --condition Z',
            'Εφαρμογή κατάστασης απευθείας χωρίς τον οδηγό',
          ],
          [
            '--duration &lt;τιμή&gt;',
            'Διάρκεια για απευθείας εφαρμογή (π.χ. 2 rounds)',
          ],
          [
            '--other &lt;κείμενο&gt;',
            'Προσαρμοσμένο κείμενο για τύπους εφέ Ξόρκι / Ικανότητα / Άλλο',
          ],
          [
            '--remove &lt;condition-id&gt;',
            'Αφαίρεση συγκεκριμένης κατάστασης με το μοναδικό της ID',
          ],
          [
            '--config &lt;option&gt; &lt;value&gt;',
            'Προσαρμογή ρυθμίσεων (βλ. ενότητα Ρυθμίσεων παρακάτω)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Παράκαμψη subjectPromptBypass μόνο για αυτήν την εντολή (υποστηρίζεται επίσης --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Εναρμόνιση κατάστασης — αφαίρεση ορφανών καταστάσεων και σειρών Turn Tracker',
          ],
          [
            '--reorder-conditions',
            'Χειροκίνητη επανατοποθέτηση γραμμών συνθηκών μετά τα εκχωρημένα τεκμήρια στη σειρά στροφών',
          ],
          ['--reinstall-macro', 'Εκ νέου δημιουργία ή ενημέρωση των GM macros'],
          [
            '--reinstall-handout',
            'Εκ νέου δημιουργία ή ενημέρωση του τοπικοποιημένου handout βοήθειας',
          ],
          [
            '--lang &lt;locale&gt;',
            'Εξαγωγή μηνυμάτων αυτής της εντολής σε πρόσθετη locale (δίγλωσση λειτουργία)',
          ],
          ['--help', 'Εμφάνιση σύντομης κάρτας βοήθειας στο chat'],
        ],
      },
      standardConditions: {
        heading: 'Τυπικές Καταστάσεις (D&amp;D 5e)',
        colCondition: 'Κατάσταση',
      },
      customEffects: {
        heading: 'Προσαρμοσμένοι Τύποι Εφέ',
        colType: 'Τύπος',
        colNotes: 'Σημειώσεις',
        rows: [
          [
            '🔮 Ξόρκι',
            'Παρακολούθηση ονομαστού εφέ ξορκιού — θα σας ζητηθεί το όνομα του ξορκιού',
          ],
          [
            '🎯 Ικανότητα',
            'Παρακολούθηση ονομαστής ικανότητας κλάσης ή φυλής — θα σας ζητηθεί το όνομά της',
          ],
          [
            '🍀 Πλεονέκτημα',
            'Καταγραφή πλεονεκτήματος που δόθηκε από ένα token σε άλλο· ομαδοποιείται με την πηγή στην πρωτοβουλία',
          ],
          [
            '⬇️ Μειονέκτημα',
            'Καταγραφή επιβληθέντος μειονεκτήματος· ομαδοποιείται με την πηγή στην πρωτοβουλία',
          ],
          [
            '📝 Άλλο',
            'Ελεύθερη προσαρμοσμένη ετικέτα — θα σας ζητηθεί περιγραφή',
          ],
        ],
      },
      durationOptions: {
        heading: 'Επιλογές Διάρκειας',
        intro:
          'Η εναπομένουσα μέτρηση εμφανίζεται στη στήλη pr του Turn Tracker και μειώνεται όταν τελειώνει η σειρά του token-αγκύρου.',
        colOption: 'Επιλογή',
        colBehaviour: 'Συμπεριφορά',
        rows: [
          [
            'Μέχρι αφαίρεσης',
            'Μόνιμο — πρέπει να αφαιρεθεί χειροκίνητα μέσω του μενού ή --remove',
          ],
          [
            'Τέλος επόμενης σειράς στόχου',
            'Λήγει όταν τελειώσει η επόμενη σειρά του token-στόχου στην πρωτοβουλία',
          ],
          [
            'Τέλος επόμενης σειράς πηγής',
            'Λήγει όταν τελειώσει η επόμενη σειρά του token-πηγής στην πρωτοβουλία',
          ],
          [
            '1 / 2 / 3 / 10 γύροι',
            'Σταθερή αντίστροφη μέτρηση· μία μείωση ανά τέλος σειράς του token-αγκύρου',
          ],
        ],
      },
      configuration: {
        heading: 'Ρυθμίσεις',
        intro:
          'Χρησιμοποιήστε !condition-tracker --config &lt;option&gt; &lt;value&gt; ή το κουμπί Ρυθμίσεις στο κύριο μενού.',
        colOption: 'Επιλογή',
        colValues: 'Τιμές',
        colDesc: 'Περιγραφή',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Εφαρμογή δεικτών κατάστασης Roll20 σε tokens όταν προστίθεται κατάσταση',
          ],
          [
            'useIcons',
            'true / false',
            'Εμφάνιση σύντομων κωδικών εικονιδίων (π.χ. [G]) αντί emoji στις σειρές Turn Tracker',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Παράλειψη του προαιρετικού βήματος υποκειμένου για εφέ Ξόρκι / Ικανότητα / Άλλο',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Μπάρα token προς παρακολούθηση· όταν πέσει στο 0 ο DM ειδοποιείται να εκκαθαρίσει καταστάσεις',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Γλώσσα εξόδου για μηνύματα chat και το handout βοήθειας',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            'Αντικατάσταση του δείκτη κατάστασης για συγκεκριμένη κατάσταση (π.χ. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Προεπιλεγμένοι Δείκτες Κατάστασης',
        colCondition: 'Κατάσταση',
        colMarker: 'Όνομα Δείκτη',
      },
      availableLocales: {
        heading: 'Διαθέσιμες Μεταφράσεις',
        intro:
          'Χρησιμοποιήστε την επιλογή ρύθμισης language για να ορίσετε τα μηνύματα chat και το handout βοήθειας σε οποιαδήποτε υποστηριζόμενη locale. Σύντομα ψευδώνυμα γίνονται επίσης δεκτά για en, zh και pt.',
        colLocale: 'Locale',
        colLanguage: 'Γλώσσα',
        colFile: 'Αρχείο Μετάφρασης',
      },
    },
  };

  const TRANSLATION$c = {
    conditions: {
      Grappled: {
        past: 'אחוז',
        verb: 'אוחז ב',
      },
      Restrained: {
        past: 'מרוסן',
        verb: 'מרסן את',
      },
      Prone: {
        past: 'שרוע',
        verb: 'מפיל את',
        suffix: 'למצב שרוע',
      },
      Poisoned: {
        past: 'מורעל',
        verb: 'מרעיל את',
      },
      Stunned: {
        past: 'המום',
        verb: 'מהמם את',
      },
      Blinded: {
        past: 'עיוור',
        verb: 'מעוור את',
      },
      Charmed: {
        past: 'מוקסם',
        verb: 'מקסים את',
      },
      Frightened: {
        past: 'מפוחד',
        verb: 'מפחיד את',
      },
      Incapacitated: {
        past: 'מנוטרל',
        verb: 'מנטרל את',
      },
      Invisible: {
        past: 'בלתי נראה',
        verb: 'הופך את',
        suffix: 'לבלתי נראה',
      },
      Paralyzed: {
        past: 'משותק',
        verb: 'משתק את',
      },
      Petrified: {
        past: 'מאובן',
        verb: 'מאבן את',
      },
      Unconscious: {
        past: 'חסר הכרה',
        verb: 'גורם ל',
        suffix: 'לאבד הכרה',
      },
      Spell: {
        past: 'מושפע מלחיש',
        verb: 'מטיל לחש על',
      },
      Ability: {
        past: 'מושפע מיכולת',
        verb: 'משתמש ביכולת על',
      },
      Advantage: {
        past: 'יש יתרון',
        verb: 'מעניק יתרון ל',
        noBy: true,
      },
      Disadvantage: {
        past: 'יש חיסרון',
        verb: 'מטיל חיסרון על',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'אחוז',
      Restrained: 'מרוסן',
      Prone: 'שרוע',
      Poisoned: 'מורעל',
      Stunned: 'המום',
      Blinded: 'עיוור',
      Charmed: 'מוקסם',
      Frightened: 'מפוחד',
      Incapacitated: 'מנוטרל',
      Invisible: 'בלתי נראה',
      Paralyzed: 'משותק',
      Petrified: 'מאובן',
      Unconscious: 'חסר הכרה',
      Spell: 'לחש',
      Ability: 'יכולת',
      Advantage: 'יתרון',
      Disadvantage: 'חיסרון',
      Other: 'אחר',
    },
    templates: {
      display: {
        custom: '{emoji} {target} מושפע מ־{effect} ({source})',
        advantage: '{emoji} ל־{source} יש יתרון נגד {target}{subject}',
        disadvantage: '{emoji} ל־{source} יש חיסרון נגד {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} {past}',
        standard: '{emoji} {target} {past} על ידי {source}',
      },
      apply: {
        custom: '{source} מחיל את {effect} על {target}.',
        advantage: 'ל־{source} יש יתרון נגד {target}{subject}.',
        disadvantage: 'ל־{source} יש חיסרון נגד {target}{subject}.',
        self: '{target} {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} אינו מושפע עוד מ־{effect}.',
        advantage: 'ל־{source} אין עוד יתרון נגד {target}{subject}.',
        disadvantage: 'ל־{source} אין עוד חיסרון נגד {target}{subject}.',
        noBy: '{target} כבר לא {past}.',
        self: '{target} כבר לא {past}.',
        standard: '{target} כבר לא {past} על ידי {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'בחר מצב',
        selectSource: 'בחר אסימון מקור',
        selectTarget: 'בחר אסימון יעד',
        selectSubject: 'בחר נושא',
        selectDuration: 'בחר משך',
        confirmTargetTitle: 'אישור רשימת יעדים',
        applyEffectTitle: 'החלת אפקט {condition}',
        noTokens: 'לא נמצאו אסימונים בעלי שם בעמוד הפעיל.',
        confirmIntro: 'האסימונים הבאים יקבלו את המצב:',
        confirmBtn: 'אשר רשימת יעדים',
        enterDetails: 'הזן פרטי אפקט',
        noneBtn: 'ללא',
        noneOrSourceBtn: 'ללא או החל על המקור',
        subjectDesc: 'בחר מי או מה מספק את האפקט.',
        sourceDesc: 'בחר את היצור שיוצר או מפעיל את המצב או האפקט.',
        targetDesc: 'בחר את היצור שיקבל את המצב או האפקט.',
        otherText: 'טקסט מצב מותאם אישית',
        effectDetails: 'פרטי {condition}',
      },
      col: {
        players: 'שחקנים',
        npcs: 'דב״שים',
        conditions: 'מצבים',
        customEffects: 'אפקטים מותאמים',
        permanentTurnEnd: 'קבוע / סוף תור',
        rounds: 'סיבובים',
        command: 'פקודה',
        result: 'תוצאה',
        field: 'שדה',
        value: 'ערך',
        option: 'אפשרות',
        condition: 'מצב',
        marker: 'סמן',
        item: 'פריט',
        removed: 'הוסר',
        details: 'פרטים',
        description: 'תיאור',
        scenario: 'תרחיש',
      },
      dur: {
        untilRemoved: 'עד להסרה',
        endOfTargetTurn: 'סוף התור הבא של היעד',
        endOfSourceTurn: 'סוף התור הבא של המקור',
        round1: 'סיבוב אחד',
        round2: '2 סיבובים',
        round3: '3 סיבובים',
        round10: '10 סיבובים',
        custom: 'מותאם אישית',
        customPrompt: 'מספר סיבובים',
        untilRemovedDisplay: 'עד להסרה',
        turnsRemaining: 'נותרו {n} סוף/י תור במעקב',
      },
      btn: {
        openWizard: 'פתח אשף',
        openMultiTarget: 'פתח אשף רב-יעדים',
        openRemovalList: 'פתח רשימת הסרה',
        showConfig: 'הצג הגדרות',
        runCleanup: 'הרץ ניקוי',
        reinstallMacro: 'התקן מאקרו מחדש',
        reinstallHandout: 'התקן דף עזרה מחדש',
        showHelp: 'הצג עזרה',
        reorderConditions: 'סדר מחדש שורות תנאי',
      },
      title: {
        menu: 'תפריט',
        removalMenu: 'הסרת מצבים',
        config: 'הגדרות',
        configTracker: 'הגדרות Condition Tracker',
        help: 'עזרה',
        applied: 'הוחל',
        removed: 'מצב הוסר',
        cleanup: 'הניקוי הושלם',
        macroReinstalled: 'המאקרו הותקן מחדש',
        handoutReinstalled: 'דף העזרה הותקן מחדש',
        warning: 'אזהרה',
        error: 'שגיאה',
        turnOrder: 'סדר תורות',
        noConditions: 'אין מצבים',
        tokenMoved: 'אסימון הועבר',
        markedDead: 'סומן כמת',
        zeroHp: '{name} — 0 נק״פ',
        moveToken: '{name} — להעביר אסימון?',
        scriptReady: 'הסקריפט מוכן',
        conditionReorder: 'סדר התורות השתנה',
      },
      heading: {
        quickActions: 'פעולות מהירות',
        settings: 'הגדרות',
        markerMappings: 'מיפוי סמנים',
        result: 'תוצאה',
        info: 'מידע',
        commandOptions: 'אפשרויות פקודה',
        promptUi: 'ממשק אשף',
        examples: 'דוגמאות',
        summary: 'סיכום',
      },
      msg: {
        noActive: 'אין מצבים פעילים במעקב.',
        configReset: 'ההגדרות אופסו לברירות המחדל של המוד.',
        unknownConfig:
          'אפשרות הגדרה לא מוכרת. השתמש ב־--config להצגת ההגדרות הנתמכות.',
        macroReinstalled:
          'המאקרואים {wizard} ו־{multiTarget} הותקנו מחדש לכל שחקני ה־GM הנוכחיים.',
        handoutReinstalled: 'דף העזרה {handout} הותקן מחדש.',
        duplicate: 'אותו מקור, נושא, יעד, מצב וטקסט מותאם כבר פעילים.',
        noTargets: 'לא צוינו אסימוני יעד להחלה מרובת יעדים.',
        noSelection: 'בחר לפחות אסימון אחד בלוח לפני שימוש ב־--multi-target.',
        invalidIds: 'לא נמצאו מזהי אסימונים תקינים בבחירה הנוכחית.',
        reSelectTokens:
          'לא ניתן למצוא את האסימונים שנבחרו במקור. בחר אותם שוב ונסה מחדש.',
        conditionNotFound: 'מזהה המצב לא נמצא.',
        gmOnly: 'פקודות Condition Tracker מיועדות ל־GM בלבד.',
        commandFailed:
          'לא ניתן להשלים את הפקודה בבטחה. בדוק את מסוף ה־API לפרטים.',
        sourceTokenNotFound: 'אסימון המקור לא נמצא.',
        targetTokenNotFound: 'אסימון היעד לא נמצא.',
        subjectTokenNotFound: 'אסימון הנושא לא נמצא.',
        invalidCondition: 'המצב חייב להיות אחד מהמצבים המוגדרים מראש או אחר.',
        subjectOnlyCustom:
          '--subject תקף רק עבור לחש, יכולת, יתרון, חיסרון ואחר.',
        subjectBypassInvalid:
          '--subjectPromptBypass מצפה ל־true או false כאשר מסופק ערך.',
        customDetailsRequired:
          'נדרשים פרטי {condition}. השתמש ב־--other כדי לספק אותם.',
        markerConfigFormat: 'תבנית הגדרת סמן: --config marker Grappled=grab',
        markerPredefinedRequired: 'הגדרת סמן דורשת שם מצב מוגדר מראש.',
        markerNameRequired: 'הגדרת סמן דורשת שם סמן שאינו ריק.',
        markerSet: 'הסמן של {condition} הוגדר ל־{marker}.',
        healthBarSet: 'סרגל הבריאות הוגדר ל־{bar}.',
        boolSet: '{key} הוגדר ל־{value}.',
        expectedBoolean: 'נדרש true או false.',
        invalidHealthBar:
          'סרגל הבריאות חייב להיות bar1_value, bar2_value או bar3_value.',
        markersDisabled: 'הסמנים מושבתים.',
        noMarkerConfigured: 'לא מוגדר סמן עבור מצב זה.',
        markerApplied: 'סמן הוחל: {marker}',
        markerPresent: 'הסמן כבר קיים: {marker}',
        langSet: 'השפה הוגדרה ל־{locale}.',
        invalidLocale: 'אזור שפה לא תקין. אזורי שפה נתמכים: {locales}.',
        otherDurationRequiresRounds:
          'משך אחר דורש מספר סיבובים, לדוגמה --duration 5 rounds.',
        invalidDuration:
          'משך חייב להיות עד להסרה, אפשרות סוף תור או מספר סיבובים חיובי.',
        zeroHpNoConditions: '{name} הגיע ל־0 נק״פ ואין לו מצבים פעילים.',
        zeroHpConditions: '{name} הגיע ל־0 נק״פ. בחר מצבים להסרה:',
        removeAllBtn: 'הסר את כל המצבים של {name}',
        markIncapacitated: 'סמן כמנוטרל',
        removeFromTurnOrder: 'הסר מסדר התורות',
        alreadyIncapacitated: '{name} כבר מנוטרל.',
        tokenRemovedFromTurn: '{name} הוסר מסדר התורות.',
        tokenNotInTurn: '{name} לא נמצא בסדר התורות.',
        moveTokenPrompt:
          'להעביר את {name} לשכבת המפה כדי שיישאר גלוי בלי להפריע לאסימונים אחרים?',
        moveTokenBtn: 'העבר את {name} לשכבת המפה',
        tokenMoved: '{name} הועבר לשכבת המפה.',
        tokenNotFound: 'אסימון לא נמצא.',
        noActiveConditions: 'ל־{name} אין מצבים פעילים להסרה.',
        deadNoConditions: '{name} סומן כמת. לא היו מצבים פעילים.',
        scriptReady: '{name} פעיל ואתה משתמש בגרסה {version}.',
        reachedZeroHp: '{name} הגיע ל־0 נק״פ',
        manuallyRemoved: 'הוסר ידנית',
        durationExpired: 'משך הזמן שלו פג',
        markedAsDead: '{name} סומן כמת',
        conditionReorder:
          'סדר התורות השתנה ו-{count} שורת/שורות תנאי עקובות עשויות להיות כעת במיקום שגוי. לחץ למטה כדי לשחזר אותן אחרי הטוקנים שהוקצו להן.',
        conditionsReordered: 'שורות התנאי מוקמו מחדש אחרי הטוקנים שהוקצו להן.',
      },
      removal: {
        conditionField: 'מצב',
        reasonField: 'סיבה',
        turnRowField: 'שורת סדר תורות',
        markerField: 'סמן',
        notConfigured: 'לא מוגדר',
        markerRemoved: 'הוסר ({marker})',
        markerRetained: 'נשמר ({marker})',
        rowRemoved: 'הוסר',
        rowMissing: 'כבר חסר',
        manualReason: 'הסרה ידנית',
      },
      cleanup: {
        orphaned: 'רשומות מצב יתומות',
        stale: 'רשומות מצב מיושנות',
        orphanedRows: 'שורות סדר תורות יתומות',
        unusedMarkers: 'סמנים שאינם בשימוש',
      },
      apply: {
        turnAppended: 'היעד לא היה בסדר התורות; שורת המצב נוספה.',
        turnInserted: 'שורת המצב נוספה מתחת לאסימון היעד.',
      },
    },
    handout: {
      versionLabel: 'גרסה',
      subtitle: 'מנהל אפקטי מצב ל־D&D 5e',
      footerNote: 'דף עזרה זה נוצר ומתעדכן אוטומטית בכל טעינת הסקריפט.',
      overview: {
        heading: 'סקירה',
        body: 'Condition Tracker מנהל מצבי D&D 5e ואפקטים מותאמים כשורות מתויגות ב־Roll20 Turn Tracker. אפשר להחיל מצבים על אסימונים, לעקוב אחר משכים לפי סדר יוזמה ולהסיר אוטומטית אפקטים שפג תוקפם בסוף תור. כל הפקודות מיועדות ל־GM בלבד.',
      },
      quickStart: {
        heading: 'התחלה מהירה',
        colCommand: 'פקודה',
        colDesc: 'תיאור',
        rows: [
          [
            '!condition-tracker --prompt',
            'אשף שלב אחר שלב לבחירת מצב, אסימונים ומשך באופן אינטראקטיבי.',
          ],
          [
            '!condition-tracker --multi-target',
            'החלת מצב אחד על כמה אסימונים בו־זמנית.',
          ],
          [
            '!condition-tracker --menu',
            'פתיחת תפריט הניהול הראשי להחלה, בדיקה או הסרה של מצבים.',
          ],
        ],
      },
      commandsRef: {
        heading: 'פקודות',
        colFlag: 'דגל',
        colDesc: 'תיאור',
        rows: [
          ['--prompt', 'ממשק אשף אינטראקטיבי'],
          ['--multi-target', 'החלת מצב על כמה יעדים'],
          ['--menu', 'הצגת התפריט הראשי'],
          ['--source X --target Y --condition Z', 'החלת מצב ישירות ללא אשף'],
          ['--duration &lt;value&gt;', 'משך להחלה ישירה'],
          ['--other &lt;text&gt;', 'טקסט מותאם לאפקטים מותאמים'],
          ['--remove &lt;condition-id&gt;', 'הסרת מצב לפי מזהה'],
          ['--config &lt;option&gt; &lt;value&gt;', 'עדכון הגדרות'],
          [
            '--prompt --subjectPromptBypass true|false',
            'עקיפת שלב הנושא לפקודה זו בלבד',
          ],
          ['--cleanup', 'ניקוי רשומות ושורות יתומות'],
          [
            '--reorder-conditions',
            'מיקום מחדש ידני של שורות תנאי אחרי הטוקנים המוקצים בסדר התורות',
          ],
          ['--reinstall-macro', 'יצירה או עדכון של מאקרואים ל־GM'],
          ['--reinstall-handout', 'יצירה או עדכון של דף העזרה המקומי'],
          ['--lang &lt;locale&gt;', 'פלט נוסף באזור שפה אחר'],
          ['--help', 'הצגת כרטיס עזרה קצר בצ׳אט'],
        ],
      },
      standardConditions: {
        heading: 'מצבים רגילים (D&D 5e)',
        colCondition: 'מצב',
      },
      customEffects: {
        heading: 'סוגי אפקטים מותאמים',
        colType: 'סוג',
        colNotes: 'הערות',
        rows: [
          ['🔮 לחש', 'מעקב אחר אפקט לחש בשם'],
          ['🎯 יכולת', 'מעקב אחר יכולת מקצוע או גזע בשם'],
          ['🍀 יתרון', 'רישום יתרון מאסימון אחד לאחר'],
          ['⬇️ חיסרון', 'רישום חיסרון שהוטל'],
          ['📝 אחר', 'תווית מותאמת חופשית'],
        ],
      },
      durationOptions: {
        heading: 'אפשרויות משך',
        intro:
          'הספירה שנותרה מוצגת בעמודת pr של מעקב התורות ופוחתת בסוף תור אסימון העוגן.',
        colOption: 'אפשרות',
        colBehaviour: 'התנהגות',
        rows: [
          ['עד להסרה', 'קבוע עד להסרה ידנית'],
          ['סוף התור הבא של היעד', 'פג בסוף התור הבא של אסימון היעד'],
          ['סוף התור הבא של המקור', 'פג בסוף התור הבא של אסימון המקור'],
          ['1 / 2 / 3 / 10 סיבובים', 'ספירה קבועה לאחור'],
        ],
      },
      configuration: {
        heading: 'הגדרות',
        intro:
          'השתמש ב־!condition-tracker --config &lt;option&gt; &lt;value&gt; או בכפתור ההגדרות בתפריט הראשי.',
        colOption: 'אפשרות',
        colValues: 'ערכים',
        colDesc: 'תיאור',
        rows: [
          [
            'useMarkers',
            'true / false',
            'החלת סמני סטטוס של Roll20 על אסימונים',
          ],
          ['useIcons', 'true / false', 'הצגת קודי אייקון קצרים במקום אימוג׳י'],
          [
            'subjectPromptBypass',
            'true / false',
            'דילוג על שלב הנושא האופציונלי',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'סרגל בריאות למעקב',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'שפת הודעות הצ׳אט ודף העזרה',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            'החלפת הסמן למצב מסוים (לדוגמה marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'סמני סטטוס ברירת מחדל',
        colCondition: 'מצב',
        colMarker: 'שם סמן',
      },
      availableLocales: {
        heading: 'תרגומים זמינים',
        intro:
          "השתמש באפשרות הגדרת language כדי לקבוע את הודעות הצ'אט וחוברת העזרה בכל locale נתמך. כינויים קצרים מקובלים גם עבור en, zh ו-pt.",
        colLocale: 'Locale',
        colLanguage: 'שפה',
        colFile: 'קובץ תרגום',
      },
    },
  };

  const TRANSLATION$b = {
    conditions: {
      Grappled: {
        past: 'megragadva',
        verb: 'megragadja',
      },
      Restrained: {
        past: 'lefogva',
        verb: 'lefogja',
      },
      Prone: {
        past: 'földre döntve',
        verb: 'földre dönti',
      },
      Poisoned: {
        past: 'megmérgezve',
        verb: 'megmérgezi',
      },
      Stunned: {
        past: 'kábult',
        verb: 'elkábítja',
      },
      Blinded: {
        past: 'megvakítva',
        verb: 'megvakítja',
      },
      Charmed: {
        past: 'elbájolva',
        verb: 'elbájolja',
      },
      Frightened: {
        past: 'megrémülve',
        verb: 'megrémíti',
      },
      Incapacitated: {
        past: 'cselekvőképtelen',
        verb: 'cselekvőképtelenné teszi',
      },
      Invisible: {
        past: 'láthatatlan',
        verb: 'láthatatlanná teszi',
      },
      Paralyzed: {
        past: 'megbénítva',
        verb: 'megbénítja',
      },
      Petrified: {
        past: 'kővé dermedve',
        verb: 'kővé dermeszti',
      },
      Unconscious: {
        past: 'eszméletlen',
        verb: 'eszméletlenné teszi',
      },
      Spell: {
        past: 'varázslat hatása alatt',
        verb: 'varázslatot mond',
      },
      Ability: {
        past: 'képesség hatása alatt',
        verb: 'képességet használ',
      },
      Advantage: {
        past: 'előnye van',
        verb: 'előnyt ad',
        noBy: true,
      },
      Disadvantage: {
        past: 'hátránya van',
        verb: 'hátrányt ad',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Megragadva',
      Restrained: 'Lefogva',
      Prone: 'Földön',
      Poisoned: 'Mérgezett',
      Stunned: 'Kábult',
      Blinded: 'Vak',
      Charmed: 'Elbájolt',
      Frightened: 'Rémült',
      Incapacitated: 'Cselekvőképtelen',
      Invisible: 'Láthatatlan',
      Paralyzed: 'Bénult',
      Petrified: 'Megkövült',
      Unconscious: 'Eszméletlen',
      Spell: 'Varázslat',
      Ability: 'Képesség',
      Advantage: 'Előny',
      Disadvantage: 'Hátrány',
      Other: 'Egyéb',
    },
    templates: {
      display: {
        custom: '{emoji} {target} {effect} hatása alatt ({source})',
        advantage: '{emoji} {source} előnnyel támad {target}{subject} ellen',
        disadvantage:
          '{emoji} {source} hátránnyal támad {target}{subject} ellen',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} {past}',
        standard: '{emoji} {target} {past} — {source}',
      },
      apply: {
        custom: '{source} alkalmazza a(z) {effect} hatást {target} célpontra.',
        advantage: '{source} előnnyel támad {target}{subject} ellen.',
        disadvantage: '{source} hátránnyal támad {target}{subject} ellen.',
        self: '{target} {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} már nem áll {effect} hatása alatt.',
        advantage:
          '{source} már nem rendelkezik előnnyel {target}{subject} ellen.',
        disadvantage:
          '{source} már nem rendelkezik hátránnyal {target}{subject} ellen.',
        noBy: '{target} már nem {past}.',
        self: '{target} már nem {past}.',
        standard: '{target} már nem {past} — {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Állapot kiválasztása',
        selectSource: 'Forrás token kiválasztása',
        selectTarget: 'Célpont token kiválasztása',
        selectSubject: 'Alany kiválasztása',
        selectDuration: 'Időtartam kiválasztása',
        confirmTargetTitle: 'Célpontlista megerősítése',
        applyEffectTitle: '{condition} hatás alkalmazása',
        noTokens: 'Nem található nevesített token az aktív oldalon.',
        confirmIntro: 'A következő tokenek kapják meg az állapotot:',
        confirmBtn: 'Célpontlista megerősítése',
        enterDetails: 'Hatás részleteinek megadása',
        noneBtn: 'Egyik sem',
        noneOrSourceBtn: 'Egyik sem vagy alkalmazás a forrásra',
        subjectDesc: 'Válassza ki, ki vagy mi hozza létre a hatást.',
        sourceDesc:
          'Válassza ki azt a lényt, amely létrehozza vagy előidézi az állapotot vagy hatást.',
        targetDesc:
          'Válassza ki azt a lényt, amely megkapja az állapotot vagy hatást.',
        otherText: 'Egyéni állapotszöveg',
        effectDetails: '{condition} részletei',
      },
      col: {
        players: 'Játékosok',
        npcs: 'NJK-k',
        conditions: 'Állapotok',
        customEffects: 'Egyéni hatások',
        permanentTurnEnd: 'Állandó / Kör vége',
        rounds: 'Körök',
        command: 'Parancs',
        result: 'Eredmény',
        field: 'Mező',
        value: 'Érték',
        option: 'Beállítás',
        condition: 'Állapot',
        marker: 'Jelölő',
        item: 'Elem',
        removed: 'Eltávolítva',
        details: 'Részletek',
        description: 'Leírás',
        scenario: 'Forgatókönyv',
      },
      dur: {
        untilRemoved: 'Eltávolításig',
        endOfTargetTurn: 'A célpont következő körének végén',
        endOfSourceTurn: 'A forrás következő körének végén',
        round1: '1 kör',
        round2: '2 kör',
        round3: '3 kör',
        round10: '10 kör',
        custom: 'Egyéni',
        customPrompt: 'Körök száma',
        untilRemovedDisplay: 'Eltávolításig',
        turnsRemaining: '{n} fennmaradó körjegy',
      },
      btn: {
        openWizard: 'Varázsló megnyitása',
        openMultiTarget: 'Többcélpontos varázsló megnyitása',
        openRemovalList: 'Eltávolítási lista megnyitása',
        showConfig: 'Beállítások megjelenítése',
        runCleanup: 'Tisztítás futtatása',
        reinstallMacro: 'Makró újratelepítése',
        reinstallHandout: 'Handout újratelepítése',
        showHelp: 'Súgó megjelenítése',
        reorderConditions: 'Állapotsorok átrendezése',
      },
      title: {
        menu: 'Menü',
        removalMenu: 'Condition Tracker — eltávolítás',
        config: 'Beállítások',
        configTracker: 'Condition Tracker — beállítások',
        help: 'Súgó',
        applied: 'Alkalmazva',
        removed: 'Állapot eltávolítva',
        cleanup: 'Tisztítás kész',
        macroReinstalled: 'Makró újratelepítve',
        handoutReinstalled: 'Handout újratelepítve',
        warning: 'Figyelmeztetés',
        error: 'Hiba',
        turnOrder: 'Körsorend',
        noConditions: 'Nincsenek állapotok',
        tokenMoved: 'Token áthelyezve',
        markedDead: 'Halottnak jelölve',
        zeroHp: '{name} — 0 ÉP',
        moveToken: '{name} — token áthelyezése?',
        scriptReady: 'Szkript kész',
        conditionReorder: 'Körsorend megváltozott',
      },
      heading: {
        quickActions: 'Gyorsműveletek',
        settings: 'Beállítások',
        markerMappings: 'Jelölő-hozzárendelések',
        result: 'Eredmény',
        info: 'Információ',
        commandOptions: 'Parancsbeállítások',
        promptUi: 'Varázsló felülete',
        examples: 'Példák',
        summary: 'Összefoglalás',
      },
      msg: {
        noActive: 'Nincs aktív követett állapot.',
        configReset: 'A beállítások visszaálltak az alapértelmezett értékekre.',
        unknownConfig:
          'Ismeretlen beállítási lehetőség. Használja a --config parancsot a támogatott beállítások megtekintéséhez.',
        macroReinstalled:
          'A(z) {wizard} és {multiTarget} makrók újra lettek telepítve az összes jelenlegi GM-játékos számára.',
        handoutReinstalled: 'A(z) {handout} súgó-handout újra lett telepítve.',
        duplicate:
          'Pontosan ugyanez a forrás, alany, célpont, állapot és egyéni szöveg már aktív.',
        noTargets:
          'Nem adtak meg célpont tokeneket a többcélpontos alkalmazáshoz.',
        noSelection:
          'Jelöljön ki legalább egy tokent a táblán a --multi-target használata előtt.',
        invalidIds:
          'Nem találhatók érvényes token-azonosítók a jelenlegi kijelölésben.',
        reSelectTokens:
          'Az eredetileg kijelölt tokenek egyike sem található. Jelölje ki újra a tokeneket, és próbálja újra.',
        conditionNotFound: 'Az állapot azonosítója nem található.',
        gmOnly: 'A Condition Tracker parancsai csak a GM számára érhetők el.',
        commandFailed:
          'A parancs nem hajtható végre biztonságosan. Ellenőrizze az API-konzolt a részletekért.',
        sourceTokenNotFound: 'A forrás token nem található.',
        targetTokenNotFound: 'A célpont token nem található.',
        subjectTokenNotFound: 'Az alany token nem található.',
        invalidCondition:
          'Az állapotnak az előre meghatározott állapotok egyikének vagy az Egyébnek kell lennie.',
        subjectOnlyCustom:
          'A --subject csak Varázslat, Képesség, Előny, Hátrány és Egyéb esetén érvényes.',
        subjectBypassInvalid:
          'A --subjectPromptBypass értékként true vagy false értéket vár.',
        customDetailsRequired:
          'A(z) {condition} részletei kötelezők. Adja meg őket a --other kapcsolóval.',
        markerConfigFormat:
          'Jelölő-beállítás formátuma: --config marker Grappled=grab',
        markerPredefinedRequired:
          'A jelölő konfigurálásához előre meghatározott állapotnév szükséges.',
        markerNameRequired:
          'A jelölő konfigurálásához nem üres jelölőnév szükséges.',
        markerSet: 'A(z) {condition} jelölője {marker} értékre állítva.',
        healthBarSet: 'Az életerő sáv {bar} értékre állítva.',
        boolSet: 'A(z) {key} {value} értékre állítva.',
        expectedBoolean: 'True vagy false értéket várunk.',
        invalidHealthBar:
          'Az életerő sávnak bar1_value, bar2_value vagy bar3_value értékűnek kell lennie.',
        markersDisabled: 'A jelölők le vannak tiltva.',
        noMarkerConfigured: 'Ehhez az állapothoz nincs jelölő konfigurálva.',
        markerApplied: 'Jelölő alkalmazva: {marker}',
        markerPresent: 'A jelölő már jelen van: {marker}',
        langSet: 'A nyelv {locale} értékre állítva.',
        invalidLocale: 'Érvénytelen locale. Támogatott locale-k: {locales}.',
        otherDurationRequiresRounds:
          'Az egyéni időtartamhoz numerikus körmegjelölés szükséges, például --duration 5 rounds.',
        invalidDuration:
          'Az időtartamnak Eltávolításig, kör-végi beállítás vagy pozitív körszám kell lennie.',
        zeroHpNoConditions: '{name} 0 ÉP-re jutott, és nincs aktív állapota.',
        zeroHpConditions:
          '{name} 0 ÉP-re jutott. Válassza ki az eltávolítandó állapotokat:',
        removeAllBtn: 'Minden állapot eltávolítása ({name})',
        markIncapacitated: 'Megjelölés cselekvőképtelenként',
        removeFromTurnOrder: 'Eltávolítás a körsorendből',
        alreadyIncapacitated: '{name} már cselekvőképtelen.',
        tokenRemovedFromTurn: '{name} eltávolítva a körsorendből.',
        tokenNotInTurn: '{name} nem található a körsorendben.',
        moveTokenPrompt:
          '{name} áthelyezése a térképrétegre, hogy látható maradjon, de ne zavarja a többi tokent?',
        moveTokenBtn: '{name} áthelyezése a térképrétegre',
        tokenMoved: '{name} áthelyezve a térképrétegre.',
        tokenNotFound: 'A token nem található.',
        noActiveConditions:
          '{name}-nek nincsenek aktív állapotai az eltávolításhoz.',
        deadNoConditions:
          '{name} halottnak lett jelölve. Nem volt aktív állapot.',
        scriptReady: '{name} aktív, és a(z) {version} verziót használja.',
        reachedZeroHp: '{name} elérte a 0 ÉP-t',
        manuallyRemoved: 'kézzel eltávolítva',
        durationExpired: 'az időtartam lejárt',
        markedAsDead: '{name} halottnak lett jelölve',
        conditionReorder:
          'A körsorend megváltozott, és {count} követett állapotsor lehet rossz helyen. Kattintson alább a visszaállításhoz a hozzárendelt tokenek után.',
        conditionsReordered:
          'Az állapotsorok vissza lettek helyezve a hozzárendelt tokenek mögé.',
      },
      removal: {
        conditionField: 'Állapot',
        reasonField: 'Ok',
        turnRowField: 'Turn Tracker sor',
        markerField: 'Jelölő',
        notConfigured: 'Nincs konfigurálva',
        markerRemoved: 'Eltávolítva ({marker})',
        markerRetained: 'Megőrizve ({marker})',
        rowRemoved: 'Eltávolítva',
        rowMissing: 'Már hiányzik',
        manualReason: 'Kézi eltávolítás',
      },
      cleanup: {
        orphaned: 'Árva állapotbejegyzések',
        stale: 'Elavult állapotbejegyzések',
        orphanedRows: 'Árva Turn Tracker sorok',
        unusedMarkers: 'Nem használt jelölők',
      },
      apply: {
        turnAppended:
          'A célpont nem volt a körsorendben; az állapotsor hozzáfűzve a végéhez.',
        turnInserted: 'Az állapotsor a célpont token alá lett illesztve.',
      },
    },
    handout: {
      versionLabel: 'Verzió',
      subtitle: 'D&D 5e állapothatás-kezelő',
      footerNote:
        'Ez a handout automatikusan létrejön és frissül minden alkalommal, amikor a szkript betöltődik.',
      overview: {
        heading: 'Áttekintés',
        body: 'A Condition Tracker D&D 5e állapotokat és egyéni hatásokat kezel megnevezett sorokként a Roll20 Turn Trackerben. Alkalmazzon állapotokat tokenekre, kövesse nyomon az időtartamokat iniciativa-sorrend szerint, és automatikusan távolítsa el a lejárt hatásokat a kör végén. Minden parancs csak a GM számára érhető el, és chatből vagy a telepített makrók révén indítható.',
      },
      quickStart: {
        heading: 'Gyors kezdés',
        colCommand: 'Parancs',
        colDesc: 'Leírás',
        rows: [
          [
            '!condition-tracker --prompt',
            'Lépésről lépésre haladó varázsló — válasszon állapotot, tokeneket és időtartamot interaktívan. Elérhető ConditionTrackerWizard makróként is.',
          ],
          [
            '!condition-tracker --multi-target',
            'Egy állapot alkalmazása több tokenre egyszerre. Elérhető ConditionTrackerMultiTarget makróként is.',
          ],
          [
            '!condition-tracker --menu',
            'A fő kezelési menü megnyitása gombokkal az állapotok alkalmazásához, megtekintéséhez vagy eltávolításához.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Parancsreferencia',
        colFlag: 'Kapcsoló',
        colDesc: 'Leírás',
        rows: [
          ['--prompt', 'Interaktív lépésről lépésre haladó varázsló'],
          [
            '--multi-target',
            'Állapot alkalmazása több célpont tokenre egyszerre',
          ],
          [
            '--menu',
            'Főmenü megjelenítése (add remove az eltávolítási menühöz)',
          ],
          [
            '--source X --target Y --condition Z',
            'Állapot közvetlen alkalmazása varázsló nélkül',
          ],
          [
            '--duration &lt;érték&gt;',
            'Időtartam közvetlen alkalmazáshoz (pl. 2 rounds)',
          ],
          [
            '--other &lt;szöveg&gt;',
            'Egyéni szöveg Varázslat / Képesség / Egyéb hatástípusokhoz',
          ],
          [
            '--remove &lt;condition-id&gt;',
            'Adott állapot eltávolítása az egyedi azonosítójával',
          ],
          [
            '--config &lt;option&gt; &lt;value&gt;',
            'Konfigurációs beállítások módosítása (lásd lent a Beállítások részt)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'A subjectPromptBypass felülbírálása csak erre a parancsra (a --subject-prompt-bypass is támogatott)',
          ],
          [
            '--cleanup',
            'Állapot egyeztetése — árva állapotok és Turn Tracker sorok eltávolítása',
          ],
          [
            '--reorder-conditions',
            'Feltétel sorok kézi átrendezése a hozzárendelt tokenek mögé a körsorrendben',
          ],
          ['--reinstall-macro', 'GM makrók újralétrehozása vagy frissítése'],
          [
            '--reinstall-handout',
            'A lokalizált súgó-handout újralétrehozása vagy frissítése',
          ],
          [
            '--lang &lt;locale&gt;',
            'A parancs üzeneteinek kimenete egy további locale-n (kétnyelvű mód)',
          ],
          ['--help', 'Rövid súgókártya megjelenítése a chatben'],
        ],
      },
      standardConditions: {
        heading: 'Szabványos állapotok (D&amp;D 5e)',
        colCondition: 'Állapot',
      },
      customEffects: {
        heading: 'Egyéni hatástípusok',
        colType: 'Típus',
        colNotes: 'Megjegyzések',
        rows: [
          [
            '🔮 Varázslat',
            'Nevesített varázslat-hatás követése — a varázslat neve bekérésre kerül',
          ],
          [
            '🎯 Képesség',
            'Nevesített osztály- vagy fajképesség követése — a képesség neve bekérésre kerül',
          ],
          [
            '🍀 Előny',
            'Az egyik tokenről a másikra adott előny rögzítése; az iniciativában a forrással csoportosítva',
          ],
          [
            '⬇️ Hátrány',
            'Kirótt hátrány rögzítése; az iniciativában a forrással csoportosítva',
          ],
          [
            '📝 Egyéb',
            'Szabad formátumú egyéni címke — leírás bekérésre kerül',
          ],
        ],
      },
      durationOptions: {
        heading: 'Időtartam-beállítások',
        intro:
          'A fennmaradó számláló a Turn Tracker pr oszlopában jelenik meg, és csökken, amikor a horgony token köre véget ér.',
        colOption: 'Beállítás',
        colBehaviour: 'Viselkedés',
        rows: [
          [
            'Eltávolításig',
            'Állandó — kézzel kell eltávolítani a menü vagy a --remove parancs segítségével',
          ],
          [
            'A célpont következő körének végén',
            'Lejár, amikor a célpont token következő köre véget ér az iniciativában',
          ],
          [
            'A forrás következő körének végén',
            'Lejár, amikor a forrás token következő köre véget ér az iniciativában',
          ],
          [
            '1 / 2 / 3 / 10 kör',
            'Rögzített visszaszámlálás; egy csökkentés a horgony token körének végén',
          ],
        ],
      },
      configuration: {
        heading: 'Beállítások',
        intro:
          'Használja a !condition-tracker --config &lt;option&gt; &lt;value&gt; parancsot vagy a főmenü Beállítások gombját.',
        colOption: 'Beállítás',
        colValues: 'Értékek',
        colDesc: 'Leírás',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Roll20 állapotjelölők alkalmazása tokenekre állapot hozzáadásakor',
          ],
          [
            'useIcons',
            'true / false',
            'Rövid ikonkódok megjelenítése (pl. [G]) emoji helyett a Turn Tracker sorokban',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Az opcionális alany-token lépés kihagyása Varázslat / Képesség / Egyéb hatásoknál',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'A figyelendő token sáv; ha 0-ra csökken, a GM felszólítást kap az állapotok rendezésére',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'A chat-üzenetek és a súgó-handout kimeneti nyelve',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            'Egy adott állapot állapotjelölőjének felülírása (pl. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Alapértelmezett állapotjelölők',
        colCondition: 'Állapot',
        colMarker: 'Jelölő neve',
      },
      availableLocales: {
        heading: 'Elérhető fordítások',
        intro:
          'Használja a language konfigurációs beállítást a chat-üzenetek és a súgó-handout bármely támogatott locale-re állításához. Rövid álnevek is elfogadottak en, zh és pt esetén.',
        colLocale: 'Locale',
        colLanguage: 'Nyelv',
        colFile: 'Fordítási fájl',
      },
    },
  };

  const TRANSLATION$a = {
    conditions: {
      Grappled: {
        past: 'afferrato',
        verb: 'afferra',
      },
      Restrained: {
        past: 'trattenuto',
        verb: 'trattiene',
      },
      Prone: {
        past: 'a terra',
        verb: 'butta',
        suffix: 'a terra',
      },
      Poisoned: {
        past: 'avvelenato',
        verb: 'avvelena',
      },
      Stunned: {
        past: 'stordito',
        verb: 'stordisce',
      },
      Blinded: {
        past: 'accecato',
        verb: 'acceca',
      },
      Charmed: {
        past: 'affascinato',
        verb: 'affascina',
      },
      Frightened: {
        past: 'spaventato',
        verb: 'spaventa',
      },
      Incapacitated: {
        past: 'incapacitato',
        verb: 'incapacita',
      },
      Invisible: {
        past: 'invisibile',
        verb: 'rende',
        suffix: 'invisibile',
      },
      Paralyzed: {
        past: 'paralizzato',
        verb: 'paralizza',
      },
      Petrified: {
        past: 'pietrificato',
        verb: 'pietrifica',
      },
      Unconscious: {
        past: 'privo di sensi',
        verb: 'rende',
        suffix: 'privo di sensi',
      },
      Spell: {
        past: 'influenzato da un incantesimo',
        verb: 'lancia un incantesimo su',
      },
      Ability: {
        past: "influenzato da un'abilità",
        verb: "usa un'abilità su",
      },
      Advantage: {
        past: 'ha vantaggio',
        verb: 'concede vantaggio a',
        noBy: true,
      },
      Disadvantage: {
        past: 'ha svantaggio',
        verb: 'impone svantaggio a',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Afferrato',
      Restrained: 'Trattenuto',
      Prone: 'A terra',
      Poisoned: 'Avvelenato',
      Stunned: 'Stordito',
      Blinded: 'Accecato',
      Charmed: 'Affascinato',
      Frightened: 'Spaventato',
      Incapacitated: 'Incapacitato',
      Invisible: 'Invisibile',
      Paralyzed: 'Paralizzato',
      Petrified: 'Pietrificato',
      Unconscious: 'Privo di sensi',
      Spell: 'Incantesimo',
      Ability: 'Abilità',
      Advantage: 'Vantaggio',
      Disadvantage: 'Svantaggio',
      Other: 'Altro',
    },
    templates: {
      display: {
        custom: '{emoji} {target} influenzato da {effect} ({source})',
        advantage: '{emoji} {source} ha vantaggio contro {target}{subject}',
        disadvantage: '{emoji} {source} ha svantaggio contro {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} è {past}',
        standard: '{emoji} {target} {past} da {source}',
      },
      apply: {
        custom: '{source} applica {effect} a {target}.',
        advantage: '{source} ha vantaggio contro {target}{subject}.',
        disadvantage: '{source} ha svantaggio contro {target}{subject}.',
        self: '{target} è {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} non è più influenzato da {effect}.',
        advantage: '{source} non ha più vantaggio contro {target}{subject}.',
        disadvantage:
          '{source} non ha più svantaggio contro {target}{subject}.',
        noBy: '{target} non è più {past}.',
        self: '{target} non è più {past}.',
        standard: '{target} non è più {past} da {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Seleziona condizione',
        selectSource: 'Seleziona token sorgente',
        selectTarget: 'Seleziona token bersaglio',
        selectSubject: 'Seleziona soggetto',
        selectDuration: 'Seleziona durata',
        confirmTargetTitle: 'Conferma lista bersagli',
        applyEffectTitle: 'Applica effetto {condition}',
        noTokens: 'Nessun token con nome trovato nella pagina attiva.',
        confirmIntro: 'I seguenti token riceveranno la condizione:',
        confirmBtn: 'Conferma lista bersagli',
        enterDetails: 'Inserisci dettagli effetto',
        noneBtn: 'Nessuno',
        noneOrSourceBtn: 'Nessuno o applica alla fonte',
        subjectDesc: "Seleziona chi o cosa applica l'effetto.",
        sourceDesc:
          "Seleziona la creatura che crea o genera la condizione o l'effetto.",
        targetDesc:
          "Seleziona la creatura che riceverà la condizione o l'effetto.",
        otherText: 'Testo condizione personalizzato',
        effectDetails: 'Dettagli {condition}',
      },
      col: {
        players: 'Giocatori',
        npcs: 'PNG',
        conditions: 'Condizioni',
        customEffects: 'Effetti personalizzati',
        permanentTurnEnd: 'Permanente / Fine turno',
        rounds: 'Round',
        command: 'Comando',
        result: 'Risultato',
        field: 'Campo',
        value: 'Valore',
        option: 'Opzione',
        condition: 'Condizione',
        marker: 'Indicatore',
        item: 'Elemento',
        removed: 'Rimosso',
        details: 'Dettagli',
        description: 'Descrizione',
        scenario: 'Scenario',
      },
      dur: {
        untilRemoved: 'Fino alla rimozione',
        endOfTargetTurn: 'Fine del prossimo turno del bersaglio',
        endOfSourceTurn: 'Fine del prossimo turno della sorgente',
        round1: '1 round',
        round2: '2 round',
        round3: '3 round',
        round10: '10 round',
        custom: 'Personalizzato',
        customPrompt: 'Numero di round',
        untilRemovedDisplay: 'Fino alla rimozione',
        turnsRemaining: '{n} fine/i turno rimanente/i',
      },
      btn: {
        openWizard: 'Apri procedura guidata',
        openMultiTarget: 'Apri procedura guidata multi-bersaglio',
        openRemovalList: 'Apri lista rimozione',
        showConfig: 'Mostra configurazione',
        runCleanup: 'Esegui pulizia',
        reinstallMacro: 'Reinstalla macro',
        reinstallHandout: 'Reinstalla documento',
        showHelp: 'Mostra aiuto',
        reorderConditions: 'Riordina righe condizioni',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Rimozione — Condition Tracker',
        config: 'Configurazione',
        configTracker: 'Configurazione — Condition Tracker',
        help: 'Aiuto',
        applied: 'Applicato',
        removed: 'Condizione rimossa',
        cleanup: 'Pulizia completata',
        macroReinstalled: 'Macro reinstallata',
        handoutReinstalled: 'Documento reinstallato',
        warning: 'Avviso',
        error: 'Errore',
        turnOrder: 'Ordine di iniziativa',
        noConditions: 'Nessuna condizione',
        tokenMoved: 'Token spostato',
        markedDead: 'Segnato come morto',
        zeroHp: '{name} — 0 PF',
        moveToken: '{name} — Spostare il token?',
        scriptReady: 'Script pronto',
        conditionReorder: 'Ordine di turno modificato',
      },
      heading: {
        quickActions: 'Azioni rapide',
        settings: 'Impostazioni',
        markerMappings: 'Mappatura indicatori',
        result: 'Risultato',
        info: 'Informazioni',
        commandOptions: 'Opzioni comando',
        promptUi: 'Interfaccia procedura guidata',
        examples: 'Esempi',
        summary: 'Riepilogo',
      },
      msg: {
        noActive: 'Nessuna condizione attiva è tracciata.',
        configReset:
          'Configurazione ripristinata ai valori predefiniti del mod.',
        unknownConfig:
          'Opzione di configurazione sconosciuta. Usa --config per visualizzare le impostazioni supportate.',
        macroReinstalled:
          'Le macro {wizard} e {multiTarget} sono state reinstallate per tutti i GM attivi.',
        handoutReinstalled:
          'Il documento di aiuto {handout} è stato reinstallato.',
        duplicate:
          'Questa combinazione esatta di sorgente, soggetto, bersaglio, condizione e testo personalizzato è già attiva.',
        noTargets:
          "Nessun token bersaglio specificato per l'applicazione multi-bersaglio.",
        noSelection:
          'Seleziona almeno un token sulla mappa prima di usare --multi-target.',
        invalidIds: 'Nessun ID token valido trovato nella selezione corrente.',
        reSelectTokens:
          'Nessuno dei token originariamente selezionati è stato trovato. Seleziona nuovamente i token e riprova.',
        conditionNotFound: 'ID condizione non trovato.',
        gmOnly: 'I comandi di Condition Tracker sono riservati al GM.',
        commandFailed:
          'Il comando non è stato completato in modo sicuro. Controlla la console API per i dettagli.',
        sourceTokenNotFound: 'Token sorgente non trovato.',
        targetTokenNotFound: 'Token bersaglio non trovato.',
        subjectTokenNotFound: 'Token soggetto non trovato.',
        invalidCondition:
          'La condizione deve essere una delle condizioni predefinite oppure Altro.',
        subjectOnlyCustom:
          '--subject è valido solo per Incantesimo, Abilità, Vantaggio, Svantaggio e Altro.',
        subjectBypassInvalid:
          '--subjectPromptBypass richiede true o false quando viene fornito un valore.',
        customDetailsRequired:
          'I dettagli di {condition} sono obbligatori. Usa --other per fornirli.',
        markerConfigFormat:
          "Il formato di configurazione dell'indicatore è: --config marker Grappled=grab",
        markerPredefinedRequired:
          "La configurazione dell'indicatore richiede un nome di condizione predefinito.",
        markerNameRequired:
          "La configurazione dell'indicatore richiede un nome di indicatore non vuoto.",
        markerSet: 'Indicatore di {condition} impostato su {marker}.',
        healthBarSet: 'Barra della salute impostata su {bar}.',
        boolSet: '{key} impostato su {value}.',
        expectedBoolean: 'Previsto true o false.',
        invalidHealthBar:
          'La barra della salute deve essere bar1_value, bar2_value o bar3_value.',
        markersDisabled: 'Gli indicatori sono disabilitati.',
        noMarkerConfigured:
          'Nessun indicatore configurato per questa condizione.',
        markerApplied: 'Indicatore applicato: {marker}',
        markerPresent: 'Indicatore già presente: {marker}',
        langSet: 'Lingua impostata su {locale}.',
        invalidLocale: 'Lingua non valida. Lingue supportate: {locales}.',
        otherDurationRequiresRounds:
          'La durata Altro richiede un numero di round, ad esempio --duration 5 rounds.',
        invalidDuration:
          "La durata deve essere Fino alla rimozione, un'opzione di fine turno o un numero positivo di round.",
        zeroHpNoConditions:
          '{name} ha raggiunto 0 PF e non ha condizioni attive.',
        zeroHpConditions:
          '{name} ha raggiunto 0 PF. Scegli le condizioni da rimuovere:',
        removeAllBtn: 'Rimuovi tutte le condizioni di {name}',
        markIncapacitated: 'Segna come Incapacitato',
        removeFromTurnOrder: "Rimuovi dall'ordine di iniziativa",
        alreadyIncapacitated: '{name} è già Incapacitato.',
        tokenRemovedFromTurn:
          "{name} è stato rimosso dall'ordine di iniziativa.",
        tokenNotInTurn: "{name} non è stato trovato nell'ordine di iniziativa.",
        moveTokenPrompt:
          'Sposta {name} al livello mappa in modo che rimanga visibile senza interferire con altri token?',
        moveTokenBtn: 'Sposta {name} al livello mappa',
        tokenMoved: '{name} è stato spostato al livello mappa.',
        tokenNotFound: 'Token non trovato.',
        noActiveConditions: '{name} non ha condizioni attive da rimuovere.',
        deadNoConditions:
          '{name} è stato segnato come morto. Nessuna condizione era attiva.',
        scriptReady: '{name} è attivo e stai usando la versione {version}.',
        reachedZeroHp: '{name} ha raggiunto 0 PF',
        manuallyRemoved: 'è stata rimossa manualmente',
        durationExpired: 'la sua durata è scaduta',
        markedAsDead: '{name} è stato segnato come morto',
        conditionReorder:
          "L'ordine di turno è cambiato e {count} riga/righe di condizione tracciata/e potrebbe/potrebbero essere fuori posto. Clicca sotto per riposizionarle dopo i rispettivi token assegnati.",
        conditionsReordered:
          'Le righe delle condizioni sono state riposizionate dopo i rispettivi token assegnati.',
      },
      removal: {
        conditionField: 'Condizione',
        reasonField: 'Motivo',
        turnRowField: 'Riga del registro dei turni',
        markerField: 'Indicatore',
        notConfigured: 'Non configurato',
        markerRemoved: 'Rimosso ({marker})',
        markerRetained: 'Mantenuto ({marker})',
        rowRemoved: 'Rimosso',
        rowMissing: 'Già assente',
        manualReason: 'Rimozione manuale',
      },
      cleanup: {
        orphaned: 'Voci di condizione orfane',
        stale: 'Voci di condizione obsolete',
        orphanedRows: 'Righe orfane del registro dei turni',
        unusedMarkers: 'Indicatori inutilizzati',
      },
      apply: {
        turnAppended:
          "Il bersaglio non era nell'ordine di iniziativa; la riga della condizione è stata aggiunta in fondo.",
        turnInserted:
          'Riga della condizione inserita sotto il token bersaglio.',
      },
    },
    handout: {
      versionLabel: 'Versione',
      subtitle: 'Gestore effetti di stato D&D 5e',
      footerNote:
        'Questo documento viene creato e aggiornato automaticamente ogni volta che lo script viene caricato.',
      overview: {
        heading: 'Panoramica',
        body: 'Condition Tracker gestisce le condizioni di stato di D&D 5e e gli effetti personalizzati come righe etichettate nel Registro dei Turni di Roll20. Applica condizioni ai token, tieni traccia delle durate per ordine di iniziativa e rimuovi automaticamente gli effetti scaduti al termine di un turno. Tutti i comandi sono riservati al GM e possono essere attivati dalla chat o tramite le macro installate.',
      },
      quickStart: {
        heading: 'Avvio rapido',
        colCommand: 'Comando',
        colDesc: 'Descrizione',
        rows: [
          [
            '!condition-tracker --prompt',
            'Procedura guidata passo dopo passo — scegli condizione, token e durata in modo interattivo. Disponibile anche come macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Applica una condizione a più token contemporaneamente. Disponibile anche come macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Apri il menu principale di gestione con pulsanti per applicare, rivedere o rimuovere condizioni.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Riferimento comandi',
        colFlag: 'Flag',
        colDesc: 'Descrizione',
        rows: [
          ['--prompt', 'Interfaccia della procedura guidata passo dopo passo'],
          [
            '--multi-target',
            'Applica una condizione a più token bersaglio contemporaneamente',
          ],
          [
            '--menu',
            'Mostra il menu principale (aggiungi remove per il menu di rimozione)',
          ],
          [
            '--source X --target Y --condition Z',
            'Applica una condizione direttamente senza la procedura guidata',
          ],
          [
            '--duration &lt;valore&gt;',
            "Durata per un'applicazione diretta (es. 2 rounds)",
          ],
          [
            '--other &lt;testo&gt;',
            'Testo personalizzato per i tipi di effetto Incantesimo / Abilità / Altro',
          ],
          [
            '--remove &lt;id-condizione&gt;',
            'Rimuovi una condizione specifica tramite il suo ID univoco',
          ],
          [
            '--config &lt;opzione&gt; &lt;valore&gt;',
            'Modifica le impostazioni di configurazione (vedi sezione Configurazione)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Sostituisci subjectPromptBypass solo per questo comando (supporta anche --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Riconcilia lo stato — rimuovi condizioni e righe del registro dei turni orfane',
          ],
          [
            '--reorder-conditions',
            "Riposizionare manualmente le righe di condizione dopo i token assegnati nell'ordine dei turni",
          ],
          ['--reinstall-macro', 'Ricrea o aggiorna le macro del GM'],
          [
            '--reinstall-handout',
            'Ricrea o aggiorna il documento di aiuto localizzato',
          ],
          [
            '--lang &lt;locale&gt;',
            'Mostra i messaggi di questo comando in una lingua aggiuntiva (modalità bilingue)',
          ],
          ['--help', 'Mostra una scheda di aiuto rapida nella chat'],
        ],
      },
      standardConditions: {
        heading: 'Condizioni standard (D&amp;D 5e)',
        colCondition: 'Condizione',
      },
      customEffects: {
        heading: 'Tipi di effetti personalizzati',
        colType: 'Tipo',
        colNotes: 'Note',
        rows: [
          [
            '🔮 Incantesimo',
            "Traccia un effetto di incantesimo nominato — ti verrà chiesto il nome dell'incantesimo",
          ],
          [
            '🎯 Abilità',
            "Traccia un'abilità di classe o razza nominata — ti verrà chiesto il nome",
          ],
          [
            '🍀 Vantaggio',
            "Registra un vantaggio concesso da un token a un altro; raggruppato con la sorgente nell'iniziativa",
          ],
          [
            '⬇️ Svantaggio',
            "Registra uno svantaggio imposto; raggruppato con la sorgente nell'iniziativa",
          ],
          [
            '📝 Altro',
            'Etichetta personalizzata libera — ti verrà chiesta una descrizione',
          ],
        ],
      },
      durationOptions: {
        heading: 'Opzioni durata',
        intro:
          'Il conteggio rimanente viene mostrato nella colonna pr del Registro dei Turni e si decrementa al termine del turno del token ancora.',
        colOption: 'Opzione',
        colBehaviour: 'Comportamento',
        rows: [
          [
            'Fino alla rimozione',
            'Permanente — deve essere rimossa manualmente tramite il menu o --remove',
          ],
          [
            'Fine del prossimo turno del bersaglio',
            "Scade al termine del prossimo turno del token bersaglio nell'iniziativa",
          ],
          [
            'Fine del prossimo turno della sorgente',
            "Scade al termine del prossimo turno del token sorgente nell'iniziativa",
          ],
          [
            '1 / 2 / 3 / 10 round',
            'Conto alla rovescia fisso; un decremento per ogni fine turno del token ancora',
          ],
        ],
      },
      configuration: {
        heading: 'Configurazione',
        intro:
          'Usa !condition-tracker --config &lt;opzione&gt; &lt;valore&gt; o il pulsante Configurazione nel menu principale.',
        colOption: 'Opzione',
        colValues: 'Valori',
        colDesc: 'Descrizione',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Applica indicatori di stato Roll20 ai token quando viene aggiunta una condizione',
          ],
          [
            'useIcons',
            'true / false',
            'Mostra codici icona brevi (es. [G]) invece di emoji nelle righe del Registro dei Turni',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Salta il passaggio facoltativo del token soggetto per gli effetti Incantesimo / Abilità / Altro',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Barra del token da monitorare; quando scende a 0 il GM viene invitato a rimuovere le condizioni',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Lingua dei messaggi nella chat e del documento di aiuto',
          ],
          [
            'marker',
            '&lt;Condizione&gt;=&lt;nome indicatore&gt;',
            "Sostituisci l'indicatore di stato usato per una condizione specifica (es. marker Grappled=grab)",
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Indicatori di stato predefiniti',
        colCondition: 'Condizione',
        colMarker: 'Nome indicatore',
      },
      availableLocales: {
        heading: 'Traduzioni disponibili',
        intro:
          "Usa l'opzione di configurazione language per impostare i messaggi della chat e il documento di aiuto su qualsiasi lingua supportata. Gli alias brevi sono accettati anche per en, zh e pt.",
        colLocale: 'Locale',
        colLanguage: 'Lingua',
        colFile: 'File di traduzione',
      },
    },
  };

  const TRANSLATION$9 = {
    conditions: {
      Grappled: {
        past: 'つかまれた',
        verb: 'つかむ',
      },
      Restrained: {
        past: '拘束された',
        verb: '拘束する',
      },
      Prone: {
        past: '伏せ状態',
        verb: '伏せ状態にする',
      },
      Poisoned: {
        past: '毒を受けた',
        verb: '毒を与える',
      },
      Stunned: {
        past: '朦朧状態',
        verb: '朦朧状態にする',
      },
      Blinded: {
        past: '盲目状態',
        verb: '盲目状態にする',
      },
      Charmed: {
        past: '魅了状態',
        verb: '魅了する',
      },
      Frightened: {
        past: '恐怖状態',
        verb: '恐怖状態にする',
      },
      Incapacitated: {
        past: '無力状態',
        verb: '無力状態にする',
      },
      Invisible: {
        past: '不可視状態',
        verb: '不可視状態にする',
      },
      Paralyzed: {
        past: '麻痺状態',
        verb: '麻痺状態にする',
      },
      Petrified: {
        past: '石化状態',
        verb: '石化状態にする',
      },
      Unconscious: {
        past: '気絶状態',
        verb: '気絶状態にする',
      },
      Spell: {
        past: '呪文の影響下',
        verb: '呪文をかける',
      },
      Ability: {
        past: '能力の影響下',
        verb: '能力を使う',
      },
      Advantage: {
        past: '有利を持つ',
        verb: '有利を与える',
        noBy: true,
      },
      Disadvantage: {
        past: '不利を持つ',
        verb: '不利を与える',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'つかみ',
      Restrained: '拘束',
      Prone: '伏せ',
      Poisoned: '毒',
      Stunned: '朦朧',
      Blinded: '盲目',
      Charmed: '魅了',
      Frightened: '恐怖',
      Incapacitated: '無力',
      Invisible: '不可視',
      Paralyzed: '麻痺',
      Petrified: '石化',
      Unconscious: '気絶',
      Spell: '呪文',
      Ability: '能力',
      Advantage: '有利',
      Disadvantage: '不利',
      Other: 'その他',
    },
    templates: {
      display: {
        custom: '{emoji} {target}は{effect}の影響下にある（{source}）',
        advantage: '{emoji} {source}は{target}{subject}に対して有利を持つ',
        disadvantage: '{emoji} {source}は{target}{subject}に対して不利を持つ',
        noBy: '{emoji} {target}は{past}（{source}）',
        self: '{target}は{past}',
        standard: '{emoji} {target}は{source}によって{past}',
      },
      apply: {
        custom: '{source}は{target}に{effect}を適用した。',
        advantage: '{source}は{target}{subject}に対して有利を持つ。',
        disadvantage: '{source}は{target}{subject}に対して不利を持つ。',
        self: '{target}は{past}。',
        withSuffix: '{source}は{target}を{suffix}状態にした（{verb}）。',
        standard: '{source}は{target}を{verb}。',
      },
      remove: {
        custom: '{target}はもはや{effect}の影響を受けていない。',
        advantage: '{source}はもはや{target}{subject}に対して有利を持たない。',
        disadvantage:
          '{source}はもはや{target}{subject}に対して不利を持たない。',
        noBy: '{target}はもはや{past}ではない。',
        self: '{target}はもはや{past}ではない。',
        standard: '{target}はもはや{source}によって{past}ではない。',
      },
    },
    ui: {
      wizard: {
        selectCondition: '状態を選択',
        selectSource: 'ソーストークンを選択',
        selectTarget: 'ターゲットトークンを選択',
        selectSubject: '対象を選択',
        selectDuration: '継続時間を選択',
        confirmTargetTitle: 'ターゲットリストを確認',
        applyEffectTitle: '{condition}の効果を適用',
        noTokens: 'アクティブなページに名前付きトークンが見つかりません。',
        confirmIntro: '以下のトークンが状態を受け取ります：',
        confirmBtn: 'ターゲットリストを確認',
        enterDetails: '効果の詳細を入力',
        noneBtn: 'なし',
        noneOrSourceBtn: 'なし、または発生源に適用',
        subjectDesc: '効果をもたらすものを選択してください。',
        sourceDesc: '状態または効果を生み出すクリーチャーを選択してください。',
        targetDesc: '状態または効果を受け取るクリーチャーを選択してください。',
        otherText: 'カスタム状態テキスト',
        effectDetails: '{condition}の詳細',
      },
      col: {
        players: 'プレイヤー',
        npcs: 'NPC',
        conditions: '状態',
        customEffects: 'カスタム効果',
        permanentTurnEnd: '恒久的 / ターン終了',
        rounds: 'ラウンド',
        command: 'コマンド',
        result: '結果',
        field: 'フィールド',
        value: '値',
        option: 'オプション',
        condition: '状態',
        marker: 'マーカー',
        item: '項目',
        removed: '削除済み',
        details: '詳細',
        description: '説明',
        scenario: 'シナリオ',
      },
      dur: {
        untilRemoved: '削除されるまで',
        endOfTargetTurn: 'ターゲットの次のターン終了時',
        endOfSourceTurn: 'ソースの次のターン終了時',
        round1: '1ラウンド',
        round2: '2ラウンド',
        round3: '3ラウンド',
        round10: '10ラウンド',
        custom: 'カスタム',
        customPrompt: 'ラウンド数',
        untilRemovedDisplay: '削除されるまで',
        turnsRemaining: '残りターン終了数：{n}',
      },
      btn: {
        openWizard: 'ウィザードを開く',
        openMultiTarget: 'マルチターゲットウィザードを開く',
        openRemovalList: '削除リストを開く',
        showConfig: '設定を表示',
        runCleanup: 'クリーンアップを実行',
        reinstallMacro: 'マクロを再インストール',
        reinstallHandout: 'ハンドアウトを再インストール',
        showHelp: 'ヘルプを表示',
        reorderConditions: '状態行を並び替え',
      },
      title: {
        menu: 'メニュー',
        removalMenu: 'Condition Tracker — 削除',
        config: '設定',
        configTracker: 'Condition Tracker 設定',
        help: 'ヘルプ',
        applied: '適用済み',
        removed: '状態削除済み',
        cleanup: 'クリーンアップ完了',
        macroReinstalled: 'マクロ再インストール済み',
        handoutReinstalled: 'ハンドアウト再インストール済み',
        warning: '警告',
        error: 'エラー',
        turnOrder: 'ターン順序',
        noConditions: '状態なし',
        tokenMoved: 'トークン移動済み',
        markedDead: '死亡としてマーク',
        zeroHp: '{name} — HP 0',
        moveToken: '{name} — トークンを移動しますか？',
        scriptReady: 'スクリプト準備完了',
        conditionReorder: 'ターン順序変更',
      },
      heading: {
        quickActions: 'クイックアクション',
        settings: '設定',
        markerMappings: 'マーカーマッピング',
        result: '結果',
        info: '情報',
        commandOptions: 'コマンドオプション',
        promptUi: 'ウィザードUI',
        examples: '例',
        summary: 'まとめ',
      },
      msg: {
        noActive: '追跡中のアクティブな状態はありません。',
        configReset: '設定がMODのデフォルトにリセットされました。',
        unknownConfig:
          '不明な設定オプションです。--configを使用してサポートされている設定を確認してください。',
        macroReinstalled:
          '{wizard}および{multiTarget}マクロが現在のすべてのGMプレイヤーに再インストールされました。',
        handoutReinstalled:
          'ヘルプハンドアウト{handout}が再インストールされました。',
        duplicate:
          '同一のソース、対象、ターゲット、状態、カスタムテキストの組み合わせがすでにアクティブです。',
        noTargets:
          'マルチターゲット適用のためのターゲットトークンが指定されていません。',
        noSelection:
          '--multi-targetを使用する前に、ボード上で少なくとも1つのトークンを選択してください。',
        invalidIds: '現在の選択に有効なトークンIDが見つかりません。',
        reSelectTokens:
          '元々選択されたトークンが見つかりません。トークンを再選択してもう一度お試しください。',
        conditionNotFound: '状態IDが見つかりません。',
        gmOnly: 'Condition TrackerのコマンドはGM専用です。',
        commandFailed:
          'コマンドを安全に完了できませんでした。詳細はAPIコンソールを確認してください。',
        sourceTokenNotFound: 'ソーストークンが見つかりません。',
        targetTokenNotFound: 'ターゲットトークンが見つかりません。',
        subjectTokenNotFound: '対象トークンが見つかりません。',
        invalidCondition:
          '状態は事前定義された状態またはその他のいずれかである必要があります。',
        subjectOnlyCustom:
          '--subjectは呪文、能力、有利、不利、その他にのみ有効です。',
        subjectBypassInvalid:
          '--subjectPromptBypassは値が指定された場合、trueまたはfalseを期待します。',
        customDetailsRequired:
          '{condition}の詳細が必要です。--otherを使用して指定してください。',
        markerConfigFormat: 'マーカー設定の形式：--config marker Grappled=grab',
        markerPredefinedRequired:
          'マーカー設定には事前定義された状態名が必要です。',
        markerNameRequired: 'マーカー設定には空でないマーカー名が必要です。',
        markerSet: '{condition}のマーカーを{marker}に設定しました。',
        healthBarSet: 'ヘルスバーを{bar}に設定しました。',
        boolSet: '{key}を{value}に設定しました。',
        expectedBoolean: 'trueまたはfalseが必要です。',
        invalidHealthBar:
          'ヘルスバーはbar1_value、bar2_value、またはbar3_valueである必要があります。',
        markersDisabled: 'マーカーは無効になっています。',
        noMarkerConfigured: 'この状態に設定されたマーカーはありません。',
        markerApplied: 'マーカーを適用しました：{marker}',
        markerPresent: 'マーカーはすでに存在します：{marker}',
        langSet: '言語を{locale}に設定しました。',
        invalidLocale:
          '無効なロケールです。サポートされているロケール：{locales}。',
        otherDurationRequiresRounds:
          'その他の継続時間には数値のラウンド数が必要です（例：--duration 5 rounds）。',
        invalidDuration:
          '継続時間は「削除されるまで」、ターン終了オプション、または正のラウンド数である必要があります。',
        zeroHpNoConditions:
          '{name}はHP0になりましたが、アクティブな状態はありません。',
        zeroHpConditions:
          '{name}はHP0になりました。削除する状態を選択してください：',
        removeAllBtn: '{name}のすべての状態を削除',
        markIncapacitated: '無力状態としてマーク',
        removeFromTurnOrder: 'ターン順序から削除',
        alreadyIncapacitated: '{name}はすでに無力状態です。',
        tokenRemovedFromTurn: '{name}がターン順序から削除されました。',
        tokenNotInTurn: '{name}はターン順序に見つかりませんでした。',
        moveTokenPrompt:
          '{name}を表示したまま他のトークンの邪魔にならないよう、マップレイヤーに移動しますか？',
        moveTokenBtn: '{name}をマップレイヤーに移動',
        tokenMoved: '{name}がマップレイヤーに移動されました。',
        tokenNotFound: 'トークンが見つかりません。',
        noActiveConditions: '{name}には削除するアクティブな状態がありません。',
        deadNoConditions:
          '{name}は死亡としてマークされました。アクティブな状態はありませんでした。',
        scriptReady:
          '{name}はアクティブで、バージョン{version}を使用しています。',
        reachedZeroHp: '{name}がHP0に達しました',
        manuallyRemoved: '手動で削除されました',
        durationExpired: '継続時間が終了しました',
        markedAsDead: '{name}が死亡としてマークされました',
        conditionReorder:
          'ターン順序が変更され、追跡中の{count}件の状態行が正しい位置にない可能性があります。割り当てられたトークンの後に復元するには以下をクリックしてください。',
        conditionsReordered:
          '状態行が割り当てられたトークンの後に再配置されました。',
      },
      removal: {
        conditionField: '状態',
        reasonField: '理由',
        turnRowField: 'ターントラッカー行',
        markerField: 'マーカー',
        notConfigured: '未設定',
        markerRemoved: '削除済み（{marker}）',
        markerRetained: '保持（{marker}）',
        rowRemoved: '削除済み',
        rowMissing: 'すでに存在しない',
        manualReason: '手動削除',
      },
      cleanup: {
        orphaned: '孤立した状態エントリ',
        stale: '古くなった状態エントリ',
        orphanedRows: '孤立したターントラッカー行',
        unusedMarkers: '未使用のマーカー',
      },
      apply: {
        turnAppended:
          'ターゲットはターン順序にありませんでした。状態行を末尾に追加しました。',
        turnInserted: 'ターゲットトークンの下に状態行を挿入しました。',
      },
    },
    handout: {
      versionLabel: 'バージョン',
      subtitle: 'D&D 5e ステータス効果マネージャー',
      footerNote:
        'このハンドアウトはスクリプトが読み込まれるたびに自動的に作成・更新されます。',
      overview: {
        heading: '概要',
        body: 'Condition TrackerはD&D 5eのステータス状態およびカスタム効果を、Roll20のターントラッカー内のラベル付き行として管理します。トークンに状態を適用し、イニシアチブ順に継続時間を追跡し、ターン終了時に期限切れの効果を自動的に削除します。すべてのコマンドはGM専用で、チャットまたはインストール済みマクロから実行できます。',
      },
      quickStart: {
        heading: 'クイックスタート',
        colCommand: 'コマンド',
        colDesc: '説明',
        rows: [
          [
            '!condition-tracker --prompt',
            'ステップバイステップのウィザード — 状態、トークン、継続時間をインタラクティブに選択します。ConditionTrackerWizardマクロとしても利用できます。',
          ],
          [
            '!condition-tracker --multi-target',
            '1つの状態を複数のトークンに同時に適用します。ConditionTrackerMultiTargetマクロとしても利用できます。',
          ],
          [
            '!condition-tracker --menu',
            '状態の適用・確認・削除ボタンを含むメインメニューを開きます。',
          ],
        ],
      },
      commandsRef: {
        heading: 'コマンドリファレンス',
        colFlag: 'フラグ',
        colDesc: '説明',
        rows: [
          ['--prompt', 'インタラクティブなステップバイステップウィザードUI'],
          ['--multi-target', '複数のターゲットトークンに状態を一括適用'],
          ['--menu', 'メインメニューを表示（削除メニューにはremoveを追加）'],
          [
            '--source X --target Y --condition Z',
            'ウィザードを使わずに直接状態を適用',
          ],
          ['--duration &lt;値&gt;', '直接適用時の継続時間（例：2 rounds）'],
          [
            '--other &lt;テキスト&gt;',
            '呪文・能力・その他の効果タイプ用のカスタムテキスト',
          ],
          ['--remove &lt;状態ID&gt;', '一意のIDで特定の状態を削除'],
          [
            '--config &lt;オプション&gt; &lt;値&gt;',
            '設定を変更する（下記の設定セクションを参照）',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'このコマンドのみsubjectPromptBypassを上書き（--subject-prompt-bypassも使用可）',
          ],
          [
            '--cleanup',
            '状態を整合する — 孤立した状態とターントラッカー行を削除',
          ],
          [
            '--reorder-conditions',
            'ターン順序において条件行を割り当てられたトークンの後ろに手動で再配置します',
          ],
          ['--reinstall-macro', 'GMマクロを再作成または更新'],
          [
            '--reinstall-handout',
            'ローカライズされたヘルプハンドアウトを再作成または更新',
          ],
          [
            '--lang &lt;ロケール&gt;',
            'このコマンドのメッセージを追加のロケールで出力（バイリンガルモード）',
          ],
          ['--help', 'チャットに簡単なヘルプカードを表示'],
        ],
      },
      standardConditions: {
        heading: '標準状態（D&amp;D 5e）',
        colCondition: '状態',
      },
      customEffects: {
        heading: 'カスタム効果タイプ',
        colType: 'タイプ',
        colNotes: '備考',
        rows: [
          [
            '🔮 呪文',
            '名前付き呪文効果を追跡します — 呪文名の入力を求められます',
          ],
          [
            '🎯 能力',
            '名前付きクラスまたは種族能力を追跡します — 能力名の入力を求められます',
          ],
          [
            '🍀 有利',
            'あるトークンから別のトークンへ付与された有利を記録します。イニシアチブではソースとグループ化されます',
          ],
          [
            '⬇️ 不利',
            '課された不利を記録します。イニシアチブではソースとグループ化されます',
          ],
          ['📝 その他', '自由形式のカスタムラベル — 説明の入力を求められます'],
        ],
      },
      durationOptions: {
        heading: '継続時間オプション',
        intro:
          '残数はターントラッカーのpr列に表示され、アンカートークンのターン終了時に減少します。',
        colOption: 'オプション',
        colBehaviour: '動作',
        rows: [
          ['削除されるまで', '恒久的 — メニューまたは--removeで手動削除が必要'],
          [
            'ターゲットの次のターン終了時',
            'イニシアチブでターゲットトークンの次のターンが終了したときに失効',
          ],
          [
            'ソースの次のターン終了時',
            'イニシアチブでソーストークンの次のターンが終了したときに失効',
          ],
          [
            '1 / 2 / 3 / 10 ラウンド',
            '固定カウントダウン。アンカートークンのターン終了ごとに1減少',
          ],
        ],
      },
      configuration: {
        heading: '設定',
        intro:
          '!condition-tracker --config &lt;オプション&gt; &lt;値&gt;またはメインメニューの設定ボタンを使用してください。',
        colOption: 'オプション',
        colValues: '値',
        colDesc: '説明',
        rows: [
          [
            'useMarkers',
            'true / false',
            '状態追加時にトークンへRoll20ステータスマーカーを適用する',
          ],
          [
            'useIcons',
            'true / false',
            'ターントラッカー行で絵文字の代わりに短いアイコンコード（例：[G]）を表示する',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            '呪文・能力・その他の効果でオプションの対象トークン手順をスキップする',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            '監視するトークンバー。0になるとGMに状態のクリーンアップを促す',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'チャットメッセージとヘルプハンドアウトの出力言語',
          ],
          [
            'marker',
            '&lt;状態&gt;=&lt;マーカー名&gt;',
            '特定の状態に使用するステータスマーカーを上書き（例：marker Grappled=grab）',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'デフォルトステータスマーカー',
        colCondition: '状態',
        colMarker: 'マーカー名',
      },
      availableLocales: {
        heading: '利用可能な翻訳',
        intro:
          'languageの設定オプションを使用して、チャットメッセージとヘルプハンドアウトをサポートされている任意のロケールに設定できます。en、zh、ptの短縮エイリアスも使用できます。',
        colLocale: 'ロケール',
        colLanguage: '言語',
        colFile: '翻訳ファイル',
      },
    },
  };

  const TRANSLATION$8 = {
    conditions: {
      Grappled: {
        past: '붙잡힘',
        verb: '붙잡음',
      },
      Restrained: {
        past: '구속됨',
        verb: '구속함',
      },
      Prone: {
        past: '넘어짐',
        verb: '넘어뜨림',
        suffix: '상태',
      },
      Poisoned: {
        past: '중독됨',
        verb: '중독시킴',
      },
      Stunned: {
        past: '기절함',
        verb: '기절시킴',
      },
      Blinded: {
        past: '눈이 멂',
        verb: '눈을 멀게 함',
      },
      Charmed: {
        past: '매혹됨',
        verb: '매혹함',
      },
      Frightened: {
        past: '겁에 질림',
        verb: '겁을 줌',
      },
      Incapacitated: {
        past: '무력화됨',
        verb: '무력화시킴',
      },
      Invisible: {
        past: '투명해짐',
        verb: '투명하게 만듦',
      },
      Paralyzed: {
        past: '마비됨',
        verb: '마비시킴',
      },
      Petrified: {
        past: '석화됨',
        verb: '석화시킴',
      },
      Unconscious: {
        past: '의식 불명',
        verb: '의식 불명으로 만듦',
      },
      Spell: {
        past: '주문에 걸림',
        verb: '주문을 시전함',
      },
      Ability: {
        past: '능력의 영향을 받음',
        verb: '능력을 사용함',
      },
      Advantage: {
        past: '이점을 가짐',
        verb: '이점을 부여함',
        noBy: true,
      },
      Disadvantage: {
        past: '불이익을 가짐',
        verb: '불이익을 가함',
        noBy: true,
      },
    },
    condNames: {
      Grappled: '붙잡힘',
      Restrained: '구속됨',
      Prone: '넘어짐',
      Poisoned: '중독됨',
      Stunned: '기절함',
      Blinded: '눈이 멂',
      Charmed: '매혹됨',
      Frightened: '겁에 질림',
      Incapacitated: '무력화됨',
      Invisible: '투명화',
      Paralyzed: '마비됨',
      Petrified: '석화됨',
      Unconscious: '의식 불명',
      Spell: '주문',
      Ability: '능력',
      Advantage: '이점',
      Disadvantage: '불이익',
      Other: '기타',
    },
    templates: {
      display: {
        custom: '{emoji} {target} 이(가) {effect}의 영향을 받음 ({source})',
        advantage:
          '{emoji} {source} 이(가) {target}{subject} 에 대해 이점을 가짐',
        disadvantage:
          '{emoji} {source} 이(가) {target}{subject} 에 대해 불이익을 가짐',
        noBy: '{emoji} {target} 이(가) {past} ({source})',
        self: '{target} 이(가) {past}',
        standard: '{emoji} {target} 이(가) {source} 에 의해 {past}',
      },
      apply: {
        custom: '{source} 이(가) {target} 에게 {effect} 효과를 적용함.',
        advantage: '{source} 이(가) {target}{subject} 에 대해 이점을 가짐.',
        disadvantage:
          '{source} 이(가) {target}{subject} 에 대해 불이익을 가짐.',
        self: '{target} 이(가) {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} 에게 적용된 {effect} 효과가 종료됨.',
        advantage:
          '{source} 이(가) {target}{subject} 에 대해 더 이상 이점을 가지지 않음.',
        disadvantage:
          '{source} 이(가) {target}{subject} 에 대해 더 이상 불이익을 가지지 않음.',
        noBy: '{target} 이(가) 더 이상 {past} 상태가 아님.',
        self: '{target} 이(가) 더 이상 {past} 상태가 아님.',
        standard:
          '{target} 이(가) 더 이상 {source} 에 의해 {past} 상태가 아님.',
      },
    },
    ui: {
      wizard: {
        selectCondition: '상태 선택',
        selectSource: '시전자 토큰 선택',
        selectTarget: '대상 토큰 선택',
        selectSubject: '주체 선택',
        selectDuration: '지속 시간 선택',
        confirmTargetTitle: '대상 목록 확인',
        applyEffectTitle: '{condition} 효과 적용',
        noTokens: '활성 페이지에서 이름이 있는 토큰을 찾을 수 없습니다.',
        confirmIntro: '다음 토큰들에 상태가 적용됩니다:',
        confirmBtn: '대상 목록 확인',
        enterDetails: '효과 상세 내용 입력',
        noneBtn: '없음',
        noneOrSourceBtn: '없음 또는 시전자에게 적용',
        subjectDesc: '효과를 전달하는 대상이나 항목을 선택하세요.',
        sourceDesc: '상태나 효과를 생성하는 생명체를 선택하세요.',
        targetDesc: '상태나 효과를 받을 생명체를 선택하세요.',
        otherText: '기타 상태 텍스트',
        effectDetails: '{condition} 상세 내용',
      },
      col: {
        players: '플레이어',
        npcs: 'NPC',
        conditions: '상태',
        customEffects: '사용자 정의 효과',
        permanentTurnEnd: '영구 / 턴 종료',
        rounds: '라운드',
        command: '명령어',
        result: '결과',
        field: '필드',
        value: '값',
        option: '옵션',
        condition: '상태',
        marker: '마커',
        item: '항목',
        removed: '제거됨',
        details: '상세 내용',
        description: '설명',
        scenario: '시나리오',
      },
      dur: {
        untilRemoved: '제거될 때까지',
        endOfTargetTurn: '대상의 다음 턴 종료 시',
        endOfSourceTurn: '시전자의 다음 턴 종료 시',
        round1: '1 라운드',
        round2: '2 라운드',
        round3: '3 라운드',
        round10: '10 라운드',
        custom: '사용자 정의',
        customPrompt: '라운드 수',
        untilRemovedDisplay: '제거될 때까지',
        turnsRemaining: '{n} 개의 추적된 턴 종료 남음',
      },
      btn: {
        openWizard: '위저드 열기',
        openMultiTarget: '다중 대상 위저드 열기',
        openRemovalList: '제거 목록 열기',
        showConfig: '설정 표시',
        runCleanup: '정리 실행',
        reinstallMacro: '매크로 재설치',
        reinstallHandout: '유인물 재설치',
        showHelp: '도움말 표시',
        reorderConditions: '조건 행 재정렬',
      },
      title: {
        menu: '메뉴',
        removalMenu: '상태 추적기 제거',
        config: '설정',
        configTracker: '상태 추적기 설정',
        help: '도움말',
        applied: '적용됨',
        removed: '상태 제거됨',
        cleanup: '정리 완료',
        macroReinstalled: '매크로 재설치됨',
        handoutReinstalled: '유인물 재설치됨',
        warning: '경고',
        error: '오류',
        turnOrder: '턴 순서',
        noConditions: '상태 없음',
        tokenMoved: '토큰 이동됨',
        markedDead: '사망으로 표시됨',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — 토큰을 이동하시겠습니까?',
        scriptReady: '스크립트 준비됨',
        conditionReorder: '턴 순서 변경됨',
      },
      heading: {
        quickActions: '빠른 작업',
        settings: '설정',
        markerMappings: '마커 매핑',
        result: '결과',
        info: '정보',
        commandOptions: '명령어 옵션',
        promptUi: '프롬프트 UI',
        examples: '예시',
        summary: '요약',
      },
      msg: {
        noActive: '추적 중인 활성 상태가 없습니다.',
        configReset: '설정이 모드 기본값으로 재설정되었습니다.',
        unknownConfig:
          '알 수 없는 설정 옵션입니다. --config 를 사용하여 지원되는 설정을 확인하세요.',
        macroReinstalled:
          '{wizard} 및 {multiTarget} 매크로가 모든 현재 GM 플레이어를 위해 재설치되었습니다.',
        handoutReinstalled: '도움말 유인물 {handout}이(가) 재설치되었습니다.',
        duplicate:
          '동일한 시전자, 주체, 대상, 상태 및 사용자 정의 텍스트가 이미 활성화되어 있습니다.',
        noTargets: '다중 대상 적용을 위한 대상 토큰이 지정되지 않았습니다.',
        noSelection:
          '--multi-target 을 사용하기 전에 보드에서 하나 이상의 토큰을 선택하세요.',
        invalidIds: '현재 선택 항목에서 유효한 토큰 ID를 찾을 수 없습니다.',
        reSelectTokens:
          '원래 선택한 토큰을 찾을 수 없습니다. 토큰을 다시 선택하고 다시 시도하세요.',
        conditionNotFound: '상태 ID를 찾을 수 없습니다.',
        gmOnly: '상태 추적기 명령어는 GM 전용입니다.',
        commandFailed:
          '명령어를 안전하게 완료할 수 없습니다. 자세한 내용은 API 콘솔을 확인하세요.',
        sourceTokenNotFound: '시전자 토큰을 찾을 수 없습니다.',
        targetTokenNotFound: '대상 토큰을 찾을 수 없습니다.',
        subjectTokenNotFound: '주체 토큰을 찾을 수 없습니다.',
        invalidCondition:
          "상태는 미리 정의된 상태 중 하나이거나 '기타'여야 합니다.",
        subjectOnlyCustom:
          '--subject 는 주문, 능력, 이점, 불이익 및 기타 효과에만 유효합니다.',
        subjectBypassInvalid:
          '--subjectPromptBypass 는 값이 제공될 때 true 또는 false를 기대합니다.',
        customDetailsRequired:
          '{condition} 상세 내용이 필요합니다. --other 를 사용하여 제공하세요.',
        markerConfigFormat: '마커 설정 형식: --config marker Grappled=grab',
        markerPredefinedRequired:
          '마커 설정에는 미리 정의된 상태 이름이 필요합니다.',
        markerNameRequired:
          '마커 설정에는 비어 있지 않은 마커 이름이 필요합니다.',
        markerSet: '{condition} 마커가 {marker} 로 설정되었습니다.',
        healthBarSet: '체력 바가 {bar} 로 설정되었습니다.',
        boolSet: '{key} 이(가) {value} 로 설정되었습니다.',
        expectedBoolean: 'true 또는 false를 기대했습니다.',
        invalidHealthBar:
          '체력 바는 bar1_value, bar2_value 또는 bar3_value 여야 합니다.',
        markersDisabled: '마커가 비활성화되었습니다.',
        noMarkerConfigured: '이 상태에 대해 설정된 마커가 없습니다.',
        markerApplied: '마커 적용됨: {marker}',
        markerPresent: '마커가 이미 존재함: {marker}',
        langSet: '언어가 {locale} 로 설정되었습니다.',
        invalidLocale:
          '유효하지 않은 로케일입니다. 지원되는 로케일: {locales}.',
        otherDurationRequiresRounds:
          '기타 지속 시간은 숫자 라운드 수가 필요합니다. 예: --duration 5 rounds.',
        invalidDuration:
          "지속 시간은 '제거될 때까지', 턴 종료 옵션 또는 양수 라운드 수여야 합니다.",
        zeroHpNoConditions: '{name} 의 HP가 0이 되었으며 활성 상태가 없습니다.',
        zeroHpConditions:
          '{name} 의 HP가 0이 되었습니다. 제거할 상태를 선택하세요:',
        removeAllBtn: '{name} 의 모든 상태 제거',
        markIncapacitated: '무력화됨으로 표시',
        removeFromTurnOrder: '턴 순서에서 제거',
        alreadyIncapacitated: '{name} 은(는) 이미 무력화 상태입니다.',
        tokenRemovedFromTurn: '{name} 이(가) 턴 순서에서 제거되었습니다.',
        tokenNotInTurn: '{name} 을(를) 턴 순서에서 찾을 수 없습니다.',
        moveTokenPrompt:
          '{name} 을(를) 지도 레이어로 이동하여 다른 토큰을 방해하지 않으면서 가시성을 유지하시겠습니까?',
        moveTokenBtn: '{name} 을(를) 지도 레이어로 이동',
        tokenMoved: '{name} 이(가) 지도 레이어로 이동되었습니다.',
        tokenNotFound: '토큰을 찾을 수 없습니다.',
        noActiveConditions: '{name} 에 제거할 활성 상태가 없습니다.',
        deadNoConditions:
          '{name} 이(가) 사망으로 표시되었습니다. 활성 상태가 없었습니다.',
        scriptReady:
          '{name} 이(가) 활성화되었으며 버전 {version} 을(를) 사용 중입니다.',
        reachedZeroHp: '{name} 의 HP가 0에 도달함',
        manuallyRemoved: '수동으로 제거됨',
        durationExpired: '지속 시간이 만료됨',
        markedAsDead: '{name} 이(가) 사망으로 표시됨',
        conditionReorder:
          '턴 순서가 변경되어 {count}개의 추적된 조건 행이 잘못된 위치에 있을 수 있습니다. 아래를 클릭하여 지정된 토큰 뒤에 복원하세요.',
        conditionsReordered: '조건 행이 지정된 토큰 뒤로 재배치되었습니다.',
      },
      removal: {
        conditionField: '상태',
        reasonField: '이유',
        turnRowField: '턴 추적기 행',
        markerField: '마커',
        notConfigured: '설정되지 않음',
        markerRemoved: '제거됨 ({marker})',
        markerRetained: '유지됨 ({marker})',
        rowRemoved: '제거됨',
        rowMissing: '이미 누락됨',
        manualReason: '수동 제거',
      },
      cleanup: {
        orphaned: '연결이 끊긴 상태 항목',
        stale: '오래된 상태 항목',
        orphanedRows: '연결이 끊긴 턴 추적기 행',
        unusedMarkers: '사용되지 않는 마커',
      },
      apply: {
        turnAppended: '대상이 턴 순서에 없었습니다. 상태 행이 추가되었습니다.',
        turnInserted: '대상 토큰 아래에 상태 행이 삽입되었습니다.',
      },
    },
    handout: {
      versionLabel: '버전',
      subtitle: 'D&D 5e 상태 효과 관리자',
      footerNote:
        '이 유인물은 스크립트가 로드될 때마다 자동으로 생성 및 업데이트됩니다.',
      overview: {
        heading: '개요',
        body: '상태 추적기(Condition Tracker)는 D&D 5e 상태 조건 및 사용자 정의 효과를 Roll20 턴 추적기의 레이블이 지정된 행으로 관리합니다. 토큰에 상태를 적용하고, 이니셔티브 순서에 따라 지속 시간을 추적하며, 턴이 종료될 때 만료된 효과를 자동으로 제거합니다. 모든 명령어는 GM 전용이며 채팅 또는 설치된 매크로를 통해 실행할 수 있습니다.',
      },
      quickStart: {
        heading: '빠른 시작',
        colCommand: '명령어',
        colDesc: '설명',
        rows: [
          [
            '!condition-tracker --prompt',
            '단계별 위저드 — 대화형으로 상태, 토큰 및 지속 시간을 선택합니다. ConditionTrackerWizard 매크로로도 사용할 수 있습니다.',
          ],
          [
            '!condition-tracker --multi-target',
            '여러 토큰에 하나의 상태를 동시에 적용합니다. ConditionTrackerMultiTarget 매크로로도 사용할 수 있습니다.',
          ],
          [
            '!condition-tracker --menu',
            '상태를 적용, 검토 또는 제거할 수 있는 버튼이 있는 메인 관리 메뉴를 엽니다.',
          ],
        ],
      },
      commandsRef: {
        heading: '명령어 참조',
        colFlag: '플래그',
        colDesc: '설명',
        rows: [
          ['--prompt', '대화형 단계별 위저드 UI'],
          ['--multi-target', '여러 대상 토큰에 동시에 상태 적용'],
          ['--menu', '메인 메뉴 표시 (제거 메뉴의 경우 remove 추가)'],
          ['--source X --target Y --condition Z', '위저드 없이 직접 상태 적용'],
          ['--duration &lt;값&gt;', '직접 적용 시 지속 시간 (예: 2 rounds)'],
          [
            '--other &lt;텍스트&gt;',
            '주문 / 능력 / 기타 효과 유형에 대한 사용자 정의 텍스트',
          ],
          ['--remove &lt;condition-id&gt;', '고유 ID로 특정 상태 제거'],
          [
            '--config &lt;옵션&gt; &lt;값&gt;',
            '구성 설정 조정 (아래 설정 섹션 참조)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            '이 명령어에 대해서만 subjectPromptBypass 재정의 (--subject-prompt-bypass 도 지원)',
          ],
          ['--cleanup', '상태 조정 — 연결이 끊긴 상태 및 턴 추적기 행 제거'],
          [
            '--reorder-conditions',
            '턴 순서에서 조건 행을 할당된 토큰 뒤로 수동으로 재배치',
          ],
          ['--reinstall-macro', 'GM 매크로 재생성 또는 업데이트'],
          [
            '--reinstall-handout',
            '현지화된 도움말 유인물 재생성 또는 업데이트',
          ],
          [
            '--lang &lt;로케일&gt;',
            '이 명령어의 메시지를 추가 로케일로 출력 (이중 언어 모드)',
          ],
          ['--help', '채팅에 간단한 도움말 카드 표시'],
        ],
      },
      standardConditions: {
        heading: '표준 상태 (D&D 5e)',
        colCondition: '상태',
      },
      customEffects: {
        heading: '사용자 정의 효과 유형',
        colType: '유형',
        colNotes: '참고',
        rows: [
          [
            '🔮 주문 (Spell)',
            '명명된 주문 효과 추적 — 주문 이름을 입력하라는 메시지가 표시됩니다.',
          ],
          [
            '🎯 능력 (Ability)',
            '명명된 클래스 또는 종족 능력 추적 — 이름을 입력하라는 메시지가 표시됩니다.',
          ],
          [
            '🍀 이점 (Advantage)',
            '한 토큰에서 다른 토큰으로 부여된 이점을 기록합니다. 이니셔티브에서 시전자와 함께 그룹화됩니다.',
          ],
          [
            '⬇️ 불이익 (Disadvantage)',
            '가해진 불이익을 기록합니다. 이니셔티브에서 시전자와 함께 그룹화됩니다.',
          ],
          [
            '📝 기타 (Other)',
            '자유 형식 사용자 정의 레이블 — 설명을 입력하라는 메시지가 표시됩니다.',
          ],
        ],
      },
      durationOptions: {
        heading: '지속 시간 옵션',
        intro:
          '남은 카운트는 턴 추적기 pr 열에 표시되며 고정된 토큰의 턴이 종료될 때 감소합니다.',
        colOption: '옵션',
        colBehaviour: '동작',
        rows: [
          [
            '제거될 때까지',
            '영구적 — 메뉴 또는 --remove 를 통해 수동으로 제거해야 합니다.',
          ],
          [
            '대상의 다음 턴 종료 시',
            '이니셔티브에서 대상 토큰의 다음 턴이 종료될 때 만료됩니다.',
          ],
          [
            '시전자의 다음 턴 종료 시',
            '이니셔티브에서 시전자 토큰의 다음 턴이 종료될 때 만료됩니다.',
          ],
          [
            '1 / 2 / 3 / 10 라운드',
            '고정된 카운트다운; 고정 토큰의 턴 종료 시마다 1씩 감소합니다.',
          ],
        ],
      },
      configuration: {
        heading: '설정',
        intro:
          '!condition-tracker --config &lt;옵션&gt; &lt;값&gt; 또는 메인 메뉴의 설정 버튼을 사용하세요.',
        colOption: '옵션',
        colValues: '값',
        colDesc: '설명',
        rows: [
          [
            'useMarkers',
            'true / false',
            '상태가 추가될 때 토큰에 Roll20 상태 마커를 적용합니다.',
          ],
          [
            'useIcons',
            'true / false',
            '턴 추적기 행에 이모지 대신 짧은 아이콘 코드(예: [G])를 표시합니다.',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            '주문 / 능력 / 기타 효과에 대해 선택적인 주체 토큰 단계를 건너뜁니다.',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            '모니터링할 토큰 바; 0으로 떨어지면 GM에게 상태 정리를 요청합니다.',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            '채팅 메시지 및 도움말 유인물의 출력 언어',
          ],
          [
            'marker',
            '&lt;상태&gt;=&lt;마커 이름&gt;',
            '특정 상태에 사용되는 상태 마커를 재정의합니다 (예: marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: '기본 상태 마커',
        colCondition: '상태',
        colMarker: '마커 이름',
      },
      availableLocales: {
        heading: '사용 가능한 번역',
        intro:
          'language 설정 옵션을 사용하여 채팅 메시지와 도움말 유인물을 지원되는 locale로 설정하세요. en, zh, pt에 대한 짧은 별칭도 허용됩니다.',
        colLocale: '로케일',
        colLanguage: '언어',
        colFile: '번역 파일',
      },
    },
  };

  const TRANSLATION$7 = {
    conditions: {
      Grappled: {
        past: 'pochwycony',
        verb: 'chwyta',
      },
      Restrained: {
        past: 'unieruchomiony',
        verb: 'unieruchamia',
      },
      Prone: {
        past: 'powalony',
        verb: 'powala',
      },
      Poisoned: {
        past: 'zatruty',
        verb: 'zatruwa',
      },
      Stunned: {
        past: 'ogłuszony',
        verb: 'ogłusza',
      },
      Blinded: {
        past: 'oślepiony',
        verb: 'oślepia',
      },
      Charmed: {
        past: 'zauroczony',
        verb: 'zaurocza',
      },
      Frightened: {
        past: 'przestraszony',
        verb: 'przeraża',
      },
      Incapacitated: {
        past: 'ubezwłasnowolniony',
        verb: 'ubezwłasnowalnia',
      },
      Invisible: {
        past: 'niewidzialny',
        verb: 'czyni',
        suffix: 'niewidzialnym',
      },
      Paralyzed: {
        past: 'sparaliżowany',
        verb: 'paraliżuje',
      },
      Petrified: {
        past: 'skamieniały',
        verb: 'zamienia w kamień',
      },
      Unconscious: {
        past: 'nieprzytomny',
        verb: 'pozbawia przytomności',
      },
      Spell: {
        past: 'pod wpływem zaklęcia',
        verb: 'rzuca zaklęcie na',
      },
      Ability: {
        past: 'pod wpływem zdolności',
        verb: 'używa zdolności na',
      },
      Advantage: {
        past: 'ma ułatwienie',
        verb: 'daje ułatwienie',
        noBy: true,
      },
      Disadvantage: {
        past: 'ma utrudnienie',
        verb: 'daje utrudnienie',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Pochwycony',
      Restrained: 'Unieruchomiony',
      Prone: 'Powalony',
      Poisoned: 'Zatruty',
      Stunned: 'Ogłuszony',
      Blinded: 'Oślepiony',
      Charmed: 'Zauroczony',
      Frightened: 'Przestraszony',
      Incapacitated: 'Ubezwłasnowolniony',
      Invisible: 'Niewidzialny',
      Paralyzed: 'Sparaliżowany',
      Petrified: 'Skamieniały',
      Unconscious: 'Nieprzytomny',
      Spell: 'Zaklęcie',
      Ability: 'Zdolność',
      Advantage: 'Ułatwienie',
      Disadvantage: 'Utrudnienie',
      Other: 'Inne',
    },
    templates: {
      display: {
        custom: '{emoji} {target} pod wpływem {effect} ({source})',
        advantage: '{emoji} {source} ma ułatwienie przeciwko {target}{subject}',
        disadvantage:
          '{emoji} {source} ma utrudnienie przeciwko {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} jest {past}',
        standard: '{emoji} {target} {past} przez {source}',
      },
      apply: {
        custom: '{source} nakłada {effect} na {target}.',
        advantage: '{source} ma ułatwienie przeciwko {target}{subject}.',
        disadvantage: '{source} ma utrudnienie przeciwko {target}{subject}.',
        self: '{target} jest {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} nie jest już pod wpływem {effect}.',
        advantage:
          '{source} nie ma już ułatwienia przeciwko {target}{subject}.',
        disadvantage:
          '{source} nie ma już utrudnienia przeciwko {target}{subject}.',
        noBy: '{target} nie jest już {past}.',
        self: '{target} nie jest już {past}.',
        standard: '{target} nie jest już {past} przez {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Wybierz stan',
        selectSource: 'Wybierz żeton źródła',
        selectTarget: 'Wybierz żeton celu',
        selectSubject: 'Wybierz podmiot',
        selectDuration: 'Wybierz czas trwania',
        confirmTargetTitle: 'Potwierdź listę celów',
        applyEffectTitle: 'Zastosuj efekt {condition}',
        noTokens: 'Nie znaleziono nazwanych żetonów na aktywnej stronie.',
        confirmIntro: 'Następujące żetony otrzymają stan:',
        confirmBtn: 'Potwierdź listę celów',
        enterDetails: 'Wprowadź szczegóły efektu',
        noneBtn: 'Żaden',
        noneOrSourceBtn: 'Żaden lub zastosuj do źródła',
        subjectDesc: 'Wybierz, kto lub co wywołuje efekt.',
        sourceDesc:
          'Wybierz stworzenie, które tworzy lub generuje stan albo efekt.',
        targetDesc: 'Wybierz stworzenie, które otrzyma stan lub efekt.',
        otherText: 'Własny tekst stanu',
        effectDetails: 'Szczegóły {condition}',
      },
      col: {
        players: 'Gracze',
        npcs: 'BN',
        conditions: 'Stany',
        customEffects: 'Własne efekty',
        permanentTurnEnd: 'Trwały / Koniec tury',
        rounds: 'Rundy',
        command: 'Polecenie',
        result: 'Wynik',
        field: 'Pole',
        value: 'Wartość',
        option: 'Opcja',
        condition: 'Stan',
        marker: 'Znacznik',
        item: 'Element',
        removed: 'Usunięto',
        details: 'Szczegóły',
        description: 'Opis',
        scenario: 'Scenariusz',
      },
      dur: {
        untilRemoved: 'Do usunięcia',
        endOfTargetTurn: 'Koniec następnej tury celu',
        endOfSourceTurn: 'Koniec następnej tury źródła',
        round1: '1 runda',
        round2: '2 rundy',
        round3: '3 rundy',
        round10: '10 rund',
        custom: 'Własny',
        customPrompt: 'Liczba rund',
        untilRemovedDisplay: 'Do usunięcia',
        turnsRemaining: 'Pozostało {n} koniec (końców) tury',
      },
      btn: {
        openWizard: 'Otwórz kreator',
        openMultiTarget: 'Otwórz kreator wielu celów',
        openRemovalList: 'Otwórz listę usuwania',
        showConfig: 'Pokaż konfigurację',
        runCleanup: 'Uruchom czyszczenie',
        reinstallMacro: 'Zainstaluj ponownie makro',
        reinstallHandout: 'Zainstaluj ponownie handout',
        showHelp: 'Pokaż pomoc',
        reorderConditions: 'Zmień kolejność wierszy stanów',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Usuwanie stanów',
        config: 'Konfiguracja',
        configTracker: 'Konfiguracja Condition Trackera',
        help: 'Pomoc',
        applied: 'Zastosowano',
        removed: 'Stan usunięty',
        cleanup: 'Czyszczenie zakończone',
        macroReinstalled: 'Makro zainstalowane ponownie',
        handoutReinstalled: 'Handout zainstalowany ponownie',
        warning: 'Ostrzeżenie',
        error: 'Błąd',
        turnOrder: 'Kolejność tur',
        noConditions: 'Brak stanów',
        tokenMoved: 'Żeton przeniesiony',
        markedDead: 'Oznaczony jako martwy',
        zeroHp: '{name} — 0 PŻ',
        moveToken: '{name} — Przenieść żeton?',
        scriptReady: 'Skrypt gotowy',
        conditionReorder: 'Kolejność tur zmieniona',
      },
      heading: {
        quickActions: 'Szybkie akcje',
        settings: 'Ustawienia',
        markerMappings: 'Mapowania znaczników',
        result: 'Wynik',
        info: 'Informacje',
        commandOptions: 'Opcje poleceń',
        promptUi: 'Interfejs kreatora',
        examples: 'Przykłady',
        summary: 'Podsumowanie',
      },
      msg: {
        noActive: 'Nie są śledzone żadne aktywne stany.',
        configReset: 'Konfiguracja zresetowana do domyślnych wartości modułu.',
        unknownConfig:
          'Nieznana opcja konfiguracji. Użyj --config, aby wyświetlić obsługiwane ustawienia.',
        macroReinstalled:
          'Makra {wizard} i {multiTarget} zostały ponownie zainstalowane dla wszystkich obecnych graczy z rolą MG.',
        handoutReinstalled:
          'Handout pomocy {handout} został ponownie zainstalowany.',
        duplicate:
          'Ta dokładna kombinacja źródła, podmiotu, celu, stanu i własnego tekstu jest już aktywna.',
        noTargets: 'Nie podano żetonów celu dla zastosowania wielu celów.',
        noSelection:
          'Wybierz przynajmniej jeden żeton na planszy przed użyciem --multi-target.',
        invalidIds:
          'Nie znaleziono prawidłowych identyfikatorów żetonów w bieżącym zaznaczeniu.',
        reSelectTokens:
          'Żaden z pierwotnie wybranych żetonów nie mógł zostać znaleziony. Wybierz żetony ponownie i spróbuj jeszcze raz.',
        conditionNotFound: 'Nie znaleziono identyfikatora stanu.',
        gmOnly: 'Polecenia Condition Trackera są dostępne tylko dla MG.',
        commandFailed:
          'Polecenia nie można było bezpiecznie wykonać. Sprawdź konsolę API.',
        sourceTokenNotFound: 'Nie można było znaleźć żetonu źródła.',
        targetTokenNotFound: 'Nie można było znaleźć żetonu celu.',
        subjectTokenNotFound: 'Nie można było znaleźć żetonu podmiotu.',
        invalidCondition:
          'Stan musi być jednym ze wstępnie zdefiniowanych stanów lub Inne.',
        subjectOnlyCustom:
          '--subject jest prawidłowy tylko dla Zaklęcia, Zdolności, Ułatwienia, Utrudnienia i Innego.',
        subjectBypassInvalid:
          '--subjectPromptBypass oczekuje wartości true lub false, gdy wartość jest podana.',
        customDetailsRequired:
          'Szczegóły {condition} są wymagane. Użyj --other, aby je podać.',
        markerConfigFormat:
          'Format konfiguracji znacznika: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Konfiguracja znacznika wymaga wstępnie zdefiniowanej nazwy stanu.',
        markerNameRequired:
          'Konfiguracja znacznika wymaga niepustej nazwy znacznika.',
        markerSet: 'Znacznik {condition} ustawiony na {marker}.',
        healthBarSet: 'Pasek zdrowia ustawiony na {bar}.',
        boolSet: '{key} ustawione na {value}.',
        expectedBoolean: 'Oczekiwano true lub false.',
        invalidHealthBar:
          'Pasek zdrowia musi być bar1_value, bar2_value lub bar3_value.',
        markersDisabled: 'Znaczniki są wyłączone.',
        noMarkerConfigured:
          'Dla tego stanu nie skonfigurowano żadnego znacznika.',
        markerApplied: 'Znacznik zastosowany: {marker}',
        markerPresent: 'Znacznik już obecny: {marker}',
        langSet: 'Język ustawiony na {locale}.',
        invalidLocale: 'Nieprawidłowy język. Obsługiwane języki: {locales}.',
        otherDurationRequiresRounds:
          'Czas trwania Inne wymaga numerycznej liczby rund, na przykład --duration 5 rounds.',
        invalidDuration:
          'Czas trwania musi być Do usunięcia, opcją końca tury lub dodatnią liczbą rund.',
        zeroHpNoConditions: '{name} osiągnął 0 PŻ i nie ma aktywnych stanów.',
        zeroHpConditions: '{name} osiągnął 0 PŻ. Wybierz stany do usunięcia:',
        removeAllBtn: 'Usuń wszystkie stany dla {name}',
        markIncapacitated: 'Oznacz jako ubezwłasnowolnionego',
        removeFromTurnOrder: 'Usuń z kolejności tur',
        alreadyIncapacitated: '{name} jest już ubezwłasnowolniony.',
        tokenRemovedFromTurn: '{name} został usunięty z kolejności tur.',
        tokenNotInTurn: '{name} nie został znaleziony w kolejności tur.',
        moveTokenPrompt:
          'Przenieść {name} na warstwę mapy, żeby pozostał widoczny, ale nie przeszkadzał innym żetonom?',
        moveTokenBtn: 'Przenieś {name} na warstwę mapy',
        tokenMoved: '{name} został przeniesiony na warstwę mapy.',
        tokenNotFound: 'Nie znaleziono żetonu.',
        noActiveConditions: '{name} nie ma aktywnych stanów do usunięcia.',
        deadNoConditions:
          '{name} został oznaczony jako martwy. Nie było aktywnych stanów.',
        scriptReady: '{name} jest aktywny i używasz wersji {version}.',
        reachedZeroHp: '{name} osiągnął 0 PŻ',
        manuallyRemoved: 'zostało ręcznie usunięte',
        durationExpired: 'czas trwania wygasł',
        markedAsDead: '{name} został oznaczony jako martwy',
        conditionReorder:
          'Kolejność tur zmieniła się i {count} śledzony (śledzonych) wiersz stanów może być teraz poza kolejnością. Kliknij poniżej, aby przywrócić je po przypisanych żetonach.',
        conditionsReordered:
          'Wiersze stanów zostały przesunięte po ich przypisanych żetonach.',
      },
      removal: {
        conditionField: 'Stan',
        reasonField: 'Powód',
        turnRowField: 'Wiersz śledzenia tur',
        markerField: 'Znacznik',
        notConfigured: 'Nie skonfigurowano',
        markerRemoved: 'Usunięto ({marker})',
        markerRetained: 'Zachowano ({marker})',
        rowRemoved: 'Usunięto',
        rowMissing: 'Już brakuje',
        manualReason: 'Ręczne usunięcie',
      },
      cleanup: {
        orphaned: 'Osierocone wpisy stanów',
        stale: 'Przestarzałe wpisy stanów',
        orphanedRows: 'Osierocone wiersze śledzenia tur',
        unusedMarkers: 'Nieużywane znaczniki',
      },
      apply: {
        turnAppended:
          'Cel nie był w kolejności tur; wiersz stanu został dołączony na końcu.',
        turnInserted: 'Wiersz stanu wstawiony poniżej żetonu celu.',
      },
    },
    handout: {
      versionLabel: 'Wersja',
      subtitle: 'Menedżer efektów statusu D&D 5e',
      footerNote:
        'Ten handout jest automatycznie tworzony i aktualizowany przy każdym załadowaniu skryptu.',
      overview: {
        heading: 'Przegląd',
        body: 'Condition Tracker zarządza stanami D&D 5e i własnymi efektami jako oznaczonymi wierszami w Śledzoniku Tur Roll20. Stosuj stany do żetonów, śledź czas trwania według kolejności inicjatywy i automatycznie usuwaj wygasłe efekty na końcu tury. Wszystkie polecenia są dostępne tylko dla MG i można je uruchamiać z czatu lub za pomocą zainstalowanych makr.',
      },
      quickStart: {
        heading: 'Szybki start',
        colCommand: 'Polecenie',
        colDesc: 'Opis',
        rows: [
          [
            '!condition-tracker --prompt',
            'Kreator krok po kroku — interaktywnie wybierz stan, żetony i czas trwania. Dostępny również jako makro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Zastosuj jeden stan do kilku żetonów jednocześnie. Dostępny również jako makro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Otwórz główne menu zarządzania z przyciskami do stosowania, przeglądania lub usuwania stanów.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Dokumentacja poleceń',
        colFlag: 'Flaga',
        colDesc: 'Opis',
        rows: [
          ['--prompt', 'Interaktywny kreator krok po kroku'],
          ['--multi-target', 'Zastosuj stan do wielu żetonów celu naraz'],
          ['--menu', 'Pokaż główne menu (dodaj remove dla menu usuwania)'],
          [
            '--source X --target Y --condition Z',
            'Zastosuj stan bezpośrednio bez kreatora',
          ],
          [
            '--duration &lt;wartość&gt;',
            'Czas trwania dla bezpośredniego zastosowania (np. 2 rounds)',
          ],
          [
            '--other &lt;tekst&gt;',
            'Własny tekst dla typów efektów Zaklęcie / Zdolność / Inne',
          ],
          [
            '--remove &lt;ID stanu&gt;',
            'Usuń konkretny stan według jego unikalnego identyfikatora',
          ],
          [
            '--config &lt;opcja&gt; &lt;wartość&gt;',
            'Dostosuj ustawienia konfiguracji (patrz sekcja Konfiguracja poniżej)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Nadpisz subjectPromptBypass tylko dla tego polecenia (obsługuje również --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Uzgodnij stan — usuń osierocone stany i wiersze Śledzika Tur',
          ],
          [
            '--reorder-conditions',
            'Ręcznie przenieść wiersze warunków za przypisane tokeny w kolejności tur',
          ],
          ['--reinstall-macro', 'Utwórz ponownie lub zaktualizuj makra MG'],
          [
            '--reinstall-handout',
            'Utwórz ponownie lub zaktualizuj zlokalizowany handout pomocy',
          ],
          [
            '--lang &lt;język&gt;',
            'Wyświetl wiadomości tego polecenia w dodatkowym języku (tryb dwujęzyczny)',
          ],
          ['--help', 'Pokaż krótką kartę pomocy w czacie'],
        ],
      },
      standardConditions: {
        heading: 'Standardowe stany (D&amp;D 5e)',
        colCondition: 'Stan',
      },
      customEffects: {
        heading: 'Własne typy efektów',
        colType: 'Typ',
        colNotes: 'Uwagi',
        rows: [
          [
            '🔮 Zaklęcie',
            'Śledź nazwany efekt zaklęcia — zostaniesz poproszony o podanie nazwy zaklęcia',
          ],
          [
            '🎯 Zdolność',
            'Śledź nazwaną zdolność klasy lub rasy — zostaniesz poproszony o podanie nazwy',
          ],
          [
            '🍀 Ułatwienie',
            'Zapisz ułatwienie przyznane od jednego żetonu drugiemu; zgrupowane ze źródłem w inicjatywie',
          ],
          [
            '⬇️ Utrudnienie',
            'Zapisz nałożone utrudnienie; zgrupowane ze źródłem w inicjatywie',
          ],
          [
            '📝 Inne',
            'Dowolna własna etykieta — zostaniesz poproszony o podanie opisu',
          ],
        ],
      },
      durationOptions: {
        heading: 'Opcje czasu trwania',
        intro:
          'Pozostała liczba jest wyświetlana w kolumnie pr Śledzika Tur i zmniejsza się, gdy kończy się tura żetonu kotwicy.',
        colOption: 'Opcja',
        colBehaviour: 'Zachowanie',
        rows: [
          [
            'Do usunięcia',
            'Trwały — musi być usunięty ręcznie przez menu lub --remove',
          ],
          [
            'Koniec następnej tury celu',
            'Wygasa gdy kończy się następna tura żetonu celu w inicjatywie',
          ],
          [
            'Koniec następnej tury źródła',
            'Wygasa gdy kończy się następna tura żetonu źródła w inicjatywie',
          ],
          [
            '1 / 2 / 3 / 10 rund',
            'Stały odliczanie; jedno zmniejszenie na koniec tury żetonu kotwicy',
          ],
        ],
      },
      configuration: {
        heading: 'Konfiguracja',
        intro:
          'Użyj !condition-tracker --config &lt;opcja&gt; &lt;wartość&gt; lub przycisku Konfiguracja w głównym menu.',
        colOption: 'Opcja',
        colValues: 'Wartości',
        colDesc: 'Opis',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Zastosuj znaczniki statusu Roll20 do żetonów przy dodawaniu stanu',
          ],
          [
            'useIcons',
            'true / false',
            'Pokaż krótkie kody ikon (np. [G]) zamiast emoji w wierszach Śledzika Tur',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Pomiń opcjonalny krok wyboru podmiotu dla efektów Zaklęcie / Zdolność / Inne',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Pasek do obserwacji; gdy spadnie do 0, MG jest proszony o wyczyszczenie stanów',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Język wyjściowy dla wiadomości czatu i handoutu pomocy',
          ],
          [
            'marker',
            '&lt;Stan&gt;=&lt;nazwa znacznika&gt;',
            'Nadpisz znacznik statusu używany dla konkretnego stanu (np. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Domyślne znaczniki statusu',
        colCondition: 'Stan',
        colMarker: 'Nazwa znacznika',
      },
      availableLocales: {
        heading: 'Dostępne tłumaczenia',
        intro:
          'Użyj opcji konfiguracji języka, aby ustawić wiadomości czatu i handout pomocy na dowolny obsługiwany język. Krótkie aliasy są również akceptowane dla en, zh i pt.',
        colLocale: 'Locale',
        colLanguage: 'Język',
        colFile: 'Plik tłumaczenia',
      },
    },
  };

  const TRANSLATION$6 = {
    conditions: {
      Grappled: {
        past: 'agarrado',
        verb: 'agarra',
      },
      Restrained: {
        past: 'restringido',
        verb: 'restringe',
      },
      Prone: {
        past: 'derrubado',
        verb: 'derruba',
      },
      Poisoned: {
        past: 'envenenado',
        verb: 'envenena',
      },
      Stunned: {
        past: 'atordoado',
        verb: 'atordoa',
      },
      Blinded: {
        past: 'cego',
        verb: 'cega',
      },
      Charmed: {
        past: 'encantado',
        verb: 'encanta',
      },
      Frightened: {
        past: 'assustado',
        verb: 'assusta',
      },
      Incapacitated: {
        past: 'incapacitado',
        verb: 'incapacita',
      },
      Invisible: {
        past: 'invisível',
        verb: 'torna',
        suffix: 'invisível',
      },
      Paralyzed: {
        past: 'paralisado',
        verb: 'paralisa',
      },
      Petrified: {
        past: 'petrificado',
        verb: 'petrifica',
      },
      Unconscious: {
        past: 'inconsciente',
        verb: 'deixa',
        suffix: 'inconsciente',
      },
      Spell: {
        past: 'afetado por um feitiço',
        verb: 'lança um feitiço sobre',
      },
      Ability: {
        past: 'afetado por uma habilidade',
        verb: 'usa uma habilidade em',
      },
      Advantage: {
        past: 'tem vantagem',
        verb: 'concede vantagem a',
        noBy: true,
      },
      Disadvantage: {
        past: 'tem desvantagem',
        verb: 'impõe desvantagem a',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Agarrado',
      Restrained: 'Restringido',
      Prone: 'Derrubado',
      Poisoned: 'Envenenado',
      Stunned: 'Atordoado',
      Blinded: 'Cego',
      Charmed: 'Encantado',
      Frightened: 'Assustado',
      Incapacitated: 'Incapacitado',
      Invisible: 'Invisível',
      Paralyzed: 'Paralisado',
      Petrified: 'Petrificado',
      Unconscious: 'Inconsciente',
      Spell: 'Feitiço',
      Ability: 'Habilidade',
      Advantage: 'Vantagem',
      Disadvantage: 'Desvantagem',
      Other: 'Outro',
    },
    templates: {
      display: {
        custom: '{emoji} {target} afetado por {effect} ({source})',
        advantage: '{emoji} {source} tem vantagem contra {target}{subject}',
        disadvantage:
          '{emoji} {source} tem desvantagem contra {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} está {past}',
        standard: '{emoji} {target} {past} por {source}',
      },
      apply: {
        custom: '{source} aplica {effect} a {target}.',
        advantage: '{source} tem vantagem contra {target}{subject}.',
        disadvantage: '{source} tem desvantagem contra {target}{subject}.',
        self: '{target} está {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} já não está afetado por {effect}.',
        advantage: '{source} já não tem vantagem contra {target}{subject}.',
        disadvantage:
          '{source} já não tem desvantagem contra {target}{subject}.',
        noBy: '{target} já não {past}.',
        self: '{target} já não está {past}.',
        standard: '{target} já não está {past} por {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Selecionar condição',
        selectSource: 'Selecionar ficha de origem',
        selectTarget: 'Selecionar ficha alvo',
        selectSubject: 'Selecionar sujeito',
        selectDuration: 'Selecionar duração',
        confirmTargetTitle: 'Confirmar lista de alvos',
        applyEffectTitle: 'Aplicar efeito {condition}',
        noTokens: 'Não foram encontradas fichas com nome na página activa.',
        confirmIntro: 'As seguintes fichas receberão a condição:',
        confirmBtn: 'Confirmar lista de alvos',
        enterDetails: 'Introduzir detalhes do efeito',
        noneBtn: 'Nenhum',
        noneOrSourceBtn: 'Nenhum ou aplicar à origem',
        subjectDesc: 'Selecione quem ou o que aplica o efeito.',
        sourceDesc:
          'Selecione a criatura que cria ou gera a condição ou o efeito.',
        targetDesc:
          'Selecione a criatura que irá receber a condição ou o efeito.',
        otherText: 'Texto de condição personalizado',
        effectDetails: 'Detalhes de {condition}',
      },
      col: {
        players: 'Jogadores',
        npcs: 'PNJs',
        conditions: 'Condições',
        customEffects: 'Efeitos personalizados',
        permanentTurnEnd: 'Permanente / Fim de turno',
        rounds: 'Rondas',
        command: 'Comando',
        result: 'Resultado',
        field: 'Campo',
        value: 'Valor',
        option: 'Opção',
        condition: 'Condição',
        marker: 'Marcador',
        item: 'Item',
        removed: 'Removido',
        details: 'Detalhes',
        description: 'Descrição',
        scenario: 'Cenário',
      },
      dur: {
        untilRemoved: 'Até ser removido',
        endOfTargetTurn: 'Fim do próximo turno do alvo',
        endOfSourceTurn: 'Fim do próximo turno da origem',
        round1: '1 ronda',
        round2: '2 rondas',
        round3: '3 rondas',
        round10: '10 rondas',
        custom: 'Personalizado',
        customPrompt: 'Número de rondas',
        untilRemovedDisplay: 'Até ser removido',
        turnsRemaining: '{n} fim(ns) de turno restante(s)',
      },
      btn: {
        openWizard: 'Abrir assistente',
        openMultiTarget: 'Abrir assistente multi-alvo',
        openRemovalList: 'Abrir lista de remoção',
        showConfig: 'Mostrar configuração',
        runCleanup: 'Executar limpeza',
        reinstallMacro: 'Reinstalar macro',
        reinstallHandout: 'Reinstalar documento',
        showHelp: 'Mostrar ajuda',
        reorderConditions: 'Reordenar linhas de condições',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Remoção — Condition Tracker',
        config: 'Configuração',
        configTracker: 'Configuração — Condition Tracker',
        help: 'Ajuda',
        applied: 'Aplicado',
        removed: 'Condição removida',
        cleanup: 'Limpeza concluída',
        macroReinstalled: 'Macro reinstalada',
        handoutReinstalled: 'Documento reinstalado',
        warning: 'Aviso',
        error: 'Erro',
        turnOrder: 'Ordem de iniciativa',
        noConditions: 'Sem condições',
        tokenMoved: 'Ficha movida',
        markedDead: 'Marcado como morto',
        zeroHp: '{name} — 0 PV',
        moveToken: '{name} — Mover ficha?',
        scriptReady: 'Script pronto',
        conditionReorder: 'Ordem de turno alterada',
      },
      heading: {
        quickActions: 'Acções rápidas',
        settings: 'Definições',
        markerMappings: 'Mapeamento de marcadores',
        result: 'Resultado',
        info: 'Informação',
        commandOptions: 'Opções de comando',
        promptUi: 'Interface do assistente',
        examples: 'Exemplos',
        summary: 'Resumo',
      },
      msg: {
        noActive: 'Não há condições activas a ser rastreadas.',
        configReset: 'Configuração reposta para os valores predefinidos.',
        unknownConfig:
          'Opção de configuração desconhecida. Utilize --config para ver as definições suportadas.',
        macroReinstalled:
          'As macros {wizard} e {multiTarget} foram reinstaladas para todos os mestres activos.',
        handoutReinstalled: 'O documento de ajuda {handout} foi reinstalado.',
        duplicate:
          'Esta combinação exacta de origem, sujeito, alvo, condição e texto personalizado já está activa.',
        noTargets:
          'Não foram especificadas fichas alvo para a aplicação multi-alvo.',
        noSelection:
          'Seleccione pelo menos uma ficha no tabuleiro antes de utilizar --multi-target.',
        invalidIds:
          'Não foram encontrados IDs de ficha válidos na selecção actual.',
        reSelectTokens:
          'Nenhuma das fichas originalmente seleccionadas foi encontrada. Volte a seleccionar as fichas e tente novamente.',
        conditionNotFound: 'ID de condição não encontrado.',
        gmOnly: 'Os comandos do Condition Tracker são exclusivos do Mestre.',
        commandFailed:
          'O comando não pôde ser concluído com segurança. Consulte a consola da API para mais detalhes.',
        sourceTokenNotFound: 'Ficha de origem não encontrada.',
        targetTokenNotFound: 'Ficha alvo não encontrada.',
        subjectTokenNotFound: 'Ficha do sujeito não encontrada.',
        invalidCondition:
          'A condição deve ser uma das condições predefinidas ou Outro.',
        subjectOnlyCustom:
          '--subject só é válido para Feitiço, Habilidade, Vantagem, Desvantagem e Outro.',
        subjectBypassInvalid:
          '--subjectPromptBypass espera true ou false quando um valor é fornecido.',
        customDetailsRequired:
          'São necessários detalhes de {condition}. Utilize --other para os fornecer.',
        markerConfigFormat:
          'O formato de configuração do marcador é: --config marker Grappled=grab',
        markerPredefinedRequired:
          'A configuração do marcador requer um nome de condição predefinido.',
        markerNameRequired:
          'A configuração do marcador requer um nome de marcador não vazio.',
        markerSet: 'Marcador de {condition} definido para {marker}.',
        healthBarSet: 'Barra de saúde definida para {bar}.',
        boolSet: '{key} definido para {value}.',
        expectedBoolean: 'Esperado true ou false.',
        invalidHealthBar:
          'A barra de saúde deve ser bar1_value, bar2_value ou bar3_value.',
        markersDisabled: 'Os marcadores estão desactivados.',
        noMarkerConfigured:
          'Não há nenhum marcador configurado para esta condição.',
        markerApplied: 'Marcador aplicado: {marker}',
        markerPresent: 'Marcador já presente: {marker}',
        langSet: 'Idioma definido para {locale}.',
        invalidLocale:
          'Configuração regional inválida. Configurações regionais suportadas: {locales}.',
        otherDurationRequiresRounds:
          'A duração Outro requer um número de rondas, por exemplo --duration 5 rounds.',
        invalidDuration:
          'A duração deve ser Até ser removido, uma opção de fim de turno ou um número positivo de rondas.',
        zeroHpNoConditions: '{name} chegou a 0 PV e não tem condições activas.',
        zeroHpConditions:
          '{name} chegou a 0 PV. Escolha as condições a remover:',
        removeAllBtn: 'Remover todas as condições de {name}',
        markIncapacitated: 'Marcar como Incapacitado',
        removeFromTurnOrder: 'Remover da ordem de iniciativa',
        alreadyIncapacitated: '{name} já está Incapacitado.',
        tokenRemovedFromTurn: '{name} foi removido da ordem de iniciativa.',
        tokenNotInTurn: '{name} não foi encontrado na ordem de iniciativa.',
        moveTokenPrompt:
          'Mover {name} para a camada do mapa para que permaneça visível sem interferir com outras fichas?',
        moveTokenBtn: 'Mover {name} para a camada do mapa',
        tokenMoved: '{name} foi movido para a camada do mapa.',
        tokenNotFound: 'Ficha não encontrada.',
        noActiveConditions: '{name} não tem condições activas para remover.',
        deadNoConditions:
          '{name} foi marcado como morto. Não havia condições activas.',
        scriptReady: '{name} está activo e está a utilizar a versão {version}.',
        reachedZeroHp: '{name} chegou a 0 PV',
        manuallyRemoved: 'foi removida manualmente',
        durationExpired: 'a sua duração expirou',
        markedAsDead: '{name} foi marcado como morto',
        conditionReorder:
          'A ordem de turno foi alterada e {count} linha(s) de condição rastreada(s) pode(m) estar fora do lugar. Clique abaixo para as restaurar após as fichas atribuídas.',
        conditionsReordered:
          'As linhas de condições foram reposicionadas após as fichas atribuídas.',
      },
      removal: {
        conditionField: 'Condição',
        reasonField: 'Motivo',
        turnRowField: 'Linha do registo de turnos',
        markerField: 'Marcador',
        notConfigured: 'Não configurado',
        markerRemoved: 'Removido ({marker})',
        markerRetained: 'Mantido ({marker})',
        rowRemoved: 'Removido',
        rowMissing: 'Já ausente',
        manualReason: 'Remoção manual',
      },
      cleanup: {
        orphaned: 'Entradas de condição órfãs',
        stale: 'Entradas de condição obsoletas',
        orphanedRows: 'Linhas órfãs do registo de turnos',
        unusedMarkers: 'Marcadores não utilizados',
      },
      apply: {
        turnAppended:
          'O alvo não estava na ordem de iniciativa; a linha de condição foi adicionada no fim.',
        turnInserted: 'Linha de condição inserida abaixo da ficha alvo.',
      },
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Gestor de efeitos de estado D&D 5e',
      footerNote:
        'Este documento é criado e actualizado automaticamente sempre que o script é carregado.',
      overview: {
        heading: 'Visão geral',
        body: 'O Condition Tracker gere as condições de estado de D&D 5e e os efeitos personalizados como linhas etiquetadas no Registo de Turnos do Roll20. Aplique condições a fichas, acompanhe as durações por ordem de iniciativa e remova automaticamente os efeitos expirados quando um turno termina. Todos os comandos são exclusivos do Mestre e podem ser activados a partir do chat ou através das macros instaladas.',
      },
      quickStart: {
        heading: 'Início rápido',
        colCommand: 'Comando',
        colDesc: 'Descrição',
        rows: [
          [
            '!condition-tracker --prompt',
            'Assistente passo a passo — escolha condição, fichas e duração de forma interactiva. Disponível também como macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Aplique uma condição a várias fichas simultaneamente. Disponível também como macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Abra o menu principal de gestão com botões para aplicar, rever ou remover condições.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Referência de comandos',
        colFlag: 'Opção',
        colDesc: 'Descrição',
        rows: [
          ['--prompt', 'Interface do assistente passo a passo'],
          [
            '--multi-target',
            'Aplicar uma condição a várias fichas alvo de uma vez',
          ],
          [
            '--menu',
            'Mostrar o menu principal (adicione remove para o menu de remoção)',
          ],
          [
            '--source X --target Y --condition Z',
            'Aplicar uma condição directamente sem o assistente',
          ],
          [
            '--duration &lt;valor&gt;',
            'Duração para uma aplicação directa (ex. 2 rounds)',
          ],
          [
            '--other &lt;texto&gt;',
            'Texto personalizado para os tipos de efeito Feitiço / Habilidade / Outro',
          ],
          [
            '--remove &lt;id-condição&gt;',
            'Remover uma condição específica pelo seu ID único',
          ],
          [
            '--config &lt;opção&gt; &lt;valor&gt;',
            'Ajustar as definições de configuração (consulte a secção Configuração)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Substituir subjectPromptBypass apenas para este comando (suporta também --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Reconciliar o estado — remover condições e linhas do registo de turnos órfãs',
          ],
          [
            '--reorder-conditions',
            'Reposicionar manualmente as linhas de condição a seguir aos tokens atribuídos na ordem de turnos',
          ],
          ['--reinstall-macro', 'Recriar ou actualizar as macros do Mestre'],
          [
            '--reinstall-handout',
            'Recriar ou actualizar o documento de ajuda localizado',
          ],
          [
            '--lang &lt;locale&gt;',
            'Apresentar as mensagens deste comando numa configuração regional adicional (modo bilingue)',
          ],
          ['--help', 'Mostrar um cartão de ajuda rápida no chat'],
        ],
      },
      standardConditions: {
        heading: 'Condições padrão (D&amp;D 5e)',
        colCondition: 'Condição',
      },
      customEffects: {
        heading: 'Tipos de efeitos personalizados',
        colType: 'Tipo',
        colNotes: 'Notas',
        rows: [
          [
            '🔮 Feitiço',
            'Rastrear um efeito de feitiço com nome — ser-lhe-á pedido o nome do feitiço',
          ],
          [
            '🎯 Habilidade',
            'Rastrear uma habilidade de classe ou raça com nome — ser-lhe-á pedido o nome',
          ],
          [
            '🍀 Vantagem',
            'Registar uma vantagem concedida de uma ficha a outra; agrupada com a origem na iniciativa',
          ],
          [
            '⬇️ Desvantagem',
            'Registar uma desvantagem imposta; agrupada com a origem na iniciativa',
          ],
          [
            '📝 Outro',
            'Etiqueta personalizada livre — ser-lhe-á pedida uma descrição',
          ],
        ],
      },
      durationOptions: {
        heading: 'Opções de duração',
        intro:
          'O contador restante é mostrado na coluna pr do Registo de Turnos e diminui quando o turno da ficha âncora termina.',
        colOption: 'Opção',
        colBehaviour: 'Comportamento',
        rows: [
          [
            'Até ser removido',
            'Permanente — deve ser removido manualmente através do menu ou --remove',
          ],
          [
            'Fim do próximo turno do alvo',
            'Expira quando o próximo turno da ficha alvo termina na iniciativa',
          ],
          [
            'Fim do próximo turno da origem',
            'Expira quando o próximo turno da ficha de origem termina na iniciativa',
          ],
          [
            '1 / 2 / 3 / 10 rondas',
            'Contagem decrescente fixa; um decréscimo por fim de turno da ficha âncora',
          ],
        ],
      },
      configuration: {
        heading: 'Configuração',
        intro:
          'Utilize !condition-tracker --config &lt;opção&gt; &lt;valor&gt; ou o botão Configuração no menu principal.',
        colOption: 'Opção',
        colValues: 'Valores',
        colDesc: 'Descrição',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Aplicar marcadores de estado Roll20 às fichas quando uma condição é adicionada',
          ],
          [
            'useIcons',
            'true / false',
            'Mostrar códigos de ícone curtos (ex. [G]) em vez de carinhas nas linhas do Registo de Turnos',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Ignorar o passo opcional da ficha sujeito para efeitos de Feitiço / Habilidade / Outro',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Barra da ficha a monitorizar; quando chega a 0 o Mestre é alertado para limpar as condições',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Idioma das mensagens do chat e do documento de ajuda',
          ],
          [
            'marker',
            '&lt;Condição&gt;=&lt;nome do marcador&gt;',
            'Substituir o marcador de estado utilizado para uma condição específica (ex. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Marcadores de estado predefinidos',
        colCondition: 'Condição',
        colMarker: 'Nome do marcador',
      },
      availableLocales: {
        heading: 'Traduções disponíveis',
        intro:
          'Utilize a opção de configuração language para definir as mensagens do chat e o documento de ajuda para qualquer configuração regional suportada. Os aliases curtos também são aceites para en, zh e pt.',
        colLocale: 'Locale',
        colLanguage: 'Idioma',
        colFile: 'Ficheiro de tradução',
      },
    },
  };

  const TRANSLATION$5 = {
    conditions: {
      Grappled: {
        past: 'agarrado',
        verb: 'agarra',
      },
      Restrained: {
        past: 'contido',
        verb: 'contém',
      },
      Prone: {
        past: 'derrubado',
        verb: 'derruba',
      },
      Poisoned: {
        past: 'envenenado',
        verb: 'envenena',
      },
      Stunned: {
        past: 'atordoado',
        verb: 'atordoa',
      },
      Blinded: {
        past: 'cegado',
        verb: 'cega',
      },
      Charmed: {
        past: 'encantado',
        verb: 'encanta',
      },
      Frightened: {
        past: 'apavorado',
        verb: 'apavora',
      },
      Incapacitated: {
        past: 'incapacitado',
        verb: 'incapacita',
      },
      Invisible: {
        past: 'invisível',
        verb: 'torna',
        suffix: 'invisível',
      },
      Paralyzed: {
        past: 'paralisado',
        verb: 'paralisa',
      },
      Petrified: {
        past: 'petrificado',
        verb: 'petrifica',
      },
      Unconscious: {
        past: 'inconsciente',
        verb: 'deixa',
        suffix: 'inconsciente',
      },
      Spell: {
        past: 'afetado por uma magia',
        verb: 'lança uma magia em',
      },
      Ability: {
        past: 'afetado por uma habilidade',
        verb: 'usa uma habilidade em',
      },
      Advantage: {
        past: 'tem vantagem',
        verb: 'concede vantagem a',
        noBy: true,
      },
      Disadvantage: {
        past: 'tem desvantagem',
        verb: 'impõe desvantagem em',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Agarrado',
      Restrained: 'Contido',
      Prone: 'Derrubado',
      Poisoned: 'Envenenado',
      Stunned: 'Atordoado',
      Blinded: 'Cegado',
      Charmed: 'Encantado',
      Frightened: 'Apavorado',
      Incapacitated: 'Incapacitado',
      Invisible: 'Invisível',
      Paralyzed: 'Paralisado',
      Petrified: 'Petrificado',
      Unconscious: 'Inconsciente',
      Spell: 'Magia',
      Ability: 'Habilidade',
      Advantage: 'Vantagem',
      Disadvantage: 'Desvantagem',
      Other: 'Outro',
    },
    templates: {
      display: {
        custom: '{emoji} {target} afetado por {effect} ({source})',
        advantage: '{emoji} {source} tem vantagem contra {target}{subject}',
        disadvantage:
          '{emoji} {source} tem desvantagem contra {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} está {past}',
        standard: '{emoji} {target} {past} por {source}',
      },
      apply: {
        custom: '{source} aplica {effect} em {target}.',
        advantage: '{source} tem vantagem contra {target}{subject}.',
        disadvantage: '{source} tem desvantagem contra {target}{subject}.',
        self: '{target} está {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} não está mais afetado por {effect}.',
        advantage: '{source} não tem mais vantagem contra {target}{subject}.',
        disadvantage:
          '{source} não tem mais desvantagem contra {target}{subject}.',
        noBy: '{target} não está mais {past}.',
        self: '{target} não está mais {past}.',
        standard: '{target} não está mais {past} por {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Selecionar condição',
        selectSource: 'Selecionar ficha de origem',
        selectTarget: 'Selecionar ficha alvo',
        selectSubject: 'Selecionar sujeito',
        selectDuration: 'Selecionar duração',
        reinstallHandout: 'Reinstalar livreto',
        confirmTargetTitle: 'Confirmar lista de alvos',
        applyEffectTitle: 'Aplicar efeito {condition}',
        noTokens: 'Nenhuma ficha nomeada encontrada na página ativa.',
        confirmIntro: 'As seguintes fichas receberão a condição:',
        confirmBtn: 'Confirmar lista de alvos',
        enterDetails: 'Inserir detalhes do efeito',
        noneBtn: 'Nenhum',
        noneOrSourceBtn: 'Nenhum ou aplicar à origem',
        subjectDesc: 'Selecione quem ou o que aplica o efeito.',
        sourceDesc:
          'Selecione a criatura que está criando ou gerando a condição ou efeito.',
        targetDesc: 'Selecione a criatura que receberá a condição ou efeito.',
        otherText: 'Texto de condição personalizada',
        effectDetails: 'Detalhes de {condition}',
      },
      col: {
        players: 'Jogadores',
        npcs: 'NPCs',
        conditions: 'Condições',
        customEffects: 'Efeitos personalizados',
        permanentTurnEnd: 'Permanente / Fim de turno',
        rounds: 'Rodadas',
        command: 'Comando',
        result: 'Resultado',
        field: 'Campo',
        value: 'Valor',
        option: 'Opção',
        condition: 'Condição',
        marker: 'Marcador',
        item: 'Item',
        removed: 'Removido',
        details: 'Detalhes',
        description: 'Descrição',
        scenario: 'Cenário',
      },
      dur: {
        untilRemoved: 'Até ser removido',
        endOfTargetTurn: 'Fim do próximo turno do alvo',
        endOfSourceTurn: 'Fim do próximo turno da origem',
        round1: '1 rodada',
        round2: '2 rodadas',
        round3: '3 rodadas',
        round10: '10 rodadas',
        custom: 'Personalizado',
        customPrompt: 'Número de rodadas',
        untilRemovedDisplay: 'Até ser removido',
        turnsRemaining: '{n} fim(ns) de turno restante(s)',
      },
      btn: {
        openWizard: 'Abrir assistente',
        openMultiTarget: 'Abrir assistente multialvo',
        openRemovalList: 'Abrir lista de remoção',
        showConfig: 'Mostrar configuração',
        runCleanup: 'Executar limpeza',
        reinstallMacro: 'Reinstalar macro',
        reinstallHandout: 'Reinstalar livreto',
        showHelp: 'Mostrar ajuda',
        reorderConditions: 'Reordenar linhas de condição',
      },
      title: {
        menu: 'Menu',
        removalMenu: 'Remoção — Condition Tracker',
        config: 'Configuração',
        configTracker: 'Configuração — Condition Tracker',
        help: 'Ajuda',
        applied: 'Aplicado',
        removed: 'Condição removida',
        cleanup: 'Limpeza concluída',
        macroReinstalled: 'Macro reinstalada',
        handoutReinstalled: 'Livreto reinstalado',
        warning: 'Aviso',
        error: 'Erro',
        turnOrder: 'Ordem de iniciativa',
        noConditions: 'Sem condições',
        tokenMoved: 'Ficha movida',
        markedDead: 'Marcado como morto',
        zeroHp: '{name} — 0 PV',
        moveToken: '{name} — Mover ficha?',
        scriptReady: 'Script pronto',
        conditionReorder: 'Ordem de turno alterada',
      },
      heading: {
        quickActions: 'Ações rápidas',
        settings: 'Configurações',
        markerMappings: 'Mapeamento de marcadores',
        result: 'Resultado',
        info: 'Informações',
        commandOptions: 'Opções de comando',
        promptUi: 'Interface do assistente',
        examples: 'Exemplos',
        summary: 'Resumo',
      },
      msg: {
        noActive: 'Nenhuma condição ativa está sendo rastreada.',
        configReset: 'Configuração redefinida para os padrões do mod.',
        unknownConfig:
          'Opção de configuração desconhecida. Use --config para ver as configurações disponíveis.',
        macroReinstalled:
          'As macros {wizard} e {multiTarget} foram reinstaladas para todos os GMs atuais.',
        handoutReinstalled: 'O livreto de ajuda {handout} foi reinstalado.',
        duplicate:
          'Essa combinação exata de origem, sujeito, alvo, condição e texto personalizado já está ativa.',
        noTargets: 'Nenhuma ficha alvo especificada para aplicação múltipla.',
        noSelection:
          'Selecione pelo menos uma ficha no tabuleiro antes de usar --multi-target.',
        invalidIds: 'Nenhum ID de ficha válido encontrado na seleção atual.',
        reSelectTokens:
          'Nenhuma das fichas selecionadas originalmente pôde ser encontrada. Selecione novamente e tente de novo.',
        conditionNotFound: 'ID de condição não encontrado.',
        gmOnly: 'Os comandos do Condition Tracker são exclusivos para o GM.',
        commandFailed:
          'O comando não pôde ser concluído com segurança. Verifique o console da API.',
        sourceTokenNotFound: 'A ficha de origem não foi encontrada.',
        targetTokenNotFound: 'A ficha alvo não foi encontrada.',
        subjectTokenNotFound: 'A ficha do sujeito não foi encontrada.',
        invalidCondition: 'A condição deve ser uma das predefinidas ou Outro.',
        subjectOnlyCustom:
          '--subject só é válido para Magia, Habilidade, Vantagem, Desvantagem e Outro.',
        subjectBypassInvalid:
          '--subjectPromptBypass espera true ou false quando um valor é fornecido.',
        customDetailsRequired:
          'Os detalhes de {condition} são obrigatórios. Use --other para fornecê-los.',
        markerConfigFormat:
          'Formato de configuração do marcador: --config marker Grappled=grab',
        markerPredefinedRequired:
          'A configuração do marcador requer um nome de condição predefinido.',
        markerNameRequired:
          'A configuração do marcador requer um nome de marcador não vazio.',
        markerSet: 'Marcador de {condition} definido como {marker}.',
        healthBarSet: 'Barra de saúde definida como {bar}.',
        boolSet: '{key} definido como {value}.',
        expectedBoolean: 'Era esperado true ou false.',
        invalidHealthBar:
          'A barra de saúde deve ser bar1_value, bar2_value ou bar3_value.',
        markersDisabled: 'Os marcadores estão desativados.',
        noMarkerConfigured:
          'Nenhum marcador está configurado para esta condição.',
        markerApplied: 'Marcador aplicado: {marker}',
        markerPresent: 'Marcador já presente: {marker}',
        langSet: 'Idioma definido como {locale}.',
        invalidLocale: 'Locale inválida. Locales suportadas: {locales}.',
        otherDurationRequiresRounds:
          'A duração Outro requer um número de rodadas, por exemplo --duration 5 rounds.',
        invalidDuration:
          'A duração deve ser Até ser removido, uma opção de fim de turno ou uma contagem positiva de rodadas.',
        zeroHpNoConditions: '{name} chegou a 0 PV e não tem condições ativas.',
        zeroHpConditions:
          '{name} chegou a 0 PV. Escolha as condições a remover:',
        removeAllBtn: 'Remover todas as condições de {name}',
        markIncapacitated: 'Marcar como incapacitado',
        removeFromTurnOrder: 'Remover da ordem de iniciativa',
        alreadyIncapacitated: '{name} já está incapacitado.',
        tokenRemovedFromTurn: '{name} foi removido da ordem de iniciativa.',
        tokenNotInTurn: '{name} não foi encontrado na ordem de iniciativa.',
        moveTokenPrompt:
          'Mover {name} para a camada do mapa para que permaneça visível sem interferir com outras fichas?',
        moveTokenBtn: 'Mover {name} para a camada do mapa',
        tokenMoved: '{name} foi movido para a camada do mapa.',
        tokenNotFound: 'Ficha não encontrada.',
        noActiveConditions: '{name} não tem condições ativas para remover.',
        deadNoConditions:
          '{name} foi marcado como morto. Nenhuma condição estava ativa.',
        scriptReady: '{name} está ativo e você está usando a versão {version}.',
        reachedZeroHp: '{name} chegou a 0 PV',
        manuallyRemoved: 'remoção manual',
        durationExpired: 'sua duração expirou',
        markedAsDead: '{name} foi marcado como morto',
        conditionReorder:
          'A ordem de turno mudou e {count} linha(s) de condição rastreada(s) pode(m) estar fora do lugar. Clique abaixo para restaurá-las após os tokens atribuídos.',
        conditionsReordered:
          'As linhas de condição foram reposicionadas após seus tokens atribuídos.',
      },
      removal: {
        conditionField: 'Condição',
        reasonField: 'Motivo',
        turnRowField: 'Linha de iniciativa',
        markerField: 'Marcador',
        notConfigured: 'Não configurado',
        markerRemoved: 'Removido ({marker})',
        markerRetained: 'Mantido ({marker})',
        rowRemoved: 'Removido',
        rowMissing: 'Já ausente',
        manualReason: 'Remoção manual',
      },
      cleanup: {
        orphaned: 'Entradas de condição órfãs',
        stale: 'Entradas de condição obsoletas',
        orphanedRows: 'Linhas de iniciativa órfãs',
        unusedMarkers: 'Marcadores não utilizados',
      },
      apply: {
        turnAppended:
          'O alvo não estava na ordem de iniciativa; a linha de condição foi adicionada.',
        turnInserted: 'Linha de condição inserida abaixo da ficha alvo.',
      },
    },
    handout: {
      versionLabel: 'Versão',
      subtitle: 'Gerenciador de efeitos de status de D&D 5e',
      footerNote:
        'Este livreto é criado e atualizado automaticamente cada vez que o script é carregado.',
      overview: {
        heading: 'Visão geral',
        body: 'Condition Tracker gerencia condições de status do D&D 5e e efeitos personalizados como linhas rotuladas no rastreador de turno do Roll20. Aplique condições a fichas, rastreie durações por ordem de iniciativa e remova automaticamente os efeitos expirados ao final de um turno. Todos os comandos são exclusivos para o GM.',
      },
      quickStart: {
        heading: 'Início rápido',
        colCommand: 'Comando',
        colDesc: 'Descrição',
        rows: [
          [
            '!condition-tracker --prompt',
            'Assistente passo a passo — escolha condição, fichas e duração de forma interativa. Também disponível como macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Aplicar uma condição a várias fichas simultaneamente. Também disponível como macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Abrir o menu principal para aplicar, revisar ou remover condições.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Referência de comandos',
        colFlag: 'Opção',
        colDesc: 'Descrição',
        rows: [
          ['--prompt', 'Interface do assistente passo a passo'],
          ['--multi-target', 'Aplicar uma condição a várias fichas alvo'],
          [
            '--menu',
            'Mostrar menu principal (adicionar remove para o menu de remoção)',
          ],
          [
            '--source X --target Y --condition Z',
            'Aplicar uma condição diretamente sem o assistente',
          ],
          [
            '--duration &lt;valor&gt;',
            'Duração para aplicação direta (ex. 2 rounds)',
          ],
          [
            '--other &lt;texto&gt;',
            'Texto personalizado para tipos Magia / Habilidade / Outro',
          ],
          [
            '--remove &lt;id-condição&gt;',
            'Remover uma condição específica pelo seu ID único',
          ],
          [
            '--config &lt;opção&gt; &lt;valor&gt;',
            'Ajustar opções de configuração',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Substituir subjectPromptBypass somente para este comando (também aceita --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Reconciliar estado — remover condições e linhas órfãs',
          ],
          [
            '--reorder-conditions',
            'Reposicionar manualmente as linhas de condição após os tokens atribuídos na ordem de iniciativa',
          ],
          ['--reinstall-macro', 'Recriar ou atualizar as macros do GM'],
          [
            '--reinstall-handout',
            'Recriar ou atualizar o livreto de ajuda localizado',
          ],
          [
            '--lang &lt;locale&gt;',
            'Emitir as mensagens deste comando em uma locale adicional (modo bilingüe)',
          ],
          ['--help', 'Mostrar um cartão de ajuda breve no chat'],
        ],
      },
      standardConditions: {
        heading: 'Condições padrão (D&D 5e)',
        colCondition: 'Condição',
      },
      customEffects: {
        heading: 'Tipos de efeitos personalizados',
        colType: 'Tipo',
        colNotes: 'Notas',
        rows: [
          [
            '🔮 Magia',
            'Rastrear um efeito de magia nomeado — você será solicitado a inserir o nome da magia',
          ],
          [
            '🎯 Habilidade',
            'Rastrear uma habilidade de classe ou raça — você será solicitado a inserir o nome',
          ],
          [
            '🍀 Vantagem',
            'Registrar vantagem concedida de uma ficha a outra; agrupada com a origem na iniciativa',
          ],
          [
            '⬇️ Desvantagem',
            'Registrar desvantagem imposta; agrupada com a origem na iniciativa',
          ],
          [
            '📝 Outro',
            'Rótulo personalizado livre — você será solicitado a inserir uma descrição',
          ],
        ],
      },
      durationOptions: {
        heading: 'Opções de duração',
        intro:
          'O contador restante é exibido na coluna pr do rastreador de turno e diminui quando o turno da ficha âncora termina.',
        colOption: 'Opção',
        colBehaviour: 'Comportamento',
        rows: [
          [
            'Até ser removido',
            'Permanente — deve ser removido manualmente pelo menu ou --remove',
          ],
          [
            'Fim do próximo turno do alvo',
            'Expira quando o próximo turno do alvo termina na iniciativa',
          ],
          [
            'Fim do próximo turno da origem',
            'Expira quando o próximo turno da origem termina na iniciativa',
          ],
          [
            '1 / 2 / 3 / 10 rodadas',
            'Contagem regressiva fixa; um decremento por cada fim de turno da âncora',
          ],
        ],
      },
      configuration: {
        heading: 'Configuração',
        intro:
          'Use !condition-tracker --config &lt;opção&gt; &lt;valor&gt; ou o botão Configuração no menu principal.',
        colOption: 'Opção',
        colValues: 'Valores',
        colDesc: 'Descrição',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Aplicar marcadores de status do Roll20 às fichas ao adicionar uma condição',
          ],
          [
            'useIcons',
            'true / false',
            'Exibir códigos de ícone curtos (ex. [G]) nas linhas do rastreador de turno',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Ignorar a etapa de sujeito opcional para efeitos Magia / Habilidade / Outro',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Barra a monitorar; quando chega a 0 o GM é solicitado a limpar as condições',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Idioma das mensagens de chat e do livreto de ajuda',
          ],
          [
            'marker',
            '&lt;Condição&gt;=&lt;nome do marcador&gt;',
            'Substituir o marcador usado para uma condição específica (ex. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Marcadores de status padrão',
        colCondition: 'Condição',
        colMarker: 'Nome do marcador',
      },
      availableLocales: {
        heading: 'Traduções disponíveis',
        intro:
          'Use a opção de configuração language para definir as mensagens de chat e o livreto de ajuda em qualquer locale suportado. Aliases curtos também são aceitos para en, zh e pt.',
        colLocale: 'Locale',
        colLanguage: 'Idioma',
        colFile: 'Arquivo de tradução',
      },
    },
  };

  const TRANSLATION$4 = {
    conditions: {
      Grappled: {
        past: 'схвачен',
        verb: 'схватывает',
      },
      Restrained: {
        past: 'опутан',
        verb: 'опутывает',
      },
      Prone: {
        past: 'сбит с ног',
        verb: 'сбивает',
        suffix: 'с ног',
      },
      Poisoned: {
        past: 'отравлен',
        verb: 'отравляет',
      },
      Stunned: {
        past: 'ошеломлен',
        verb: 'ошеломляет',
      },
      Blinded: {
        past: 'ослеплен',
        verb: 'ослепляет',
      },
      Charmed: {
        past: 'очарован',
        verb: 'очаровывает',
      },
      Frightened: {
        past: 'испуган',
        verb: 'пугает',
      },
      Incapacitated: {
        past: 'недееспособен',
        verb: 'делает',
        suffix: 'недееспособным',
      },
      Invisible: {
        past: 'невидим',
        verb: 'делает',
        suffix: 'невидимым',
      },
      Paralyzed: {
        past: 'парализован',
        verb: 'парализует',
      },
      Petrified: {
        past: 'окаменел',
        verb: 'окаменяет',
      },
      Unconscious: {
        past: 'без сознания',
        verb: 'лишает',
        suffix: 'сознания',
      },
      Spell: {
        past: 'под действием заклинания',
        verb: 'накладывает заклинание на',
      },
      Ability: {
        past: 'под действием умения',
        verb: 'использует умение на',
      },
      Advantage: {
        past: 'имеет преимущество',
        verb: 'дает преимущество',
        noBy: true,
      },
      Disadvantage: {
        past: 'имеет помеху',
        verb: 'накладывает помеху',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Схвачен',
      Restrained: 'Опутан',
      Prone: 'Лежит ничком',
      Poisoned: 'Отравлен',
      Stunned: 'Ошеломлен',
      Blinded: 'Ослеплен',
      Charmed: 'Очарован',
      Frightened: 'Испуган',
      Incapacitated: 'Недееспособен',
      Invisible: 'Невидим',
      Paralyzed: 'Парализован',
      Petrified: 'Окаменел',
      Unconscious: 'Без сознания',
      Spell: 'Заклинание',
      Ability: 'Умение',
      Advantage: 'Преимущество',
      Disadvantage: 'Помеха',
      Other: 'Другое',
    },
    templates: {
      display: {
        custom: '{emoji} {target} под воздействием {effect} ({source})',
        advantage:
          '{emoji} {source} имеет преимущество против {target}{subject}',
        disadvantage: '{emoji} {source} имеет помеху против {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} {past}',
        standard: '{emoji} {target} {past} от {source}',
      },
      apply: {
        custom: '{source} накладывает {effect} на {target}.',
        advantage: '{source} имеет преимущество против {target}{subject}.',
        disadvantage: '{source} имеет помеху против {target}{subject}.',
        self: '{target} {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} больше не находится под воздействием {effect}.',
        advantage:
          '{source} больше не имеет преимущества против {target}{subject}.',
        disadvantage:
          '{source} больше не имеет помехи против {target}{subject}.',
        noBy: '{target} больше не {past}.',
        self: '{target} больше не {past}.',
        standard: '{target} больше не {past} от {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Выбрать состояние',
        selectSource: 'Выбрать жетон источника',
        selectTarget: 'Выбрать жетон цели',
        selectSubject: 'Выбрать субъект',
        selectDuration: 'Выбрать длительность',
        confirmTargetTitle: 'Подтвердить список целей',
        applyEffectTitle: 'Применить эффект {condition}',
        noTokens: 'На активной странице не найдено именованных жетонов.',
        confirmIntro: 'Следующие жетоны получат состояние:',
        confirmBtn: 'Подтвердить список целей',
        enterDetails: 'Ввести подробности эффекта',
        noneBtn: 'Нет',
        noneOrSourceBtn: 'Нет или применить к источнику',
        subjectDesc: 'Выберите, кто или что вызывает эффект.',
        sourceDesc:
          'Выберите существо, создающее или генерирующее состояние или эффект.',
        targetDesc: 'Выберите существо, которое получит состояние или эффект.',
        otherText: 'Произвольный текст состояния',
        effectDetails: 'Подробности {condition}',
      },
      col: {
        players: 'Игроки',
        npcs: 'НИП',
        conditions: 'Состояния',
        customEffects: 'Пользовательские эффекты',
        permanentTurnEnd: 'Постоянный / Конец хода',
        rounds: 'Раунды',
        command: 'Команда',
        result: 'Результат',
        field: 'Поле',
        value: 'Значение',
        option: 'Параметр',
        condition: 'Состояние',
        marker: 'Маркер',
        item: 'Элемент',
        removed: 'Удалено',
        details: 'Подробности',
        description: 'Описание',
        scenario: 'Сценарий',
      },
      dur: {
        untilRemoved: 'До удаления',
        endOfTargetTurn: 'Конец следующего хода цели',
        endOfSourceTurn: 'Конец следующего хода источника',
        round1: '1 раунд',
        round2: '2 раунда',
        round3: '3 раунда',
        round10: '10 раундов',
        custom: 'Произвольно',
        customPrompt: 'Количество раундов',
        untilRemovedDisplay: 'До удаления',
        turnsRemaining: 'Осталось {n} конец (концов) хода',
      },
      btn: {
        openWizard: 'Открыть мастер',
        openMultiTarget: 'Открыть мастер нескольких целей',
        openRemovalList: 'Открыть список удаления',
        showConfig: 'Показать конфигурацию',
        runCleanup: 'Запустить очистку',
        reinstallMacro: 'Переустановить макрос',
        reinstallHandout: 'Переустановить хэндаут',
        showHelp: 'Показать справку',
        reorderConditions: 'Переупорядочить строки состояний',
      },
      title: {
        menu: 'Меню',
        removalMenu: 'Удаление состояний',
        config: 'Конфигурация',
        configTracker: 'Конфигурация Condition Tracker',
        help: 'Справка',
        applied: 'Применено',
        removed: 'Состояние удалено',
        cleanup: 'Очистка завершена',
        macroReinstalled: 'Макрос переустановлен',
        handoutReinstalled: 'Хэндаут переустановлен',
        warning: 'Предупреждение',
        error: 'Ошибка',
        turnOrder: 'Порядок ходов',
        noConditions: 'Нет состояний',
        tokenMoved: 'Жетон перемещён',
        markedDead: 'Помечен как мёртвый',
        zeroHp: '{name} — 0 ХП',
        moveToken: '{name} — Переместить жетон?',
        scriptReady: 'Скрипт готов',
        conditionReorder: 'Порядок ходов изменён',
      },
      heading: {
        quickActions: 'Быстрые действия',
        settings: 'Настройки',
        markerMappings: 'Сопоставления маркеров',
        result: 'Результат',
        info: 'Информация',
        commandOptions: 'Параметры команд',
        promptUi: 'Интерфейс мастера',
        examples: 'Примеры',
        summary: 'Итог',
      },
      msg: {
        noActive: 'Активных состояний не отслеживается.',
        configReset: 'Конфигурация сброшена до значений по умолчанию модуля.',
        unknownConfig:
          'Неизвестный параметр конфигурации. Используйте --config для просмотра поддерживаемых настроек.',
        macroReinstalled:
          'Макросы {wizard} и {multiTarget} были переустановлены для всех текущих игроков с ролью ДМ.',
        handoutReinstalled: 'Справочный хэндаут {handout} был переустановлен.',
        duplicate:
          'Точное сочетание источника, субъекта, цели, состояния и произвольного текста уже активно.',
        noTargets: 'Не указаны жетоны целей для применения к нескольким целям.',
        noSelection:
          'Выберите хотя бы один жетон на поле перед использованием --multi-target.',
        invalidIds:
          'В текущем выделении не найдено допустимых идентификаторов жетонов.',
        reSelectTokens:
          'Ни один из первоначально выбранных жетонов не найден. Выберите жетоны заново и повторите попытку.',
        conditionNotFound: 'Идентификатор состояния не найден.',
        gmOnly: 'Команды Condition Tracker доступны только для ДМ.',
        commandFailed:
          'Команда не могла быть безопасно выполнена. Проверьте консоль API.',
        sourceTokenNotFound: 'Жетон источника не найден.',
        targetTokenNotFound: 'Жетон цели не найден.',
        subjectTokenNotFound: 'Жетон субъекта не найден.',
        invalidCondition:
          'Состояние должно быть одним из предопределённых состояний или Другое.',
        subjectOnlyCustom:
          '--subject допустим только для Заклинания, Умения, Преимущества, Помехи и Другого.',
        subjectBypassInvalid:
          '--subjectPromptBypass ожидает значение true или false, если значение указано.',
        customDetailsRequired:
          'Подробности {condition} обязательны. Используйте --other для их указания.',
        markerConfigFormat:
          'Формат конфигурации маркера: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Конфигурация маркера требует предопределённого имени состояния.',
        markerNameRequired:
          'Конфигурация маркера требует непустого имени маркера.',
        markerSet: 'Маркер {condition} установлен на {marker}.',
        healthBarSet: 'Полоса здоровья установлена на {bar}.',
        boolSet: '{key} установлено на {value}.',
        expectedBoolean: 'Ожидалось true или false.',
        invalidHealthBar:
          'Полоса здоровья должна быть bar1_value, bar2_value или bar3_value.',
        markersDisabled: 'Маркеры отключены.',
        noMarkerConfigured: 'Для данного состояния не настроен маркер.',
        markerApplied: 'Маркер применён: {marker}',
        markerPresent: 'Маркер уже присутствует: {marker}',
        langSet: 'Язык установлен на {locale}.',
        invalidLocale: 'Недопустимый язык. Поддерживаемые языки: {locales}.',
        otherDurationRequiresRounds:
          'Длительность «Другое» требует числового количества раундов, например --duration 5 rounds.',
        invalidDuration:
          'Длительность должна быть «До удаления», вариантом конца хода или положительным числом раундов.',
        zeroHpNoConditions: '{name} достиг 0 ХП и не имеет активных состояний.',
        zeroHpConditions:
          '{name} достиг 0 ХП. Выберите состояния для удаления:',
        removeAllBtn: 'Удалить все состояния для {name}',
        markIncapacitated: 'Пометить как недееспособного',
        removeFromTurnOrder: 'Убрать из порядка ходов',
        alreadyIncapacitated: '{name} уже недееспособен.',
        tokenRemovedFromTurn: '{name} был убран из порядка ходов.',
        tokenNotInTurn: '{name} не найден в порядке ходов.',
        moveTokenPrompt:
          'Переместить {name} на слой карты, чтобы он оставался видимым, но не мешал другим жетонам?',
        moveTokenBtn: 'Переместить {name} на слой карты',
        tokenMoved: '{name} был перемещён на слой карты.',
        tokenNotFound: 'Жетон не найден.',
        noActiveConditions: '{name} не имеет активных состояний для удаления.',
        deadNoConditions:
          '{name} был помечен как мёртвый. Активных состояний не было.',
        scriptReady: '{name} активен, вы используете версию {version}.',
        reachedZeroHp: '{name} достиг 0 ХП',
        manuallyRemoved: 'было удалено вручную',
        durationExpired: 'длительность истекла',
        markedAsDead: '{name} был помечен как мёртвый',
        conditionReorder:
          'Порядок ходов изменился, и {count} отслеживаемая (отслеживаемых) строка состояний может быть не на своём месте. Нажмите ниже, чтобы восстановить их после назначенных жетонов.',
        conditionsReordered:
          'Строки состояний были перемещены после назначенных им жетонов.',
      },
      removal: {
        conditionField: 'Состояние',
        reasonField: 'Причина',
        turnRowField: 'Строка отслеживания ходов',
        markerField: 'Маркер',
        notConfigured: 'Не настроено',
        markerRemoved: 'Удалено ({marker})',
        markerRetained: 'Сохранено ({marker})',
        rowRemoved: 'Удалено',
        rowMissing: 'Уже отсутствует',
        manualReason: 'Ручное удаление',
      },
      cleanup: {
        orphaned: 'Осиротевшие записи состояний',
        stale: 'Устаревшие записи состояний',
        orphanedRows: 'Осиротевшие строки отслеживания ходов',
        unusedMarkers: 'Неиспользуемые маркеры',
      },
      apply: {
        turnAppended:
          'Цель не была в порядке ходов; строка состояния добавлена в конец.',
        turnInserted: 'Строка состояния вставлена ниже жетона цели.',
      },
    },
    handout: {
      versionLabel: 'Версия',
      subtitle: 'Менеджер состояний D&D 5e',
      footerNote:
        'Этот хэндаут автоматически создаётся и обновляется при каждой загрузке скрипта.',
      overview: {
        heading: 'Обзор',
        body: 'Condition Tracker управляет состояниями D&D 5e и пользовательскими эффектами в виде подписанных строк в Трекере Ходов Roll20. Применяйте состояния к жетонам, отслеживайте длительности по порядку инициативы и автоматически удаляйте истёкшие эффекты в конце хода. Все команды доступны только для ДМ и могут вызываться из чата или через установленные макросы.',
      },
      quickStart: {
        heading: 'Быстрый старт',
        colCommand: 'Команда',
        colDesc: 'Описание',
        rows: [
          [
            '!condition-tracker --prompt',
            'Пошаговый мастер — интерактивно выберите состояние, жетоны и длительность. Также доступен как макрос ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Применить одно состояние к нескольким жетонам одновременно. Также доступен как макрос ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Открыть главное меню управления с кнопками для применения, просмотра или удаления состояний.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Справочник команд',
        colFlag: 'Флаг',
        colDesc: 'Описание',
        rows: [
          ['--prompt', 'Интерактивный пошаговый мастер'],
          [
            '--multi-target',
            'Применить состояние к нескольким жетонам цели сразу',
          ],
          [
            '--menu',
            'Показать главное меню (добавить remove для меню удаления)',
          ],
          [
            '--source X --target Y --condition Z',
            'Применить состояние напрямую без мастера',
          ],
          [
            '--duration &lt;значение&gt;',
            'Длительность для прямого применения (например, 2 rounds)',
          ],
          [
            '--other &lt;текст&gt;',
            'Произвольный текст для типов эффектов Заклинание / Умение / Другое',
          ],
          [
            '--remove &lt;ID состояния&gt;',
            'Удалить конкретное состояние по его уникальному идентификатору',
          ],
          [
            '--config &lt;параметр&gt; &lt;значение&gt;',
            'Изменить настройки конфигурации (см. раздел Конфигурация ниже)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Переопределить subjectPromptBypass только для этой команды (также поддерживает --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Согласовать состояние — удалить осиротевшие состояния и строки Трекера Ходов',
          ],
          [
            '--reorder-conditions',
            'Вручную переместить строки условий после назначенных токенов в очереди хода',
          ],
          ['--reinstall-macro', 'Пересоздать или обновить макросы ДМ'],
          [
            '--reinstall-handout',
            'Пересоздать или обновить локализованный справочный хэндаут',
          ],
          [
            '--lang &lt;язык&gt;',
            'Выводить сообщения этой команды на дополнительном языке (двуязычный режим)',
          ],
          ['--help', 'Показать краткую справочную карточку в чате'],
        ],
      },
      standardConditions: {
        heading: 'Стандартные состояния (D&amp;D 5e)',
        colCondition: 'Состояние',
      },
      customEffects: {
        heading: 'Пользовательские типы эффектов',
        colType: 'Тип',
        colNotes: 'Примечания',
        rows: [
          [
            '🔮 Заклинание',
            'Отслеживать именованный эффект заклинания — вам будет предложено ввести название заклинания',
          ],
          [
            '🎯 Умение',
            'Отслеживать именованное умение класса или расы — вам будет предложено ввести название',
          ],
          [
            '🍀 Преимущество',
            'Записать преимущество, предоставленное от одного жетона другому; сгруппировано с источником в инициативе',
          ],
          [
            '⬇️ Помеха',
            'Записать наложенную помеху; сгруппировано с источником в инициативе',
          ],
          [
            '📝 Другое',
            'Произвольная пользовательская метка — вам будет предложено ввести описание',
          ],
        ],
      },
      durationOptions: {
        heading: 'Варианты длительности',
        intro:
          'Оставшееся число отображается в столбце pr Трекера Ходов и уменьшается, когда заканчивается ход опорного жетона.',
        colOption: 'Вариант',
        colBehaviour: 'Поведение',
        rows: [
          [
            'До удаления',
            'Постоянное — должно быть удалено вручную через меню или --remove',
          ],
          [
            'Конец следующего хода цели',
            'Истекает, когда заканчивается следующий ход жетона цели в инициативе',
          ],
          [
            'Конец следующего хода источника',
            'Истекает, когда заканчивается следующий ход жетона источника в инициативе',
          ],
          [
            '1 / 2 / 3 / 10 раундов',
            'Фиксированный обратный отсчёт; одно уменьшение за конец хода опорного жетона',
          ],
        ],
      },
      configuration: {
        heading: 'Конфигурация',
        intro:
          'Используйте !condition-tracker --config &lt;параметр&gt; &lt;значение&gt; или кнопку Конфигурация в главном меню.',
        colOption: 'Параметр',
        colValues: 'Значения',
        colDesc: 'Описание',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Применять маркеры состояния Roll20 к жетонам при добавлении состояния',
          ],
          [
            'useIcons',
            'true / false',
            'Показывать короткие коды иконок (например, [G]) вместо эмодзи в строках Трекера Ходов',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Пропустить необязательный шаг выбора субъекта для эффектов Заклинание / Умение / Другое',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Наблюдаемая полоса; когда опускается до 0, ДМ предлагается очистить состояния',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Язык вывода для сообщений чата и справочного хэндаута',
          ],
          [
            'marker',
            '&lt;Состояние&gt;=&lt;имя маркера&gt;',
            'Переопределить маркер состояния для конкретного состояния (например, marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Маркеры состояний по умолчанию',
        colCondition: 'Состояние',
        colMarker: 'Имя маркера',
      },
      availableLocales: {
        heading: 'Доступные переводы',
        intro:
          'Используйте параметр конфигурации языка, чтобы задать язык сообщений чата и справочного хэндаута. Короткие псевдонимы также принимаются для en, zh и pt.',
        colLocale: 'Locale',
        colLanguage: 'Язык',
        colFile: 'Файл перевода',
      },
    },
  };

  const TRANSLATION$3 = {
    conditions: {
      Grappled: {
        past: 'aferrado',
        verb: 'aferra',
      },
      Restrained: {
        past: 'restringido',
        verb: 'restringe',
      },
      Prone: {
        past: 'derribado',
        verb: 'derriba',
      },
      Poisoned: {
        past: 'envenenado',
        verb: 'envenena',
      },
      Stunned: {
        past: 'aturdido',
        verb: 'aturde',
      },
      Blinded: {
        past: 'cegado',
        verb: 'ciega',
      },
      Charmed: {
        past: 'encantado',
        verb: 'encanta',
      },
      Frightened: {
        past: 'asustado',
        verb: 'asusta',
      },
      Incapacitated: {
        past: 'incapacitado',
        verb: 'incapacita',
      },
      Invisible: {
        past: 'invisible',
        verb: 'vuelve',
        suffix: 'invisible',
      },
      Paralyzed: {
        past: 'paralizado',
        verb: 'paraliza',
      },
      Petrified: {
        past: 'petrificado',
        verb: 'petrifica',
      },
      Unconscious: {
        past: 'inconsciente',
        verb: 'deja',
        suffix: 'inconsciente',
      },
      Spell: {
        past: 'afectado por un conjuro',
        verb: 'lanza un conjuro sobre',
      },
      Ability: {
        past: 'afectado por una habilidad',
        verb: 'usa una habilidad en',
      },
      Advantage: {
        past: 'tiene ventaja',
        verb: 'otorga ventaja a',
        noBy: true,
      },
      Disadvantage: {
        past: 'tiene desventaja',
        verb: 'impone desventaja en',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Aferrado',
      Restrained: 'Restringido',
      Prone: 'Derribado',
      Poisoned: 'Envenenado',
      Stunned: 'Aturdido',
      Blinded: 'Cegado',
      Charmed: 'Encantado',
      Frightened: 'Asustado',
      Incapacitated: 'Incapacitado',
      Invisible: 'Invisible',
      Paralyzed: 'Paralizado',
      Petrified: 'Petrificado',
      Unconscious: 'Inconsciente',
      Spell: 'Conjuro',
      Ability: 'Habilidad',
      Advantage: 'Ventaja',
      Disadvantage: 'Desventaja',
      Other: 'Otro',
    },
    templates: {
      display: {
        custom: '{emoji} {target} afectado por {effect} ({source})',
        advantage: '{emoji} {source} tiene ventaja contra {target}{subject}',
        disadvantage:
          '{emoji} {source} tiene desventaja contra {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} está {past}',
        standard: '{emoji} {target} {past} por {source}',
      },
      apply: {
        custom: '{source} aplica {effect} a {target}.',
        advantage: '{source} tiene ventaja contra {target}{subject}.',
        disadvantage: '{source} tiene desventaja contra {target}{subject}.',
        self: '{target} está {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} ya no está afectado por {effect}.',
        advantage: '{source} ya no tiene ventaja contra {target}{subject}.',
        disadvantage:
          '{source} ya no tiene desventaja contra {target}{subject}.',
        noBy: '{target} ya no está {past}.',
        self: '{target} ya no está {past}.',
        standard: '{target} ya no está {past} por {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Seleccionar condición',
        selectSource: 'Seleccionar ficha de origen',
        selectTarget: 'Seleccionar ficha objetivo',
        selectSubject: 'Seleccionar sujeto',
        selectDuration: 'Seleccionar duración',
        confirmTargetTitle: 'Confirmar lista de objetivos',
        applyEffectTitle: 'Aplicar efecto {condition}',
        noTokens: 'No se encontraron fichas con nombre en la página activa.',
        confirmIntro: 'Las siguientes fichas recibirán la condición:',
        confirmBtn: 'Confirmar lista de objetivos',
        enterDetails: 'Introducir detalles del efecto',
        noneBtn: 'Ninguno',
        noneOrSourceBtn: 'Ninguno o aplicar al origen',
        subjectDesc: 'Selecciona quién o qué aplica el efecto.',
        sourceDesc:
          'Selecciona la criatura que crea o genera la condición o efecto.',
        targetDesc:
          'Selecciona la criatura que recibirá la condición o efecto.',
        otherText: 'Texto de condición personalizada',
        effectDetails: 'Detalles de {condition}',
      },
      col: {
        players: 'Jugadores',
        npcs: 'PNJ',
        conditions: 'Condiciones',
        customEffects: 'Efectos personalizados',
        permanentTurnEnd: 'Permanente / Fin de turno',
        rounds: 'Rondas',
        command: 'Comando',
        result: 'Resultado',
        field: 'Campo',
        value: 'Valor',
        option: 'Opción',
        condition: 'Condición',
        marker: 'Marcador',
        item: 'Elemento',
        removed: 'Eliminado',
        details: 'Detalles',
        description: 'Descripción',
        scenario: 'Escenario',
      },
      dur: {
        untilRemoved: 'Hasta retirar',
        endOfTargetTurn: 'Fin del próximo turno del objetivo',
        endOfSourceTurn: 'Fin del próximo turno de la fuente',
        round1: '1 ronda',
        round2: '2 rondas',
        round3: '3 rondas',
        round10: '10 rondas',
        custom: 'Personalizado',
        customPrompt: 'Número de rondas',
        untilRemovedDisplay: 'Hasta retirar',
        turnsRemaining: '{n} fin(es) de turno restante(s)',
      },
      btn: {
        openWizard: 'Abrir asistente',
        openMultiTarget: 'Abrir asistente multiobjetivo',
        openRemovalList: 'Abrir lista de eliminación',
        showConfig: 'Mostrar configuración',
        runCleanup: 'Ejecutar limpieza',
        reinstallMacro: 'Reinstalar macro',
        reinstallHandout: 'Reinstalar folleto',
        showHelp: 'Mostrar ayuda',
        reorderConditions: 'Reordenar filas de condición',
      },
      title: {
        menu: 'Menú',
        removalMenu: 'Eliminación — Condition Tracker',
        config: 'Configuración',
        configTracker: 'Configuración — Condition Tracker',
        help: 'Ayuda',
        applied: 'Aplicado',
        removed: 'Condición eliminada',
        cleanup: 'Limpieza completada',
        macroReinstalled: 'Macro reinstalada',
        handoutReinstalled: 'Folleto reinstalado',
        warning: 'Advertencia',
        error: 'Error',
        turnOrder: 'Orden de iniciativa',
        noConditions: 'Sin condiciones',
        tokenMoved: 'Ficha movida',
        markedDead: 'Marcado como muerto',
        zeroHp: '{name} — 0 PV',
        moveToken: '{name} — ¿Mover ficha?',
        scriptReady: 'Script listo',
        conditionReorder: 'Orden de turno cambiado',
      },
      heading: {
        quickActions: 'Acciones rápidas',
        settings: 'Ajustes',
        markerMappings: 'Asignación de marcadores',
        result: 'Resultado',
        info: 'Información',
        commandOptions: 'Opciones de comando',
        promptUi: 'Interfaz del asistente',
        examples: 'Ejemplos',
        summary: 'Resumen',
      },
      msg: {
        noActive: 'No se están rastreando condiciones activas.',
        configReset:
          'Configuración restablecida a los valores predeterminados.',
        unknownConfig:
          'Opción de configuración desconocida. Usa --config para ver los ajustes disponibles.',
        macroReinstalled:
          'Las macros {wizard} y {multiTarget} se han reinstalado para todos los GM actuales.',
        handoutReinstalled: 'El folleto de ayuda {handout} se reinstaló.',
        duplicate:
          'Esa combinación exacta de fuente, sujeto, objetivo, condición y texto personalizado ya está activa.',
        noTargets:
          'No se especificaron fichas objetivo para la aplicación múltiple.',
        noSelection:
          'Selecciona al menos una ficha en el tablero antes de usar --multi-target.',
        invalidIds:
          'No se encontraron identificadores de ficha válidos en la selección actual.',
        reSelectTokens:
          'No se encontró ninguna de las fichas seleccionadas originalmente. Vuelve a seleccionarlas e inténtalo de nuevo.',
        conditionNotFound: 'No se encontró el identificador de condición.',
        gmOnly: 'Los comandos de Condition Tracker son solo para el GM.',
        commandFailed:
          'El comando no pudo completarse de forma segura. Revisa la consola de la API.',
        sourceTokenNotFound: 'No se encontró la ficha de origen.',
        targetTokenNotFound: 'No se encontró la ficha objetivo.',
        subjectTokenNotFound: 'No se encontró la ficha del sujeto.',
        invalidCondition:
          'La condición debe ser una de las predefinidas u Otro.',
        subjectOnlyCustom:
          '--subject solo es válido para Conjuro, Habilidad, Ventaja, Desventaja y Otro.',
        subjectBypassInvalid:
          '--subjectPromptBypass espera true o false cuando se proporciona un valor.',
        customDetailsRequired:
          'Se requieren los detalles de {condition}. Usa --other para proporcionarlos.',
        markerConfigFormat:
          'Formato de configuración del marcador: --config marker Grappled=grab',
        markerPredefinedRequired:
          'La configuración del marcador requiere un nombre de condición predefinido.',
        markerNameRequired:
          'La configuración del marcador requiere un nombre de marcador no vacío.',
        markerSet: 'Marcador de {condition} establecido en {marker}.',
        healthBarSet: 'Barra de salud establecida en {bar}.',
        boolSet: '{key} establecido en {value}.',
        expectedBoolean: 'Se esperaba true o false.',
        invalidHealthBar:
          'La barra de salud debe ser bar1_value, bar2_value o bar3_value.',
        markersDisabled: 'Los marcadores están desactivados.',
        noMarkerConfigured:
          'No hay ningún marcador configurado para esta condición.',
        markerApplied: 'Marcador aplicado: {marker}',
        markerPresent: 'Marcador ya presente: {marker}',
        langSet: 'Idioma establecido en {locale}.',
        invalidLocale:
          'Configuración regional no válida. Locales admitidas: {locales}.',
        otherDurationRequiresRounds:
          'La duración Otro requiere un número de rondas, por ejemplo --duration 5 rounds.',
        invalidDuration:
          'La duración debe ser Hasta retirar, una opción de fin de turno o un número positivo de rondas.',
        zeroHpNoConditions:
          '{name} ha llegado a 0 PV y no tiene condiciones activas.',
        zeroHpConditions:
          '{name} ha llegado a 0 PV. Elige las condiciones a eliminar:',
        removeAllBtn: 'Eliminar todas las condiciones de {name}',
        markIncapacitated: 'Marcar como incapacitado',
        removeFromTurnOrder: 'Eliminar del orden de iniciativa',
        alreadyIncapacitated: '{name} ya está incapacitado.',
        tokenRemovedFromTurn:
          '{name} ha sido eliminado del orden de iniciativa.',
        tokenNotInTurn: '{name} no se encontró en el orden de iniciativa.',
        moveTokenPrompt:
          '¿Mover {name} a la capa del mapa para que permanezca visible sin interferir con otras fichas?',
        moveTokenBtn: 'Mover {name} a la capa del mapa',
        tokenMoved: '{name} ha sido movido a la capa del mapa.',
        tokenNotFound: 'Ficha no encontrada.',
        noActiveConditions: '{name} no tiene condiciones activas que eliminar.',
        deadNoConditions:
          '{name} fue marcado como muerto. No había condiciones activas.',
        scriptReady: '{name} está activo y usas la versión {version}.',
        reachedZeroHp: '{name} alcanzó 0 PV',
        manuallyRemoved: 'eliminación manual',
        durationExpired: 'su duración expiró',
        markedAsDead: '{name} fue marcado como muerto',
        conditionReorder:
          'El orden de turno ha cambiado y {count} fila(s) de condición rastreada(s) puede(n) estar fuera de lugar. Haz clic abajo para restaurarlas después de sus tokens asignados.',
        conditionsReordered:
          'Las filas de condición han sido reposicionadas después de sus tokens asignados.',
      },
      removal: {
        conditionField: 'Condición',
        reasonField: 'Razón',
        turnRowField: 'Fila de iniciativa',
        markerField: 'Marcador',
        notConfigured: 'No configurado',
        markerRemoved: 'Eliminado ({marker})',
        markerRetained: 'Conservado ({marker})',
        rowRemoved: 'Eliminado',
        rowMissing: 'Ya faltaba',
        manualReason: 'Eliminación manual',
      },
      cleanup: {
        orphaned: 'Entradas de condición huérfanas',
        stale: 'Entradas de condición obsoletas',
        orphanedRows: 'Filas de iniciativa huérfanas',
        unusedMarkers: 'Marcadores sin usar',
      },
      apply: {
        turnAppended:
          'El objetivo no estaba en el orden de iniciativa; se agregó la fila de condición.',
        turnInserted:
          'Fila de condición insertada debajo de la ficha objetivo.',
      },
    },
    handout: {
      versionLabel: 'Versión',
      subtitle: 'Gestor de efectos de estado de D&D 5e',
      footerNote:
        'Este folleto se crea y actualiza automáticamente cada vez que se carga el script.',
      overview: {
        heading: 'Descripción general',
        body: 'Condition Tracker gestiona las condiciones de estado de D&D 5e y los efectos personalizados como filas etiquetadas en el rastreador de turno de Roll20. Aplica condiciones a fichas, rastrea duraciones por orden de iniciativa y elimina automáticamente los efectos caducados al finalizar un turno. Todos los comandos son exclusivos para el GM.',
      },
      quickStart: {
        heading: 'Inicio rápido',
        colCommand: 'Comando',
        colDesc: 'Descripción',
        rows: [
          [
            '!condition-tracker --prompt',
            'Asistente paso a paso — elige condición, fichas y duración de forma interactiva. También disponible como macro ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Aplicar una condición a varias fichas simultáneamente. También disponible como macro ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Abrir el menú principal para aplicar, revisar o eliminar condiciones.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Referencia de comandos',
        colFlag: 'Opción',
        colDesc: 'Descripción',
        rows: [
          ['--prompt', 'Interfaz del asistente paso a paso'],
          ['--multi-target', 'Aplicar una condición a varias fichas objetivo'],
          [
            '--menu',
            'Mostrar menú principal (añadir remove para el menú de eliminación)',
          ],
          [
            '--source X --target Y --condition Z',
            'Aplicar una condición directamente sin el asistente',
          ],
          [
            '--duration &lt;valor&gt;',
            'Duración para aplicación directa (p. ej. 2 rounds)',
          ],
          [
            '--other &lt;texto&gt;',
            'Texto personalizado para tipos Conjuro / Habilidad / Otro',
          ],
          [
            '--remove &lt;id-condición&gt;',
            'Eliminar una condición específica por su ID único',
          ],
          [
            '--config &lt;opción&gt; &lt;valor&gt;',
            'Ajustar opciones de configuración',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Sobrescribir subjectPromptBypass solo para este comando (también admite --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Reconciliar estado — eliminar condiciones y filas huérfanas',
          ],
          [
            '--reorder-conditions',
            'Reposicionar manualmente las filas de condición detrás de sus fichas asignadas en el orden de turno',
          ],
          ['--reinstall-macro', 'Recrear o actualizar las macros del GM'],
          [
            '--reinstall-handout',
            'Recrear o actualizar el folleto de ayuda localizado',
          ],
          [
            '--lang &lt;locale&gt;',
            'Emitir los mensajes de este comando en una locale adicional (modo bilingüe)',
          ],
          ['--help', 'Mostrar una tarjeta de ayuda breve en el chat'],
        ],
      },
      standardConditions: {
        heading: 'Condiciones estándar (D&D 5e)',
        colCondition: 'Condición',
      },
      customEffects: {
        heading: 'Tipos de efectos personalizados',
        colType: 'Tipo',
        colNotes: 'Notas',
        rows: [
          [
            '🔮 Conjuro',
            'Rastrear un efecto de conjuro nombrado — se te pedirá el nombre del conjuro',
          ],
          [
            '🎯 Habilidad',
            'Rastrear una habilidad de clase o racial — se te pedirá el nombre',
          ],
          [
            '🍀 Ventaja',
            'Registrar ventaja otorgada de una ficha a otra; agrupada con la fuente en la iniciativa',
          ],
          [
            '⬇️ Desventaja',
            'Registrar desventaja impuesta; agrupada con la fuente en la iniciativa',
          ],
          [
            '📝 Otro',
            'Etiqueta personalizada libre — se te pedirá una descripción',
          ],
        ],
      },
      durationOptions: {
        heading: 'Opciones de duración',
        intro:
          'El conteo restante se muestra en la columna pr del rastreador de turno y disminuye cuando termina el turno de la ficha ancla.',
        colOption: 'Opción',
        colBehaviour: 'Comportamiento',
        rows: [
          [
            'Hasta retirar',
            'Permanente — debe eliminarse manualmente mediante el menú o --remove',
          ],
          [
            'Fin del próximo turno del objetivo',
            'Expira cuando termina el próximo turno del objetivo en la iniciativa',
          ],
          [
            'Fin del próximo turno de la fuente',
            'Expira cuando termina el próximo turno de la fuente en la iniciativa',
          ],
          [
            '1 / 2 / 3 / 10 rondas',
            'Cuenta regresiva fija; un decremento por cada fin de turno del ancla',
          ],
        ],
      },
      configuration: {
        heading: 'Configuración',
        intro:
          'Usa !condition-tracker --config &lt;opción&gt; &lt;valor&gt; o el botón Configuración en el menú principal.',
        colOption: 'Opción',
        colValues: 'Valores',
        colDesc: 'Descripción',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Aplicar marcadores de estado de Roll20 a las fichas al agregar una condición',
          ],
          [
            'useIcons',
            'true / false',
            'Mostrar códigos de ícono cortos (p. ej. [G]) en las filas del rastreador de turno',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Omitir el paso de sujeto opcional para efectos Conjuro / Habilidad / Otro',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Barra a vigilar; cuando llega a 0 se le pide al GM que limpie las condiciones',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Idioma de los mensajes de chat y el folleto de ayuda',
          ],
          [
            'marker',
            '&lt;Condición&gt;=&lt;nombre del marcador&gt;',
            'Reemplazar el marcador usado para una condición específica (p. ej. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Marcadores de estado predeterminados',
        colCondition: 'Condición',
        colMarker: 'Nombre del marcador',
      },
      availableLocales: {
        heading: 'Traducciones disponibles',
        intro:
          'Usa la opción de configuración language para establecer los mensajes de chat y el folleto de ayuda en cualquier idioma compatible. También se aceptan alias cortos para en, zh y pt.',
        colLocale: 'Configuración regional',
        colLanguage: 'Idioma',
        colFile: 'Archivo de traducción',
      },
    },
  };

  const TRANSLATION$2 = {
    conditions: {
      Grappled: {
        past: 'fasthållen',
        verb: 'håller fast',
      },
      Restrained: {
        past: 'hindrad',
        verb: 'hindrar',
      },
      Prone: {
        past: 'liggande',
        verb: 'slår',
        suffix: 'omkull',
      },
      Poisoned: {
        past: 'förgiftad',
        verb: 'förgiftar',
      },
      Stunned: {
        past: 'omtöcknad',
        verb: 'omtöcknar',
      },
      Blinded: {
        past: 'förblindad',
        verb: 'förblindar',
      },
      Charmed: {
        past: 'charmad',
        verb: 'charmar',
      },
      Frightened: {
        past: 'skrämd',
        verb: 'skrämmer',
      },
      Incapacitated: {
        past: 'oskadliggjord',
        verb: 'oskadliggör',
      },
      Invisible: {
        past: 'osynlig',
        verb: 'gör',
        suffix: 'osynlig',
      },
      Paralyzed: {
        past: 'paralyserad',
        verb: 'paralyserar',
      },
      Petrified: {
        past: 'förstenad',
        verb: 'förstenar',
      },
      Unconscious: {
        past: 'medvetslös',
        verb: 'gör',
        suffix: 'medvetslös',
      },
      Spell: {
        past: 'påverkad av en besvärjelse',
        verb: 'kastar en besvärjelse på',
      },
      Ability: {
        past: 'påverkad av en förmåga',
        verb: 'använder en förmåga på',
      },
      Advantage: {
        past: 'har fördel',
        verb: 'ger fördel till',
        noBy: true,
      },
      Disadvantage: {
        past: 'har nackdel',
        verb: 'ger nackdel till',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Fasthållen',
      Restrained: 'Hindrad',
      Prone: 'Liggande',
      Poisoned: 'Förgiftad',
      Stunned: 'Omtöcknad',
      Blinded: 'Förblindad',
      Charmed: 'Charmad',
      Frightened: 'Skrämd',
      Incapacitated: 'Oskadliggjord',
      Invisible: 'Osynlig',
      Paralyzed: 'Paralyserad',
      Petrified: 'Förstenad',
      Unconscious: 'Medvetslös',
      Spell: 'Besvärjelse',
      Ability: 'Förmåga',
      Advantage: 'Fördel',
      Disadvantage: 'Nackdel',
      Other: 'Annat',
    },
    templates: {
      display: {
        custom: '{emoji} {target} påverkad av {effect} ({source})',
        advantage: '{emoji} {source} har fördel mot {target}{subject}',
        disadvantage: '{emoji} {source} har nackdel mot {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} är {past}',
        standard: '{emoji} {target} {past} av {source}',
      },
      apply: {
        custom: '{source} applicerar {effect} på {target}.',
        advantage: '{source} har fördel mot {target}{subject}.',
        disadvantage: '{source} har nackdel mot {target}{subject}.',
        self: '{target} är {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} är inte längre påverkad av {effect}.',
        advantage: '{source} har inte längre fördel mot {target}{subject}.',
        disadvantage: '{source} har inte längre nackdel mot {target}{subject}.',
        noBy: '{target} är inte längre {past}.',
        self: '{target} är inte längre {past}.',
        standard: '{target} är inte längre {past} av {source}.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Välj tillstånd',
        selectSource: 'Välj källtoken',
        selectTarget: 'Välj måltoken',
        selectSubject: 'Välj subjekt',
        selectDuration: 'Välj varaktighet',
        confirmTargetTitle: 'Bekräfta mållista',
        applyEffectTitle: 'Applicera {condition}-effekt',
        noTokens: 'Inga namngivna tokens hittades på den aktiva sidan.',
        confirmIntro: 'Följande tokens kommer att få tillståndet:',
        confirmBtn: 'Bekräfta mållista',
        enterDetails: 'Ange effektdetaljer',
        noneBtn: 'Ingen',
        noneOrSourceBtn: 'Ingen eller applicera på källa',
        subjectDesc: 'Välj vem eller vad som levererar effekten.',
        sourceDesc:
          'Välj det väsen som skapar/genererar tillståndet eller effekten.',
        targetDesc:
          'Välj det väsen som kommer att ta emot tillståndet eller effekten.',
        otherText: 'Anpassad tillståndstext',
        effectDetails: '{condition}-detaljer',
      },
      col: {
        players: 'Spelare',
        npcs: 'NPC:er',
        conditions: 'Tillstånd',
        customEffects: 'Anpassade effekter',
        permanentTurnEnd: 'Permanent / Rundslutet',
        rounds: 'Rundor',
        command: 'Kommando',
        result: 'Resultat',
        field: 'Fält',
        value: 'Värde',
        option: 'Alternativ',
        condition: 'Tillstånd',
        marker: 'Markör',
        item: 'Post',
        removed: 'Borttagen',
        details: 'Detaljer',
        description: 'Beskrivning',
        scenario: 'Scenario',
      },
      dur: {
        untilRemoved: 'Tills borttagen',
        endOfTargetTurn: 'Slutet av målets nästa tur',
        endOfSourceTurn: 'Slutet av källans nästa tur',
        round1: '1 runda',
        round2: '2 rundor',
        round3: '3 rundor',
        round10: '10 rundor',
        custom: 'Anpassad',
        customPrompt: 'Antal rundor',
        untilRemovedDisplay: 'Tills borttagen',
        turnsRemaining: '{n} spårad(e) turslut återstår',
      },
      btn: {
        openWizard: 'Öppna guide',
        openMultiTarget: 'Öppna guide för flera mål',
        openRemovalList: 'Öppna borttagningslista',
        showConfig: 'Visa konfiguration',
        runCleanup: 'Kör rensning',
        reinstallMacro: 'Installera om makro',
        reinstallHandout: 'Installera om handout',
        showHelp: 'Visa hjälp',
        reorderConditions: 'Ordna om tillståndsrader',
      },
      title: {
        menu: 'Meny',
        removalMenu: 'Condition Tracker — borttagning',
        config: 'Konfiguration',
        configTracker: 'Condition Tracker — konfiguration',
        help: 'Hjälp',
        applied: 'Applicerad',
        removed: 'Tillstånd borttaget',
        cleanup: 'Rensning slutförd',
        macroReinstalled: 'Makro ominstallerat',
        handoutReinstalled: 'Handout ominstallerat',
        warning: 'Varning',
        error: 'Fel',
        turnOrder: 'Turordning',
        noConditions: 'Inga tillstånd',
        tokenMoved: 'Token flyttad',
        markedDead: 'Markerad som död',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — Flytta token?',
        scriptReady: 'Skript redo',
        conditionReorder: 'Turordning ändrad',
      },
      heading: {
        quickActions: 'Snabbåtgärder',
        settings: 'Inställningar',
        markerMappings: 'Markörsmappningar',
        result: 'Resultat',
        info: 'Info',
        commandOptions: 'Kommandoalternativ',
        promptUi: 'Guide-gränssnitt',
        examples: 'Exempel',
        summary: 'Sammanfattning',
      },
      msg: {
        noActive: 'Inga aktiva tillstånd spåras.',
        configReset: 'Konfigurationen återställd till standardvärden.',
        unknownConfig:
          'Okänt konfigurationsalternativ. Använd --config för att visa stödda inställningar.',
        macroReinstalled:
          'Makrona {wizard} och {multiTarget} har installerats om för alla nuvarande GM-spelare.',
        handoutReinstalled: 'Hjälp-handouten {handout} har installerats om.',
        duplicate:
          'Exakt den kombinationen av källa, subjekt, mål, tillstånd och anpassad text är redan aktiv.',
        noTargets: 'Inga måltoken angivna för tillämpning på flera mål.',
        noSelection:
          'Välj minst en token på spelplanen innan du använder --multi-target.',
        invalidIds: 'Inga giltiga token-id:n hittades i det aktuella urvalet.',
        reSelectTokens:
          'Ingen av de ursprungligen valda tokenerna kunde hittas. Välj tokens igen och försök på nytt.',
        conditionNotFound: 'Tillstånds-id hittades inte.',
        gmOnly: 'Condition Tracker-kommandon är endast för GM:ar.',
        commandFailed:
          'Kommandot kunde inte slutföras säkert. Kontrollera API-konsolen för detaljer.',
        sourceTokenNotFound: 'Källtoken kunde inte hittas.',
        targetTokenNotFound: 'Måltoken kunde inte hittas.',
        subjectTokenNotFound: 'Subjekttoken kunde inte hittas.',
        invalidCondition:
          'Tillståndet måste vara ett av de fördefinierade tillstånden eller Annat.',
        subjectOnlyCustom:
          '--subject är endast giltigt för Besvärjelse, Förmåga, Fördel, Nackdel och Annat.',
        subjectBypassInvalid:
          '--subjectPromptBypass förväntar true eller false när ett värde anges.',
        customDetailsRequired:
          '{condition}-detaljer krävs. Använd --other för att ange dem.',
        markerConfigFormat:
          'Format för markörskonfiguration: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Markörskonfiguration kräver ett fördefinierat tillståndsnamn.',
        markerNameRequired:
          'Markörskonfiguration kräver ett icke-tomt markörnamn.',
        markerSet: '{condition}-markör inställd på {marker}.',
        healthBarSet: 'Hälsomätare inställd på {bar}.',
        boolSet: '{key} inställd på {value}.',
        expectedBoolean: 'Förväntade true eller false.',
        invalidHealthBar:
          'Hälsomätaren måste vara bar1_value, bar2_value eller bar3_value.',
        markersDisabled: 'Markörer är inaktiverade.',
        noMarkerConfigured: 'Ingen markör är konfigurerad för detta tillstånd.',
        markerApplied: 'Markör applicerad: {marker}',
        markerPresent: 'Markör redan närvarande: {marker}',
        langSet: 'Språk inställt på {locale}.',
        invalidLocale: 'Ogiltig locale. Stödda localer: {locales}.',
        otherDurationRequiresRounds:
          'Annan varaktighet kräver ett numeriskt antal rundor, till exempel --duration 5 rounds.',
        invalidDuration:
          'Varaktigheten måste vara Tills borttagen, ett turslut-alternativ eller ett positivt antal rundor.',
        zeroHpNoConditions:
          '{name} har nått 0 HP och har inga aktiva tillstånd.',
        zeroHpConditions: '{name} har nått 0 HP. Välj tillstånd att ta bort:',
        removeAllBtn: 'Ta bort alla tillstånd för {name}',
        markIncapacitated: 'Markera som oskadliggjord',
        removeFromTurnOrder: 'Ta bort från turordning',
        alreadyIncapacitated: '{name} är redan oskadliggjord.',
        tokenRemovedFromTurn: '{name} har tagits bort från turordningen.',
        tokenNotInTurn: '{name} hittades inte i turordningen.',
        moveTokenPrompt:
          'Flytta {name} till kartlagret så att den förblir synlig men inte stör andra tokens?',
        moveTokenBtn: 'Flytta {name} till kartlagret',
        tokenMoved: '{name} har flyttats till kartlagret.',
        tokenNotFound: 'Token hittades inte.',
        noActiveConditions: '{name} har inga aktiva tillstånd att ta bort.',
        deadNoConditions:
          '{name} markerades som död. Inga tillstånd var aktiva.',
        scriptReady: '{name} är aktiv och du använder version {version}.',
        reachedZeroHp: '{name} nådde 0 HP',
        manuallyRemoved: 'manuellt borttagen',
        durationExpired: 'varaktigheten löpte ut',
        markedAsDead: '{name} markerades som död',
        conditionReorder:
          'Turordningen ändrades och {count} spårad(e) tillståndsrad(er) kan nu vara felplacerade. Klicka nedan för att återställa dem efter sina tilldelade tokens.',
        conditionsReordered:
          'Tillståndsrader har ompositionerats efter sina tilldelade tokens.',
      },
      removal: {
        conditionField: 'Tillstånd',
        reasonField: 'Orsak',
        turnRowField: 'Turspårningsrad',
        markerField: 'Markör',
        notConfigured: 'Ej konfigurerad',
        markerRemoved: 'Borttagen ({marker})',
        markerRetained: 'Behållen ({marker})',
        rowRemoved: 'Borttagen',
        rowMissing: 'Redan saknad',
        manualReason: 'Manuell borttagning',
      },
      cleanup: {
        orphaned: 'Övergivna tillståndsposter',
        stale: 'Inaktuella tillståndsposter',
        orphanedRows: 'Övergivna turspårningsrader',
        unusedMarkers: 'Oanvända markörer',
      },
      apply: {
        turnAppended:
          'Målet var inte i turordningen; tillståndsrad lades till sist.',
        turnInserted: 'Tillståndsrad infogad under måltoken.',
      },
    },
    handout: {
      versionLabel: 'Version',
      subtitle: 'D&D 5e-statuseffekthanterare',
      footerNote:
        'Detta handout skapas och uppdateras automatiskt varje gång skriptet laddas.',
      overview: {
        heading: 'Översikt',
        body: 'Condition Tracker hanterar D&D 5e-statustillstånd och anpassade effekter som märkta rader i Roll20:s turspårare. Applicera tillstånd på tokens, spåra varaktigheter efter initiativordning och ta automatiskt bort utgångna effekter när en tur slutar. Alla kommandon är GM-exklusiva och kan utlösas från chatten eller via de installerade makrona.',
      },
      quickStart: {
        heading: 'Snabbstart',
        colCommand: 'Kommando',
        colDesc: 'Beskrivning',
        rows: [
          [
            '!condition-tracker --prompt',
            'Steg-för-steg-guide — välj tillstånd, tokens och varaktighet interaktivt. Finns även som makrot ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Applicera ett tillstånd på flera tokens samtidigt. Finns även som makrot ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Öppna huvudmenyn med knappar för att applicera, granska eller ta bort tillstånd.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Kommandoreferens',
        colFlag: 'Flagga',
        colDesc: 'Beskrivning',
        rows: [
          ['--prompt', 'Interaktiv steg-för-steg-guide'],
          [
            '--multi-target',
            'Applicera ett tillstånd på flera måltoken på en gång',
          ],
          ['--menu', 'Visa huvudmeny (lägg till remove för borttagningsmenyn)'],
          [
            '--source X --target Y --condition Z',
            'Applicera ett tillstånd direkt utan guiden',
          ],
          [
            '--duration &lt;värde&gt;',
            'Varaktighet för direkt applicering (t.ex. 2 rounds)',
          ],
          [
            '--other &lt;text&gt;',
            'Anpassad text för Besvärjelse / Förmåga / Annan effekttyp',
          ],
          [
            '--remove &lt;tillstånds-id&gt;',
            'Ta bort ett specifikt tillstånd via dess unika id',
          ],
          [
            '--config &lt;alternativ&gt; &lt;värde&gt;',
            'Justera konfigurationsinställningar (se avsnittet Konfiguration nedan)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Åsidosätt subjectPromptBypass enbart för detta kommando (stöder även --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Stäm av tillstånd — ta bort övergivna tillstånd och turspårningsrader',
          ],
          [
            '--reorder-conditions',
            'Flytta manuellt tillståndsrader bakom deras tilldelade tokens i turordningen',
          ],
          ['--reinstall-macro', 'Återskapa eller uppdatera GM-makrona'],
          [
            '--reinstall-handout',
            'Återskapa eller uppdatera det lokaliserade hjälp-handouten',
          ],
          [
            '--lang &lt;locale&gt;',
            'Skicka detta kommandos meddelanden på ytterligare en locale (tvåspråkigt läge)',
          ],
          ['--help', 'Visa ett kort hjälpkort i chatten'],
        ],
      },
      standardConditions: {
        heading: 'Standardtillstånd (D&amp;D 5e)',
        colCondition: 'Tillstånd',
      },
      customEffects: {
        heading: 'Anpassade effekttyper',
        colType: 'Typ',
        colNotes: 'Anteckningar',
        rows: [
          [
            '🔮 Besvärjelse',
            'Spåra en namngiven besvärjelseeffekt — du uppmanas att ange besvärjelsens namn',
          ],
          [
            '🎯 Förmåga',
            'Spåra en namngiven klass- eller rasförmåga — du uppmanas att ange förmågans namn',
          ],
          [
            '🍀 Fördel',
            'Registrera fördel given från en token till en annan; grupperad med källan i initiativet',
          ],
          [
            '⬇️ Nackdel',
            'Registrera pålagd nackdel; grupperad med källan i initiativet',
          ],
          [
            '📝 Annat',
            'Fritext anpassad etikett — du uppmanas att ange en beskrivning',
          ],
        ],
      },
      durationOptions: {
        heading: 'Varaktighetsalternativ',
        intro:
          'Det återstående antalet visas i pr-kolumnen i turspåraren och minskar när ankertokenens tur slutar.',
        colOption: 'Alternativ',
        colBehaviour: 'Beteende',
        rows: [
          [
            'Tills borttagen',
            'Permanent — måste tas bort manuellt via menyn eller --remove',
          ],
          [
            'Slutet av målets nästa tur',
            'Löper ut när måltoken:s nästa tur slutar i initiativet',
          ],
          [
            'Slutet av källans nästa tur',
            'Löper ut när källtoken:s nästa tur slutar i initiativet',
          ],
          [
            '1 / 2 / 3 / 10 rundor',
            'Fast nedräkning; ett steg per ankertokenens turslut',
          ],
        ],
      },
      configuration: {
        heading: 'Konfiguration',
        intro:
          'Använd !condition-tracker --config &lt;alternativ&gt; &lt;värde&gt; eller knappen Konfiguration i huvudmenyn.',
        colOption: 'Alternativ',
        colValues: 'Värden',
        colDesc: 'Beskrivning',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Applicera Roll20-statusmarkörer på tokens när ett tillstånd läggs till',
          ],
          [
            'useIcons',
            'true / false',
            'Visa korta ikonkoder (t.ex. [G]) istället för emoji i turspårningsrader',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Hoppa över det valfria subjektsteget för Besvärjelse / Förmåga / Andra effekter',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Token-mätare att bevaka; när den når 0 uppmanas GM att rensa upp tillstånd',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Utdataspråk för chattmeddelanden och hjälp-handouten',
          ],
          [
            'marker',
            '&lt;Tillstånd&gt;=&lt;markörnamn&gt;',
            'Åsidosätt statusmarkören för ett specifikt tillstånd (t.ex. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Standardstatusmarkörer',
        colCondition: 'Tillstånd',
        colMarker: 'Markörnamn',
      },
      availableLocales: {
        heading: 'Tillgängliga översättningar',
        intro:
          'Använd språkkonfigurationsalternativet för att ställa in chattmeddelanden och hjälp-handouten till en stödd locale. Korta alias accepteras även för en, zh och pt.',
        colLocale: 'Locale',
        colLanguage: 'Språk',
        colFile: 'Översättningsfil',
      },
    },
  };

  const TRANSLATION$1 = {
    conditions: {
      Grappled: {
        past: 'yakalanmış',
        verb: 'yakalar',
      },
      Restrained: {
        past: 'kısıtlanmış',
        verb: 'kısıtlar',
      },
      Prone: {
        past: 'yere düşmüş',
        verb: 'yere düşürür',
      },
      Poisoned: {
        past: 'zehirlenmiş',
        verb: 'zehirler',
      },
      Stunned: {
        past: 'sersemlemiş',
        verb: 'sersemletir',
      },
      Blinded: {
        past: 'kör olmuş',
        verb: 'kör eder',
      },
      Charmed: {
        past: 'büyülenmiş',
        verb: 'büyüler',
      },
      Frightened: {
        past: 'korkmuş',
        verb: 'korkutur',
      },
      Incapacitated: {
        past: 'etkisiz',
        verb: 'etkisiz hale getirir',
      },
      Invisible: {
        past: 'görünmez',
        verb: 'görünmez yapar',
      },
      Paralyzed: {
        past: 'felç olmuş',
        verb: 'felç eder',
      },
      Petrified: {
        past: 'taşlaşmış',
        verb: 'taşlaştırır',
      },
      Unconscious: {
        past: 'bilinçsiz',
        verb: 'bilinçsiz bırakır',
      },
      Spell: {
        past: 'bir büyüden etkilenmiş',
        verb: 'üzerine büyü yapar',
      },
      Ability: {
        past: 'bir yetenekten etkilenmiş',
        verb: 'üzerinde yetenek kullanır',
      },
      Advantage: {
        past: 'avantajı var',
        verb: 'avantaj verir',
        noBy: true,
      },
      Disadvantage: {
        past: 'dezavantajı var',
        verb: 'dezavantaj verir',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Yakalanmış',
      Restrained: 'Kısıtlanmış',
      Prone: 'Yerde',
      Poisoned: 'Zehirlenmiş',
      Stunned: 'Sersemlemiş',
      Blinded: 'Kör',
      Charmed: 'Büyülenmiş',
      Frightened: 'Korkmuş',
      Incapacitated: 'Etkisiz',
      Invisible: 'Görünmez',
      Paralyzed: 'Felç',
      Petrified: 'Taşlaşmış',
      Unconscious: 'Bilinçsiz',
      Spell: 'Büyü',
      Ability: 'Yetenek',
      Advantage: 'Avantaj',
      Disadvantage: 'Dezavantaj',
      Other: 'Diğer',
    },
    templates: {
      display: {
        custom: '{emoji} {target} {effect} etkisi altında ({source})',
        advantage: '{emoji} {source}, {target}{subject} karşısında avantajlı',
        disadvantage:
          '{emoji} {source}, {target}{subject} karşısında dezavantajlı',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} {past}',
        standard: '{emoji} {target} {source} tarafından {past}',
      },
      apply: {
        custom: '{source}, {target} üzerine {effect} etkisi uygular.',
        advantage: '{source}, {target}{subject} karşısında avantajlıdır.',
        disadvantage: '{source}, {target}{subject} karşısında dezavantajlıdır.',
        self: '{target} {past}.',
        withSuffix: '{source} {target} {suffix} {verb}.',
        standard: '{source} {target} {verb}.',
      },
      remove: {
        custom: '{target} artık {effect} etkisi altında değil.',
        advantage:
          '{source} artık {target}{subject} karşısında avantajlı değil.',
        disadvantage:
          '{source} artık {target}{subject} karşısında dezavantajlı değil.',
        noBy: '{target} artık {past} değil.',
        self: '{target} artık {past} değil.',
        standard: '{target} artık {source} tarafından {past} değil.',
      },
    },
    ui: {
      wizard: {
        selectCondition: 'Durum Seç',
        selectSource: 'Kaynak Token Seç',
        selectTarget: 'Hedef Token Seç',
        selectSubject: 'Özne Seç',
        selectDuration: 'Süre Seç',
        confirmTargetTitle: 'Hedef Listesini Onayla',
        applyEffectTitle: '{condition} Etkisi Uygula',
        noTokens: 'Aktif sayfada adlandırılmış token bulunamadı.',
        confirmIntro: 'Aşağıdaki tokenlar durumu alacak:',
        confirmBtn: 'Hedef listesini onayla',
        enterDetails: 'Etki ayrıntılarını girin',
        noneBtn: 'Hiçbiri',
        noneOrSourceBtn: 'Hiçbiri veya kaynağa uygula',
        subjectDesc: 'Etkiyi kimin veya neyin yarattığını seçin.',
        sourceDesc: 'Durumu veya etkiyi oluşturan yaratığı seçin.',
        targetDesc: 'Durumu veya etkiyi alacak yaratığı seçin.',
        otherText: 'Özel durum metni',
        effectDetails: '{condition} ayrıntıları',
      },
      col: {
        players: 'Oyuncular',
        npcs: "OYK'lar",
        conditions: 'Durumlar',
        customEffects: 'Özel Etkiler',
        permanentTurnEnd: 'Kalıcı / Tur Sonu',
        rounds: 'Turlar',
        command: 'Komut',
        result: 'Sonuç',
        field: 'Alan',
        value: 'Değer',
        option: 'Seçenek',
        condition: 'Durum',
        marker: 'İşaretçi',
        item: 'Öğe',
        removed: 'Kaldırıldı',
        details: 'Ayrıntılar',
        description: 'Açıklama',
        scenario: 'Senaryo',
      },
      dur: {
        untilRemoved: 'Kaldırılana kadar',
        endOfTargetTurn: 'Hedefin sonraki turunun sonu',
        endOfSourceTurn: 'Kaynağın sonraki turunun sonu',
        round1: '1 tur',
        round2: '2 tur',
        round3: '3 tur',
        round10: '10 tur',
        custom: 'Özel',
        customPrompt: 'Tur sayısı',
        untilRemovedDisplay: 'Kaldırılana kadar',
        turnsRemaining: '{n} tur sonu takibi kaldı',
      },
      btn: {
        openWizard: 'Sihirbazı Aç',
        openMultiTarget: 'Çoklu Hedef Sihirbazını Aç',
        openRemovalList: 'Kaldırma Listesini Aç',
        showConfig: 'Yapılandırmayı Göster',
        runCleanup: 'Temizliği Çalıştır',
        reinstallMacro: 'Makroyu Yeniden Yükle',
        reinstallHandout: 'El İlanını Yeniden Yükle',
        showHelp: 'Yardımı Göster',
        reorderConditions: 'Durum Satırlarını Yeniden Sırala',
      },
      title: {
        menu: 'Menü',
        removalMenu: 'Condition Tracker — Kaldırma',
        config: 'Yapılandırma',
        configTracker: 'Condition Tracker yapılandırması',
        help: 'Yardım',
        applied: 'Uygulandı',
        removed: 'Durum Kaldırıldı',
        cleanup: 'Temizlik Tamamlandı',
        macroReinstalled: 'Makro Yeniden Yüklendi',
        handoutReinstalled: 'El İlanı Yeniden Yüklendi',
        warning: 'Uyarı',
        error: 'Hata',
        turnOrder: 'Tur Sırası',
        noConditions: 'Durum Yok',
        tokenMoved: 'Token Taşındı',
        markedDead: 'Ölü Olarak İşaretlendi',
        zeroHp: '{name} — 0 KP',
        moveToken: '{name} — Token Taşınsın mı?',
        scriptReady: 'Betik Hazır',
        conditionReorder: 'Tur Sırası Değişti',
      },
      heading: {
        quickActions: 'Hızlı İşlemler',
        settings: 'Ayarlar',
        markerMappings: 'İşaretçi Eşlemeleri',
        result: 'Sonuç',
        info: 'Bilgi',
        commandOptions: 'Komut Seçenekleri',
        promptUi: 'Sihirbaz Arayüzü',
        examples: 'Örnekler',
        summary: 'Özet',
      },
      msg: {
        noActive: 'Takip edilen aktif durum yok.',
        configReset: 'Yapılandırma mod varsayılanlarına sıfırlandı.',
        unknownConfig:
          'Bilinmeyen yapılandırma seçeneği. Desteklenen ayarları görüntülemek için --config kullanın.',
        macroReinstalled:
          '{wizard} ve {multiTarget} makroları tüm mevcut GM oyuncuları için yeniden yüklendi.',
        handoutReinstalled: 'Yardım el ilanı {handout} yeniden yüklendi.',
        duplicate: 'Aynı kaynak, özne, hedef, durum ve özel metin zaten aktif.',
        noTargets: 'Çoklu hedef uygulaması için hedef token belirtilmedi.',
        noSelection:
          '--multi-target kullanmadan önce tabloda en az bir token seçin.',
        invalidIds: 'Mevcut seçimde geçerli token kimliği bulunamadı.',
        reSelectTokens:
          'Orijinal olarak seçilen tokenların hiçbiri bulunamadı. Tokenları yeniden seçip tekrar deneyin.',
        conditionNotFound: 'Durum kimliği bulunamadı.',
        gmOnly: "Condition Tracker komutları yalnızca GM'e özeldir.",
        commandFailed:
          'Komut güvenli şekilde tamamlanamadı. Ayrıntılar için API konsolunu kontrol edin.',
        sourceTokenNotFound: 'Kaynak token bulunamadı.',
        targetTokenNotFound: 'Hedef token bulunamadı.',
        subjectTokenNotFound: 'Özne token bulunamadı.',
        invalidCondition:
          'Durum, önceden tanımlanmış durumlardan biri veya Diğer olmalıdır.',
        subjectOnlyCustom:
          '--subject yalnızca Büyü, Yetenek, Avantaj, Dezavantaj ve Diğer için geçerlidir.',
        subjectBypassInvalid:
          '--subjectPromptBypass, bir değer sağlandığında true veya false bekler.',
        customDetailsRequired:
          '{condition} ayrıntıları gereklidir. Bunları sağlamak için --other kullanın.',
        markerConfigFormat:
          'İşaretçi yapılandırma biçimi: --config marker Grappled=grab',
        markerPredefinedRequired:
          'İşaretçi yapılandırması önceden tanımlanmış bir durum adı gerektirir.',
        markerNameRequired:
          'İşaretçi yapılandırması boş olmayan bir işaretçi adı gerektirir.',
        markerSet: '{condition} işaretçisi {marker} olarak ayarlandı.',
        healthBarSet: 'Sağlık çubuğu {bar} olarak ayarlandı.',
        boolSet: '{key}, {value} olarak ayarlandı.',
        expectedBoolean: 'true veya false bekleniyor.',
        invalidHealthBar:
          'Sağlık çubuğu bar1_value, bar2_value veya bar3_value olmalıdır.',
        markersDisabled: 'İşaretçiler devre dışı.',
        noMarkerConfigured: 'Bu durum için yapılandırılmış işaretçi yok.',
        markerApplied: 'İşaretçi uygulandı: {marker}',
        markerPresent: 'İşaretçi zaten mevcut: {marker}',
        langSet: 'Dil {locale} olarak ayarlandı.',
        invalidLocale:
          'Geçersiz yerel ayar. Desteklenen yerel ayarlar: {locales}.',
        otherDurationRequiresRounds:
          'Diğer süre, sayısal bir tur sayısı gerektirir; örneğin --duration 5 rounds.',
        invalidDuration:
          'Süre; Kaldırılana kadar, bir tur sonu seçeneği veya pozitif bir tur sayısı olmalıdır.',
        zeroHpNoConditions: "{name} 0 KP'ye ulaştı ve aktif durumu yok.",
        zeroHpConditions:
          "{name} 0 KP'ye ulaştı. Kaldırılacak durumları seçin:",
        removeAllBtn: '{name} için Tüm Durumları Kaldır',
        markIncapacitated: 'Etkisiz Olarak İşaretle',
        removeFromTurnOrder: 'Tur Sırasından Kaldır',
        alreadyIncapacitated: '{name} zaten Etkisiz.',
        tokenRemovedFromTurn: '{name} tur sırasından kaldırıldı.',
        tokenNotInTurn: '{name} tur sırasında bulunamadı.',
        moveTokenPrompt:
          '{name} görünür kalması ancak diğer tokenlara engel olmaması için harita katmanına taşınsın mı?',
        moveTokenBtn: '{name} Harita Katmanına Taşı',
        tokenMoved: '{name} harita katmanına taşındı.',
        tokenNotFound: 'Token bulunamadı.',
        noActiveConditions: '{name} kaldırılacak aktif durumu yok.',
        deadNoConditions: '{name} ölü olarak işaretlendi. Aktif durum yoktu.',
        scriptReady: '{name} aktif ve {version} sürümünü kullanıyorsunuz.',
        reachedZeroHp: "{name} 0 KP'ye ulaştı",
        manuallyRemoved: 'manuel olarak kaldırıldı',
        durationExpired: 'süresi doldu',
        markedAsDead: '{name} ölü olarak işaretlendi',
        conditionReorder:
          'Tur sırası değişti ve {count} takip edilen durum satırı artık yanlış yerde olabilir. Bunları atanmış tokenlarının arkasına taşımak için aşağıya tıklayın.',
        conditionsReordered:
          'Durum satırları atanmış tokenlarının arkasına yeniden konumlandırıldı.',
      },
      removal: {
        conditionField: 'Durum',
        reasonField: 'Neden',
        turnRowField: 'Tur Takibi satırı',
        markerField: 'İşaretçi',
        notConfigured: 'Yapılandırılmamış',
        markerRemoved: 'Kaldırıldı ({marker})',
        markerRetained: 'Tutuldu ({marker})',
        rowRemoved: 'Kaldırıldı',
        rowMissing: 'Zaten eksik',
        manualReason: 'Manuel kaldırma',
      },
      cleanup: {
        orphaned: 'Sahipsiz durum girişleri',
        stale: 'Eski durum girişleri',
        orphanedRows: 'Sahipsiz Tur Takibi satırları',
        unusedMarkers: 'Kullanılmayan işaretçiler',
      },
      apply: {
        turnAppended: 'Hedef tur sırasında değildi; durum satırı sona eklendi.',
        turnInserted: 'Durum satırı hedef tokenın altına eklendi.',
      },
    },
    handout: {
      versionLabel: 'Sürüm',
      subtitle: 'D&D 5e Durum Etkisi Yöneticisi',
      footerNote:
        'Bu el ilanı, betik her yüklendiğinde otomatik olarak oluşturulur ve güncellenir.',
      overview: {
        heading: 'Genel Bakış',
        body: "Condition Tracker, D&D 5e durum koşullarını ve özel efektleri Roll20 Tur Takibinde etiketli satırlar olarak yönetir. Tokenlara durum uygulayın, süreleri inisiyatif sırasına göre takip edin ve tur sona erdiğinde süresi dolan efektleri otomatik olarak kaldırın. Tüm komutlar yalnızca GM'e özeldir ve sohbetten veya yüklü makrolar aracılığıyla tetiklenebilir.",
      },
      quickStart: {
        heading: 'Hızlı Başlangıç',
        colCommand: 'Komut',
        colDesc: 'Açıklama',
        rows: [
          [
            '!condition-tracker --prompt',
            'Adım adım sihirbaz — durumu, tokenleri ve süreyi etkileşimli olarak seçin. ConditionTrackerWizard makrosu olarak da kullanılabilir.',
          ],
          [
            '!condition-tracker --multi-target',
            'Bir durumu aynı anda birden fazla tokena uygulayın. ConditionTrackerMultiTarget makrosu olarak da kullanılabilir.',
          ],
          [
            '!condition-tracker --menu',
            'Durum uygulamak, incelemek veya kaldırmak için düğmeler içeren ana yönetim menüsünü açın.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Komut Referansı',
        colFlag: 'Bayrak',
        colDesc: 'Açıklama',
        rows: [
          ['--prompt', 'Etkileşimli adım adım sihirbaz arayüzü'],
          [
            '--multi-target',
            'Bir durumu aynı anda birden fazla hedef tokena uygula',
          ],
          ['--menu', 'Ana menüyü göster (kaldırma menüsü için remove ekle)'],
          [
            '--source X --target Y --condition Z',
            'Sihirbaz olmadan doğrudan durum uygula',
          ],
          [
            '--duration &lt;değer&gt;',
            'Doğrudan uygulama için süre (örn. 2 rounds)',
          ],
          [
            '--other &lt;metin&gt;',
            'Büyü / Yetenek / Diğer etki türleri için özel metin',
          ],
          [
            '--remove &lt;durum-kimliği&gt;',
            'Belirli bir durumu benzersiz kimliğiyle kaldır',
          ],
          [
            '--config &lt;seçenek&gt; &lt;değer&gt;',
            'Yapılandırma ayarlarını düzenle (aşağıdaki Yapılandırma bölümüne bakın)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            "Bu komut için subjectPromptBypass'ı geçersiz kıl (--subject-prompt-bypass da desteklenir)",
          ],
          [
            '--cleanup',
            'Durumu uzlaştır — sahipsiz koşulları ve Tur Takibi satırlarını kaldır',
          ],
          [
            '--reorder-conditions',
            'Tur sırasındaki koşul satırlarını atanmış tokenlarının arkasına manuel olarak yeniden konumlandır',
          ],
          ['--reinstall-macro', 'GM makrolarını yeniden oluştur veya güncelle'],
          [
            '--reinstall-handout',
            'Yerelleştirilmiş yardım el ilanını yeniden oluştur veya güncelle',
          ],
          [
            '--lang &lt;yerel ayar&gt;',
            'Bu komutun mesajlarını ek bir yerel ayarda çıkart (iki dilli mod)',
          ],
          ['--help', 'Sohbette kısa bir yardım kartı göster'],
        ],
      },
      standardConditions: {
        heading: 'Standart Durumlar (D&amp;D 5e)',
        colCondition: 'Durum',
      },
      customEffects: {
        heading: 'Özel Efekt Türleri',
        colType: 'Tür',
        colNotes: 'Notlar',
        rows: [
          [
            '🔮 Büyü',
            'Adlandırılmış bir büyü etkisini takip edin — büyü adı sorulacak',
          ],
          [
            '🎯 Yetenek',
            'Adlandırılmış bir sınıf veya ırk yeteneğini takip edin — yetenek adı sorulacak',
          ],
          [
            '🍀 Avantaj',
            'Bir tokenden diğerine verilen avantajı kaydedin; inisiyatifte kaynakla gruplandırılır',
          ],
          [
            '⬇️ Dezavantaj',
            'Uygulanan dezavantajı kaydedin; inisiyatifte kaynakla gruplandırılır',
          ],
          ['📝 Diğer', 'Serbest biçimli özel etiket — bir açıklama sorulacak'],
        ],
      },
      durationOptions: {
        heading: 'Süre Seçenekleri',
        intro:
          'Kalan sayı, Tur Takibinin pr sütununda gösterilir ve çapa tokenının turu sona erdiğinde azalır.',
        colOption: 'Seçenek',
        colBehaviour: 'Davranış',
        rows: [
          [
            'Kaldırılana kadar',
            'Kalıcı — menü veya --remove aracılığıyla manuel olarak kaldırılmalıdır',
          ],
          [
            'Hedefin sonraki turunun sonu',
            'Hedef tokenın inisiyatifteki sonraki turu sona erdiğinde sona erer',
          ],
          [
            'Kaynağın sonraki turunun sonu',
            'Kaynak tokenın inisiyatifteki sonraki turu sona erdiğinde sona erer',
          ],
          [
            '1 / 2 / 3 / 10 tur',
            'Sabit geri sayım; çapa token tur sonunda bir azalma',
          ],
        ],
      },
      configuration: {
        heading: 'Yapılandırma',
        intro:
          '!condition-tracker --config &lt;seçenek&gt; &lt;değer&gt; veya ana menüdeki Yapılandırma düğmesini kullanın.',
        colOption: 'Seçenek',
        colValues: 'Değerler',
        colDesc: 'Açıklama',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Bir durum eklendiğinde tokenlara Roll20 durum işaretçileri uygula',
          ],
          [
            'useIcons',
            'true / false',
            'Tur Takibi satırlarında emoji yerine kısa simge kodları göster (örn. [G])',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            'Büyü / Yetenek / Diğer efektler için isteğe bağlı özne-token adımını atla',
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            "İzlenecek token çubuğu; 0'a düştüğünde GM'den durumları temizlemesi istenir",
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Sohbet mesajları ve yardım el ilanı için çıktı dili',
          ],
          [
            'marker',
            '&lt;Durum&gt;=&lt;işaretçi adı&gt;',
            'Belirli bir durum için kullanılan durum işaretçisini geçersiz kıl (örn. marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Varsayılan Durum İşaretçileri',
        colCondition: 'Durum',
        colMarker: 'İşaretçi Adı',
      },
      availableLocales: {
        heading: 'Mevcut Çeviriler',
        intro:
          'Sohbet mesajlarını ve yardım el ilanını desteklenen herhangi bir yerel ayara ayarlamak için language yapılandırma seçeneğini kullanın. en, zh ve pt için kısa takma adlar da kabul edilir.',
        colLocale: 'Yerel Ayar',
        colLanguage: 'Dil',
        colFile: 'Çeviri Dosyası',
      },
    },
  };

  const TRANSLATION = {
    conditions: {
      Grappled: {
        past: 'схоплений',
        verb: 'схоплює',
      },
      Restrained: {
        past: 'стриманий',
        verb: 'стримує',
      },
      Prone: {
        past: 'збитий з ніг',
        verb: 'збиває',
        suffix: 'з ніг',
      },
      Poisoned: {
        past: 'отруєний',
        verb: 'отруює',
      },
      Stunned: {
        past: 'приголомшений',
        verb: 'приголомшує',
      },
      Blinded: {
        past: 'осліплений',
        verb: 'осліплює',
      },
      Charmed: {
        past: 'зачарований',
        verb: 'зачаровує',
      },
      Frightened: {
        past: 'наляканий',
        verb: 'лякає',
      },
      Incapacitated: {
        past: 'недієздатний',
        verb: 'робить',
        suffix: 'недієздатним',
      },
      Invisible: {
        past: 'невидимий',
        verb: 'робить',
        suffix: 'невидимим',
      },
      Paralyzed: {
        past: 'паралізований',
        verb: 'паралізує',
      },
      Petrified: {
        past: "скам'янілий",
        verb: "скам'яніює",
      },
      Unconscious: {
        past: 'непритомний',
        verb: 'позбавляє',
        suffix: 'свідомості',
      },
      Spell: {
        past: 'під дією закляття',
        verb: 'накладає закляття на',
      },
      Ability: {
        past: 'під дією здібності',
        verb: 'використовує здібність на',
      },
      Advantage: {
        past: 'має перевагу',
        verb: 'надає перевагу',
        noBy: true,
      },
      Disadvantage: {
        past: 'має перешкоду',
        verb: 'накладає перешкоду',
        noBy: true,
      },
    },
    condNames: {
      Grappled: 'Схоплений',
      Restrained: 'Стриманий',
      Prone: 'Долілиць',
      Poisoned: 'Отруєний',
      Stunned: 'Приголомшений',
      Blinded: 'Осліплений',
      Charmed: 'Зачарований',
      Frightened: 'Наляканий',
      Incapacitated: 'Недієздатний',
      Invisible: 'Невидимий',
      Paralyzed: 'Паралізований',
      Petrified: "Скам'янілий",
      Unconscious: 'Непритомний',
      Spell: 'Закляття',
      Ability: 'Здібність',
      Advantage: 'Перевага',
      Disadvantage: 'Перешкода',
      Other: 'Інше',
    },
    languageNames: {
      af: 'африкаанс',
      ca: 'каталонська',
      'zh-TW': 'китайська (Тайвань)',
      cs: 'чеська',
      da: 'данська',
      nl: 'нідерландська',
      'en-US': 'англійська (Сполучені Штати)',
      fi: 'фінська',
      fr: 'французька',
      de: 'німецька',
      el: 'грецька',
      he: 'іврит',
      hu: 'угорська',
      it: 'італійська',
      ja: 'японська',
      ko: 'корейська',
      pl: 'польська',
      'pt-PT': 'португальська (Португалія)',
      'pt-BR': 'португальська (Бразилія)',
      ru: 'російська',
      es: 'іспанська',
      sv: 'шведська',
      tr: 'турецька',
      uk: 'українська',
    },
    ui: {
      choice: {
        selectCondition: 'Виберіть стан',
        selectSource: 'Виберіть токен-джерело',
        selectTarget: 'Виберіть токен-ціль',
        selectSubject: "Виберіть суб'єкт",
        selectDuration: 'Виберіть тривалість',
        confirmTargetTitle: 'Підтвердьте список цілей',
        applyEffectTitle: 'Застосувати ефект {condition}',
        noTokens: 'На активній сторінці не знайдено іменованих токенів.',
        confirmIntro: 'Ці токени отримають стан:',
        confirmBtn: 'Підтвердити список цілей',
        enterDetails: 'Введіть подробиці ефекту',
        noneBtn: 'Немає',
        noneOrSourceBtn: 'Немає або застосувати до джерела',
        subjectDesc: 'Виберіть, хто або що спричиняє ефект.',
        sourceDesc: 'Виберіть істоту, яка створює стан або ефект.',
        targetDesc: 'Виберіть істоту, яка отримає стан або ефект.',
        otherText: 'Текст іншого стану',
        effectDetails: 'Подробиці {condition}',
      },
      col: {
        players: 'Гравці',
        npcs: 'NPC',
        conditions: 'Стани',
        customEffects: 'Користувацькі ефекти',
        permanentTurnEnd: 'Постійно / кінець ходу',
        rounds: 'Раунди',
        command: 'Команда',
        result: 'Результат',
        field: 'Поле',
        value: 'Значення',
        option: 'Опція',
        condition: 'Стан',
        marker: 'Маркер',
        item: 'Елемент',
        removed: 'Видалено',
        details: 'Подробиці',
        description: 'Опис',
        scenario: 'Сценарій',
      },
      dur: {
        untilRemoved: 'Доки не видалено',
        endOfTargetTurn: 'Кінець наступного ходу цілі',
        endOfSourceTurn: 'Кінець наступного ходу джерела',
        round1: '1 раунд',
        round2: '2 раунди',
        round3: '3 раунди',
        round10: '10 раундів',
        custom: 'Власне',
        customPrompt: 'Кількість раундів',
        untilRemovedDisplay: 'Доки не видалено',
        turnsRemaining: 'Залишилось відстежуваних завершень ходу: {n}',
      },
      btn: {
        openWizard: 'Відкрити майстер',
        openMultiTarget: 'Майстер кількох цілей',
        openRemovalList: 'Відкрити список видалення',
        showConfig: 'Показати налаштування',
        runCleanup: 'Запустити очищення',
        reinstallMacro: 'Перевстановити макрос',
        reinstallHandout: 'Перевстановити довідник',
        showHelp: 'Показати довідку',
        reorderConditions: 'Переупорядкувати рядки умов',
      },
      title: {
        menu: 'Меню',
        removalMenu: 'Видалення Condition Tracker',
        config: 'Налаштування',
        configTracker: 'Налаштування Condition Tracker',
        help: 'Довідка',
        applied: 'Застосовано',
        removed: 'Стан видалено',
        cleanup: 'Очищення завершено',
        macroReinstalled: 'Макрос перевстановлено',
        handoutReinstalled: 'Довідник перевстановлено',
        warning: 'Попередження',
        error: 'Помилка',
        turnOrder: 'Порядок ходів',
        noConditions: 'Немає станів',
        tokenMoved: 'Токен переміщено',
        markedDead: 'Позначено як мертвого',
        zeroHp: '{name} — 0 HP',
        moveToken: '{name} — перемістити токен?',
        scriptReady: 'Скрипт готовий',
        conditionReorder: 'Порядок ходів змінено',
      },
      heading: {
        quickActions: 'Швидкі дії',
        settings: 'Налаштування',
        markerMappings: 'Відповідність маркерів',
        result: 'Результат',
        info: 'Інформація',
        commandOptions: 'Параметри команд',
        promptUi: 'Інтерфейс майстра',
        examples: 'Приклади',
        summary: 'Підсумок',
      },
      msg: {
        noActive: 'Активні стани не відстежуються.',
        configReset: 'Налаштування скинуто до стандартних значень моду.',
        unknownConfig:
          'Невідома опція налаштування. Використайте --config, щоб переглянути підтримувані налаштування.',
        macroReinstalled:
          'Макроси {wizard} і {multiTarget} перевстановлено для всіх поточних GM-гравців.',
        handoutReinstalled: 'Довідник {handout} перевстановлено.',
        duplicate:
          "Такий самий набір джерела, суб'єкта, цілі, стану й тексту вже активний.",
        noTargets: 'Для застосування до кількох цілей не вказано токени.',
        noSelection:
          'Виберіть принаймні один токен на мапі перед використанням --multi-target.',
        invalidIds: 'У поточному виборі не знайдено дійсних ID токенів.',
        reSelectTokens:
          'Жоден із початково вибраних токенів не знайдено. Виберіть токени знову й повторіть.',
        conditionNotFound: 'ID стану не знайдено.',
        gmOnly: 'Команди Condition Tracker доступні лише GM.',
        commandFailed:
          'Команду не вдалося безпечно виконати. Перевірте консоль API.',
        sourceTokenNotFound: 'Токен-джерело не знайдено.',
        targetTokenNotFound: 'Токен-ціль не знайдено.',
        subjectTokenNotFound: "Токен-суб'єкт не знайдено.",
        invalidCondition:
          'Стан має бути одним із попередньо визначених станів або Other.',
        subjectOnlyCustom:
          '--subject дійсний лише для Spell, Ability, Advantage, Disadvantage та Other.',
        subjectBypassInvalid:
          '--subjectPromptBypass очікує true або false, якщо значення вказано.',
        customDetailsRequired:
          'Для {condition} потрібні подробиці. Використайте --other, щоб їх указати.',
        markerConfigFormat:
          'Формат налаштування маркера: --config marker Grappled=grab',
        markerPredefinedRequired:
          'Для налаштування маркера потрібна назва попередньо визначеного стану.',
        markerNameRequired:
          'Для налаштування маркера потрібна непорожня назва маркера.',
        markerSet: 'Маркер {condition} встановлено на {marker}.',
        healthBarSet: "Панель здоров'я встановлено на {bar}.",
        boolSet: '{key} встановлено на {value}.',
        expectedBoolean: 'Очікується true або false.',
        invalidHealthBar:
          "Панель здоров'я має бути bar1_value, bar2_value або bar3_value.",
        markersDisabled: 'Маркери вимкнено.',
        noMarkerConfigured: 'Для цього стану маркер не налаштовано.',
        markerApplied: 'Маркер застосовано: {marker}',
        markerPresent: 'Маркер уже присутній: {marker}',
        langSet: 'Мову встановлено: {locale}.',
        invalidLocale: 'Недійсна локаль. Підтримувані локалі: {locales}.',
        otherDurationRequiresRounds:
          'Інша тривалість потребує числової кількості раундів, наприклад --duration 5 rounds.',
        invalidDuration:
          "Тривалість має бути 'доки не видалено', опцією кінця ходу або додатною кількістю раундів.",
        zeroHpNoConditions: '{name} досяг 0 HP і не має активних станів.',
        zeroHpConditions: '{name} досяг 0 HP. Виберіть стани для видалення:',
        removeAllBtn: 'Видалити всі стани для {name}',
        markIncapacitated: 'Позначити як недієздатного',
        removeFromTurnOrder: 'Видалити з порядку ходів',
        alreadyIncapacitated: '{name} уже недієздатний.',
        tokenRemovedFromTurn: '{name} видалено з порядку ходів.',
        tokenNotInTurn: '{name} не знайдено в порядку ходів.',
        moveTokenPrompt:
          'Перемістити {name} на шар мапи, щоб він залишався видимим і не заважав іншим токенам?',
        moveTokenBtn: 'Перемістити {name} на шар мапи',
        tokenMoved: '{name} переміщено на шар мапи.',
        tokenNotFound: 'Токен не знайдено.',
        noActiveConditions: '{name} не має активних станів для видалення.',
        deadNoConditions:
          '{name} позначено як мертвого. Активних станів не було.',
        scriptReady: '{name} активний, ви використовуєте версію {version}.',
        reachedZeroHp: '{name} досяг 0 HP',
        manuallyRemoved: 'це було видалено вручну',
        durationExpired: 'тривалість завершилася',
        markedAsDead: '{name} позначено як мертвого',
        conditionReorder:
          'Порядок ходів змінився, і {count} відстежуваний рядок/рядків умов може бути тепер не на місці. Натисніть нижче, щоб відновити їх після призначених токенів.',
        conditionsReordered:
          'Рядки умов були переміщені після призначених токенів.',
      },
      removal: {
        conditionField: 'Стан',
        reasonField: 'Причина',
        turnRowField: 'Рядок трекера ходів',
        markerField: 'Маркер',
        notConfigured: 'Не налаштовано',
        markerRemoved: 'Видалено ({marker})',
        markerRetained: 'Збережено ({marker})',
        rowRemoved: 'Видалено',
        rowMissing: 'Уже відсутній',
        manualReason: 'Ручне видалення',
      },
      cleanup: {
        orphaned: 'Осиротілі записи станів',
        stale: 'Застарілі записи станів',
        orphanedRows: 'Осиротілі рядки трекера ходів',
        unusedMarkers: 'Невикористані маркери',
      },
      apply: {
        turnAppended:
          'Цілі не було в порядку ходів; рядок стану додано в кінець.',
        turnInserted: 'Рядок стану вставлено під токеном цілі.',
      },
    },
    handout: {
      versionLabel: 'Версія',
      subtitle: 'Менеджер станів D&D 5e',
      footerNote:
        'Цей довідник автоматично створюється й оновлюється під час кожного запуску скрипта.',
      overview: {
        heading: 'Огляд',
        body: 'Condition Tracker керує станами D&D 5e і користувацькими ефектами як підписаними рядками в Roll20 Turn Tracker. Застосовуйте стани до токенів, відстежуйте тривалість за порядком ініціативи та автоматично видаляйте ефекти, термін яких завершився. Усі команди доступні лише GM і можуть запускатися з чату або встановлених макросів.',
      },
      quickStart: {
        heading: 'Швидкий старт',
        colCommand: 'Команда',
        colDesc: 'Опис',
        rows: [
          [
            '!condition-tracker --prompt',
            'Покроковий майстер — виберіть стан, токени й тривалість інтерактивно. Також доступний як макрос ConditionTrackerWizard.',
          ],
          [
            '!condition-tracker --multi-target',
            'Застосувати один стан до кількох токенів одночасно. Також доступний як макрос ConditionTrackerMultiTarget.',
          ],
          [
            '!condition-tracker --menu',
            'Відкрити головне меню керування з кнопками застосування, перегляду або видалення станів.',
          ],
        ],
      },
      commandsRef: {
        heading: 'Довідник команд',
        colFlag: 'Параметр',
        colDesc: 'Опис',
        rows: [
          ['--prompt', 'Інтерактивний покроковий майстер'],
          ['--multi-target', 'Застосувати стан до кількох цілей одночасно'],
          [
            '--menu',
            'Показати головне меню (додайте remove для меню видалення)',
          ],
          [
            '--source X --target Y --condition Z',
            'Застосувати стан напряму без майстра',
          ],
          [
            '--duration &lt;value&gt;',
            'Тривалість для прямого застосування (наприклад, 2 rounds)',
          ],
          [
            '--other &lt;text&gt;',
            'Користувацький текст для ефектів Spell / Ability / Other',
          ],
          [
            '--remove &lt;condition-id&gt;',
            'Видалити конкретний стан за його унікальним ID',
          ],
          [
            '--config &lt;option&gt; &lt;value&gt;',
            'Змінити налаштування (див. розділ Налаштування нижче)',
          ],
          [
            '--prompt --subjectPromptBypass true|false',
            'Перевизначити subjectPromptBypass лише для цієї команди (також підтримує --subject-prompt-bypass)',
          ],
          [
            '--cleanup',
            'Узгодити стан — видалити осиротілі стани й рядки Turn Tracker',
          ],
          [
            '--reorder-conditions',
            'Вручну переставити рядки умов після відповідних токенів у черзі ходу',
          ],
          ['--reinstall-macro', 'Повторно створити або оновити GM-макроси'],
          [
            '--reinstall-handout',
            'Повторно створити або оновити локалізований довідник',
          ],
          [
            '--lang &lt;locale&gt;',
            'Вивести повідомлення цієї команди додатковою локаллю (двомовний режим)',
          ],
          ['--help', 'Показати коротку картку довідки в чаті'],
        ],
      },
      standardConditions: {
        heading: 'Стандартні стани (D&amp;D 5e)',
        colCondition: 'Стан',
      },
      customEffects: {
        heading: 'Користувацькі типи ефектів',
        colType: 'Тип',
        colNotes: 'Примітки',
        rows: [
          [
            '🔮 Spell',
            'Відстежувати ефект названого закляття — буде запитано назву закляття',
          ],
          [
            '🎯 Ability',
            'Відстежувати названу класову або расову здібність — буде запитано назву здібності',
          ],
          [
            '🍀 Advantage',
            'Записати перевагу від одного токена проти іншого; групується з джерелом в ініціативі',
          ],
          [
            '⬇️ Disadvantage',
            'Записати перешкоду; групується з джерелом в ініціативі',
          ],
          ['📝 Other', 'Довільна користувацька мітка — буде запитано опис'],
        ],
      },
      durationOptions: {
        heading: 'Опції тривалості',
        intro:
          'Залишок показується в колонці pr трекера ходів і зменшується, коли завершується хід опорного токена.',
        colOption: 'Опція',
        colBehaviour: 'Поведінка',
        rows: [
          [
            'Until removed',
            'Постійно — потрібно видалити вручну через меню або --remove',
          ],
          [
            "End of target's next turn",
            'Завершується, коли закінчується наступний хід токена-цілі',
          ],
          [
            "End of source's next turn",
            'Завершується, коли закінчується наступний хід токена-джерела',
          ],
          [
            '1 / 2 / 3 / 10 rounds',
            'Фіксований відлік; одне зменшення на завершення ходу опорного токена',
          ],
        ],
      },
      configuration: {
        heading: 'Налаштування',
        intro:
          'Використайте !condition-tracker --config &lt;option&gt; &lt;value&gt; або кнопку Налаштування в головному меню.',
        colOption: 'Опція',
        colValues: 'Значення',
        colDesc: 'Опис',
        rows: [
          [
            'useMarkers',
            'true / false',
            'Застосовувати статус-маркери Roll20 до токенів, коли додається стан',
          ],
          [
            'useIcons',
            'true / false',
            'Показувати короткі коди іконок (наприклад, [G]) замість emoji в рядках Turn Tracker',
          ],
          [
            'subjectPromptBypass',
            'true / false',
            "Пропускати необов'язковий крок вибору суб'єкта для ефектів Spell / Ability / Other",
          ],
          [
            'healthBar',
            'bar1_value / bar2_value / bar3_value',
            'Панель токена для відстеження; коли вона падає до 0, GM отримує запит на очищення станів',
          ],
          [
            'language',
            'en-US / fr / de / es / pt-BR / ko',
            'Мова повідомлень чату та довідника',
          ],
          [
            'marker',
            '&lt;Condition&gt;=&lt;marker name&gt;',
            'Перевизначити статус-маркер для конкретного стану (наприклад, marker Grappled=grab)',
          ],
        ],
      },
      defaultMarkers: {
        heading: 'Стандартні статус-маркери',
        colCondition: 'Стан',
        colMarker: 'Назва маркера',
      },
      availableLocales: {
        heading: 'Доступні переклади',
        intro:
          'Використайте опцію language, щоб установити повідомлення чату й довідник на будь-яку підтримувану локаль. Також приймаються короткі псевдоніми en, zh і pt.',
        colLocale: 'Локаль',
        colLanguage: 'Мова',
        colFile: 'Файл перекладу',
      },
    },
    templates: {
      display: {
        custom: '{emoji} {target} під дією {effect} ({source})',
        advantage: '{emoji} {source} має перевагу проти {target}{subject}',
        disadvantage: '{emoji} {source} має перешкоду проти {target}{subject}',
        noBy: '{emoji} {target} {past} ({source})',
        self: '{target} {past}',
        standard: '{emoji} {target} {past} від {source}',
      },
      apply: {
        custom: '{source} застосовує {effect} до {target}.',
        advantage: '{source} має перевагу проти {target}{subject}.',
        disadvantage: '{source} має перешкоду проти {target}{subject}.',
        self: '{target} {past}.',
        withSuffix: '{source} {verb} {target} {suffix}.',
        standard: '{source} {verb} {target}.',
      },
      remove: {
        custom: '{target} більше не під дією {effect}.',
        advantage: '{source} більше не має переваги проти {target}{subject}.',
        disadvantage:
          '{source} більше не має перешкоди проти {target}{subject}.',
        noBy: '{target} більше не {past}.',
        self: '{target} більше не {past}.',
        standard: '{target} більше не {past} від {source}.',
      },
    },
  };

  const TRANSLATIONS = {
    af: TRANSLATION$n,
    ca: TRANSLATION$m,
    'zh-TW': TRANSLATION$l,
    cs: TRANSLATION$k,
    da: TRANSLATION$j,
    nl: TRANSLATION$i,
    'en-US': TRANSLATION$h,
    fi: TRANSLATION$g,
    fr: TRANSLATION$f,
    de: TRANSLATION$e,
    el: TRANSLATION$d,
    he: TRANSLATION$c,
    hu: TRANSLATION$b,
    it: TRANSLATION$a,
    ja: TRANSLATION$9,
    ko: TRANSLATION$8,
    pl: TRANSLATION$7,
    'pt-PT': TRANSLATION$6,
    'pt-BR': TRANSLATION$5,
    ru: TRANSLATION$4,
    es: TRANSLATION$3,
    sv: TRANSLATION$2,
    tr: TRANSLATION$1,
    uk: TRANSLATION,
  };

  for (const translation of Object.values(TRANSLATIONS)) {
    const rows = translation?.handout?.configuration?.rows;
    const languageRow = Array.isArray(rows)
      ? rows.find((row) => Array.isArray(row) && row[0] === 'language')
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
  function normalizeLocale(lang) {
    const s = typeof lang === 'string' ? lang.trim() : '';
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
      ''
    );
  }

  /**
   * Returns a valid locale string, falling back to the default.
   *
   * @param {string} lang Locale string to validate.
   * @returns {string} Validated locale.
   */
  function getLocale(lang) {
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
  function getLocalizedLanguageName(locale, displayLocale) {
    const definition = getLocaleDefinition(locale);
    if (!definition) {
      return locale;
    }

    const lang = getLocale(displayLocale);
    let localizedName =
      TRANSLATIONS[lang]?.languageNames?.[definition.code] || '';
    try {
      localizedName =
        localizedName ||
        new Intl.DisplayNames([lang], { type: 'language' }).of(definition.code);
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
        : '';
    return `${name}${nativeName}`;
  }

  /**
   * Returns true when a locale should render right-to-left.
   *
   * @param {string} locale Locale string.
   * @returns {boolean} True for right-to-left locales.
   */
  function isRtlLocale(locale) {
    const lang = getLocale(locale);
    return LOCALE_DEFINITIONS.some(
      (definition) =>
        definition.code === lang && definition.direction === 'rtl',
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
      if (current == null || typeof current !== 'object') return undefined;
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
  function t(key, locale, vars = {}) {
    const lang = getLocale(locale);
    const parts = key.split('.');
    let value = getNestedValue(TRANSLATIONS[lang], parts);

    if (value === undefined && lang !== DEFAULT_LOCALE) {
      value = getNestedValue(TRANSLATIONS[DEFAULT_LOCALE], parts);
    }

    if (typeof value !== 'string') return key;

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
  function tRaw(key, locale) {
    const lang = getLocale(locale);
    const parts = key.split('.');
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
  function getConditionLocalData(condition, locale) {
    const lang = getLocale(locale);
    const data = TRANSLATIONS[lang]?.conditions?.[condition];
    return data || null;
  }

  /**
   * Returns true when a value is neither undefined nor null.
   *
   * @param {*} value The value to inspect.
   * @returns {boolean} True when the value exists.
   */
  function hasValue$1(value) {
    return value !== undefined && value !== null;
  }

  /**
   * Converts a value to trimmed text.
   *
   * @param {*} value The value to convert.
   * @returns {string} Trimmed text or an empty string.
   */
  function toText(value) {
    if (!hasValue$1(value)) {
      return '';
    }

    return String(value).trim();
  }

  /**
   * Escapes text for safe Roll20 chat HTML.
   *
   * @param {*} value The value to escape.
   * @returns {string} Escaped text.
   */
  function escapeHtml(value) {
    return toText(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  /**
   * Normalizes a label for case-insensitive comparisons.
   *
   * @param {*} value The label to normalize.
   * @returns {string} A lowercase comparison key.
   */
  function normalizeKey(value) {
    return toText(value).toLowerCase();
  }

  /**
   * Generates a compact stable-enough Roll20 state identifier.
   *
   * @returns {string} A condition identifier.
   */
  function createId() {
    const randomPart = Math.floor(Math.random() * 0x100000000)
      .toString(36)
      .padStart(7, '0');
    return `ct_${Date.now().toString(36)}_${randomPart}`;
  }

  /**
   * Converts a Roll20 object name into a useful display value.
   *
   * @param {Graphic} token The Roll20 token object.
   * @returns {string} The token name or a fallback label.
   */
  function getTokenName(token) {
    const name = token?.get ? toText(token.get('name')) : '';
    if (name) {
      return name;
    }

    return 'Unnamed Token';
  }

  /**
   * Safely parses JSON and returns a fallback on failure.
   *
   * @param {string} text JSON text.
   * @param {*} fallback The fallback value.
   * @returns {*} Parsed JSON or the fallback.
   */
  function parseJson(text, fallback) {
    try {
      return JSON.parse(text || '');
    } catch (error) {
      log(`Failed to parse JSON: ${error.message}`);
      return fallback;
    }
  }

  /**
   * Returns true when the provided value is an object but not an array.
   *
   * @param {*} value The value to inspect.
   * @returns {boolean} True for plain object-like values.
   */
  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Queries Roll20 objects and always returns an array.
   *
   * @param {object} criteria Roll20 findObjs criteria.
   * @returns {object[]} Matching Roll20 objects.
   */
  function queryObjects(criteria) {
    return findObjs(criteria) || [];
  }

  /**
   * Returns a graphic token by id, or null when missing.
   *
   * @param {*} tokenId Roll20 graphic id.
   * @returns {Graphic|null} Roll20 token object.
   */
  function getGraphicToken(tokenId) {
    return getObj('graphic', toText(tokenId)) || null;
  }

  /**
   * Returns true when a graphic token id resolves to an existing token.
   *
   * @param {*} tokenId Roll20 graphic id.
   * @returns {boolean} True when the token exists.
   */
  function tokenExists(tokenId) {
    return Boolean(getGraphicToken(tokenId));
  }

  /**
   * Returns all Roll20 player objects.
   *
   * @returns {object[]} Roll20 player objects.
   */
  function getPlayers() {
    return queryObjects({ _type: 'player' });
  }

  /**
   * Returns all current GM player ids.
   *
   * @returns {string[]} GM player ids.
   */
  function getGmPlayerIds() {
    const gmIds = [];
    const players = getPlayers();

    for (const player of players) {
      const playerId = toText(player.get('_id'));
      if (playerId && playerIsGM(playerId)) {
        gmIds.push(playerId);
      }
    }

    return gmIds;
  }

  const GLOBAL_CONFIG_KEY = STATE_KEY.toLowerCase();

  /**
   * Creates a fresh default configuration object.
   *
   * @returns {object} Default configuration.
   */
  function createDefaultConfig() {
    return {
      useMarkers: true,
      useIcons: false,
      subjectPromptBypass: false,
      healthBar: VALID_HEALTH_BARS[0],
      language: DEFAULT_LOCALE,
      markers: { ...DEFAULT_MARKERS },
    };
  }

  /**
   * Creates a new runtime bookkeeping object.
   *
   * @returns {object} Runtime bookkeeping state.
   */
  function createRuntimeState() {
    return {
      previousFirstTurnId: '',
      previousTurnSignature: '',
      previousTokenIds: [],
      previousMisplacedConditionIds: [],
    };
  }

  /**
   * Ensures the persistent Roll20 state exists and has required fields.
   *
   * @returns {object} The Condition Tracker state branch.
   */
  function ensureState() {
    const existing = state[STATE_KEY];
    if (
      isRecord(existing) &&
      existing.version === SCRIPT_VERSION &&
      isRecord(existing.config) &&
      Array.isArray(existing.active) &&
      isRecord(existing.runtime)
    ) {
      return existing;
    }

    if (!isRecord(state[STATE_KEY])) {
      state[STATE_KEY] = {};
    }

    const trackerState = state[STATE_KEY];
    trackerState.version = SCRIPT_VERSION;

    if (!isRecord(trackerState.config)) {
      trackerState.config = createDefaultConfig();
    }

    trackerState.config = mergeConfig(trackerState.config);

    if (!Array.isArray(trackerState.active)) {
      trackerState.active = [];
    }

    if (!isRecord(trackerState.runtime)) {
      trackerState.runtime = createRuntimeState();
    }

    return trackerState;
  }

  /**
   * Merges a possibly incomplete config object with defaults.
   *
   * @param {object} config The current config.
   * @returns {object} A complete config.
   */
  function mergeConfig(config) {
    const defaults = createDefaultConfig();
    const nextConfig = isRecord(config) ? config : {};
    const markers = isRecord(nextConfig.markers) ? nextConfig.markers : {};

    return {
      useMarkers:
        typeof nextConfig.useMarkers === 'boolean'
          ? nextConfig.useMarkers
          : defaults.useMarkers,
      useIcons:
        typeof nextConfig.useIcons === 'boolean'
          ? nextConfig.useIcons
          : defaults.useIcons,
      subjectPromptBypass:
        typeof nextConfig.subjectPromptBypass === 'boolean'
          ? nextConfig.subjectPromptBypass
          : defaults.subjectPromptBypass,
      healthBar: VALID_HEALTH_BARS.includes(nextConfig.healthBar)
        ? nextConfig.healthBar
        : defaults.healthBar,
      language: normalizeLocale(nextConfig.language) || defaults.language,
      markers: { ...defaults.markers, ...markers },
    };
  }

  /**
   * Returns the current configuration.
   *
   * @returns {object} The current configuration.
   */
  function getConfig() {
    return ensureState().config;
  }

  /**
   * Replaces the current configuration.
   *
   * @param {object} config The next config.
   * @returns {object} The saved config.
   */
  function setConfig(config) {
    const trackerState = ensureState();
    trackerState.config = mergeConfig(config);
    return trackerState.config;
  }

  /**
   * Imports Roll20 One-Click useroptions into persisted config when available.
   *
   * Supports both the common direct branch format and branches that nest values
   * under a useroptions object.
   *
   * @returns {object} The saved config.
   */
  function applyGlobalConfig() {
    const options = getGlobalConfigOptions();
    if (!options) {
      return getConfig();
    }

    const config = getConfig();
    const nextConfig = { ...config };

    nextConfig.useMarkers = parseBooleanOption(
      options.useMarkers,
      config.useMarkers,
    );
    nextConfig.useIcons = parseBooleanOption(options.useIcons, config.useIcons);
    nextConfig.subjectPromptBypass = parseBooleanOption(
      options.subjectPromptBypass,
      config.subjectPromptBypass,
    );

    if (VALID_HEALTH_BARS.includes(options.healthBar)) {
      nextConfig.healthBar = options.healthBar;
    }

    const language = normalizeLocale(options.language);
    if (language) {
      nextConfig.language = language;
    }

    const nextMarkers = { ...config.markers };
    Object.keys(DEFAULT_MARKERS).forEach((condition) => {
      const markerValue = getMarkerOption(options, condition);
      nextMarkers[condition] = parseMarkerOption(
        markerValue,
        nextMarkers[condition] || DEFAULT_MARKERS[condition],
      );
    });
    nextConfig.markers = nextMarkers;

    return setConfig(nextConfig);
  }

  /**
   * Returns the Condition Tracker One-Click options branch when present.
   *
   * @returns {object|null} One-Click options or null.
   */
  function getGlobalConfigOptions() {
    if (!isRecord(globalconfig)) {
      return null;
    }

    const branch = globalconfig[GLOBAL_CONFIG_KEY] || globalconfig[STATE_KEY];
    if (!isRecord(branch)) {
      return null;
    }

    if (isRecord(branch.useroptions)) {
      return branch.useroptions;
    }

    return branch;
  }

  /**
   * Normalizes Roll20 checkbox-style option values to booleans.
   *
   * @param {*} value Option value.
   * @param {boolean} fallback Value to use when the option is absent/invalid.
   * @returns {boolean} Parsed boolean option.
   */
  function parseBooleanOption(value, fallback) {
    if (typeof value === 'boolean') {
      return value;
    }

    if (value === undefined || value === null) {
      return fallback;
    }

    const normalized = String(value).trim().toLowerCase();
    if (['true', '1', 'checked', 'on', 'yes'].includes(normalized)) {
      return true;
    }

    if (['false', '0', '', 'off', 'no'].includes(normalized)) {
      return false;
    }

    return fallback;
  }

  /**
   * Reads marker overrides from One-Click option keys.
   *
   * Supports several key formats for compatibility with prior local builds.
   *
   * @param {object} options One-Click options object.
   * @param {string} condition Condition/effect name.
   * @returns {*} Raw option value.
   */
  function getMarkerOption(options, condition) {
    if (!isRecord(options)) {
      return undefined;
    }

    const keyVariants = [
      `marker${condition}`,
      `marker.${condition}`,
      `markers.${condition}`,
    ];

    for (const key of keyVariants) {
      if (Object.hasOwn(options, key)) {
        return options[key];
      }
    }

    return undefined;
  }

  /**
   * Normalizes marker option values.
   *
   * @param {*} value Option value.
   * @param {string} fallback Value to use when absent/invalid.
   * @returns {string} Parsed marker name.
   */
  function parseMarkerOption(value, fallback) {
    if (typeof value !== 'string') {
      return fallback;
    }

    const marker = value.trim();
    if (marker) {
      return marker;
    }

    return fallback;
  }

  /**
   * Adds an active condition to persistent state.
   *
   * @param {object} condition The condition record to add.
   * @returns {object} The saved condition record.
   */
  function addActiveCondition(condition) {
    const trackerState = ensureState();
    trackerState.active.push(condition);
    return condition;
  }

  /**
   * Returns the current active condition list.
   *
   * @returns {object[]} Active conditions.
   */
  function getActiveConditions() {
    return ensureState().active;
  }

  /**
   * Returns active conditions matching a predicate.
   *
   * @param {(condition: object) => boolean} predicate Match function.
   * @returns {object[]} Matching active conditions.
   */
  function filterActiveConditions(predicate) {
    return getActiveConditions().filter(predicate);
  }

  /**
   * Returns true when any active condition matches a predicate.
   *
   * @param {(condition: object) => boolean} predicate Match function.
   * @returns {boolean} True when a matching condition exists.
   */
  function someActiveCondition(predicate) {
    return getActiveConditions().some(predicate);
  }

  /**
   * Splits active conditions into kept and matched groups.
   *
   * @param {(condition: object) => boolean} predicate Match function.
   * @returns {{ matched: object[], unmatched: object[] }} Partitioned conditions.
   */
  function partitionActiveConditions(predicate) {
    const matched = [];
    const unmatched = [];

    for (const condition of getActiveConditions()) {
      if (predicate(condition)) {
        matched.push(condition);
      } else {
        unmatched.push(condition);
      }
    }

    return { matched, unmatched };
  }

  /**
   * Finds an active condition by id.
   *
   * @param {string} conditionId The condition id.
   * @returns {object|null} The matching condition or null.
   */
  function findActiveCondition(conditionId) {
    return (
      filterActiveConditions((condition) => condition.id === conditionId)[0] ||
      null
    );
  }

  /**
   * Replaces the active condition list.
   *
   * @param {object[]} active The next active list.
   * @returns {object[]} The saved active list.
   */
  function setActiveConditions(active) {
    const trackerState = ensureState();
    trackerState.active = Array.isArray(active) ? active : [];
    return trackerState.active;
  }

  /**
   * Removes one active condition by id.
   *
   * @param {string} conditionId The condition id to remove.
   * @returns {object|null} The removed condition or null.
   */
  function removeActiveCondition(conditionId) {
    const trackerState = ensureState();
    const remaining = [];
    let removed = null;

    for (const condition of trackerState.active) {
      if (condition.id === conditionId) {
        removed = condition;
      } else {
        remaining.push(condition);
      }
    }

    trackerState.active = remaining;
    return removed;
  }

  /**
   * Returns all active conditions for one target token.
   *
   * @param {string} targetTokenId The target token id.
   * @returns {object[]} Matching active conditions.
   */
  function getActiveByTarget(targetTokenId) {
    return filterActiveConditions(
      (condition) => condition.targetTokenId === targetTokenId,
    );
  }

  /**
   * Updates runtime turn tracker bookkeeping.
   *
   * @param {string} firstTurnId The current first turn id.
   * @param {string} signature The current turn signature.
   * @param {string[]} [tokenIds] Ordered token ids from the current turn order.
   * @param {string[]} [misplacedConditionIds] Condition ids currently misplaced in the turn order.
   * @returns {void}
   */
  function updateTurnRuntime(
    firstTurnId,
    signature,
    tokenIds,
    misplacedConditionIds,
  ) {
    const runtime = ensureState().runtime;
    runtime.previousFirstTurnId = firstTurnId || '';
    runtime.previousTurnSignature = signature || '';
    runtime.previousTokenIds = Array.isArray(tokenIds) ? tokenIds : [];
    runtime.previousMisplacedConditionIds = Array.isArray(misplacedConditionIds)
      ? misplacedConditionIds
      : [];
  }

  const MACRO_DEFINITIONS = [
    { name: MACRO_NAME, body: DEFAULT_MACRO_BODY },
    { name: MACRO_NAME_MULTI_TARGET, body: DEFAULT_MULTI_TARGET_MACRO_BODY },
  ];

  /**
   * Installs or updates all GM-facing macros for all current GMs.
   *
   * @returns {void}
   */
  function installMacro() {
    const gmIds = getGmIds();
    if (!gmIds.length) {
      log(
        `${SCRIPT_NAME} macro install skipped: no GM player id is currently available.`,
      );
      return;
    }

    const gmIdSet = new Set(gmIds);
    let createdCount = 0;
    let updatedCount = 0;
    let removedCount = 0;

    for (const macroDef of MACRO_DEFINITIONS) {
      const macrosByOwner = groupMacrosByOwner(
        queryObjects({ _type: 'macro', name: macroDef.name }),
      );

      for (const gmId of gmIds) {
        const result = syncGmMacro(
          gmId,
          macrosByOwner.get(gmId) || [],
          gmId,
          macroDef,
        );
        createdCount += result.created;
        updatedCount += result.updated;
        removedCount += result.removed;
      }

      removedCount += removeOrphanedMacros(macrosByOwner, gmIdSet);
    }

    logInstallResult(createdCount, updatedCount, removedCount);
  }

  /**
   * Groups existing macros by their owner player id.
   *
   * @param {object[]} macros Roll20 macro objects.
   * @returns {Map<string, object[]>} Macros keyed by owner player id.
   */
  function groupMacrosByOwner(macros) {
    const byOwner = new Map();
    for (const macro of macros) {
      const ownerId = macro.get('playerid') || '';
      if (!byOwner.has(ownerId)) {
        byOwner.set(ownerId, []);
      }
      byOwner.get(ownerId).push(macro);
    }
    return byOwner;
  }

  /**
   * Creates or updates one named macro for a GM, removing any duplicates.
   *
   * @param {string} gmId GM player id.
   * @param {object[]} ownerMacros Existing macros owned by this GM for this definition.
   * @param {string} visibleTo Comma-separated GM ids for visibility.
   * @param {{name: string, body: string}} macroDef Macro name and action body.
   * @returns {{created: number, updated: number, removed: number}} Counts.
   */
  function syncGmMacro(gmId, ownerMacros, visibleTo, macroDef) {
    if (ownerMacros.length === 0) {
      createObj('macro', {
        playerid: gmId,
        name: macroDef.name,
        action: macroDef.body,
        visibleto: visibleTo,
        istokenaction: false,
      });
      return { created: 1, updated: 0, removed: 0 };
    }

    const [primaryMacro, ...duplicates] = ownerMacros;
    primaryMacro.set({
      action: macroDef.body,
      visibleto: visibleTo,
      istokenaction: false,
    });

    for (const duplicate of duplicates) {
      duplicate.remove();
    }

    return { created: 0, updated: 1, removed: duplicates.length };
  }

  /**
   * Removes macros owned by players who are no longer GMs.
   *
   * @param {Map<string, object[]>} macrosByOwner Macros keyed by owner player id.
   * @param {Set<string>} gmIdSet Current GM player ids.
   * @returns {number} Number of macros removed.
   */
  function removeOrphanedMacros(macrosByOwner, gmIdSet) {
    let removed = 0;
    for (const [ownerId, orphans] of macrosByOwner) {
      if (gmIdSet.has(ownerId)) continue;
      for (const orphan of orphans) {
        orphan.remove();
        removed += 1;
      }
    }
    return removed;
  }

  /**
   * Logs the result of a macro install/update pass.
   *
   * @param {number} createdCount Macros created.
   * @param {number} updatedCount Macros updated.
   * @param {number} removedCount Macros removed.
   * @returns {void}
   */
  function logInstallResult(createdCount, updatedCount, removedCount) {
    const cleanupNote =
      removedCount > 0 ? ` Cleaned up ${removedCount} duplicate macro(s).` : '';
    if (createdCount > 0) {
      log(
        `${SCRIPT_NAME}: Macros installed (created ${createdCount}).${cleanupNote}`,
      );
    } else {
      log(
        `${SCRIPT_NAME}: Macros updated (updated ${updatedCount}).${cleanupNote}`,
      );
    }
  }

  /**
   * Returns all current GM player ids.
   *
   * @returns {string[]} GM player ids.
   */
  function getGmIds() {
    return getGmPlayerIds();
  }

  const STYLE = {
    outer:
      "font-family:'Georgia',serif;background-color:#0A0A12;color:#E6DFFF;padding:24px;border-radius:8px;",
    header:
      'background:linear-gradient(135deg,#5B21B6 0%,#FF4D6D 100%);padding:18px 24px;border-radius:6px;margin-bottom:24px;text-align:center;',
    h1: "color:#FFFFFF;margin:0;font-size:1.6em;font-family:'Georgia',serif;letter-spacing:1px;",
    subtitle:
      'color:#E9D5FF;margin:6px 0 0;font-size:0.85em;letter-spacing:0.5px;',
    h2: "color:#FF4D6D;font-family:'Georgia',serif;border-bottom:1px solid #5B21B6;padding-bottom:6px;margin-top:24px;",
    h2first:
      "color:#FF4D6D;font-family:'Georgia',serif;border-bottom:1px solid #5B21B6;padding-bottom:6px;margin-top:0;",
    body: 'color:#B8AFCF;line-height:1.6;margin-top:0;',
    intro: 'color:#B8AFCF;font-size:0.9em;margin-top:0;',
    table:
      'width:100%;border-collapse:collapse;font-size:0.9em;margin-bottom:8px;',
    tableSmall: 'width:100%;border-collapse:collapse;font-size:0.85em;',
    thRow: 'background-color:#1E40AF;',
    th: 'padding:7px 10px;text-align:left;color:#E9D5FF;font-weight:bold;',
    spacer: 'padding:3px;',
    footer:
      'margin-top:28px;padding-top:14px;border-top:1px solid #5B21B6;text-align:center;color:#B8AFCF;font-size:0.8em;',
    footerP: 'margin:0;line-height:1.8;',
    code: 'background-color:#1a1a2e;padding:1px 4px;border-radius:2px;',
  };

  /**
   * Returns the alternating row background color.
   *
   * @param {boolean} even Whether the row is even.
   * @returns {string} Hex color for the row background.
   */
  function row(even) {
    return even ? '#12122a' : '#0e0e22';
  }

  /**
   * Builds inline text direction styles for localized handouts.
   *
   * @param {string} locale Locale code.
   * @returns {string} Inline CSS direction and alignment.
   */
  function getDirectionStyle$1(locale) {
    return isRtlLocale(locale)
      ? 'direction:rtl;text-align:right;'
      : 'direction:ltr;text-align:left;';
  }

  /**
   * Returns the localized table header style.
   *
   * @param {string} locale Locale code.
   * @returns {string} Inline CSS for table headers.
   */
  function getThStyle(locale) {
    return isRtlLocale(locale)
      ? STYLE.th.replace('text-align:left', 'text-align:right')
      : STYLE.th;
  }

  /**
   * Builds a two-column or three-column handout table.
   *
   * @param {string[]} headers Table header labels.
   * @param {string[][]} rows Table rows.
   * @param {string[]} [widths] Optional column widths.
   * @param {string} locale Locale code.
   * @returns {string} Table HTML.
   */
  function buildTable(headers, rows, widths, locale) {
    const thCells = headers
      .map((h, i) => {
        const w = widths?.[i] ? `width:${widths[i]};` : '';
        return `<th style="${getThStyle(locale)}${w}">${h}</th>`;
      })
      .join('');
    const bodyRows = rows
      .map((cells, ri) => {
        const bg = row(ri % 2 === 0);
        const tds = cells
          .map((cell, ci) => {
            const isFirst = ci === 0;
            const style = isFirst
              ? `padding:6px 10px;font-family:monospace;color:#E9D5FF;background-color:${bg};`
              : `padding:6px 10px;color:#B8AFCF;background-color:${bg};`;
            return `<td style="${style}">${cell}</td>`;
          })
          .join('');
        return `<tr>${tds}</tr>`;
      })
      .join('');
    return `<table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}">${thCells}</tr></thead><tbody>${bodyRows}</tbody></table>`;
  }

  /**
   * Builds the standard D&D conditions table.
   *
   * @param {string} colLabel Header label for condition columns.
   * @param {string} locale Locale code.
   * @returns {string} Condition table HTML.
   */
  function buildConditionTable(colLabel, locale) {
    const standardConditions = [
      'Blinded',
      'Charmed',
      'Frightened',
      'Grappled',
      'Incapacitated',
      'Invisible',
      'Paralyzed',
      'Petrified',
      'Poisoned',
      'Prone',
      'Restrained',
      'Stunned',
      'Unconscious',
    ];
    const left = standardConditions.slice(0, 7);
    const right = standardConditions.slice(7);
    const maxRows = Math.max(left.length, right.length);
    const rows = [];
    for (let i = 0; i < maxRows; i++) {
      const l = left[i] ? `${CONDITION_DATA[left[i]].emoji} ${left[i]}` : '';
      const r = right[i] ? `${CONDITION_DATA[right[i]].emoji} ${right[i]}` : '';
      const bg = row(i % 2 === 0);
      rows.push(
        `<tr><td style="padding:7px 10px;color:#E6DFFF;background-color:${bg};">${escapeHtml(l)}</td>` +
          `<td style="padding:7px 10px;color:#E6DFFF;background-color:${bg};">${escapeHtml(r)}</td></tr>`,
      );
    }

    const thStyle = `${getThStyle(locale)}width:50%;`;
    const safeLabel = escapeHtml(colLabel);
    return `<table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}"><th style="${thStyle}">${safeLabel}</th><th style="${thStyle}">${safeLabel}</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }

  /**
   * Builds the default status marker mapping table.
   *
   * @param {string} colCondition Condition column label.
   * @param {string} colMarker Marker column label.
   * @param {string} locale Locale code.
   * @returns {string} Marker table HTML.
   */
  function buildMarkersTable(colCondition, colMarker, locale) {
    const entries = Object.entries(DEFAULT_MARKERS);
    const rows = entries
      .map(([condition, marker], i) => {
        const data = CONDITION_DATA[condition];
        const emoji = data ? data.emoji : '';
        const bg = row(i % 2 === 0);
        return (
          `<tr>` +
          `<td style="padding:6px 10px;color:#E6DFFF;background-color:${bg};">${escapeHtml(emoji)} ${escapeHtml(condition)}</td>` +
          `<td style="padding:6px 10px;font-family:monospace;color:#B8AFCF;background-color:${bg};">${escapeHtml(marker)}</td>` +
          `</tr>`
        );
      })
      .join('');
    return (
      `<table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}">` +
      `<th style="${getThStyle(locale)}width:50%;">${escapeHtml(colCondition)}</th>` +
      `<th style="${getThStyle(locale)}">${escapeHtml(colMarker)}</th>` +
      `</tr></thead><tbody>${rows}</tbody></table>`
    );
  }

  /**
   * Builds the quick-start command table.
   *
   * @param {string} colCommand Command column label.
   * @param {string} colDesc Description column label.
   * @param {string[][]} rows Quick-start rows.
   * @returns {string} Quick-start table HTML.
   */
  function buildQuickStartTable(colCommand, colDesc, rows) {
    const bodyRows = rows
      .map(([cmd, desc], i) => {
        const bg = row(i % 2 === 0);
        return (
          `<tr>` +
          `<td style="padding:7px 10px;background-color:${bg};border-radius:4px;font-family:monospace;color:#E9D5FF;white-space:nowrap;width:45%;">${cmd}</td>` +
          `<td style="padding:7px 10px;color:#B8AFCF;background-color:${bg};">${desc}</td>` +
          `<tr><td colspan="2" style="${STYLE.spacer}"></td></tr>`
        );
      })
      .join('');
    return `<table style="${STYLE.table}"><tbody>${bodyRows}</tbody></table>`;
  }

  /**
   * Builds a Twemoji asset URL for a locale flag.
   *
   * @param {string} flag Unicode regional-indicator flag.
   * @returns {string} SVG asset URL or an empty string.
   */
  function flagAssetUrl$1(flag) {
    const codepoints = Array.from(String(flag || '').trim())
      .map((character) => character.codePointAt(0).toString(16))
      .join('-');
    return codepoints
      ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
      : '';
  }

  /**
   * Builds an accessible flag image label for a locale.
   *
   * @param {object} locale Locale metadata.
   * @returns {string} Trusted locale flag HTML.
   */
  function buildLocaleFlag(locale) {
    const label = escapeHtml(locale.flagLabel || locale.name);
    const url = flagAssetUrl$1(locale.flag);
    if (!url) {
      return '';
    }
    return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
  }

  /**
   * Builds a display label for a locale in the current handout language.
   *
   * @param {object} locale Locale metadata.
   * @param {string} displayLocale Locale to use for the language name.
   * @returns {string} Locale label HTML.
   */
  function buildLocaleLabel(locale, displayLocale) {
    return `${buildLocaleFlag(locale)} ${escapeHtml(locale.code)} — ${escapeHtml(getLocalizedLanguageName(locale.code, displayLocale))}`;
  }

  /**
   * Builds the available translations table.
   *
   * @param {string} locale Locale code for table direction.
   * @returns {string} Locale table HTML.
   */
  function buildLocalesTable(locale) {
    const rows = LOCALE_DEFINITIONS.map((definition) => [
      `<span style="${STYLE.code}">${escapeHtml(definition.code)}</span>`,
      buildLocaleLabel(definition, locale),
    ]);
    return buildTable(
      [
        t('handout.availableLocales.colLocale', locale),
        t('handout.availableLocales.colLanguage', locale),
      ],
      rows,
      ['24%', '76%'],
      locale,
    );
  }

  /**
   * Builds the command reference section.
   *
   * @param {(key: string) => string} hs Handout string lookup.
   * @param {(key: string) => *} hr Handout raw value lookup.
   * @param {string} locale Locale code.
   * @returns {string} Section HTML.
   */
  function buildCommandsReferenceSection(hs, hr, locale) {
    const rows = hr('commandsRef.rows');
    return `<h2 style="${STYLE.h2}">${hs('commandsRef.heading')}</h2>
    ${buildTable([hs('commandsRef.colFlag'), hs('commandsRef.colDesc')], rows, ['42%'], locale)}`;
  }

  /**
   * Builds the custom effect type section.
   *
   * @param {(key: string) => string} hs Handout string lookup.
   * @param {(key: string) => *} hr Handout raw value lookup.
   * @param {string} locale Locale code.
   * @returns {string} Section HTML.
   */
  function buildCustomEffectsSection(hs, hr, locale) {
    const rows = hr('customEffects.rows');
    return `<h2 style="${STYLE.h2}">${hs('customEffects.heading')}</h2>
    ${buildTable([hs('customEffects.colType'), hs('customEffects.colNotes')], rows, ['30%'], locale)}`;
  }

  /**
   * Builds the duration option section.
   *
   * @param {(key: string) => string} hs Handout string lookup.
   * @param {(key: string) => *} hr Handout raw value lookup.
   * @param {string} locale Locale code.
   * @returns {string} Section HTML.
   */
  function buildDurationOptionsSection(hs, hr, locale) {
    const rows = hr('durationOptions.rows');
    return `<h2 style="${STYLE.h2}">${hs('durationOptions.heading')}</h2>
    <p style="${STYLE.intro}">${hs('durationOptions.intro')}</p>
    ${buildTable([hs('durationOptions.colOption'), hs('durationOptions.colBehaviour')], rows, ['40%'], locale)}`;
  }

  /**
   * Builds the configuration section.
   *
   * @param {(key: string) => string} hs Handout string lookup.
   * @param {(key: string) => *} hr Handout raw value lookup.
   * @param {string} locale Locale code.
   * @returns {string} Section HTML.
   */
  function buildConfigurationSection(hs, hr, locale) {
    const rows = hr('configuration.rows');
    const threeCol = rows
      .map(([opt, vals, desc], i) => {
        const bg = row(i % 2 === 0);
        return (
          `<tr>` +
          `<td style="padding:6px 10px;font-family:monospace;color:#E9D5FF;background-color:${bg};">${opt}</td>` +
          `<td style="padding:6px 10px;color:#B8AFCF;background-color:${bg};">${vals}</td>` +
          `<td style="padding:6px 10px;color:#B8AFCF;background-color:${bg};">${desc}</td>` +
          `</tr>`
        );
      })
      .join('');
    return (
      `<h2 style="${STYLE.h2}">${hs('configuration.heading')}</h2>
    <p style="${STYLE.intro}">${hs('configuration.intro')}</p>
    <table style="${STYLE.tableSmall}"><thead><tr style="${STYLE.thRow}">` +
      `<th style="${getThStyle(locale)}width:30%;">${hs('configuration.colOption')}</th>` +
      `<th style="${getThStyle(locale)}width:25%;">${hs('configuration.colValues')}</th>` +
      `<th style="${getThStyle(locale)}">${hs('configuration.colDesc')}</th>` +
      `</tr></thead><tbody>${threeCol}</tbody></table>`
    );
  }

  /**
   * Applies all handout fields that Condition Tracker owns.
   *
   * @param {object} handout Roll20 handout object.
   * @param {string} html Handout notes HTML.
   * @returns {void}
   */
  function updateHandoutObject(handout, html) {
    handout.set({
      name: HANDOUT_NAME,
      inplayerjournals: '',
      controlledby: '',
    });
    handout.set('notes', html);
  }

  /**
   * Generates the full help handout HTML for the given locale.
   *
   * @param {string} [locale] Output locale.
   * @returns {string} HTML string.
   */
  function buildHandoutHtml(locale) {
    const lang = getLocale(locale);
    const version = SCRIPT_VERSION;
    const directionStyle = getDirectionStyle$1(lang);
    /**
     * Looks up a handout string for the active locale.
     *
     * @param {string} key Handout translation key.
     * @returns {string} Translated text.
     */
    const hs = (key) => t(`handout.${key}`, lang);
    /**
     * Looks up raw handout data for the active locale.
     *
     * @param {string} key Handout translation key.
     * @returns {*} Raw translated value.
     */
    const hr = (key) => tRaw(`handout.${key}`, lang);

    const overview = `
    <h2 style="${STYLE.h2first}">${hs('overview.heading')}</h2>
    <p style="${STYLE.body}">${hs('overview.body')}</p>`;

    const quickStart = `
    <h2 style="${STYLE.h2}">${hs('quickStart.heading')}</h2>
    ${buildQuickStartTable(hs('quickStart.colCommand'), hs('quickStart.colDesc'), hr('quickStart.rows'))}`;

    const commandsRef = buildCommandsReferenceSection(hs, hr, lang);

    const standardConds = `
    <h2 style="${STYLE.h2}">${hs('standardConditions.heading')}</h2>
    ${buildConditionTable(hs('standardConditions.colCondition'), lang)}`;

    const customEffects = buildCustomEffectsSection(hs, hr, lang);

    const durationOpts = buildDurationOptionsSection(hs, hr, lang);

    const config = buildConfigurationSection(hs, hr, lang);

    const markers = `
    <h2 style="${STYLE.h2}">${hs('defaultMarkers.heading')}</h2>
    ${buildMarkersTable(hs('defaultMarkers.colCondition'), hs('defaultMarkers.colMarker'), lang)}`;

    const availableLocales = `
    <h2 style="${STYLE.h2}">${hs('availableLocales.heading')}</h2>
    <p style="${STYLE.intro}">${hs('availableLocales.intro')}</p>
    ${buildLocalesTable(lang)}`;

    const footer = `
    <div style="${STYLE.footer}">
      <p style="${STYLE.footerP}">${SCRIPT_NAME} ${version} &nbsp;•&nbsp; ${hs('footerNote')}</p>
    </div>`;

    return `<div style="${STYLE.outer}${directionStyle}">
    <div style="${STYLE.header}">
      <img src="${LOGO_URL_512}" style="max-width:220px;height:auto;margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" alt="${SCRIPT_NAME} logo" title="${SCRIPT_NAME}" />
      <h1 style="${STYLE.h1}">${SCRIPT_NAME}</h1>
      <p style="${STYLE.subtitle}">${hs('versionLabel')} ${version} &nbsp;•&nbsp; ${hs('subtitle')}</p>
    </div>
    ${overview}${quickStart}${commandsRef}${standardConds}${customEffects}${durationOpts}${config}${availableLocales}${markers}${footer}
  </div>`;
  }

  /**
   * Creates the help handout on first run, or updates its notes on every subsequent startup.
   * Duplicate handouts with the same name are removed.
   *
   * @param {string} [locale] Output locale.
   * @returns {void}
   */
  function installHandout(locale) {
    const html = buildHandoutHtml(locale);
    const existing = queryObjects({ _type: 'handout', name: HANDOUT_NAME });

    if (existing.length === 0) {
      const handout = createObj('handout', {
        name: HANDOUT_NAME,
      });
      updateHandoutObject(handout, html);
      log(`${SCRIPT_NAME}: Help handout created.`);
      return;
    }

    const [primary, ...duplicates] = existing;
    updateHandoutObject(primary, html);
    for (const dup of duplicates) {
      dup.remove();
    }

    const cleanupNote =
      duplicates.length > 0
        ? ` Removed ${duplicates.length} duplicate(s).`
        : '';
    log(`${SCRIPT_NAME}: Help handout updated.${cleanupNote}`);
  }

  /**
   * Returns true when a condition is a custom effect type (not a standard D&D condition).
   *
   * @param {string} condition Canonical condition.
   * @returns {boolean}
   */
  function isCustomEffectType(condition) {
    return CUSTOM_EFFECT_TYPE_SET.has(condition);
  }

  /**
   * Returns true when a condition requires free-text details via --other.
   *
   * @param {string} condition Canonical condition.
   * @returns {boolean}
   */
  function isCustomTextCondition(condition) {
    return CUSTOM_TEXT_CONDITIONS.has(condition);
  }

  /**
   * Returns the canonical condition label for user input.
   *
   * @param {string} value The condition label from chat.
   * @returns {string} The canonical label or an empty string.
   */
  function getCanonicalCondition(value) {
    const key = normalizeKey(value);

    for (const type of CUSTOM_EFFECT_TYPE_SET) {
      if (normalizeKey(type) === key) {
        return type;
      }
    }

    for (const condition of STANDARD_CONDITIONS) {
      if (normalizeKey(condition) === key) {
        return condition;
      }
    }

    return '';
  }

  /**
   * Returns the past-tense effect text for a condition in the given locale.
   *
   * @param {string} condition The canonical condition.
   * @param {string} locale Locale string.
   * @returns {string} The past-tense effect text.
   */
  function getLocalizedPast(condition, locale) {
    const localData = getConditionLocalData(condition, locale);
    if (localData?.past) return localData.past;
    const data = CONDITION_DATA[condition];
    return data ? data.past : toText(condition).toLowerCase();
  }

  /**
   * Returns the emoji for a condition, used in Turn Tracker and GM whispers.
   *
   * @param {string} condition Canonical condition.
   * @returns {string} Emoji character.
   */
  function getConditionEmoji(condition) {
    const data = CONDITION_DATA[condition];
    return data ? data.emoji : '✨';
  }

  /**
   * Builds the Turn Tracker display text in the given locale.
   * All values are plain text (no HTML).
   *
   * @param {object} details Display details.
   * @param {string} details.condition Canonical condition.
   * @param {string} details.customText Custom effect text.
   * @param {string} details.sourceName Source token name.
   * @param {string} details.targetName Target token name.
   * @param {boolean} [details.isSelfTarget] Whether source and target are the same token.
   * @param {string} [details.subjectName] Subject name for advantage types.
   * @param {string} [locale] Output locale.
   * @returns {string} Turn Tracker display text.
   */
  function buildDisplayText(details, locale) {
    const emoji = getConditionEmoji(details.condition);

    if (isCustomTextCondition(details.condition)) {
      return t('templates.display.custom', locale, {
        emoji,
        target: details.targetName,
        effect: details.customText,
        source: details.sourceName,
      });
    }

    if (isAdvantageType(details.condition)) {
      const subject = toText(details.subjectName)
        ? ` (${details.subjectName})`
        : '';
      const tplKey =
        details.condition === CONDITION_DISADVANTAGE
          ? 'templates.display.disadvantage'
          : 'templates.display.advantage';
      return t(tplKey, locale, {
        emoji,
        source: details.sourceName,
        target: details.targetName,
        subject,
      });
    }

    const localData = getConditionLocalData(details.condition, locale);
    const data = localData || CONDITION_DATA[details.condition];

    if (data?.noBy) {
      return t('templates.display.noBy', locale, {
        emoji,
        target: details.targetName,
        past: data.past,
        source: details.sourceName,
      });
    }

    if (details.isSelfTarget) {
      return t('templates.display.self', locale, {
        emoji,
        target: details.targetName,
        past: getLocalizedPast(details.condition, locale),
      });
    }

    return t('templates.display.standard', locale, {
      emoji,
      target: details.targetName,
      past: getLocalizedPast(details.condition, locale),
      source: details.sourceName,
    });
  }

  /**
   * Builds the public application announcement in the given locale.
   * HTML-unsafe names are wrapped in pre-built HTML spans by the caller;
   * verb/suffix values are passed pre-escaped.
   *
   * @param {object} details Display details.
   * @param {string} details.condition Canonical condition.
   * @param {string} details.customText Custom effect text.
   * @param {string} details.sourceName Source token name.
   * @param {string} details.targetName Target token name.
   * @param {string} [details.sourceTokenId] Source token id.
   * @param {string} [details.targetTokenId] Target token id.
   * @param {string} [details.subjectName] Subject name.
   * @param {boolean} details.useIcons Whether icons are enabled.
   * @param {string} [locale] Output locale.
   * @returns {string} Public chat text.
   */
  function buildApplyMessage(details, locale) {
    const prefix = buildIconPrefix(details.condition, details.useIcons);
    const src = actorSpan(details.sourceName);
    const tgt = actorSpan(details.targetName);

    if (isCustomTextCondition(details.condition)) {
      return (
        prefix +
        t('templates.apply.custom', locale, {
          source: src,
          effect: effectSpan(details.customText),
          target: tgt,
        })
      );
    }

    if (isAdvantageType(details.condition)) {
      const subject = toText(details.subjectName)
        ? ` (${escapeHtml(details.subjectName)})`
        : '';
      const tplKey =
        details.condition === CONDITION_DISADVANTAGE
          ? 'templates.apply.disadvantage'
          : 'templates.apply.advantage';
      return prefix + t(tplKey, locale, { source: src, target: tgt, subject });
    }

    const localData = getConditionLocalData(details.condition, locale);
    const data = localData || CONDITION_DATA[details.condition];

    if (isSelfTarget(details)) {
      return (
        prefix +
        t('templates.apply.self', locale, {
          target: tgt,
          past: escapeHtml(getLocalizedPast(details.condition, locale)),
        })
      );
    }

    if (data?.suffix) {
      return (
        prefix +
        t('templates.apply.withSuffix', locale, {
          source: src,
          verb: escapeHtml(data.verb),
          target: tgt,
          suffix: escapeHtml(data.suffix),
        })
      );
    }

    return (
      prefix +
      t('templates.apply.standard', locale, {
        source: src,
        verb: escapeHtml(data.verb),
        target: tgt,
      })
    );
  }

  /**
   * Builds the public removal announcement in the given locale.
   *
   * @param {object} condition Active condition record.
   * @param {boolean} useIcons Whether icons are enabled.
   * @param {string} [locale] Output locale.
   * @returns {string} Public chat text.
   */
  function buildRemovalMessage(condition, useIcons, locale) {
    const prefix = buildIconPrefix(condition.condition, useIcons);
    const src = actorSpan(condition.sourceName);
    const tgt = actorSpan(condition.targetName);

    if (isCustomTextCondition(condition.condition)) {
      return (
        prefix +
        t('templates.remove.custom', locale, {
          target: tgt,
          effect: effectSpan(condition.customText),
        })
      );
    }

    if (isAdvantageType(condition.condition)) {
      const subject = toText(condition.subjectName)
        ? ` (${escapeHtml(condition.subjectName)})`
        : '';
      const tplKey =
        condition.condition === CONDITION_DISADVANTAGE
          ? 'templates.remove.disadvantage'
          : 'templates.remove.advantage';
      return prefix + t(tplKey, locale, { source: src, target: tgt, subject });
    }

    const localData = getConditionLocalData(condition.condition, locale);
    const data = localData || CONDITION_DATA[condition.condition];

    if (data?.noBy) {
      return (
        prefix +
        t('templates.remove.noBy', locale, {
          target: tgt,
          past: escapeHtml(data.past),
        })
      );
    }

    if (isSelfTarget(condition)) {
      return (
        prefix +
        t('templates.remove.self', locale, {
          target: tgt,
          past: escapeHtml(getLocalizedPast(condition.condition, locale)),
        })
      );
    }

    return (
      prefix +
      t('templates.remove.standard', locale, {
        target: tgt,
        past: escapeHtml(getLocalizedPast(condition.condition, locale)),
        source: src,
      })
    );
  }

  /**
   * Returns a configured icon prefix when enabled.
   *
   * @param {string} condition The canonical condition.
   * @param {boolean} useIcons Whether icons are enabled.
   * @returns {string} Icon prefix or an empty string.
   */
  function buildIconPrefix(condition, useIcons) {
    if (!useIcons) {
      return '';
    }

    const data = CONDITION_DATA[condition];
    if (!data) {
      return '[*] ';
    }

    return `${data.icon} `;
  }

  /**
   * Returns true for Advantage/Disadvantage conditions.
   *
   * @param {string} condition Canonical condition.
   * @returns {boolean} True for advantage-style effects.
   */
  function isAdvantageType(condition) {
    return (
      condition === CONDITION_ADVANTAGE || condition === CONDITION_DISADVANTAGE
    );
  }

  /**
   * Returns true when a condition source and target are the same token.
   *
   * @param {object} details Display details.
   * @returns {boolean} True for self-targeted condition application.
   */
  function isSelfTarget(details) {
    const sourceTokenId = toText(details.sourceTokenId);
    const targetTokenId = toText(details.targetTokenId);
    return Boolean(
      sourceTokenId && targetTokenId && sourceTokenId === targetTokenId,
    );
  }

  /**
   * Wraps an actor name in a coloured bold span.
   *
   * @param {string} name Actor name.
   * @returns {string} HTML span.
   */
  function actorSpan(name) {
    return `<span style="color:#5B21B6;font-weight:bold">${escapeHtml(name)}</span>`;
  }

  /**
   * Wraps an effect label in a coloured italic span.
   *
   * @param {string} label Effect label.
   * @returns {string} HTML span.
   */
  function effectSpan(label) {
    return `<span style="color:#FF4D6D;font-style:italic">${escapeHtml(label)}</span>`;
  }

  const DEFAULT_WHISPER_TARGET = 'gm';

  const CHAT_CARD_STYLE = [
    'width:100%',
    'border-radius:4px',
    `box-shadow:1px 1px 1px ${COLOR_TEXT_DIM_SILVER}`,
    'text-align:left',
    'vertical-align:middle',
    'margin:0px auto',
    `border:1px solid ${COLOR_BG_SOFT_BLACK}`,
    `color:${COLOR_TEXT_ARCANE_SILVER}`,
    `background-image:-webkit-linear-gradient(-45deg,${COLOR_ACCENT_DARK} 0%,${COLOR_ACCENT_LIGHT} 100%)`,
    'overflow:hidden',
  ].join(';');

  const CHAT_HEADER_STYLE = [
    `background:${COLOR_HEADER_LIGHT}`,
    `color:${COLOR_HEADER_DARK}`,
    'padding:2px 5px',
    `border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}`,
    'font-variant:small-caps',
    'font-weight:bold',
    'text-align:center',
  ].join(';');

  const CHAT_CONTENT_STYLE = 'padding:3px 8px';

  const TABLE_HEADER_STYLE = [
    'text-align:left',
    'padding:2px 4px',
    `border-bottom:1px solid ${COLOR_TEXT_ARCANE_SILVER}`,
  ].join(';');

  const CHAT_BUTTON_STYLE = [
    `background:${COLOR_ACCENT_DARK}`,
    `color:${COLOR_TEXT_WHITE}`,
    'padding:2px 6px',
    'border-radius:4px',
    'text-decoration:none',
  ].join(';');

  const CHAT_HEADER_SCRIPT_READY = 'Script Ready';

  const CHAT_HEADER_WARNING_STYLE = [
    'background:#FEF3C7',
    'color:#92400E',
    'padding:2px 5px',
    'border-bottom:1px solid #92400E',
    'font-variant:small-caps',
    'font-weight:bold',
    'text-align:center',
  ].join(';');

  /**
   * Builds inline text direction styles for the active chat locale.
   *
   * @param {string} locale Locale code.
   * @returns {string} Inline CSS direction and alignment.
   */
  function getDirectionStyle(locale) {
    return isRtlLocale(locale)
      ? 'direction:rtl;text-align:right'
      : 'direction:ltr;text-align:left';
  }

  /**
   * Returns the table header style adjusted for locale direction.
   *
   * @param {string} locale Locale code.
   * @returns {string} Inline CSS for table headers.
   */
  function getTableHeaderStyle(locale) {
    return isRtlLocale(locale)
      ? TABLE_HEADER_STYLE.replace('text-align:left', 'text-align:right')
      : TABLE_HEADER_STYLE;
  }

  const CHAT_HEADER_ERROR_STYLE = [
    'background:#FEE2E2',
    'color:#991B1B',
    'padding:2px 5px',
    'border-bottom:1px solid #991B1B',
    'font-variant:small-caps',
    'font-weight:bold',
    'text-align:center',
  ].join(';');

  /**
   * Marks a string as trusted HTML for controlled chat rendering.
   *
   * @param {string} value Trusted HTML fragment.
   * @returns {object} Trusted HTML wrapper.
   */
  function rawHtml(value) {
    return { __trustedHtml: String(value) };
  }

  /**
   * Sends a public chat message as raw HTML.
   *
   * @param {string} html Trusted HTML message body.
   * @returns {void}
   */
  function announceHtml(html) {
    sendChat(SCRIPT_NAME, html);
  }

  /**
   * Whispers a message to a GM or player.
   *
   * @param {string} playerId Player id.
   * @param {string} title Message title.
   * @param {string|string[]} body Message body lines.
   * @returns {void}
   */
  function whisper(playerId, title, body) {
    whisperWithBox(playerId, body, (lines) => buildBox(title, lines));
  }

  /**
   * Whispers a message to every GM in the game.
   *
   * @param {string} title Message title.
   * @param {string|string[]} body Message body lines.
   * @returns {void}
   */
  function whisperGms(title, body) {
    const gmIds = getGmPlayerIds();
    for (const gmId of gmIds) {
      whisper(gmId, title, body);
    }
  }

  /**
   * Builds a styled chat box.
   *
   * @param {string} title Message title.
   * @param {string[]} lines Message body lines.
   * @returns {string} Chat HTML.
   */
  function buildBox(title, lines) {
    const safeTitle = escapeHtml(title);
    const locale = getConfig().language;
    const headerLabel =
      toText(title) === CHAT_HEADER_SCRIPT_READY ||
      toText(title) === t('ui.title.scriptReady', locale)
        ? `😎 ${safeTitle} 😎`
        : `ℹ️ ${safeTitle}`;
    return buildStyledBox(lines, CHAT_HEADER_STYLE, headerLabel, locale);
  }

  /**
   * Builds a styled warning chat box.
   *
   * @param {string[]} lines Message body lines.
   * @returns {string} Chat HTML.
   */
  function buildWarningBox(lines, locale) {
    return buildStyledBox(
      lines,
      CHAT_HEADER_WARNING_STYLE,
      `⚠️ ${escapeHtml(t('ui.title.warning', locale))}`,
      locale,
    );
  }

  /**
   * Builds a styled error chat box.
   *
   * @param {string[]} lines Message body lines.
   * @returns {string} Chat HTML.
   */
  function buildErrorBox(lines, locale) {
    return buildStyledBox(
      lines,
      CHAT_HEADER_ERROR_STYLE,
      `❌ ${escapeHtml(t('ui.title.error', locale))}`,
      locale,
    );
  }

  /**
   * Whispers a warning message to a GM or player.
   *
   * @param {string} playerId Player id.
   * @param {string|string[]} body Message body lines.
   * @returns {void}
   */
  function whisperWarning(playerId, body) {
    whisperWithBox(playerId, body, (lines, locale) =>
      buildWarningBox(lines, locale),
    );
  }

  /**
   * Whispers an error message to a GM or player.
   *
   * @param {string} playerId Player id.
   * @param {string|string[]} body Message body lines.
   * @returns {void}
   */
  function whisperError(playerId, body) {
    whisperWithBox(playerId, body, (lines, locale) =>
      buildErrorBox(lines, locale),
    );
  }

  /**
   * Builds one of the styled chat card variants.
   *
   * @param {string[]} lines Message body lines.
   * @param {string} headerStyle Header style string.
   * @param {string} headerText Header label.
   * @param {string} locale Locale for text direction.
   * @returns {string} Chat HTML.
   */
  function buildStyledBox(lines, headerStyle, headerText, locale) {
    const body = buildBody(lines);
    const directionStyle = getDirectionStyle(locale);
    const logo = `<div style="text-align:center;padding:6px 0 4px;"><img src="${LOGO_URL_256}" style="height:48px;width:auto;" alt="${SCRIPT_NAME} logo" title="${SCRIPT_NAME}" /></div>`;
    const header = `<div style="${headerStyle}">${headerText}</div>`;
    const content = `<div style="${CHAT_CONTENT_STYLE};${directionStyle}">${body}</div>`;
    return `<div style="${CHAT_CARD_STYLE};${directionStyle}">${logo}${header}${content}</div>`;
  }

  /**
   * Normalizes whisper input, builds a box, and sends it.
   *
   * @param {string} playerId Player id.
   * @param {string|string[]} body Message body lines.
   * @param {(lines: string[], locale: string) => string} boxBuilder Chat box builder.
   * @returns {void}
   */
  function whisperWithBox(playerId, body, boxBuilder) {
    const lines = normalizeBodyLines(body);
    const locale = getConfig().language;
    const html = boxBuilder(lines, locale);
    sendWhisperHtml(playerId, html);
  }

  /**
   * Sends prebuilt whisper HTML to a player or GM target.
   *
   * @param {string} playerId Player id.
   * @param {string} html Prebuilt chat card HTML.
   * @returns {void}
   */
  function sendWhisperHtml(playerId, html) {
    const target = getWhisperTarget(playerId);
    sendChat(SCRIPT_NAME, `/w "${target}" ${html}`);
  }

  /**
   * Normalizes whisper body input to a string array.
   *
   * @param {string|string[]} body Message body lines.
   * @returns {string[]} Body lines array.
   */
  function normalizeBodyLines(body) {
    return Array.isArray(body) ? body : [body];
  }

  /**
   * Builds escaped chat body HTML.
   *
   * @param {string[]} lines Body lines.
   * @returns {string} Body HTML.
   */
  function buildBody(lines) {
    const parts = [];
    for (const line of lines) {
      const content = formatChatLine(line);
      parts.push(`<div>${content}</div>`);
    }

    return parts.join('');
  }

  /**
   * Formats one line for chat body rendering.
   *
   * @param {*} line Chat line value.
   * @returns {string} Escaped or trusted HTML content.
   */
  function formatChatLine(line) {
    if (isTrustedHtmlLine(line)) {
      return getTrustedHtml(line);
    }

    return escapeHtml(line);
  }

  /**
   * Returns true for internally generated chat HTML fragments.
   *
   * @param {*} line Chat line value.
   * @returns {boolean} True when the line is trusted HTML.
   */
  function isTrustedHtmlLine(line) {
    return (
      Boolean(line) && typeof line === 'object' && hasValue(line.__trustedHtml)
    );
  }

  /**
   * Returns the HTML payload from a trusted chat line.
   *
   * @param {*} line Chat line value.
   * @returns {string} Trusted HTML.
   */
  function getTrustedHtml(line) {
    if (line === null || line === undefined) return '';
    if (typeof line === 'object') {
      return hasValue(line.__trustedHtml) ? String(line.__trustedHtml) : '';
    }
    return String(line);
  }

  /**
   * Returns true when a value exists.
   *
   * @param {*} value The value to inspect.
   * @returns {boolean} True when the value is neither undefined nor null.
   */
  function hasValue(value) {
    return value !== undefined && value !== null;
  }

  /**
   * Builds a Roll20 API command button.
   *
   * @param {string} label Button label.
   * @param {string} command Command text.
   * @returns {string} Button HTML.
   */
  function buildButton(label, command) {
    return rawHtml(
      `<a style="${CHAT_BUTTON_STYLE}" href="${escapeHtml(command)}">${escapeHtml(label)}</a>`,
    );
  }

  /**
   * Builds a remove button for an active condition.
   *
   * @param {object} condition Active condition record.
   * @returns {string} Button HTML.
   */
  function buildRemoveButton(condition) {
    return buildButton(
      `Remove: ${condition.displayText}`,
      `${COMMAND} --remove ${condition.id}`,
    );
  }

  /**
   * Creates a compact HTML table for chat output.
   *
   * @param {string[]} headers Column labels.
   * @param {string[][]} rows Table rows with trusted cell HTML.
   * @returns {object} Trusted HTML line.
   */
  function htmlTable(headers, rows) {
    const locale = getConfig().language;
    const tableHeaderStyle = getTableHeaderStyle(locale);
    const directionStyle = getDirectionStyle(locale);
    const headerCells = headers
      .map(
        (header) =>
          `<th style="${tableHeaderStyle}"><strong>${escapeHtml(header)}</strong></th>`,
      )
      .join('');

    const bodyRows = rows
      .map(
        (cells) =>
          `<tr>${cells
            .map(
              (cell) =>
                `<td style="padding:2px 4px;vertical-align:top;${directionStyle}">${getTrustedHtml(cell)}</td>`,
            )
            .join('')}</tr>`,
      )
      .join('');

    return rawHtml(
      `<table style="width:100%;border-collapse:collapse;${directionStyle}"><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`,
    );
  }

  /**
   * Resolves a player whisper target.
   *
   * @param {string} playerId Player id.
   * @returns {string} Display name suitable for /w.
   */
  function getWhisperTarget(playerId) {
    const player = getObj('player', playerId);
    const displayName = player
      ? toText(player.get('_displayname')).replaceAll('"', '')
      : '';
    if (displayName) {
      return displayName;
    }

    return DEFAULT_WHISPER_TARGET;
  }

  /**
   * Parses a duration label into a stored duration object.
   *
   * @param {string} label User-provided duration label.
   * @param {object} context Duration context.
   * @param {string} context.sourceTokenId Source token id.
   * @param {string} context.targetTokenId Target token id.
   * @param {string} context.currentTurnTokenId Current first turn token id.
   * @returns {object} Parse result.
   */
  function parseDuration(label, context) {
    const locale = getConfig().language;
    const text = toText(label) || 'Until removed';
    const key = normalizeKey(text);

    if (key === 'until removed') {
      return validDuration({
        type: DURATION_UNTIL_REMOVED,
        remaining: null,
        anchor: null,
      });
    }

    if (
      key === 'end of target next turn' ||
      key === "end of target's next turn"
    ) {
      return validDuration(
        createTurnEndDuration(
          context.targetTokenId,
          context.currentTurnTokenId,
        ),
      );
    }

    if (
      key === 'end of source next turn' ||
      key === "end of source's next turn"
    ) {
      return validDuration(
        createTurnEndDuration(
          context.sourceTokenId,
          context.currentTurnTokenId,
        ),
      );
    }

    const rounds = parseRoundCount(key);
    if (rounds > 0) {
      return validDuration(
        createRoundDuration(
          rounds,
          context.targetTokenId,
          context.currentTurnTokenId,
        ),
      );
    }

    if (key === 'other') {
      return invalidDuration(t('ui.msg.otherDurationRequiresRounds', locale));
    }

    return invalidDuration(t('ui.msg.invalidDuration', locale));
  }

  /**
   * Creates a turn-end duration.
   *
   * @param {string} anchorTokenId Anchor token id.
   * @param {string} currentTurnTokenId Current first turn token id.
   * @returns {object} Stored duration.
   */
  function createTurnEndDuration(anchorTokenId, currentTurnTokenId) {
    return {
      type: DURATION_TURN_END,
      remaining: anchorTokenId === currentTurnTokenId ? 2 : 1,
      anchor: anchorTokenId,
    };
  }

  /**
   * Creates a round-count duration anchored on the target turn.
   *
   * @param {number} rounds Round count.
   * @param {string} targetTokenId Target token id.
   * @param {string} currentTurnTokenId Current first turn token id.
   * @returns {object} Stored duration.
   */
  function createRoundDuration(rounds, targetTokenId, currentTurnTokenId) {
    const extraCurrentTurn = targetTokenId === currentTurnTokenId ? 1 : 0;
    return {
      type: DURATION_ROUNDS,
      remaining: rounds + extraCurrentTurn,
      anchor: targetTokenId,
    };
  }

  /**
   * Parses a round-count duration key.
   *
   * @param {string} key Normalized duration key.
   * @returns {number} Positive round count or zero.
   */
  function parseRoundCount(key) {
    const match = /^(\d+)\s*(?:round|rounds)?$/.exec(key);
    if (!match) {
      return 0;
    }

    return Number(match[1]);
  }

  /**
   * Decrements a condition duration when its anchor turn ends.
   *
   * @param {object} condition Active condition record.
   * @param {string} endedTurnTokenId Token id whose turn just ended.
   * @returns {boolean} True when the condition expired.
   */
  function decrementDuration(condition, endedTurnTokenId) {
    const duration = condition.duration;
    if (
      !duration ||
      duration.type === DURATION_UNTIL_REMOVED ||
      duration.anchor !== endedTurnTokenId
    ) {
      return false;
    }

    duration.remaining -= 1;
    return duration.remaining <= 0;
  }

  /**
   * Creates a valid duration result.
   *
   * @param {object} duration Stored duration.
   * @returns {object} Valid parse result.
   */
  function validDuration(duration) {
    return { valid: true, duration };
  }

  /**
   * Creates an invalid duration result.
   *
   * @param {string} message Error message.
   * @returns {object} Invalid parse result.
   */
  function invalidDuration(message) {
    return { valid: false, message };
  }

  /**
   * Applies a marker to a token if needed.
   *
   * @param {Graphic} token Target token.
   * @param {string} marker Marker name or tag.
   * @returns {boolean} True when the marker was added.
   */
  function applyMarker(token, marker) {
    const markerText = toText(marker);
    if (!token || !markerText) {
      return false;
    }

    const markers = getTokenMarkers(token);
    if (containsMarker(markers, markerText)) {
      return false;
    }

    markers.push(markerText);
    setTokenMarkers(token, markers);
    return true;
  }

  /**
   * Removes a marker if no remaining active condition needs it.
   *
   * @param {object} condition Condition being removed.
   * @returns {object} Marker removal result.
   */
  function removeMarkerIfUnused(condition) {
    const marker = toText(condition.marker);
    if (!marker) {
      return { removed: false, marker: '' };
    }

    if (isMarkerStillRequired(condition.targetTokenId, marker, condition.id)) {
      return { removed: false, marker };
    }

    const token = getObj('graphic', condition.targetTokenId);
    if (!token) {
      return { removed: false, marker };
    }

    const markers = getTokenMarkers(token);
    const nextMarkers = removeMarkerFromList(markers, marker);
    const removed = nextMarkers.length !== markers.length;
    if (removed) {
      setTokenMarkers(token, nextMarkers);
    }

    return { removed, marker };
  }

  /**
   * Returns true when another active condition still requires a marker.
   *
   * @param {string} targetTokenId Target token id.
   * @param {string} marker Marker name or tag.
   * @param {string} ignoredConditionId Condition id being removed.
   * @returns {boolean} True when the marker is still needed.
   */
  function isMarkerStillRequired(targetTokenId, marker, ignoredConditionId) {
    for (const condition of ensureState().active) {
      const sameTarget = condition.targetTokenId === targetTokenId;
      const sameMarker = condition.marker === marker;
      const differentCondition = condition.id !== ignoredConditionId;
      if (sameTarget && sameMarker && differentCondition) {
        return true;
      }
    }

    return false;
  }

  /**
   * Reads a token status marker list.
   *
   * @param {Graphic} token Token object.
   * @returns {string[]} Marker list.
   */
  function getTokenMarkers(token) {
    const text = toText(token.get('statusmarkers'));
    if (!text) {
      return [];
    }

    const markers = [];
    const parts = text.split(TOKEN_MARKER_SEPARATOR);
    for (const part of parts) {
      const marker = toText(part);
      if (marker) {
        markers.push(marker);
      }
    }

    return markers;
  }

  /**
   * Saves a token status marker list.
   *
   * @param {Graphic} token Token object.
   * @param {string[]} markers Marker list.
   * @returns {void}
   */
  function setTokenMarkers(token, markers) {
    token.set('statusmarkers', markers.join(TOKEN_MARKER_SEPARATOR));
  }

  /**
   * Returns true when a marker item matches a target marker name or tag.
   *
   * Handles badged markers (e.g. "grab@2") by comparing the base name.
   *
   * @param {string} item Marker item from a token's marker list.
   * @param {string} marker Marker name or tag to compare against.
   * @returns {boolean} True when the item matches.
   */
  function matchesMarker(item, marker) {
    return item === marker || getMarkerBase(item) === marker;
  }

  /**
   * Returns true when a marker list already contains a marker.
   *
   * @param {string[]} markers Marker list.
   * @param {string} marker Marker name or tag.
   * @returns {boolean} True when present.
   */
  function containsMarker(markers, marker) {
    for (const item of markers) {
      if (matchesMarker(item, marker)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Removes one marker from a marker list.
   *
   * @param {string[]} markers Marker list.
   * @param {string} marker Marker name or tag.
   * @returns {string[]} Marker list without the marker.
   */
  function removeMarkerFromList(markers, marker) {
    const nextMarkers = [];
    for (const item of markers) {
      if (!matchesMarker(item, marker)) {
        nextMarkers.push(item);
      }
    }

    return nextMarkers;
  }

  /**
   * Returns the marker name without a numeric badge suffix.
   *
   * @param {string} marker Marker text.
   * @returns {string} Marker base.
   */
  function getMarkerBase(marker) {
    return toText(marker).split('@')[0];
  }

  /**
   * Parses an API chat message into command arguments.
   *
   * @param {string} content Raw chat content.
   * @returns {object} Parsed command details.
   */
  function parseCommand(content) {
    const body = toText(content).slice(COMMAND.length).trim();
    const tokens = tokenize(body);
    return collectFlags(tokens);
  }

  /**
   * Splits command text into shell-like tokens.
   *
   * @param {string} text Command text without namespace.
   * @returns {string[]} Token list.
   */
  function tokenize(text) {
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
  function collectFlags(tokens) {
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
  function isQuote(character) {
    return character === '"' || character === "'";
  }

  /**
   * Updates the active quote state.
   *
   * @param {string} activeQuote Current quote character.
   * @param {string} character Current character.
   * @returns {string} Next quote state.
   */
  function updateQuote(activeQuote, character) {
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
  function pushToken(tokens, token) {
    const trimmed = toText(token);
    if (trimmed) {
      tokens.push(trimmed);
    }
  }

  /**
   * Gets the current Campaign turn order as an array.
   *
   * @returns {object[]} Current turn order rows.
   */
  function getTurnOrder() {
    const campaign = Campaign();
    const rows = parseJson(campaign.get('turnorder') || EMPTY_TURN_ORDER, []);
    return Array.isArray(rows) ? rows : [];
  }

  /**
   * Saves the Campaign turn order.
   *
   * @param {object[]} rows Turn order rows.
   * @returns {void}
   */
  function setTurnOrder(rows) {
    Campaign().set('turnorder', JSON.stringify(rows));
  }

  /**
   * Returns the first token id in the current turn order.
   *
   * @returns {string} Current first token id or an empty string.
   */
  function getCurrentTurnTokenId() {
    const rows = getTurnOrder();
    if (rows.length === 0) {
      return '';
    }

    return getTokenRowId(rows[0]);
  }

  /**
   * Returns the pr value for a condition row based on its duration.
   *
   * @param {object|null} duration Stored duration object.
   * @returns {string} Remaining count as a string, or empty for untimed durations.
   */
  function buildTurnOrderPr(duration) {
    if (!duration || duration.type === DURATION_UNTIL_REMOVED) {
      return '';
    }
    return String(duration.remaining);
  }

  /**
   * Creates a custom Turn Tracker row for a condition.
   *
   * @param {object} condition Active condition record.
   * @returns {object} Turn order row.
   */
  function createConditionRow(condition) {
    return {
      id: '-1',
      pr: buildTurnOrderPr(condition.duration),
      custom: condition.displayText,
      _ct: condition.id,
    };
  }

  /**
   * Updates the pr value of an existing condition row after a duration decrement.
   *
   * @param {object} condition Active condition record.
   * @returns {void}
   */
  function updateConditionRow(condition) {
    const rows = getTurnOrder();
    let changed = false;

    for (const row of rows) {
      if (getConditionIdFromRow(row) === condition.id) {
        row.pr = buildTurnOrderPr(condition.duration);
        changed = true;
        break;
      }
    }

    if (changed) {
      setTurnOrder(rows);
    }
  }

  /**
   * Inserts a condition row after the target token and existing target conditions.
   *
   * @param {object} condition Active condition record.
   * @returns {object} Insert result.
   */
  function insertConditionRow(condition) {
    const rows = getTurnOrder();
    const anchorTokenId = getConditionAnchorTokenId(condition);
    const anchorLookup = getConditionAnchorLookup();
    const insertIndex = getInsertIndex(rows, anchorTokenId, anchorLookup);
    const conditionRow = createConditionRow(condition);
    rows.splice(insertIndex.index, 0, conditionRow);
    setTurnOrder(rows);
    return { appended: insertIndex.appended };
  }

  /**
   * Inserts multiple condition rows in a single turn-order read-write cycle.
   *
   * All conditions must already be added to active state before calling this so
   * the anchor lookup is complete. Rows are spliced sequentially so each
   * insertion sees the positions from prior insertions.
   *
   * @param {object[]} conditions Active condition records.
   * @returns {{ appended: boolean }[]} Per-condition insert results in the same order.
   */
  function insertConditionRows(conditions) {
    if (!conditions || conditions.length === 0) {
      return [];
    }

    const rows = getTurnOrder();
    const anchorLookup = getConditionAnchorLookup();
    const results = [];

    for (const condition of conditions) {
      const anchorTokenId = getConditionAnchorTokenId(condition);
      const insertIndex = getInsertIndex(rows, anchorTokenId, anchorLookup);
      rows.splice(insertIndex.index, 0, createConditionRow(condition));
      results.push({ appended: insertIndex.appended });
    }

    setTurnOrder(rows);
    return results;
  }

  /**
   * Returns the token id used to anchor a condition row in Turn Tracker.
   *
   * Advantage and Disadvantage are grouped under the source token so they read
   * with the creature granting or imposing the effect.
   *
   * @param {object} condition Active condition record.
   * @returns {string} Anchor token id.
   */
  function getConditionAnchorTokenId(condition) {
    if (
      condition?.condition === CONDITION_ADVANTAGE ||
      condition?.condition === CONDITION_DISADVANTAGE
    ) {
      return toText(condition.sourceTokenId);
    }

    return toText(condition?.targetTokenId);
  }

  /**
   * Finds the insertion point for a target condition row.
   *
   * @param {object[]} rows Current turn order rows.
   * @param {string} targetTokenId Target token id.
   * @param {Map<string, string>} [anchorLookup] Optional condition-id to anchor-token lookup.
   * @returns {object} Insert index details.
   */
  function getInsertIndex(rows, targetTokenId, anchorLookup) {
    let targetIndex = -1;

    for (let index = 0; index < rows.length; index += 1) {
      if (getTokenRowId(rows[index]) === targetTokenId) {
        targetIndex = index;
        break;
      }
    }

    if (targetIndex < 0) {
      return { index: rows.length, appended: true };
    }

    return {
      index: findAfterExistingTargetConditions(
        rows,
        targetIndex + 1,
        targetTokenId,
        anchorLookup,
      ),
      appended: false,
    };
  }

  /**
   * Finds the first row after existing Condition Tracker rows for a target.
   *
   * @param {object[]} rows Current turn order rows.
   * @param {number} startIndex Initial index after the target token.
   * @param {string} anchorTokenId Target token id.
   * @param {Map<string, string>} [anchorLookup] Optional condition-id to anchor-token lookup.
   * @returns {number} Insert index.
   */
  function findAfterExistingTargetConditions(
    rows,
    startIndex,
    anchorTokenId,
    anchorLookup,
  ) {
    const lookup = anchorLookup || getConditionAnchorLookup();
    let index = startIndex;
    while (
      index < rows.length &&
      isConditionRowForTarget(rows[index], anchorTokenId, lookup)
    ) {
      index += 1;
    }

    return index;
  }

  /**
   * Returns true when a row belongs to a target condition.
   *
   * @param {object} row Turn order row.
   * @param {string} targetTokenId Target token id.
   * @param {Map<string, string>} [anchorLookup] Optional condition-id to anchor-token lookup.
   * @returns {boolean} True for a matching condition row.
   */
  function isConditionRowForTarget(row, targetTokenId, anchorLookup) {
    const conditionId = getConditionIdFromRow(row);
    if (!conditionId) {
      return false;
    }

    const lookup = anchorLookup || getConditionAnchorLookup();
    return lookup.get(conditionId) === targetTokenId;
  }

  /**
   * Removes a token's own turn order row by token id.
   *
   * @param {string} tokenId Roll20 graphic token id.
   * @returns {boolean} True when a row was removed.
   */
  function removeTokenRow(tokenId) {
    const rows = getTurnOrder();
    const remaining = [];
    let removed = false;

    for (const row of rows) {
      if (getTokenRowId(row) === tokenId) {
        removed = true;
      } else {
        remaining.push(row);
      }
    }

    if (removed) {
      setTurnOrder(remaining);
    }

    return removed;
  }

  /**
   * Removes a condition row by condition id.
   *
   * @param {string} conditionId Condition id.
   * @returns {boolean} True when a row was removed.
   */
  function removeConditionRow(conditionId) {
    const rows = getTurnOrder();
    const remaining = [];
    let removed = false;

    for (const row of rows) {
      if (getConditionIdFromRow(row) === conditionId) {
        removed = true;
      } else {
        remaining.push(row);
      }
    }

    if (removed) {
      setTurnOrder(remaining);
    }

    return removed;
  }

  /**
   * Removes one or more condition rows by condition id.
   *
   * Uses a single pass over turn order rows to avoid repeated rescans when
   * cleaning up multiple conditions.
   *
   * @param {Iterable<string>} conditionIds Condition ids to remove.
   * @returns {number} Number of removed rows.
   */
  function removeConditionRows(conditionIds) {
    const ids = new Set();
    for (const id of conditionIds || []) {
      const text = toText(id);
      if (text) {
        ids.add(text);
      }
    }

    if (ids.size === 0) {
      return 0;
    }

    const rows = getTurnOrder();
    const remaining = [];
    let removed = 0;

    for (const row of rows) {
      const conditionId = getConditionIdFromRow(row);
      if (conditionId && ids.has(conditionId)) {
        removed += 1;
      } else {
        remaining.push(row);
      }
    }

    if (removed > 0) {
      setTurnOrder(remaining);
    }

    return removed;
  }

  /**
   * Removes orphaned condition rows without active state records.
   *
   * @returns {number} Number of removed rows.
   */
  function removeOrphanedConditionRows() {
    const rows = getTurnOrder();
    const activeIds = getActiveConditionIds();
    const remaining = [];
    let removed = 0;

    for (const row of rows) {
      const conditionId = getConditionIdFromRow(row);
      if (conditionId && !activeIds[conditionId]) {
        removed += 1;
      } else {
        remaining.push(row);
      }
    }

    if (removed > 0) {
      setTurnOrder(remaining);
    }

    return removed;
  }

  /**
   * Returns true when a condition row currently exists.
   *
   * @param {string} conditionId Condition id.
   * @returns {boolean} True when the row exists.
   */
  function conditionRowExists(conditionId) {
    const rows = getTurnOrder();
    for (const row of rows) {
      if (getConditionIdFromRow(row) === conditionId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Extracts a Condition Tracker id from a row.
   *
   * @param {object} row Turn order row.
   * @returns {string} Condition id or an empty string.
   */
  function getConditionIdFromRow(row) {
    if (row && row._ct) {
      return toText(row._ct);
    }

    // Backward compat: older rows stored the id in the formula field.
    const formula = toText(row && row.formula);
    if (formula.startsWith(TURN_ORDER_PREFIX)) {
      return formula.slice(TURN_ORDER_PREFIX.length);
    }

    return '';
  }

  /**
   * Returns a token id from a normal token turn row.
   *
   * @param {object} row Turn order row.
   * @returns {string} Token id or an empty string.
   */
  function getTokenRowId(row) {
    const id = toText(row && row.id);
    if (!id || id === '-1') {
      return '';
    }

    return id;
  }

  /**
   * Builds a signature for turn-order change detection.
   *
   * @returns {string} Turn signature.
   */
  function getTurnSignature() {
    const rows = getTurnOrder();
    if (rows.length === 0) {
      return '';
    }

    // Track all row fields that can affect condition bookkeeping.
    return rows
      .map((row) =>
        [
          toText(row?.id),
          toText(row?.custom),
          toText(row?.pr),
          toText(row?.formula),
          toText(row?._ct),
        ].join('|'),
      )
      .join('\n');
  }

  /**
   * Rewrites any existing Turn Tracker rows that use the old formula-based
   * identifier to the new _ct field, clearing the formula so Roll20 stops
   * trying to evaluate it as a dice expression.
   *
   * @returns {void}
   */
  function migrateTurnOrderRows() {
    const rows = getTurnOrder();
    let changed = false;

    for (const row of rows) {
      const formula = toText(row.formula);
      if (formula.startsWith(TURN_ORDER_PREFIX)) {
        const conditionId = formula.slice(TURN_ORDER_PREFIX.length);
        if (row._ct !== conditionId) {
          row._ct = conditionId;
        }
        // Roll20 expects formula to be numeric/math; clear legacy metadata values.
        row.formula = '';
        changed = true;
      }
    }

    if (changed) {
      setTurnOrder(rows);
    }
  }

  /**
   * Builds a lookup object of active condition ids.
   *
   * @returns {object} Lookup object.
   */
  function getActiveConditionIds() {
    const lookup = {};
    for (const condition of ensureState().active) {
      lookup[condition.id] = true;
    }

    return lookup;
  }

  /**
   * Returns the ids of all token rows (non-custom rows) in turn order sequence.
   *
   * @returns {string[]} Token ids in current turn order.
   */
  function getTokenRowIds() {
    return getTurnOrder()
      .map((row) => getTokenRowId(row))
      .filter(Boolean);
  }

  /**
   * Returns condition ids whose rows appear after the wrong anchor token.
   *
   * A condition row is misplaced when the most recent token row before it in the
   * tracker is not the condition's anchor token, and the anchor token IS present
   * somewhere in the turn order.
   *
   * @returns {string[]} Misplaced condition ids.
   */
  function findMisplacedConditionIds() {
    const rows = getTurnOrder();
    const anchorLookup = getConditionAnchorLookup();
    const tokenIdSet = new Set(
      rows.map((r) => getTokenRowId(r)).filter(Boolean),
    );
    const misplaced = [];
    let currentTokenId = null;

    for (const row of rows) {
      const tokenId = getTokenRowId(row);
      if (tokenId) {
        currentTokenId = tokenId;
      } else {
        const conditionId = getConditionIdFromRow(row);
        if (conditionId) {
          const expectedAnchor = anchorLookup.get(conditionId);
          if (
            expectedAnchor &&
            tokenIdSet.has(expectedAnchor) &&
            expectedAnchor !== currentTokenId
          ) {
            misplaced.push(conditionId);
          }
        }
      }
    }

    return misplaced;
  }

  /**
   * Strips all condition rows from the turn order and re-inserts them
   * immediately after their anchor tokens in a single read-write cycle.
   *
   * @returns {void}
   */
  function reorderAllConditionRows() {
    const rows = getTurnOrder();
    const anchorLookup = getConditionAnchorLookup();
    const activeConditions = ensureState().active;

    const workingRows = rows.filter((row) => !getConditionIdFromRow(row));

    for (const condition of activeConditions) {
      const anchorTokenId = getConditionAnchorTokenId(condition);
      const insertIndex = getInsertIndex(
        workingRows,
        anchorTokenId,
        anchorLookup,
      );
      workingRows.splice(insertIndex.index, 0, createConditionRow(condition));
    }

    setTurnOrder(workingRows);
  }

  /**
   * Returns a Set of all condition ids that currently have a Turn Tracker row.
   *
   * Builds the Set in a single pass so callers avoid O(n) per-condition scans.
   *
   * @returns {Set<string>} Condition ids with an existing row.
   */
  function getConditionRowIdSet() {
    const ids = new Set();
    for (const row of getTurnOrder()) {
      const id = getConditionIdFromRow(row);
      if (id) ids.add(id);
    }
    return ids;
  }

  /**
   * Builds a condition-id to anchor-token lookup from active state.
   *
   * @returns {Map<string, string>} Condition anchor lookup.
   */
  function getConditionAnchorLookup() {
    const lookup = new Map();
    for (const condition of ensureState().active) {
      lookup.set(condition.id, getConditionAnchorTokenId(condition));
    }

    return lookup;
  }

  /**
   * Removes a condition and emits the requested feedback.
   *
   * @param {string} conditionId Active condition id.
   * @param {object} options Removal options.
   * @param {string} options.playerId GM player id for whispers.
   * @param {string} options.reason Cleanup reason.
   * @param {boolean} options.publicAnnounce Whether to announce publicly.
   * @param {boolean} options.whisperResult Whether to whisper details.
   * @param {string} [options.locale] Primary output locale.
   * @param {string} [options.extraLocale] Additional output locale for bilingual mode.
   * @returns {object} Removal result.
   */
  function removeConditionById(conditionId, options) {
    const condition = removeActiveCondition(conditionId);
    if (!condition) {
      return {
        removed: false,
        message: t('ui.msg.conditionNotFound', getConfig().language),
      };
    }

    const rowRemoved = removeConditionRow(condition.id);
    const markerResult = removeMarkerIfUnused(condition);
    const config = getConfig();
    const locale = options.locale || config.language;

    if (options.publicAnnounce) {
      announceHtml(buildRemovalMessage(condition, config.useIcons, locale));
      if (options.extraLocale && options.extraLocale !== locale) {
        announceHtml(
          buildRemovalMessage(condition, config.useIcons, options.extraLocale),
        );
      }
    }

    if (options.whisperResult) {
      whisperRemoval(
        options.playerId,
        condition,
        rowRemoved,
        markerResult,
        options.reason,
        locale,
      );
    }

    return { removed: true, condition, rowRemoved, markerResult };
  }

  /**
   * Whispers condition removal details to the GM.
   *
   * @param {string} playerId GM player id.
   * @param {object} condition Removed condition.
   * @param {boolean} rowRemoved Whether the turn row was removed.
   * @param {object} markerResult Marker removal result.
   * @param {string} reason Removal reason.
   * @param {string} [locale] Output locale.
   * @returns {void}
   */
  function whisperRemoval(
    playerId,
    condition,
    rowRemoved,
    markerResult,
    reason,
    locale,
  ) {
    const reasonText = reason || t('ui.removal.manualReason', locale);
    let markerSummary = t('ui.removal.notConfigured', locale);
    if (markerResult.marker) {
      markerSummary = markerResult.removed
        ? t('ui.removal.markerRemoved', locale, {
            marker: escapeHtml(markerResult.marker),
          })
        : t('ui.removal.markerRetained', locale, {
            marker: escapeHtml(markerResult.marker),
          });
    }

    whisper(playerId, t('ui.title.removed', locale), [
      htmlTable(
        [t('ui.col.field', locale), t('ui.col.result', locale)],
        [
          [
            t('ui.removal.conditionField', locale),
            escapeHtml(condition.displayText),
          ],
          [t('ui.removal.reasonField', locale), escapeHtml(reasonText)],
          [
            t('ui.removal.turnRowField', locale),
            rowRemoved
              ? t('ui.removal.rowRemoved', locale)
              : t('ui.removal.rowMissing', locale),
          ],
          [t('ui.removal.markerField', locale), markerSummary],
        ],
      ),
    ]);
  }

  /**
   * Returns true when a chat sender is a GM.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {boolean} True for GM senders.
   */
  function isGmMessage(msg) {
    return Boolean(msg && playerIsGM(msg.playerid));
  }

  /**
   * Resolves and validates token-based apply arguments.
   *
   * @param {object} args Parsed command arguments.
   * @returns {object} Validation result.
   */
  function validateApplyArgs(args) {
    const locale = getConfig().language;
    const sourceToken = getGraphicToken(args.source);
    if (!sourceToken) {
      return invalid(t('ui.msg.sourceTokenNotFound', locale));
    }

    const condition = getCanonicalCondition(args.condition);
    if (!condition) {
      return invalid(t('ui.msg.invalidCondition', locale));
    }

    const subjectRaw = toText(args.subject);
    const subjectId = subjectRaw === '__none__' ? '' : subjectRaw;
    if (subjectId && !isCustomEffectType(condition)) {
      return invalid(t('ui.msg.subjectOnlyCustom', locale));
    }

    const subjectToken = subjectId ? getGraphicToken(subjectId) : null;
    if (subjectId && !subjectToken) {
      return invalid(t('ui.msg.subjectTokenNotFound', locale));
    }

    const targetId = toText(args.target);
    const targetToken = getGraphicToken(targetId);
    if (!targetToken) {
      return invalid(t('ui.msg.targetTokenNotFound', locale));
    }

    const customText = toText(args.other);
    if (isCustomTextCondition(condition) && !customText) {
      return invalid(t('ui.msg.customDetailsRequired', locale, { condition }));
    }

    return {
      valid: true,
      sourceToken,
      subjectToken,
      targetToken,
      condition,
      customText: isCustomTextCondition(condition) ? customText : '',
    };
  }

  /**
   * Validates a marker configuration value.
   *
   * @param {string} condition Condition label.
   * @param {string} marker Marker name or tag.
   * @returns {object} Validation result.
   */
  function validateMarkerConfig(condition, marker) {
    const locale = getConfig().language;
    const canonical = getCanonicalCondition(condition);
    if (!canonical || canonical === CONDITION_OTHER) {
      return invalid(t('ui.msg.markerPredefinedRequired', locale));
    }

    if (!toText(marker)) {
      return invalid(t('ui.msg.markerNameRequired', locale));
    }

    return { valid: true, condition: canonical, marker: toText(marker) };
  }

  /**
   * Validates a boolean configuration value.
   *
   * @param {string} value Boolean text.
   * @returns {object} Validation result.
   */
  function validateBoolean(value) {
    const locale = getConfig().language;
    const text = toText(value).toLowerCase();
    if (!BOOLEAN_TEXT.has(text)) {
      return invalid(t('ui.msg.expectedBoolean', locale));
    }

    return { valid: true, value: text === 'true' };
  }

  /**
   * Validates a health bar setting.
   *
   * @param {string} value Health bar property.
   * @returns {object} Validation result.
   */
  function validateHealthBar(value) {
    const locale = getConfig().language;
    const text = toText(value);
    if (!VALID_HEALTH_BARS.includes(text)) {
      return invalid(t('ui.msg.invalidHealthBar', locale));
    }

    return { valid: true, value: text };
  }

  /**
   * Validates a locale string.
   *
   * @param {string} value Locale string.
   * @returns {object} Validation result.
   */
  function validateLocale(value) {
    const locale = getConfig().language;
    const text = normalizeLocale(value);
    if (!text) {
      return invalid(
        t('ui.msg.invalidLocale', locale, {
          locales: SUPPORTED_LOCALE_LIST,
        }),
      );
    }
    return { valid: true, value: text };
  }

  /**
   * Creates an invalid validation result.
   *
   * @param {string} message Error message.
   * @returns {object} Invalid result.
   */
  function invalid(message) {
    return { valid: false, message };
  }

  /**
   * Performs manual cleanup and reconciliation.
   *
   * @param {string} playerId GM player id.
   * @returns {object} Cleanup summary.
   */
  function runCleanup(playerId) {
    const turnOrderRows = getTurnOrder();
    const tokenRowIds = buildTokenRowIdSet(turnOrderRows);
    const combatActive = tokenRowIds.size > 0;

    const kept = [];
    const removedConditions = [];
    let orphanedEntries = 0;
    let staleEntries = 0;
    let missingRows = 0;

    for (const condition of getActiveConditions()) {
      const sourceExists = tokenExists(condition.sourceTokenId);
      const targetExists = tokenExists(condition.targetTokenId);
      const rowExists = conditionRowExists(condition.id);
      const targetInTurnOrder =
        !combatActive || tokenRowIds.has(condition.targetTokenId);

      if (sourceExists && targetExists && rowExists && targetInTurnOrder) {
        kept.push(condition);
      } else {
        removedConditions.push(condition);
        if (!sourceExists || !targetExists) {
          orphanedEntries += 1;
        } else if (!targetInTurnOrder) {
          staleEntries += 1;
        }
        if (!rowExists) {
          missingRows += 1;
        }
      }
    }

    removeConditionRows(removedConditions.map((c) => c.id));
    setActiveConditions(kept);
    const unusedMarkers = removeUnusedMarkers(removedConditions);
    const orphanedRows = removeOrphanedConditionRows();
    const locale = getConfig().language;
    whisperCleanupSummary(
      playerId,
      orphanedEntries,
      staleEntries,
      orphanedRows + missingRows,
      unusedMarkers,
      locale,
    );

    return {
      orphanedEntries,
      staleEntries,
      orphanedRows: orphanedRows + missingRows,
      unusedMarkers,
    };
  }

  /**
   * Removes markers for conditions after state has been reconciled.
   *
   * @param {object[]} conditions Removed condition records.
   * @returns {number} Number of removed markers.
   */
  function removeUnusedMarkers(conditions) {
    let removed = 0;
    for (const condition of conditions) {
      const markerResult = removeMarkerIfUnused(condition);
      if (markerResult.removed) {
        removed += 1;
      }
    }

    return removed;
  }

  /**
   * Builds a Set of token ids present as real token rows in the turn order.
   *
   * @param {object[]} rows Turn order rows.
   * @returns {Set<string>} Token ids.
   */
  function buildTokenRowIdSet(rows) {
    const ids = new Set();
    for (const row of rows) {
      const id = getTokenRowId(row);
      if (id) ids.add(id);
    }
    return ids;
  }

  /**
   * Whispers cleanup details to the GM.
   *
   * @param {string} playerId GM player id.
   * @param {number} orphanedEntries Removed state entries for deleted tokens.
   * @param {number} staleEntries Removed state entries for tokens no longer in the turn order.
   * @param {number} orphanedRows Removed or missing Turn Tracker rows.
   * @param {number} unusedMarkers Removed markers.
   * @param {string} [locale] Output locale.
   * @returns {void}
   */
  function whisperCleanupSummary(
    playerId,
    orphanedEntries,
    staleEntries,
    orphanedRows,
    unusedMarkers,
    locale,
  ) {
    whisper(playerId, t('ui.title.cleanup', locale), [
      rawHtml(`<strong>${t('ui.heading.summary', locale)}</strong>`),
      htmlTable(
        [t('ui.col.item', locale), t('ui.col.removed', locale)],
        [
          [t('ui.cleanup.orphaned', locale), String(orphanedEntries)],
          [t('ui.cleanup.stale', locale), String(staleEntries)],
          [t('ui.cleanup.orphanedRows', locale), String(orphanedRows)],
          [t('ui.cleanup.unusedMarkers', locale), String(unusedMarkers)],
        ],
      ),
    ]);
  }

  const SUBJECT_NONE = '__none__';

  const SECTION_HEADING_STYLE = [
    `background:${COLOR_HEADER_LIGHT}`,
    `color:${COLOR_HEADER_DARK}`,
    `border-left:4px solid ${COLOR_BG_SOFT_BLACK}`,
    `border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}`,
    `box-shadow:inset 0 -1px 0 ${COLOR_BG_SOFT_BLACK}`,
    `text-transform:uppercase`,
    `letter-spacing:0.06em`,
    `font-size:11px`,
    `font-weight:bold`,
    `padding:3px 6px`,
    `margin:2px 0`,
  ].join(';');

  /**
   * Builds an in-card section heading distinct from the message header.
   *
   * @param {string} text Heading text.
   * @returns {object} Trusted HTML line.
   */
  function heading(text) {
    return rawHtml(
      `<div style="${SECTION_HEADING_STYLE}">${escapeHtml(text)}</div>`,
    );
  }

  /**
   * Wraps a value in chat-safe code tags.
   *
   * @param {string} text Text to render as code.
   * @returns {string} HTML fragment.
   */
  function code(text) {
    return `<code>${escapeHtml(text)}</code>`;
  }

  /**
   * Decodes simple HTML entities used in localized handout source text before chat escaping.
   *
   * @param {*} value Localized value.
   * @returns {string} Text ready for the chat escaping pipeline.
   */
  function decodeHelpText(value) {
    return toText(value)
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&');
  }

  /**
   * Builds a Twemoji asset URL for a locale flag.
   *
   * @param {string} flag Unicode regional-indicator flag.
   * @returns {string} SVG asset URL or an empty string.
   */
  function flagAssetUrl(flag) {
    const codepoints = Array.from(toText(flag))
      .map((character) => character.codePointAt(0).toString(16))
      .join('-');
    return codepoints
      ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
      : '';
  }

  /**
   * Builds an accessible flag image label for chat output.
   *
   * @param {object} locale Locale metadata.
   * @returns {string} Trusted HTML flag fragment.
   */
  function localeFlag(locale) {
    const label = escapeHtml(locale.flagLabel || locale.name);
    const url = flagAssetUrl(locale.flag);
    if (!url) {
      return '';
    }
    return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
  }

  /**
   * Builds the readable language label for a locale in the active configured language.
   *
   * @param {object} locale Locale metadata.
   * @returns {string} Trusted HTML locale label.
   */
  function localeLabel(locale) {
    const displayLocale = getConfig().language;
    return `${localeFlag(locale)} ${escapeHtml(getLocalizedLanguageName(locale.code, displayLocale))}`;
  }

  /**
   * Builds a readable locale name for confirmation messages without flag imagery.
   *
   * @param {string} localeCode Locale code.
   * @returns {string} Human-readable locale label.
   */
  function localeDisplayName(localeCode) {
    const locale = LOCALE_DEFINITIONS.find(
      (definition) => definition.code === localeCode,
    );
    if (!locale) {
      return localeCode;
    }

    const nativeName =
      locale.nativeName && locale.nativeName !== locale.name
        ? ` (${locale.nativeName})`
        : '';
    return `${locale.name}${nativeName} [${locale.code}]`;
  }

  /**
   * Builds a localized intro for invalid locale warnings.
   *
   * @param {string} locale Active locale.
   * @returns {string} Intro text ending before the locale table.
   */
  function invalidLocaleIntro(locale) {
    return t('ui.msg.invalidLocale', locale, { locales: '' })
      .replace(/\s*:?\s*\.?$/, ':')
      .trim();
  }

  /**
   * Builds rows for the supported-locale help table.
   *
   * @returns {string[][]} Trusted HTML table rows.
   */
  function localeTableRows() {
    return LOCALE_DEFINITIONS.map((locale) => [
      code(locale.code),
      localeLabel(locale),
    ]);
  }

  /**
   * Builds a token choice button for the requested wizard slot.
   *
   * @param {object} token Token entry.
   * @param {object} args Current wizard args.
   * @param {"source"|"target"|"subject"} slot Which slot to fill.
   * @returns {object} Trusted HTML button.
   */
  function buildTokenChoiceButton(token, args, slot) {
    return buildButton(
      token.name,
      buildWizardBase({ ...args, [slot]: token.id }),
    );
  }

  /**
   * Builds the command URL for a duration choice.
   *
   * @param {object} args Current wizard args.
   * @param {string} duration Canonical duration label.
   * @returns {string} Roll20 API command.
   */
  function buildDurationCommand(args, duration) {
    const sourceId = toText(args.source);
    const targetId = toText(args.target);
    const targetsRaw = toText(args.targets);
    const condition = getCanonicalCondition(toText(args.condition));
    const langRaw = toText(args.lang);
    const parts = [
      `--source ${sourceId}`,
      targetsRaw ? `--targets ${targetsRaw}` : `--target ${targetId}`,
      `--condition ${condition}`,
      `--duration ${duration}`,
    ];
    if (langRaw) parts.push(`--lang ${langRaw}`);
    return buildCommand(parts);
  }

  /**
   * Converts localized handout rows into escaped chat table rows.
   *
   * @param {string[][]} rows Raw localized rows.
   * @returns {string[][]} Escaped HTML rows.
   */
  function toEscapedHandoutTableRows(rows) {
    return rows.map(([a, b]) => [
      code(decodeHelpText(a)),
      escapeHtml(decodeHelpText(b)),
    ]);
  }

  /**
   * Adds light spacing between structured sections.
   *
   * @returns {object} Trusted HTML spacer.
   */
  function sectionSpacer() {
    return rawHtml('<br><br>');
  }

  /**
   * Returns true when a character's sheet-level npc attribute marks it as a PC.
   *
   * Works for sheets that expose an "npc" attribute (e.g. D&D 5e OGL).
   * Returns undefined when the attribute is absent so callers can fall back.
   * Uses findObjs instead of getAttrByName to avoid Roll20 console errors when
   * the attribute does not exist on the character sheet.
   *
   * @param {string} characterId Roll20 character id.
   * @returns {boolean|undefined} True for PC, false for NPC, undefined if unknown.
   */
  function isPlayerByNpcAttribute(characterId) {
    const attrs = queryObjects({
      _type: 'attribute',
      _characterid: characterId,
      name: 'npc',
    });
    if (attrs.length === 0) return undefined;
    return attrs[0].get('current') !== '1';
  }

  /**
   * Returns true when a character's controlledby field includes at least one
   * non-GM player.
   *
   * @param {object} character Roll20 character object.
   * @returns {boolean} True for player-controlled characters.
   */
  function isPlayerByControlledBy(character) {
    const controlledBy = toText(character.get('controlledby'));
    if (!controlledBy) return false;
    // "all" is a Roll20 sentinel meaning every player can see the sheet —
    // it does not indicate a player character, so exclude it.
    return controlledBy
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id && id !== 'all')
      .some((id) => !playerIsGM(id));
  }

  /**
   * Returns true when a token is directly controlled by at least one non-GM player
   * via its token-level controlledby field.
   *
   * @param {object} token Roll20 graphic object.
   * @returns {boolean} True when a non-GM player controls the token directly.
   */
  function isPlayerByTokenControlledBy(token) {
    const controlledBy = toText(token.get('controlledby'));
    if (!controlledBy) return false;
    return controlledBy
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id && id !== 'all')
      .some((id) => !playerIsGM(id));
  }

  /**
   * Returns true when a token is linked to a player character.
   *
   * Checks token-level controlledby first (catches player-owned NPC stat blocks
   * such as an Echo Knight's echo). Then falls back to sheet npc attribute and
   * the character-level controlledby field.
   *
   * @param {object} token Roll20 graphic object.
   * @returns {boolean} True for player tokens.
   */
  function isPlayerToken(token) {
    if (isPlayerByTokenControlledBy(token)) return true;
    const characterId = toText(token.get('represents'));
    if (!characterId) return false;
    const character = getObj('character', characterId);
    if (!character) return false;
    const byAttr = isPlayerByNpcAttribute(characterId);
    if (byAttr !== undefined) return byAttr;
    return isPlayerByControlledBy(character);
  }

  /**
   * Returns the display name for a token: the token's own name field, falling
   * back to the linked character's name when the token field is blank.
   *
   * @param {object} token Roll20 graphic object.
   * @returns {string} Display name, or empty string if none found.
   */
  function getTokenDisplayName(token) {
    const tokenName = toText(token.get('name'));
    if (tokenName) return tokenName;
    const characterId = toText(token.get('represents'));
    if (!characterId) return '';
    const character = getObj('character', characterId);
    return character ? toText(character.get('name')) : '';
  }

  /**
   * Returns true when a token's configured HP bar is explicitly set to zero or
   * below. Tokens with no value on the bar (empty string) are not considered
   * dead and return false.
   *
   * @param {object} token Roll20 graphic object.
   * @returns {boolean} True when the token has zero or negative HP.
   */
  function hasZeroHp(token) {
    const bar = getConfig().healthBar;
    const raw = token.get(bar);
    if (raw === '' || raw === null || raw === undefined) return false;
    const value = Number(raw);
    return Number.isFinite(value) && value <= 0;
  }

  /**
   * Converts one Roll20 graphic token into a token entry, or null when the
   * token has no resolvable name or has zero HP.
   *
   * @param {object} token Roll20 graphic object.
   * @returns {{id: string, name: string, isPlayer: boolean}|null} Token entry.
   */
  function tokenToEntry(token) {
    if (hasZeroHp(token)) return null;
    const name = getTokenDisplayName(token);
    if (!name) return null;
    return { id: token.id, name, isPlayer: isPlayerToken(token) };
  }

  /**
   * Returns token entries sourced from the current turn order.
   *
   * Custom text rows (id "-1") are ignored. Tokens that no longer exist or
   * have no resolvable name are skipped. Each token id appears at most once.
   *
   * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
   */
  function getTokensFromTurnOrder() {
    const seen = new Set();
    const entries = [];
    for (const row of getTurnOrder()) {
      const tokenId = getTokenRowId(row);
      if (!tokenId || seen.has(tokenId)) continue;
      seen.add(tokenId);
      const token = getGraphicToken(tokenId);
      if (!token) continue;
      const entry = tokenToEntry(token);
      if (entry) entries.push(entry);
    }
    return entries;
  }

  /**
   * Returns token entries sourced from the active player page.
   *
   * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
   */
  function getTokensFromPage() {
    const pageId = Campaign().get('playerpageid');
    return queryObjects({ _type: 'graphic', _pageid: pageId })
      .map(tokenToEntry)
      .filter(Boolean);
  }

  /**
   * Returns named combat tokens sorted alphabetically.
   *
   * Uses turn order token IDs when initiative is running — this works regardless
   * of which page the GM is viewing and naturally excludes custom text rows
   * (e.g. "Round 1"). Falls back to the active player page when the turn order
   * contains no real token entries (pre-combat).
   *
   * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
   */
  function getPageTokens() {
    const fromTurnOrder = getTokensFromTurnOrder();
    const entries =
      fromTurnOrder.length > 0 ? fromTurnOrder : getTokensFromPage();
    return entries.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Builds a partial wizard command string carrying all resolved args forward.
   *
   * Only includes args that have valid, non-empty values. Condition is
   * canonicalized and dropped if unrecognized.
   *
   * @param {object} args Current parsed command arguments.
   * @returns {string} Command prefix for wizard step buttons.
   */
  function buildWizardBase(args) {
    const parts = ['--prompt'];
    const sourceId = toText(args.source);
    const subjectRaw = toText(args.subject);
    const subjectId = subjectRaw === SUBJECT_NONE ? '' : subjectRaw;
    const targetId = toText(args.target);
    const targetsRaw = toText(args.targets);
    const selectedIdsRaw = toText(args['selected-ids']);
    const conditionRaw = toText(args.condition);
    const canonical = conditionRaw ? getCanonicalCondition(conditionRaw) : '';
    const durationRaw = toText(args.duration);
    const langRaw = toText(args.lang);

    if (sourceId) parts.push(`--source ${sourceId}`);
    if (subjectRaw === SUBJECT_NONE) parts.push(`--subject ${SUBJECT_NONE}`);
    else if (subjectId) parts.push(`--subject ${subjectId}`);
    if (targetId) parts.push(`--target ${targetId}`);
    if (targetsRaw) parts.push(`--targets ${targetsRaw}`);
    else if (selectedIdsRaw) parts.push(`--selected-ids ${selectedIdsRaw}`);
    if (canonical) parts.push(`--condition ${canonical}`);
    if (durationRaw) parts.push(`--duration ${durationRaw}`);
    if (langRaw) parts.push(`--lang ${langRaw}`);
    return buildCommand(parts);
  }

  /**
   * Builds a Roll20 command string with the script command prefix.
   *
   * @param {string[]} parts Command parts excluding the base command.
   * @returns {string} Joined command string.
   */
  function buildCommand(parts) {
    return [COMMAND, ...parts].join(' ');
  }

  /**
   * Builds a Roll20 duration query string with an optional leading default.
   *
   * Custom values not in the standard list are prepended so they appear first.
   *
   * @param {string} defaultDuration Duration label to pre-select, or empty.
   * @returns {string} Roll20 `?{...}` query string.
   */
  function buildDurationQuery(defaultDuration) {
    const text = toText(defaultDuration);
    if (text) {
      const rest = DURATION_OPTIONS.filter((o) => o !== text);
      const options = DURATION_OPTIONS.includes(text)
        ? [text, ...rest]
        : [text, ...DURATION_OPTIONS];
      return `?{Duration|${options.join('|')}}`;
    }
    return `?{Duration|${DURATION_OPTIONS.join('|')}}`;
  }

  /**
   * Builds table rows for two uneven button columns.
   *
   * @param {string[]} leftButtons Left column button HTML.
   * @param {string[]} rightButtons Right column button HTML.
   * @returns {string[][]} Table rows with blank-cell padding.
   */
  function buildTwoColumnRows(leftButtons, rightButtons) {
    const maxRows = Math.max(leftButtons.length, rightButtons.length);
    const tableRows = [];

    for (let i = 0; i < maxRows; i += 1) {
      tableRows.push([
        i < leftButtons.length ? leftButtons[i] : '',
        i < rightButtons.length ? rightButtons[i] : '',
      ]);
    }

    return tableRows;
  }

  /**
   * Whispers named token buttons for one wizard slot in a two-column layout.
   *
   * Player-controlled tokens appear in the left column and NPCs in the right.
   * An optional description is shown above the table to explain the role.
   *
   * @param {string} playerId GM player id.
   * @param {string} title Step heading.
   * @param {object} args Current wizard args.
   * @param {"source"|"target"|"subject"} slot Which slot to fill.
   * @param {string} [description] Optional context shown above the token list.
   * @returns {void}
   */
  function showTokenStep(playerId, title, args, slot, description) {
    const locale = getConfig().language;
    const tokens = getPageTokens();
    if (tokens.length === 0) {
      whisper(playerId, title, t('ui.wizard.noTokens', locale));
      return;
    }

    const playerButtons = tokens
      .filter((tok) => tok.isPlayer)
      .map((tok) => buildTokenChoiceButton(tok, args, slot));
    const npcButtons = tokens
      .filter((tok) => !tok.isPlayer)
      .map((tok) => buildTokenChoiceButton(tok, args, slot));
    const tableRows = buildTwoColumnRows(playerButtons, npcButtons);

    const body = [];
    if (description) {
      body.push(
        rawHtml(
          `<div style="font-style:italic;margin:2px 0 4px;">${escapeHtml(description)}</div>`,
        ),
      );
    }
    if (slot === 'subject') {
      body.push(
        buildButton(
          t('ui.wizard.noneBtn', locale),
          buildWizardBase({ ...args, subject: SUBJECT_NONE }),
        ),
      );
    }
    if (slot === 'target') {
      const sourceId = toText(args.source);
      if (sourceId) {
        body.push(
          buildButton(
            t('ui.wizard.noneOrSourceBtn', locale),
            buildWizardBase({ ...args, target: sourceId }),
          ),
        );
      }
    }
    body.push(
      htmlTable(
        [t('ui.col.players', locale), t('ui.col.npcs', locale)],
        tableRows,
      ),
    );
    whisper(playerId, title, body);
  }

  /**
   * Whispers a confirmation card listing the pre-selected tokens with a single
   * "Confirm target list" button that advances the wizard to the duration step.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Current wizard args.
   * @returns {void}
   */
  function showMultiTargetStep(playerId, args) {
    const locale = getConfig().language;
    const selectedIdsRaw = toText(args['selected-ids']);
    const ids = selectedIdsRaw.split(',').filter(Boolean);

    const resolved = ids
      .map((id) => {
        const token = getGraphicToken(id);
        if (!token) return null;
        const name = getTokenDisplayName(token);
        return name ? { id, name } : null;
      })
      .filter(Boolean);

    if (resolved.length === 0) {
      whisperWarning(playerId, t('ui.msg.reSelectTokens', locale));
      return;
    }

    const confirmedIds = resolved.map((tok) => tok.id).join(',');
    const confirmCmd = buildWizardBase({
      ...args,
      targets: confirmedIds,
      'selected-ids': '',
    });
    const tokenListHtml = resolved
      .map(
        (tok) => `<div style="padding:1px 0;">• ${escapeHtml(tok.name)}</div>`,
      )
      .join('');

    whisper(playerId, t('ui.wizard.confirmTargetTitle', locale), [
      rawHtml(
        `<div style="margin-bottom:4px;font-style:italic;">${escapeHtml(t('ui.wizard.confirmIntro', locale))}</div>`,
      ),
      rawHtml(tokenListHtml),
      buildButton(t('ui.wizard.confirmBtn', locale), confirmCmd),
    ]);
  }

  /**
   * Whispers condition selection buttons in a two-column layout.
   *
   * Left column: standard D&D conditions. Right column: custom effect types.
   * All buttons advance the wizard to the target/subject step.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Current wizard args.
   * @returns {void}
   */
  function showConditionStep(playerId, args) {
    const locale = getConfig().language;
    const base = buildWizardBase(args);

    const standardButtons = STANDARD_CONDITIONS.map((c) =>
      buildButton(t(`condNames.${c}`, locale), `${base} --condition ${c}`),
    );

    const customButtons = CUSTOM_EFFECT_TYPES.map((c) =>
      buildButton(t(`condNames.${c}`, locale), `${base} --condition ${c}`),
    );

    const tableRows = buildTwoColumnRows(standardButtons, customButtons);

    whisper(playerId, t('ui.wizard.selectCondition', locale), [
      htmlTable(
        [t('ui.col.conditions', locale), t('ui.col.customEffects', locale)],
        tableRows,
      ),
    ]);
  }

  /**
   * Whispers duration buttons in a two-column table layout.
   *
   * Left column: permanent and turn-end options.
   * Right column: fixed round counts plus a custom-round entry.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Current wizard args.
   * @returns {void}
   */
  function showDurationStep(playerId, args) {
    const locale = getConfig().language;

    // English canonical values used in command URLs; localized labels shown on buttons
    const leftOptions = [
      { dur: 'Until removed', label: t('ui.dur.untilRemoved', locale) },
      {
        dur: 'End of target next turn',
        label: t('ui.dur.endOfTargetTurn', locale),
      },
      {
        dur: 'End of source next turn',
        label: t('ui.dur.endOfSourceTurn', locale),
      },
    ];
    const rightOptions = [
      { dur: '1 round', label: t('ui.dur.round1', locale) },
      { dur: '2 rounds', label: t('ui.dur.round2', locale) },
      { dur: '3 rounds', label: t('ui.dur.round3', locale) },
      { dur: '10 rounds', label: t('ui.dur.round10', locale) },
    ];
    const customPrompt = t('ui.dur.customPrompt', locale);
    const customCmd = buildDurationCommand(args, `?{${customPrompt}|} rounds`);

    const leftButtons = leftOptions.map(({ dur, label }) =>
      buildButton(label, buildDurationCommand(args, dur)),
    );
    const rightButtons = [
      ...rightOptions.map(({ dur, label }) =>
        buildButton(label, buildDurationCommand(args, dur)),
      ),
      buildButton(t('ui.dur.custom', locale), customCmd),
    ];

    const tableRows = buildTwoColumnRows(leftButtons, rightButtons);

    whisper(playerId, t('ui.wizard.selectDuration', locale), [
      htmlTable(
        [t('ui.col.permanentTurnEnd', locale), t('ui.col.rounds', locale)],
        tableRows,
      ),
    ]);
  }

  /**
   * Whispers a button with native query dialogs for effect text and duration.
   *
   * Used for Spell, Ability, and Other when description or duration is missing
   * and cannot be collected through the wizard button flow.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Current wizard args.
   * @param {string} condition Canonical condition (Spell, Ability, or Other).
   * @returns {void}
   */
  function showCustomTextStep(playerId, args, condition) {
    const locale = getConfig().language;
    const sourceId = toText(args.source);
    const targetId = toText(args.target);
    const targetsRaw = toText(args.targets);
    const langRaw = toText(args.lang);
    const durationQuery = buildDurationQuery(toText(args.duration));
    const prompt =
      condition === 'Other'
        ? t('ui.wizard.otherText', locale)
        : t('ui.wizard.effectDetails', locale, { condition });
    const parts = [
      `--source ${sourceId}`,
      targetsRaw ? `--targets ${targetsRaw}` : `--target ${targetId}`,
      `--condition ${condition}`,
      `--other ?{${prompt}|}`,
      `--duration ${durationQuery}`,
    ];
    if (langRaw) parts.push(`--lang ${langRaw}`);
    const cmd = buildCommand(parts);
    whisper(playerId, t('ui.wizard.applyEffectTitle', locale, { condition }), [
      buildButton(t('ui.wizard.enterDetails', locale), cmd),
    ]);
  }

  /**
   * Returns false when --subject is supplied for a standard (non-custom) condition.
   *
   * @param {string} subjectId Parsed --subject value.
   * @param {string} canonical Canonical condition label.
   * @returns {boolean} True when the combination is valid.
   */
  function isSubjectAllowed(subjectId, canonical) {
    const value = subjectId === SUBJECT_NONE ? '' : subjectId;
    if (!value || !canonical) return true;
    return isCustomEffectType(canonical);
  }

  /**
   * Dispatches to the correct detail step once source, target, and condition are known.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Resolved wizard args.
   * @param {string} canonical Canonical condition label.
   * @returns {void}
   */
  function showEffectDetailStep(playerId, args, canonical) {
    const targetsRaw = toText(args.targets);
    if (isCustomTextCondition(canonical)) {
      if (toText(args.other) && toText(args.duration)) {
        if (targetsRaw) {
          handleMultiApply(playerId, args);
        } else {
          handleApply(playerId, args);
        }
        return;
      }
      showCustomTextStep(playerId, args, canonical);
      return;
    }
    if (toText(args.duration)) {
      if (targetsRaw) {
        handleMultiApply(playerId, args);
      } else {
        handleApply(playerId, args);
      }
      return;
    }
    showDurationStep(playerId, args);
  }

  /**
   * Advances the condition application wizard based on which arguments are present.
   *
   * Steps in order: condition, subject (custom effects), source token,
   * target token, and duration.
   * Each step whispers buttons to the GM. Any step whose value is already
   * supplied is skipped. Calls handleApply directly when all values are present.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Parsed command arguments.
   * @returns {void}
   */
  function showPromptUi(playerId, args) {
    const conditionRaw = toText(args.condition);
    const canonical = conditionRaw ? getCanonicalCondition(conditionRaw) : '';
    const config = getConfig();
    const subjectBypassForCommand = resolveSubjectPromptBypassOverride(
      args,
      config.subjectPromptBypass,
    );
    if (!subjectBypassForCommand.valid) {
      whisperWarning(playerId, subjectBypassForCommand.message);
      return;
    }

    const shouldBypassSubject =
      subjectBypassForCommand.value && isCustomEffectType(canonical);
    const wizardArgs = shouldBypassSubject
      ? { ...args, subject: SUBJECT_NONE }
      : args;

    const sourceId = toText(wizardArgs.source);
    const subjectRaw = toText(wizardArgs.subject);
    const subjectId = subjectRaw === SUBJECT_NONE ? '' : subjectRaw;

    const locale = getConfig().language;

    if (!isSubjectAllowed(toText(wizardArgs.subject), canonical)) {
      whisperWarning(playerId, t('ui.msg.subjectOnlyCustom', locale));
      return;
    }

    if (!canonical) {
      showConditionStep(playerId, wizardArgs);
      return;
    }

    const subjectChosen = Boolean(subjectId) || subjectRaw === SUBJECT_NONE;
    if (isCustomEffectType(canonical) && !subjectChosen) {
      showTokenStep(
        playerId,
        t('ui.wizard.selectSubject', locale),
        wizardArgs,
        'subject',
        t('ui.wizard.subjectDesc', locale),
      );
      return;
    }

    if (!sourceId) {
      showTokenStep(
        playerId,
        t('ui.wizard.selectSource', locale),
        wizardArgs,
        'source',
        t('ui.wizard.sourceDesc', locale),
      );
      return;
    }

    const targetId = toText(wizardArgs.target);
    const targetsRaw = toText(wizardArgs.targets);

    if (!targetId && !targetsRaw) {
      const selectedIdsRaw = toText(wizardArgs['selected-ids']);
      if (selectedIdsRaw) {
        showMultiTargetStep(playerId, wizardArgs);
        return;
      }
      showTokenStep(
        playerId,
        t('ui.wizard.selectTarget', locale),
        wizardArgs,
        'target',
        t('ui.wizard.targetDesc', locale),
      );
      return;
    }

    const resolvedArgs =
      subjectRaw === SUBJECT_NONE ? { ...wizardArgs, subject: '' } : wizardArgs;

    showEffectDetailStep(playerId, resolvedArgs, canonical);
  }

  /**
   * Resolves a per-command override for subjectPromptBypass.
   *
   * Supports either --subjectPromptBypass or --subject-prompt-bypass.
   * If omitted, the persisted config value is used.
   *
   * @param {object} args Parsed command arguments.
   * @param {boolean} configDefault Current config default.
   * @returns {{valid: boolean, value?: boolean, message?: string}} Resolution result.
   */
  function resolveSubjectPromptBypassOverride(args, configDefault) {
    const overrideRaw =
      args.subjectPromptBypass ?? args['subject-prompt-bypass'];
    if (overrideRaw === undefined) {
      return { valid: true, value: configDefault };
    }

    if (overrideRaw === true) {
      return { valid: true, value: true };
    }

    const parsed = validateBoolean(overrideRaw);
    if (!parsed.valid) {
      return {
        valid: false,
        message: t('ui.msg.subjectBypassInvalid', getConfig().language),
      };
    }

    return { valid: true, value: parsed.value };
  }

  /**
   * Handles Roll20 API chat input.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {void}
   */
  function handleInput(msg) {
    if (!isConditionTrackerMessage(msg)) {
      return;
    }

    try {
      ensureState();
      routeCommand(msg, parseCommand(msg.content));
    } catch (error) {
      whisperError(
        msg.playerid,
        t('ui.msg.commandFailed', getConfig().language),
      );
      log(`${SCRIPT_NAME} error: ${error.message}`);
    }
  }

  /**
   * Returns true when a chat message belongs to this mod.
   *
   * @param {object} msg Roll20 chat message.
   * @returns {boolean} True for Condition Tracker API messages.
   */
  function isConditionTrackerMessage(msg) {
    return Boolean(
      msg && msg.type === 'api' && toText(msg.content).startsWith(COMMAND),
    );
  }

  /**
   * Routes a parsed command to the correct handler.
   *
   * @param {object} msg Roll20 chat message.
   * @param {object} args Parsed command arguments.
   * @returns {void}
   */
  function routeCommand(msg, args) {
    if (args.help) {
      showHelp(msg.playerid);
      return;
    }

    if (!isGmMessage(msg)) {
      whisperError(msg.playerid, t('ui.msg.gmOnly', getConfig().language));
      return;
    }

    if (args['multi-target'] !== undefined) {
      handleMultiTargetTrigger(msg);
      return;
    }

    if (args.prompt !== undefined) {
      showPromptUi(msg.playerid, args);
      return;
    }

    if (args.menu) {
      showMenu(msg.playerid, args.menu);
      return;
    }

    if (args.remove) {
      handleRemove(msg.playerid, args.remove);
      return;
    }

    if (args.cleanup) {
      runCleanup(msg.playerid);
      return;
    }

    if (args['reorder-conditions'] !== undefined) {
      handleReorderConditions(msg.playerid);
      return;
    }

    if (args['reinstall-macro']) {
      handleReinstallMacro(msg.playerid);
      return;
    }

    if (args['reinstall-handout']) {
      handleReinstallHandout(msg.playerid);
      return;
    }

    if (args.config) {
      handleConfig(msg.playerid, args.config);
      return;
    }

    if (args.targets) {
      handleMultiApply(msg.playerid, args);
      return;
    }

    if (args.source || args.target || args.subject || args.condition) {
      handleApply(msg.playerid, args);
      return;
    }

    routeZeroHpCommand(msg.playerid, args);
  }

  /**
   * Dispatches zero-HP event commands, falling back to the main menu.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Parsed command arguments.
   * @returns {void}
   */
  function routeZeroHpCommand(playerId, args) {
    if (args['zero-hp-dead']) {
      handleZeroHpDead(playerId, args['zero-hp-dead']);
      return;
    }
    if (args['zero-hp-incapacitated']) {
      handleZeroHpIncapacitated(playerId, args['zero-hp-incapacitated']);
      return;
    }
    if (args['zero-hp-remove-all']) {
      handleZeroHpRemoveAll(playerId, args['zero-hp-remove-all']);
      return;
    }
    if (args['zero-hp-remove-from-turn']) {
      handleZeroHpRemoveFromTurnOrder(
        playerId,
        args['zero-hp-remove-from-turn'],
      );
      return;
    }
    if (args['zero-hp-to-map']) {
      handleZeroHpToMapLayer(playerId, args['zero-hp-to-map']);
      return;
    }
    showMenu(playerId, 'main');
  }

  /**
   * Reads the tokens currently selected by the GM and launches the multi-target
   * wizard, encoding the selected token ids into --selected-ids.
   *
   * @param {object} msg Roll20 chat message (used for playerid and selected).
   * @returns {void}
   */
  function handleMultiTargetTrigger(msg) {
    const locale = getConfig().language;
    const selected = Array.isArray(msg.selected) ? msg.selected : [];
    if (selected.length === 0) {
      whisperWarning(msg.playerid, t('ui.msg.noSelection', locale));
      return;
    }
    const selectedIds = selected
      .map((s) => toText(s._id))
      .filter(Boolean)
      .join(',');
    if (!selectedIds) {
      whisperWarning(msg.playerid, t('ui.msg.invalidIds', locale));
      return;
    }
    showPromptUi(msg.playerid, { prompt: true, 'selected-ids': selectedIds });
  }

  /**
   * Validates args, checks for duplicates, and builds a ready-to-persist condition.
   *
   * Does not modify state or the turn order. Returns null and whispers a warning
   * to the GM when any step fails.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Parsed command arguments.
   * @returns {{condition: object, markerNotice: string, locale: string, extraLocale: string}|null}
   */
  function prepareApply(playerId, args) {
    const validation = validateApplyArgs(args);
    if (!validation.valid) {
      whisperWarning(playerId, validation.message);
      return null;
    }

    const config = getConfig();
    const locale = config.language;
    const extraLocale = getLocale(toText(args.lang));
    const durationResult = parseDuration(args.duration, {
      sourceTokenId: validation.sourceToken.id,
      targetTokenId: validation.targetToken.id,
      currentTurnTokenId: getCurrentTurnTokenId(),
    });

    if (!durationResult.valid) {
      whisperWarning(playerId, durationResult.message);
      return null;
    }

    if (
      isDuplicate(
        validation.sourceToken.id,
        validation.subjectToken?.id || '',
        validation.subjectName || '',
        validation.targetToken.id,
        validation.condition,
        validation.customText,
      )
    ) {
      whisperWarning(playerId, t('ui.msg.duplicate', locale));
      return null;
    }

    const condition = buildConditionRecord(
      validation,
      config,
      durationResult.duration,
      locale,
    );
    const markerNotice = applyConfiguredMarker(
      validation.targetToken,
      condition,
      config,
      locale,
    );
    return { condition, markerNotice, locale, extraLocale };
  }

  /**
   * Applies a condition or custom effect to multiple target tokens.
   *
   * Validates and adds each condition to state sequentially (preserving duplicate
   * detection across targets), then inserts all Turn Tracker rows in a single
   * read-write cycle.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Parsed command arguments (must include targets).
   * @returns {void}
   */
  function handleMultiApply(playerId, args) {
    const targetsRaw = toText(args.targets);
    const targetIds = targetsRaw.split(',').filter(Boolean);
    if (targetIds.length === 0) {
      whisperWarning(playerId, t('ui.msg.noTargets', getConfig().language));
      return;
    }

    const prepared = [];
    for (const targetId of targetIds) {
      const prep = prepareApply(playerId, {
        ...args,
        target: targetId,
      });
      if (!prep) continue;
      addActiveCondition(prep.condition);
      prepared.push(prep);
    }

    if (prepared.length === 0) return;

    const insertResults = insertConditionRows(prepared.map((p) => p.condition));

    for (let i = 0; i < prepared.length; i++) {
      const { condition, markerNotice, locale, extraLocale } = prepared[i];
      const { appended } = insertResults[i];
      announceHtml(buildApplyMessage(condition, locale));
      if (extraLocale !== locale) {
        announceHtml(buildApplyMessage(condition, extraLocale));
      }
      whisperApplySummary(playerId, condition, appended, markerNotice, locale);
    }
  }

  /**
   * Applies a condition or custom effect.
   *
   * @param {string} playerId GM player id.
   * @param {object} args Parsed command arguments.
   * @returns {void}
   */
  function handleApply(playerId, args) {
    const prep = prepareApply(playerId, args);
    if (!prep) return;

    const { condition, markerNotice, locale, extraLocale } = prep;
    addActiveCondition(condition);
    const insertResult = insertConditionRow(condition);

    announceHtml(buildApplyMessage(condition, locale));
    if (extraLocale !== locale) {
      announceHtml(buildApplyMessage(condition, extraLocale));
    }
    whisperApplySummary(
      playerId,
      condition,
      insertResult.appended,
      markerNotice,
      locale,
    );
  }

  /**
   * Builds an active condition record.
   *
   * @param {object} validation Validated apply arguments.
   * @param {object} config Current config.
   * @param {object} duration Stored duration.
   * @param {string} [locale] Output locale for displayText.
   * @returns {object} Active condition record.
   */
  function buildConditionRecord(validation, config, duration, locale) {
    const sourceName = getTokenName(validation.sourceToken);
    const subjectName = validation.subjectToken
      ? getTokenName(validation.subjectToken)
      : validation.subjectName || '';
    const targetName = getTokenName(validation.targetToken);
    const marker = toText(config.markers[validation.condition]) || '';
    const details = {
      sourceName,
      subjectName,
      targetName,
      isSelfTarget: validation.sourceToken.id === validation.targetToken.id,
      condition: validation.condition,
      customText: validation.customText,
      useIcons: config.useIcons,
    };

    const id = createId();
    return {
      id,
      sourceTokenId: validation.sourceToken.id,
      subjectTokenId: validation.subjectToken?.id || '',
      targetTokenId: validation.targetToken.id,
      sourceName,
      subjectName,
      targetName,
      condition: validation.condition,
      customText: validation.customText,
      displayText: buildDisplayText(details, locale),
      marker,
      turnOrderCustomId: id,
      duration,
      createdAt: Date.now(),
    };
  }

  /**
   * Applies the configured marker and returns a GM-facing notice.
   *
   * @param {Graphic} targetToken Target token.
   * @param {object} condition Condition record.
   * @param {object} config Current config.
   * @param {string} [locale] Output locale.
   * @returns {string} Marker notice.
   */
  function applyConfiguredMarker(targetToken, condition, config, locale) {
    if (!config.useMarkers) {
      return t('ui.msg.markersDisabled', locale);
    }

    if (!condition.marker) {
      return t('ui.msg.noMarkerConfigured', locale);
    }

    const added = applyMarker(targetToken, condition.marker);
    return added
      ? t('ui.msg.markerApplied', locale, { marker: condition.marker })
      : t('ui.msg.markerPresent', locale, { marker: condition.marker });
  }

  /**
   * Returns true when an exact duplicate is already active.
   *
   * @param {string} sourceTokenId Source token id.
   * @param {string} subjectTokenId Subject token id.
   * @param {string} subjectName Subject display name.
   * @param {string} targetTokenId Target token id.
   * @param {string} condition Condition label.
   * @param {string} customText Custom effect text.
   * @returns {boolean} True for an exact duplicate.
   */
  function isDuplicate(
    sourceTokenId,
    subjectTokenId,
    subjectName,
    targetTokenId,
    condition,
    customText,
  ) {
    return someActiveCondition((activeCondition) => {
      const sameSource = activeCondition.sourceTokenId === sourceTokenId;
      const sameSubject =
        (activeCondition.subjectTokenId || '') === (subjectTokenId || '');
      const sameSubjectName =
        (activeCondition.subjectName || '') === (subjectName || '');
      const sameTarget = activeCondition.targetTokenId === targetTokenId;
      const sameCondition = activeCondition.condition === condition;
      const sameCustomText = activeCondition.customText === customText;
      return (
        sameSource &&
        sameSubject &&
        sameSubjectName &&
        sameTarget &&
        sameCondition &&
        sameCustomText
      );
    });
  }

  /**
   * Removes one active condition by id.
   *
   * @param {string} playerId GM player id.
   * @param {string} conditionId Condition id.
   * @returns {void}
   */
  function handleRemove(playerId, conditionId) {
    const locale = getConfig().language;
    const condition = findActiveCondition(toText(conditionId));
    if (!condition) {
      whisperWarning(playerId, t('ui.msg.conditionNotFound', locale));
      return;
    }

    removeConditionById(condition.id, {
      playerId,
      reason: t('ui.msg.manuallyRemoved', locale),
      publicAnnounce: true,
      whisperResult: true,
      locale,
    });
  }

  /**
   * Handles configuration commands.
   *
   * @param {string} playerId GM player id.
   * @param {string|boolean} configText Config command text.
   * @returns {void}
   */
  function handleConfig(playerId, configText) {
    if (configText === true || !toText(configText)) {
      showConfig(playerId);
      return;
    }

    const parts = toText(configText).split(/\s+/);
    const option = parts[0];
    const value = parts.slice(1).join(' ');

    if (option === 'marker') {
      updateMarkerConfig(playerId, value);
      return;
    }

    if (option === 'useMarkers') {
      updateBooleanConfig(playerId, 'useMarkers', value);
      return;
    }

    if (option === 'icons') {
      updateBooleanConfig(playerId, 'useIcons', value);
      return;
    }

    if (option === 'subjectPromptBypass') {
      updateBooleanConfig(playerId, 'subjectPromptBypass', value);
      return;
    }

    if (option === 'healthBar') {
      updateHealthBarConfig(playerId, value);
      return;
    }

    if (option === 'language') {
      updateLocaleConfig(playerId, value);
      return;
    }

    if (option === 'reset') {
      resetConfig(playerId);
      return;
    }

    whisperWarning(playerId, t('ui.msg.unknownConfig', getConfig().language));
  }

  /**
   * Restores all configuration settings to their defaults.
   *
   * @param {string} playerId GM player id.
   * @returns {void}
   */
  function resetConfig(playerId) {
    const defaultConfig = createDefaultConfig();
    setConfig(defaultConfig);
    installHandout(defaultConfig.language);
    whisper(
      playerId,
      t('ui.title.configTracker', defaultConfig.language),
      t('ui.msg.configReset', defaultConfig.language),
    );
  }

  /**
   * Updates the language setting.
   *
   * @param {string} playerId GM player id.
   * @param {string} value Locale string.
   * @returns {void}
   */
  function updateLocaleConfig(playerId, value) {
    const result = validateLocale(value);
    if (!result.valid) {
      const locale = getConfig().language;
      whisperWarning(playerId, [
        invalidLocaleIntro(locale),
        htmlTable(
          [
            t('handout.availableLocales.colLocale', locale),
            t('handout.availableLocales.colLanguage', locale),
          ],
          localeTableRows(),
        ),
      ]);
      return;
    }

    applyConfigUpdate(
      playerId,
      (config) => {
        config.language = result.value;
      },
      t('ui.msg.langSet', result.value, {
        locale: localeDisplayName(result.value),
      }),
      result.value,
    );

    installHandout(result.value);
  }

  /**
   * Updates a marker mapping.
   *
   * @param {string} playerId GM player id.
   * @param {string} value Marker assignment text.
   * @returns {void}
   */
  function updateMarkerConfig(playerId, value) {
    const locale = getConfig().language;
    const separatorIndex = value.indexOf('=');
    if (separatorIndex < 1) {
      whisperWarning(playerId, t('ui.msg.markerConfigFormat', locale));
      return;
    }

    const result = validateMarkerConfig(
      value.slice(0, separatorIndex),
      value.slice(separatorIndex + 1),
    );
    if (!result.valid) {
      whisperWarning(playerId, result.message);
      return;
    }

    applyConfigUpdate(
      playerId,
      (config) => {
        config.markers[result.condition] = result.marker;
      },
      t('ui.msg.markerSet', locale, {
        condition: result.condition,
        marker: result.marker,
      }),
    );
  }

  /**
   * Persists a config mutation and whispers the success message.
   *
   * @param {string} playerId GM player id.
   * @param {(config: object) => void} applyMutation Config mutator.
   * @param {string} successMessage Success message body.
   * @param {string} [locale] Locale for the config title (defaults to current config language).
   * @returns {void}
   */
  function applyConfigUpdate(playerId, applyMutation, successMessage, locale) {
    const config = getConfig();
    applyMutation(config);
    setConfig(config);
    const lang = locale || config.language;
    whisper(playerId, t('ui.title.configTracker', lang), successMessage);
  }

  /**
   * Updates a boolean config setting.
   *
   * @param {string} playerId GM player id.
   * @param {string} key Config key.
   * @param {string} value Boolean text.
   * @returns {void}
   */
  function updateBooleanConfig(playerId, key, value) {
    const locale = getConfig().language;
    const result = validateBoolean(value);
    if (!result.valid) {
      whisperWarning(playerId, result.message);
      return;
    }

    applyConfigUpdate(
      playerId,
      (config) => {
        config[key] = result.value;
      },
      t('ui.msg.boolSet', locale, { key, value: String(result.value) }),
    );
  }

  /**
   * Updates the configured health bar.
   *
   * @param {string} playerId GM player id.
   * @param {string} value Health bar setting.
   * @returns {void}
   */
  function updateHealthBarConfig(playerId, value) {
    const locale = getConfig().language;
    const result = validateHealthBar(value);
    if (!result.valid) {
      whisperWarning(playerId, result.message);
      return;
    }

    applyConfigUpdate(
      playerId,
      (config) => {
        config.healthBar = result.value;
      },
      t('ui.msg.healthBarSet', locale, { bar: result.value }),
    );
  }

  /**
   * Shows the main or removal menu.
   *
   * @param {string} playerId GM player id.
   * @param {string|boolean} menu Menu name.
   * @returns {void}
   */
  function showMenu(playerId, menu) {
    const locale = getConfig().language;
    if (menu === MENU_REMOVE) {
      showRemovalMenu(playerId);
      return;
    }

    const cmdPrompt = `${COMMAND} --prompt`;
    const cmdMultiTarget = `${COMMAND} --multi-target`;
    const cmdRemoveMenu = `${COMMAND} --menu remove`;
    const cmdConfig = `${COMMAND} --config`;
    const cmdCleanup = `${COMMAND} --cleanup`;
    const cmdReorder = `${COMMAND} --reorder-conditions`;
    const cmdReinstall = `${COMMAND} --reinstall-macro`;
    const cmdReinstallHandout = `${COMMAND} --reinstall-handout`;
    const cmdHelp = `${COMMAND} --help`;

    whisper(playerId, t('ui.title.menu', locale), [
      heading(t('ui.heading.quickActions', locale)),
      htmlTable(
        [t('ui.col.command', locale), t('ui.col.result', locale)],
        [
          [
            code(cmdPrompt),
            buildButton(t('ui.btn.openWizard', locale), cmdPrompt),
          ],
          [
            code(cmdMultiTarget),
            buildButton(t('ui.btn.openMultiTarget', locale), cmdMultiTarget),
          ],
          [
            code(cmdRemoveMenu),
            buildButton(t('ui.btn.openRemovalList', locale), cmdRemoveMenu),
          ],
          [
            code(cmdConfig),
            buildButton(t('ui.btn.showConfig', locale), cmdConfig),
          ],
          [
            code(cmdCleanup),
            buildButton(t('ui.btn.runCleanup', locale), cmdCleanup),
          ],
          [
            code(cmdReorder),
            buildButton(t('ui.btn.reorderConditions', locale), cmdReorder),
          ],
          [
            code(cmdReinstall),
            buildButton(t('ui.btn.reinstallMacro', locale), cmdReinstall),
          ],
          [
            code(cmdReinstallHandout),
            buildButton(
              t('ui.btn.reinstallHandout', locale),
              cmdReinstallHandout,
            ),
          ],
          [code(cmdHelp), buildButton(t('ui.btn.showHelp', locale), cmdHelp)],
        ],
      ),
    ]);
  }

  /**
   * Shows active conditions with remove buttons.
   *
   * @param {string} playerId GM player id.
   * @returns {void}
   */
  function showRemovalMenu(playerId) {
    const locale = getConfig().language;
    const active = ensureState().active;
    if (active.length === 0) {
      whisper(
        playerId,
        t('ui.title.removalMenu', locale),
        t('ui.msg.noActive', locale),
      );
      return;
    }

    const lines = [];
    for (const condition of active) {
      lines.push(buildRemoveButton(condition));
    }

    whisper(playerId, t('ui.title.removalMenu', locale), lines);
  }

  /**
   * Shows the current configuration.
   *
   * @param {string} playerId GM player id.
   * @returns {void}
   */
  function showConfig(playerId) {
    const config = getConfig();
    const locale = config.language;
    const markerRows = [];
    for (const condition of STANDARD_CONDITIONS) {
      markerRows.push([
        escapeHtml(condition),
        code(config.markers[condition] || '(none)'),
      ]);
    }

    whisper(playerId, t('ui.title.config', locale), [
      heading(t('ui.heading.settings', locale)),
      htmlTable(
        [t('ui.col.option', locale), t('ui.col.value', locale)],
        [
          ['useMarkers', code(String(config.useMarkers))],
          ['useIcons', code(String(config.useIcons))],
          ['subjectPromptBypass', code(String(config.subjectPromptBypass))],
          ['healthBar', code(config.healthBar)],
          ['language', code(config.language)],
        ],
      ),
      sectionSpacer(),
      heading(t('ui.heading.markerMappings', locale)),
      htmlTable(
        [t('ui.col.condition', locale), t('ui.col.marker', locale)],
        markerRows,
      ),
    ]);
  }

  /**
   * Shows command help.
   *
   * @param {string} playerId Player id.
   * @returns {void}
   */
  function showHelp(playerId) {
    const locale = getConfig().language;
    const commandRows = /** @type {string[][]} */ (
      tRaw('handout.commandsRef.rows', locale) || []
    );
    const quickStartRows = /** @type {string[][]} */ (
      tRaw('handout.quickStart.rows', locale) || []
    );
    const configRows = /** @type {string[][]} */ (
      tRaw('handout.configuration.rows', locale) || []
    );

    const configTableRows = configRows.map(([option, values, description]) => [
      code(decodeHelpText(option)),
      escapeHtml(decodeHelpText(values)),
      escapeHtml(decodeHelpText(description)),
    ]);

    whisper(playerId, t('ui.title.help', locale), [
      heading(t('ui.heading.info', locale)),
      htmlTable(
        [t('ui.col.item', locale), t('ui.col.details', locale)],
        [
          [escapeHtml(SCRIPT_NAME), code(SCRIPT_VERSION)],
          [escapeHtml(HANDOUT_NAME), escapeHtml(t('handout.subtitle', locale))],
          [
            escapeHtml(t('handout.overview.heading', locale)),
            escapeHtml(decodeHelpText(t('handout.overview.body', locale))),
          ],
        ],
      ),
      sectionSpacer(),
      heading(t('ui.heading.commandOptions', locale)),
      htmlTable(
        [
          t('handout.commandsRef.colFlag', locale),
          t('handout.commandsRef.colDesc', locale),
        ],
        toEscapedHandoutTableRows(commandRows),
      ),
      sectionSpacer(),
      heading(t('handout.configuration.heading', locale)),
      htmlTable(
        [
          t('handout.configuration.colOption', locale),
          t('handout.configuration.colValues', locale),
          t('handout.configuration.colDesc', locale),
        ],
        configTableRows,
      ),
      sectionSpacer(),
      heading(t('handout.availableLocales.heading', locale)),
      t('handout.availableLocales.intro', locale),
      htmlTable(
        [
          t('handout.availableLocales.colLocale', locale),
          t('handout.availableLocales.colLanguage', locale),
        ],
        localeTableRows(),
      ),
      sectionSpacer(),
      heading(t('ui.heading.examples', locale)),
      htmlTable(
        [
          t('handout.quickStart.colCommand', locale),
          t('handout.quickStart.colDesc', locale),
        ],
        toEscapedHandoutTableRows(quickStartRows),
      ),
      sectionSpacer(),
    ]);
  }

  /**
   * Whispers application details to the GM.
   *
   * @param {string} playerId GM player id.
   * @param {object} condition Active condition record.
   * @param {boolean} appended Whether the row was appended.
   * @param {string} markerNotice Marker notice.
   * @param {string} [locale] Output locale.
   * @returns {void}
   */
  function whisperApplySummary(
    playerId,
    condition,
    appended,
    markerNotice,
    locale,
  ) {
    whisper(playerId, t('ui.title.applied', locale), [
      heading(t('ui.heading.result', locale)),
      htmlTable(
        [t('ui.col.field', locale), t('ui.col.value', locale)],
        [
          [
            t('ui.removal.conditionField', locale),
            escapeHtml(condition.displayText),
          ],
          [
            t('ui.title.turnOrder', locale),
            appended
              ? t('ui.apply.turnAppended', locale)
              : t('ui.apply.turnInserted', locale),
          ],
          [t('ui.removal.markerField', locale), escapeHtml(markerNotice)],
          ['Duration', escapeHtml(formatDuration(condition.duration, locale))],
        ],
      ),
    ]);
  }

  /**
   * Formats a stored duration for chat.
   *
   * @param {object} duration Stored duration.
   * @param {string} [locale] Output locale.
   * @returns {string} Human-readable duration.
   */
  function formatDuration(duration, locale) {
    if (!duration || duration.type === DURATION_UNTIL_REMOVED) {
      return t('ui.dur.untilRemovedDisplay', locale);
    }

    return t('ui.dur.turnsRemaining', locale, { n: duration.remaining });
  }

  /**
   * Whispers all GMs a prompt to selectively remove conditions when a token hits 0 HP.
   * For player tokens, does nothing when there are no active conditions.
   * For NPC tokens, always sends the turn order removal prompt even with no conditions.
   *
   * @param {object} token Roll20 graphic object.
   * @param {string} targetName Token display name.
   * @param {boolean} isPlayer Whether the token is a player-controlled token.
   * @returns {void}
   */
  function promptZeroHpConditionRemoval(token, targetName, isPlayer) {
    const locale = getConfig().language;
    const tokenId = token.id;
    const active = getActiveByTarget(tokenId);
    const title = t('ui.title.zeroHp', locale, { name: targetName });

    if (active.length === 0) {
      if (isPlayer) {
        return;
      }
      whisperGms(title, [
        t('ui.msg.zeroHpNoConditions', locale, { name: targetName }),
        buildButton(
          t('ui.msg.removeFromTurnOrder', locale),
          `${COMMAND} --zero-hp-remove-from-turn ${tokenId}`,
        ),
      ]);
      return;
    }

    const lines = [
      t('ui.msg.zeroHpConditions', locale, { name: targetName }),
      ...active.map((condition) => buildRemoveButton(condition)),
      buildButton(
        t('ui.msg.removeAllBtn', locale, { name: targetName }),
        `${COMMAND} --zero-hp-remove-all ${tokenId}`,
      ),
    ];

    if (isPlayer) {
      lines.push(
        buildButton(
          t('ui.msg.markIncapacitated', locale),
          `${COMMAND} --zero-hp-incapacitated ${tokenId}`,
        ),
      );
    } else {
      lines.push(
        buildButton(
          t('ui.msg.removeFromTurnOrder', locale),
          `${COMMAND} --zero-hp-remove-from-turn ${tokenId}`,
        ),
      );
    }

    whisperGms(title, lines);
  }

  /**
   * Removes expired duration conditions.
   *
   * @param {string} playerId GM player id.
   * @param {object[]} expired Expired conditions.
   * @returns {void}
   */
  function removeExpiredConditions(playerId, expired) {
    const locale = getConfig().language;
    for (const condition of expired) {
      removeConditionById(condition.id, {
        playerId,
        reason: t('ui.msg.durationExpired', locale),
        publicAnnounce: true,
        whisperResult: true,
        locale,
      });
    }
  }

  /**
   * Removes all active conditions for a token, used when the GM clicks "Remove All" at 0 HP.
   *
   * @param {string} playerId GM player id.
   * @param {string} tokenId Target token id.
   * @returns {void}
   */
  function handleZeroHpRemoveAll(playerId, tokenId) {
    const locale = getConfig().language;
    const token = getGraphicToken(tokenId);
    const targetName = token ? getTokenName(token) : tokenId;
    const active = getActiveByTarget(tokenId);
    if (active.length === 0) {
      whisper(playerId, t('ui.title.noConditions', locale), [
        t('ui.msg.noActiveConditions', locale, { name: targetName }),
      ]);
      return;
    }
    for (const condition of active) {
      removeConditionById(condition.id, {
        playerId,
        reason: t('ui.msg.reachedZeroHp', locale, { name: targetName }),
        publicAnnounce: true,
        whisperResult: true,
        locale,
      });
    }
  }

  /**
   * Removes an NPC token's own row from the turn order when it hits 0 HP,
   * then prompts all GMs to optionally move the token to the map layer.
   *
   * @param {string} playerId GM player id.
   * @param {string} tokenId Target token id.
   * @returns {void}
   */
  function handleZeroHpRemoveFromTurnOrder(playerId, tokenId) {
    const locale = getConfig().language;
    const token = getGraphicToken(tokenId);
    const targetName = token ? getTokenName(token) : tokenId;
    const removed = removeTokenRow(tokenId);
    const message = removed
      ? t('ui.msg.tokenRemovedFromTurn', locale, { name: targetName })
      : t('ui.msg.tokenNotInTurn', locale, { name: targetName });
    whisper(playerId, t('ui.title.turnOrder', locale), [message]);

    if (token) {
      whisperGms(t('ui.title.moveToken', locale, { name: targetName }), [
        t('ui.msg.moveTokenPrompt', locale, { name: targetName }),
        buildButton(
          t('ui.msg.moveTokenBtn', locale, { name: targetName }),
          `${COMMAND} --zero-hp-to-map ${tokenId}`,
        ),
      ]);
    }
  }

  /**
   * Moves a token to the map layer so it stays visible but is no longer interactive.
   *
   * @param {string} playerId GM player id.
   * @param {string} tokenId Target token id.
   * @returns {void}
   */
  function handleZeroHpToMapLayer(playerId, tokenId) {
    const locale = getConfig().language;
    const token = getGraphicToken(tokenId);
    if (!token) {
      whisperError(playerId, t('ui.msg.tokenNotFound', locale));
      return;
    }

    const targetName = getTokenName(token);
    token.set('layer', 'map');
    whisper(playerId, t('ui.title.tokenMoved', locale), [
      t('ui.msg.tokenMoved', locale, { name: targetName }),
    ]);
  }

  /**
   * Removes all active conditions for a player token marked as dead.
   *
   * @param {string} playerId GM player id.
   * @param {string} tokenId Target token id.
   * @returns {void}
   */
  function handleZeroHpDead(playerId, tokenId) {
    const locale = getConfig().language;
    const token = getGraphicToken(tokenId);
    const targetName = token ? getTokenName(token) : tokenId;
    const active = getActiveByTarget(tokenId);
    if (active.length === 0) {
      whisper(playerId, t('ui.title.markedDead', locale), [
        t('ui.msg.deadNoConditions', locale, { name: targetName }),
      ]);
      return;
    }
    for (const condition of active) {
      removeConditionById(condition.id, {
        playerId,
        reason: t('ui.msg.markedAsDead', locale, { name: targetName }),
        publicAnnounce: true,
        whisperResult: true,
        locale,
      });
    }
  }

  /**
   * Applies the Incapacitated condition to a player token at 0 HP.
   *
   * @param {string} playerId GM player id.
   * @param {string} tokenId Target token id.
   * @returns {void}
   */
  function handleZeroHpIncapacitated(playerId, tokenId) {
    const config = getConfig();
    const locale = config.language;
    const token = getGraphicToken(tokenId);
    if (!token) {
      whisperError(playerId, t('ui.msg.tokenNotFound', locale));
      return;
    }

    const tokenName = getTokenName(token);

    if (isDuplicate(tokenId, '', '', tokenId, 'Incapacitated', '')) {
      whisperWarning(
        playerId,
        t('ui.msg.alreadyIncapacitated', locale, { name: tokenName }),
      );
      return;
    }

    const validation = {
      sourceToken: token,
      subjectToken: null,
      targetToken: token,
      condition: 'Incapacitated',
      customText: '',
    };
    const duration = { type: DURATION_UNTIL_REMOVED };
    const condition = buildConditionRecord(
      validation,
      config,
      duration,
      locale,
    );
    const markerNotice = applyConfiguredMarker(
      token,
      condition,
      config,
      locale,
    );
    addActiveCondition(condition);
    const insertResult = insertConditionRow(condition);

    announceHtml(buildApplyMessage(condition, locale));
    whisperApplySummary(
      playerId,
      condition,
      insertResult.appended,
      markerNotice,
      locale,
    );
  }

  /**
   * Reorders all condition rows to follow their anchor tokens.
   *
   * @param {string} playerId GM player id.
   * @returns {void}
   */
  function handleReorderConditions(playerId) {
    const locale = getConfig().language;
    reorderAllConditionRows();
    whisper(
      playerId,
      t('ui.title.conditionReorder', locale),
      t('ui.msg.conditionsReordered', locale),
    );
  }

  /**
   * Reinstalls the ConditionTrackerWizard macro for all current GM players.
   *
   * @param {string} playerId GM player id.
   * @returns {void}
   */
  function handleReinstallMacro(playerId) {
    const locale = getConfig().language;
    installMacro();
    whisper(
      playerId,
      t('ui.title.macroReinstalled', locale),
      t('ui.msg.macroReinstalled', locale, {
        wizard: MACRO_NAME,
        multiTarget: MACRO_NAME_MULTI_TARGET,
      }),
    );
  }

  /**
   * Reinstalls the localized help handout for the current configured language.
   *
   * @param {string} playerId GM player id.
   * @returns {void}
   */
  function handleReinstallHandout(playerId) {
    const locale = getConfig().language;
    installHandout(locale);
    whisper(
      playerId,
      t('ui.title.handoutReinstalled', locale),
      t('ui.msg.handoutReinstalled', locale, { handout: HANDOUT_NAME }),
    );
  }

  /**
   * Initializes state, macros, and runtime turn bookkeeping.
   *
   * @returns {void}
   */
  function checkInstall() {
    ensureState();
    applyGlobalConfig();
    migrateTurnOrderRows();
    updateTurnRuntime(
      getCurrentTurnTokenId(),
      getTurnSignature(),
      getTokenRowIds(),
      findMisplacedConditionIds(),
    );
    installMacro();
    installHandout(getConfig().language);
    log(
      `-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} [Updated: ${SCRIPT_LAST_UPDATED}] <=-`,
    );

    const locale = getConfig().language;
    const gmIds = getGmPlayerIds();
    for (const gmId of gmIds) {
      whisper(
        gmId,
        t('ui.title.scriptReady', locale),
        t('ui.msg.scriptReady', locale, {
          name: SCRIPT_NAME,
          version: SCRIPT_VERSION,
        }),
      );
      showMenu(gmId);
    }
  }

  /**
   * Handles token changes for HP-zero cleanup.
   *
   * @param {Graphic} token Changed token.
   * @param {object} previous Previous token attributes.
   * @returns {void}
   */
  function handleTokenChange(token, previous) {
    try {
      if (previous.statusmarkers !== undefined) {
        const prevMarkers = toText(previous.statusmarkers)
          .split(TOKEN_MARKER_SEPARATOR)
          .map((s) => s.trim())
          .filter(Boolean);
        const currMarkers = getTokenMarkers(token);
        if (
          containsMarker(currMarkers, 'dead') &&
          !containsMarker(prevMarkers, 'dead')
        ) {
          const targetName = getTokenName(token);
          promptZeroHpConditionRemoval(token, targetName, isPlayerToken(token));
          return;
        }
      }

      const config = getConfig();
      const bar = config.healthBar;
      const previousValue = Number(previous[bar]);
      const currentValue = Number(token.get(bar));

      if (!Number.isFinite(currentValue) || currentValue > 0) {
        return;
      }

      if (Number.isFinite(previousValue) && previousValue <= 0) {
        return;
      }

      const targetName = getTokenName(token);
      promptZeroHpConditionRemoval(token, targetName, isPlayerToken(token));
    } catch (error) {
      log(`${SCRIPT_NAME} HP cleanup error: ${error.message}`);
    }
  }

  /**
   * Removes conditions bound to a deleted token.
   *
   * Prunes conditions where the deleted token was either source or target,
   * removes matching turn-order rows in a single pass, and clears markers from
   * surviving target tokens when they are no longer needed.
   *
   * @param {Graphic} token Deleted token.
   * @returns {void}
   */
  function handleTokenDestroy(token) {
    try {
      const tokenId = token?.id || '';
      if (!tokenId) {
        return;
      }

      const { matched: removed, unmatched: kept } = partitionActiveConditions(
        (condition) =>
          condition.sourceTokenId === tokenId ||
          condition.targetTokenId === tokenId,
      );

      if (removed.length === 0) {
        return;
      }

      setActiveConditions(kept);
      removeConditionRows(removed.map((condition) => condition.id));
      for (const condition of removed) {
        removeMarkerIfUnused(condition);
      }
    } catch (error) {
      log(`${SCRIPT_NAME} token cleanup error: ${error.message}`);
    }
  }

  /**
   * Handles Turn Tracker changes for duration expiration.
   *
   * @returns {void}
   */
  function handleTurnOrderChange() {
    try {
      const trackerState = ensureState();
      const currentSignature = getTurnSignature();
      if (currentSignature === trackerState.runtime.previousTurnSignature) {
        return;
      }

      const previousFirstTurnId = trackerState.runtime.previousFirstTurnId;
      const previousTokenIds = trackerState.runtime.previousTokenIds || [];
      const previousMisplacedIds =
        trackerState.runtime.previousMisplacedConditionIds || [];
      const currentFirstTurnId = getCurrentTurnTokenId();
      const currentTokenIds = getTokenRowIds();
      reconcileActiveConditionsWithTurnOrder();
      const currentMisplacedIds = findMisplacedConditionIds();
      updateTurnRuntime(
        currentFirstTurnId,
        currentSignature,
        currentTokenIds,
        currentMisplacedIds,
      );

      if (
        shouldPromptConditionReorder(
          previousTokenIds,
          currentTokenIds,
          previousMisplacedIds,
          currentMisplacedIds,
        )
      ) {
        promptConditionReorder(getPrimaryGmId(), currentMisplacedIds.length);
      }

      if (!previousFirstTurnId || previousFirstTurnId === currentFirstTurnId) {
        return;
      }

      const { expired, decremented } =
        collectExpiredConditions(previousFirstTurnId);
      for (const condition of decremented) {
        updateConditionRow(condition);
      }
      removeExpiredConditions(getPrimaryGmId(), expired);
    } catch (error) {
      log(`${SCRIPT_NAME} duration error: ${error.message}`);
    }
  }

  /**
   * Returns true when a turn-order change should prompt the GM to reorder
   * condition rows.
   *
   * @param {string[]} previousTokenIds Token ids from the previous turn order snapshot.
   * @param {string[]} currentTokenIds Token ids from the current turn order.
   * @param {string[]} previousMisplacedIds Previously misplaced condition ids.
   * @param {string[]} currentMisplacedIds Currently misplaced condition ids.
   * @returns {boolean} True when a reorder prompt should be whispered.
   */
  function shouldPromptConditionReorder(
    previousTokenIds,
    currentTokenIds,
    previousMisplacedIds,
    currentMisplacedIds,
  ) {
    if (currentMisplacedIds.length === 0) {
      return false;
    }

    const previousMisplacedSet = new Set(previousMisplacedIds);
    const newlyMisplaced = currentMisplacedIds.some(
      (id) => !previousMisplacedSet.has(id),
    );
    if (!newlyMisplaced) {
      return false;
    }

    if (isSingleTurnAdvance(previousTokenIds, currentTokenIds)) {
      return false;
    }

    return true;
  }

  /**
   * Returns true when token rows changed by the normal next-turn rotation.
   *
   * @param {string[]} previousIds Token ids from the previous turn order snapshot.
   * @param {string[]} currentIds Token ids from the current turn order.
   * @returns {boolean} True for a one-step left rotation.
   */
  function isSingleTurnAdvance(previousIds, currentIds) {
    if (previousIds.length < 2 || previousIds.length !== currentIds.length) {
      return false;
    }

    const rotated = previousIds.slice(1).concat(previousIds[0]);
    return arraysEqual(rotated, currentIds);
  }

  /**
   * Returns true when two string arrays have the same values in the same order.
   *
   * @param {string[]} a First array.
   * @param {string[]} b Second array.
   * @returns {boolean} True when arrays match.
   */
  function arraysEqual(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    return a.every((value, index) => value === b[index]);
  }

  /**
   * Whispers a GM prompt asking whether to reorder displaced condition rows.
   *
   * @param {string} gmId GM player id.
   * @param {number} count Number of misplaced condition rows detected.
   * @returns {void}
   */
  function promptConditionReorder(gmId, count) {
    const locale = getConfig().language;
    whisper(gmId, t('ui.title.conditionReorder', locale), [
      t('ui.msg.conditionReorder', locale, { count }),
      buildButton(
        t('ui.btn.reorderConditions', locale),
        `${COMMAND} --reorder-conditions`,
      ),
    ]);
  }

  /**
   * Removes active conditions whose custom Turn Tracker rows no longer exist.
   *
   * @returns {number} Number of removed state entries.
   */
  function reconcileActiveConditionsWithTurnOrder() {
    const rowConditionIds = getConditionRowIdSet();
    const { matched: kept, unmatched: removed } = partitionActiveConditions(
      (condition) => rowConditionIds.has(condition.id),
    );

    if (removed.length === 0) {
      return 0;
    }

    setActiveConditions(kept);
    for (const condition of removed) {
      removeMarkerIfUnused(condition);
    }

    return removed.length;
  }

  /**
   * Collects conditions that expired or decremented when an anchor token turn ended.
   *
   * @param {string} endedTurnTokenId Token id whose turn ended.
   * @returns {{ expired: object[], decremented: object[] }} Expired and decremented condition records.
   */
  function collectExpiredConditions(endedTurnTokenId) {
    const expired = [];
    const decremented = [];

    for (const condition of getActiveConditions()) {
      const anchored = isAnchoredTo(condition, endedTurnTokenId);
      if (decrementDuration(condition, endedTurnTokenId)) {
        expired.push(condition);
      } else if (anchored) {
        decremented.push(condition);
      }
    }

    return { expired, decremented };
  }

  /**
   * Returns true when a condition's duration is anchored to the given token.
   *
   * @param {object} condition Active condition record.
   * @param {string} tokenId Token id to check against.
   * @returns {boolean} True when anchored.
   */
  function isAnchoredTo(condition, tokenId) {
    const d = condition.duration;
    return d?.anchor === tokenId;
  }

  /**
   * Returns a GM player id for automated whispers.
   *
   * @returns {string} GM player id or an empty string.
   */
  function getPrimaryGmId() {
    return getGmPlayerIds()[0] || '';
  }

  /**
   * Registers Roll20 event handlers.
   *
   * @returns {void}
   */
  function registerEventHandlers() {
    on('ready', checkInstall);
    on('chat:message', handleInput);
    on('change:graphic', handleTokenChange);
    on('destroy:graphic', handleTokenDestroy);
    on('change:campaign:turnorder', handleTurnOrderChange);
  }

  registerEventHandlers();
})();
