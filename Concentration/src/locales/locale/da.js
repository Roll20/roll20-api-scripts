const TRANSLATION = {
  titles: {
    ready: 'Koncentrationen er klar.',
    menu: 'Koncentrationsindstillinger',
    help: 'Koncentrationskommandoer',
    status: 'Hvem koncentrerer sig',
    advantage: 'Fordel ved koncentrationsbesparelser',
    reset: 'Nulstil koncentration',
    concentration: 'Koncentration',
    save: 'Koncentration Gem',
    check: 'Kontrol af koncentration',
  },
  messages: {
    migrated:
      'Opgraderet fra version 1.0. Dine indstillinger og fordelsliste blev bevaret, og dine gamle makroer fungerer stadig.',
    reconciled:
      'Indhentet kortet: Koncentrerende tokens fundet {added}, gamle poster fjernet {dropped}.',
    readyHint: 'Skriv {command} for indstillingerne, eller åbn Command Deck-uddelingskopien.',
    settingChanged: '{setting} er nu {value}.',
    confirmReset:
      'Vil du sætte alle indstillinger tilbage til deres standard og rydde fordelslisten? Koncentrationsmarkører på kortet bliver.',
    reset: 'Indstillinger sættes tilbage til deres standardindstillinger.',
    journal: 'Handouts genopbygget: {help} og {deck}.',
  },
  notices: {
    started: '{name} koncentrerer sig nu om {spell}.',
    startedNoSpell: '{name} koncentrerer sig nu.',
    switched: '{name} holder op med at koncentrere sig om {old} og koncentrerer sig nu om {spell}.',
    switchedNoSpell: '{name} koncentrerer sig nu.',
    ended: '{name} koncentrerer sig ikke længere om {spell}.',
    endedNoSpell: '{name} koncentrerer sig ikke længere.',
    lost: '{name} mister koncentrationen på {spell}.',
    lostNoSpell: '{name} mister koncentrationen.',
    kept: '{name} bliver ved med at koncentrere sig om {spell}.',
    keptNoSpell: '{name} bliver ved med at koncentrere sig.',
    zeroHp: '{name} falder til 0 hitpoint og mister koncentrationen på {spell}.',
    zeroHpNoSpell: '{name} falder til 0 hitpoint og mister koncentrationen.',
    checkNeeded:
      '{name} skal lave et Constitution-sparekast for at blive ved med at koncentrere sig: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Modifikator',
    roll: 'Rulle',
    advantageRoll: '{first} og {second} (fordel)',
    success: 'Succes',
    failure: 'Fiasko',
  },
  menu: {
    concentratingCount: 'Koncentrerer sig nu: {count}',
    settings: 'Indstillinger',
    footer:
      'Skriv {command} for at komme tilbage hertil. Hver knap er også i "{deck}" uddelingsark.',
  },
  status: {
    none: 'Ingen koncentrerer sig.',
  },
  advantage: {
    intro:
      'Karakterer indstillet til On roll deres koncentrationsredninger med fordel, som med War Caster-bedriften. Dette gælder for automatiske gemmer.',
    none: 'Der er ingen karakterer i dette spil.',
  },
  buttons: {
    roll: 'Rulle',
    advantage: 'Fordel',
    status: 'Status',
    advantageMenu: 'Fordel menu',
    help: 'Hjælp',
    reset: 'Nulstil',
    confirmReset: 'Nulstil indstillinger',
    end: 'Ende',
    menu: 'Menu',
    concentrate: 'Koncentrer dig om…',
    toggle: 'Skift',
    journal: 'Genopbyg uddelingsark',
  },
  prompts: {
    spell: 'Fortryllelse',
  },
  values: {
    on: 'På',
    off: 'Slukket',
    bar: 'Søjle {bar}',
    unnamed: 'Unavngivet',
    sendTo: {
      everyone: 'Alle sammen',
      character: 'Karakter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Grundlæggende',
      detailed: 'Detaljeret',
    },
  },
  settings: {
    language: {
      label: 'Sprog',
      desc: 'Sproget i chatbeskeder og uddelingskopier.',
    },
    command: {
      label: 'Kommando',
      desc: 'Chatkommandoen uden "!". Version 1.0 makroer bruger koncentration.',
    },
    statusmarker: {
      label: 'Statusmarkør',
      desc: 'Token-markøren, der viser koncentration. Brugerdefinerede token-markører kan bruges.',
    },
    bar: {
      label: 'HP Bar',
      desc: 'Token-bjælken, der indeholder hitpoints. Skader på det kræver en koncentrationsbesparelse.',
    },
    send_reminder_to: {
      label: 'Send påmindelse til',
      desc: 'Hvem ser koncentrationsbeskeder og gemmer: alle, GM eller karakterens spillere (GM får en kopi).',
    },
    auto_add_concentration_marker: {
      label: 'Auto Add Con. Markør',
      desc: 'Tilføj markøren, når en koncentrationsbesværgelse er kastet fra et ark.',
      hint: 'D&D 5e 2014 (OGL) og 2024 ark.',
    },
    auto_roll_save: {
      label: 'Auto Roll Gem',
      desc: 'Rul saven, så snart et koncentrerende token tager skade. Når den er slukket, har påmindelsen Roll- og Advantage-knapper.',
    },
    show_roll_button: {
      label: 'Rulleknap',
      desc: 'Tilføj Roll og Advantage-knapper til påmindelsen, når Auto Roll Save er slået fra.',
    },
    end_at_zero: {
      label: 'Slut ved 0 HK',
      desc: 'Slut koncentrationen uden en redning, når en token falder til 0 hitpoint.',
    },
    bonus_attribute: {
      label: 'Bonus egenskab',
      desc: 'Arkattributten tilføjet til koncentration sparer. constitution_save_mod fungerer på D&D 5e 2014 og 2024 ark.',
    },
    debug: {
      label: 'Fejlretningstilstand',
      desc: 'Skriv noter om staveregistrering og lagring til API-konsollen for supportanmodninger.',
    },
    support_mode: {
      label: 'Supporttilstand',
      desc: 'Hvor meget Debug Mode skriver: Grundlæggende (kort) eller Detaljeret.',
    },
  },
  help: {
    menu: 'Med intet valgt (GM): Åbn indstillingerne. Med tokens valgt: start- eller slutkoncentration.',
    toggle:
      'Begynd at koncentrere dig om en besværgelse med de valgte tokens. Navngiv en anden besværgelse at skifte; køre det igen for at afslutte.',
    end: 'Slutkoncentration for de valgte tokens.',
    status: 'List, hvem der koncentrerer sig, med Afslut-knapper.',
    config: 'Skift en indstilling, for eksempel config auto_roll_save|false.',
    advantageMenu: 'Vælg med fordel, hvilke karakterer rullekoncentrationen sparer.',
    toggleAdvantage: 'Slå fordel til eller fra for én karakter.',
    roll: 'Rul en gem fra en påmindelses rulle eller fordel-knap.',
    journal: 'Genopbyg hjælpe- og kommandodækket-uddelingsarkene.',
    reset: 'Sæt alle indstillinger tilbage til deres standard.',
    help: 'Vis denne liste.',
    footer:
      'Fuldstændige instruktioner findes i "{help}" uddelingsark; knapperne er i "{deck}" uddelingsark.',
    playerFooter: 'Vælg dit token først.',
  },
  errors: {
    noSelection: 'Vælg først et token.',
    notYours: 'Du kan kun ændre koncentrationen for tokens, du kontrollerer.',
    gmOnly: 'Kun GM kan bruge denne kommando.',
    notConcentrating: 'Det token koncentrerer sig ikke.',
    unknownSetting: 'Der er ingen indstilling kaldet "{key}".',
    badSettingValue: '"{value}" er ikke en gyldig værdi for {key}.',
    rollExpired: 'Den knap er udløbet.',
    unknownCharacter: 'Den karakter eksisterer ikke længere.',
    internal: 'Noget gik galt. API-konsollen har detaljerne.',
  },
  hints: {
    noSelection: 'Vælg casterens token, og kør derefter kommandoen igen.',
    rollExpired: 'Knapper virker én gang og i 10 minutter. Beskadig tokenet igen for et nyt.',
    unknownSetting: 'Indtast kommandoen med intet valgt for at se indstillingerne.',
  },
  warnings: {
    unknownMarker:
      'Statusmarkøren "{marker}" er ikke en af ​​dette spils markører. Vælg en anden i indstillingerne.',
  },
  deck: {
    subtitle: 'Kommandodæk',
    selected: 'Udvalgte tokens',
    selectedDesc: 'Vælg casterens token først.',
    table: 'Bordet',
    tableDesc: 'Se, hvem der koncentrerer sig, og hvem der har fordel på deres redninger.',
    tools: 'Værktøjer',
    toolsDesc: 'Indstillinger, kommandolisten og uddelingskopierne.',
    footer: 'Fuldstændige instruktioner findes i "{help}" uddelingsark.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Koncentrationsmarkører, påmindelser og gemmer til D&D 5e',
    overview: {
      heading: 'Oversigt',
      body: 'Koncentration holder styr på, hvem der koncentrerer sig om hvilken besværgelse. Den sætter en markør på kasterens token, ruller (eller beder om) en Constitution save, når den token tager skade, og fortæller bordet, hvornår koncentrationen slutter.',
    },
    quickStart: {
      heading: 'Hurtig start',
      steps: [
        'Vælg casterens token og skriv !koncentration efterfulgt af besværgelsen, for eksempel !koncentration Bless.',
        'Skift tokens hitpunkter i dens stangboble. En save rulles ved DC 10, eller halvdelen af ​​skaden, hvis den er højere.',
        'Kør den samme kommando igen, eller tag markøren af ​​for at afslutte koncentrationen.',
        'Skriv !koncentration med intet valgt for at åbne indstillingerne.',
      ],
    },
    concentrating: {
      heading: 'Koncentrerer sig',
      points: [
        'Navngivning af en anden besværgelse ændrer koncentrationen til den, som en ny koncentrationsbesværgelse gør.',
        'At sætte markøren på en token i hånden starter koncentrationen uden en besværgelse; at tage den af ​​eller slette tokenet, afslutter den.',
        'Et nyt linket token af ​​en koncentrerende karakter får markøren, og et indsat token, der bærer markøren, spores.',
        'Tokens af én karakter med en linket hit point bar deler koncentration. Ikke-forbundne tokens, såsom en pakke nisser fra ét ark, koncentrerer sig om deres egen.',
        'Alle ser en besked, når koncentrationen starter, skifter eller slutter, medmindre Send påmindelse til siger andet.',
      ],
    },
    saves: {
      heading: 'Koncentration sparer',
      points: [
        'DC er 10 eller halvdelen af ​​skaden, alt efter hvad der er størst, op til DC 30.',
        'Modifikatoren kommer fra bonusattributten på karakterens ark; en manglende værdi tæller som 0.',
        'Auto Roll Gem ruller på én gang. Når den er slukket, har påmindelsen Roll- og Advantage-knapper til afspilleren eller GM.',
        'En mislykket redning stopper koncentrationen. Med End på 0 HP tændt, vil faldet til 0 hitpoint afsluttes uden en redning.',
        'Advantage-menuen giver en karakterfordel ved automatiske lagringer, som War Caster-bedriften gør.',
      ],
    },
    automatic: {
      heading: 'Besværgelser afgivet fra et ark',
      points: [
        'Med Auto Add Con. Markør på, kaster en koncentrationsbesværgelse fra et D&D 5e 2014 (OGL) eller 2024 ark tilføjer markøren.',
        'Casterens tokens på den side, de ser, er markeret; hvis der ikke er nogen, er tokens på enhver side.',
        'Kun kort fra GM, en anden Mod eller en af ​​karakterens spillere tæller. At kaste den samme besværgelse igen ændrer intet.',
        'Et D&D 2024-kort, der kun nævner koncentration i sin tekst, såsom War Caster-bedriften, kan starte koncentration, men erstatter aldrig en besværgelse.',
        'D&D 2024-ark skal muligvis bruge Experimental API-serveren. Slå fejlretningstilstand til for at se, hvorfor en besværgelse blev eller ikke blev opdaget.',
      ],
    },
    players: {
      heading: 'Spillere',
      points: [
        'Spillere kan starte og afslutte koncentrationen for tokens, de kontrollerer, og bruge Roll- og Advantage-knapperne på deres egne gemmer.',
        'Med Send Reminder For at indstille til Character, hviskes beskeder til karakterens spillere og til GM.',
      ],
    },
    commands: {
      heading: 'Kommandoer',
      intro: 'Andre Mods, såsom ScriptCards, kan også sende disse kommandoer.',
      colCommand: 'Kommando',
      colDesc: 'Hvad den gør',
    },
    settings: {
      heading: 'Indstillinger',
      intro:
        "Skift indstillinger med knapperne på indstillingskortet eller med config <key>|<value>. Nogle kan også indstilles på Mod's side.",
      colKey: 'Nøgle',
      colName: 'Navn',
      colDesc: 'Hvad den gør',
    },
    upgrading: {
      heading: 'Opgradering fra version 1.0',
      points: [
        'Indstillinger, fordelslisten og hver kommando fortsætter med at fungere.',
        'Beskeder siger nu, hvornår koncentrationen ophører, og på hvilken besværgelse.',
        'Poletter, der allerede bærer markøren, samles op ved opstart.',
      ],
    },
    troubleshooting: {
      heading: 'Fejlfinding',
      points: [
        "Ingen lagring, når hitpoint falder: Tjek, at tokenet har markøren, og at HP Bar er den bjælke, du har ændret. Ændringer foretaget af andre Mods gennem API'et rejser ikke begivenheder, så de bliver ikke set.",
        'Modifikatoren er 0: Tjek bonusattributten mod karakterens ark.',
        'Besværgelser, der kastes fra arket, registreres ikke: Aktiver Fejlretningstilstand, cast trylleformularen igen, og læs API-konsollen.',
        'To tegn deler et navn: Detektion bruger det første match. Giv karakterer unikke navne.',
      ],
    },
    languages: {
      heading: 'Sprog',
      body: 'Koncentration er oversat til sprogene nedenfor. Vælg en med sprogindstillingen.',
      colCode: 'Kode',
      colName: 'Sprog',
      colNative: 'Indfødt navn',
    },
    credits: {
      heading: 'Credits',
      original: 'Original Mod af',
      maintainer: 'Vedligeholdes af',
      support: 'Rapporter fejl og ideer på Roll20 Mod-forummet eller på GitHub.',
    },
    footer: 'Knapper for hver handling er i "{deck}" uddelingsark.',
  },
};

export default TRANSLATION;
