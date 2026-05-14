const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "fastholdt",
      verb: "fastholder",
    },
    Restrained: {
      past: "bundet",
      verb: "binder",
    },
    Prone: {
      past: "væltet omkuld",
      verb: "vælter",
      suffix: "omkuld",
    },
    Poisoned: {
      past: "forgiftet",
      verb: "forgifter",
    },
    Stunned: {
      past: "lammet",
      verb: "lammer",
    },
    Blinded: {
      past: "blindet",
      verb: "blinder",
    },
    Charmed: {
      past: "charmet",
      verb: "charmerer",
    },
    Frightened: {
      past: "skræmt",
      verb: "skræmmer",
    },
    Incapacitated: {
      past: "ukampdygtig",
      verb: "gør",
      suffix: "ukampdygtig",
    },
    Invisible: {
      past: "usynlig",
      verb: "gør",
      suffix: "usynlig",
    },
    Paralyzed: {
      past: "paralyseret",
      verb: "paralyserer",
    },
    Petrified: {
      past: "forstenet",
      verb: "forstener",
    },
    Unconscious: {
      past: "bevidstløs",
      verb: "gør",
      suffix: "bevidstløs",
    },
    Spell: {
      past: "påvirket af en besværgelse",
      verb: "kaster en besværgelse på",
    },
    Ability: {
      past: "påvirket af en evne",
      verb: "bruger en evne på",
    },
    Advantage: {
      past: "har fordel",
      verb: "giver fordel til",
      noBy: true,
    },
    Disadvantage: {
      past: "har ulempe",
      verb: "giver ulempe til",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Fastholdt",
    Restrained: "Bundet",
    Prone: "Omkuld",
    Poisoned: "Forgiftet",
    Stunned: "Lammet",
    Blinded: "Blindet",
    Charmed: "Charmed",
    Frightened: "Skræmt",
    Incapacitated: "Ukampdygtig",
    Invisible: "Usynlig",
    Paralyzed: "Paralyseret",
    Petrified: "Forstenet",
    Unconscious: "Bevidstløs",
    Spell: "Besværgelse",
    Ability: "Evne",
    Advantage: "Fordel",
    Disadvantage: "Ulempe",
    Other: "Andet",
  },
  templates: {
    display: {
      custom: "{emoji} {target} påvirket af {effect} ({source})",
      advantage: "{emoji} {source} har fordel mod {target}{subject}",
      disadvantage: "{emoji} {source} har ulempe mod {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} er {past}",
      standard: "{emoji} {target} {past} af {source}",
    },
    apply: {
      custom: "{source} påfører {effect} på {target}.",
      advantage: "{source} har fordel mod {target}{subject}.",
      disadvantage: "{source} har ulempe mod {target}{subject}.",
      self: "{target} er {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} er ikke længere påvirket af {effect}.",
      advantage: "{source} har ikke længere fordel mod {target}{subject}.",
      disadvantage: "{source} har ikke længere ulempe mod {target}{subject}.",
      noBy: "{target} er ikke længere {past}.",
      self: "{target} er ikke længere {past}.",
      standard: "{target} er ikke længere {past} af {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Vælg tilstand",
      selectSource: "Vælg kildetoken",
      selectTarget: "Vælg måltoken",
      selectSubject: "Vælg subjekt",
      selectDuration: "Vælg varighed",
      confirmTargetTitle: "Bekræft målliste",
      applyEffectTitle: "Anvend {condition}-effekt",
      noTokens: "Ingen navngivne tokens fundet på den aktive side.",
      confirmIntro: "Følgende tokens vil modtage tilstanden:",
      confirmBtn: "Bekræft målliste",
      enterDetails: "Indtast effektdetaljer",
      noneBtn: "Ingen",
      noneOrSourceBtn: "Ingen eller anvend på kilde",
      subjectDesc: "Vælg hvem eller hvad der leverer effekten.",
      sourceDesc:
        "Vælg den skabning, der opretter/genererer tilstanden eller effekten.",
      targetDesc:
        "Vælg den skabning, der vil modtage tilstanden eller effekten.",
      otherText: "Brugerdefineret tilstandstekst",
      effectDetails: "{condition}-detaljer",
    },
    col: {
      players: "Spillere",
      npcs: "NPC'er",
      conditions: "Tilstande",
      customEffects: "Brugerdefinerede effekter",
      permanentTurnEnd: "Permanent / Rundeslutten",
      rounds: "Runder",
      command: "Kommando",
      result: "Resultat",
      field: "Felt",
      value: "Værdi",
      option: "Indstilling",
      condition: "Tilstand",
      marker: "Markør",
      item: "Element",
      removed: "Fjernet",
      details: "Detaljer",
      description: "Beskrivelse",
      scenario: "Scenarie",
    },
    dur: {
      untilRemoved: "Indtil fjernet",
      endOfTargetTurn: "Slutningen af målets næste tur",
      endOfSourceTurn: "Slutningen af kildens næste tur",
      round1: "1 runde",
      round2: "2 runder",
      round3: "3 runder",
      round10: "10 runder",
      custom: "Brugerdefineret",
      customPrompt: "Antal runder",
      untilRemovedDisplay: "Indtil fjernet",
      turnsRemaining: "{n} sporing(er) af turslut tilbage",
    },
    btn: {
      openWizard: "Åbn guide",
      openMultiTarget: "Åbn guide til flere mål",
      openRemovalList: "Åbn fjernelsesliste",
      showConfig: "Vis konfiguration",
      runCleanup: "Kør oprydning",
      reinstallMacro: "Geninstaller makro",
      reinstallHandout: "Geninstaller handout",
      showHelp: "Vis hjælp",
      reorderConditions: "Omarranger tilstandsrækker",
    },
    title: {
      menu: "Menu",
      removalMenu: "Condition Tracker — fjernelse",
      config: "Konfiguration",
      configTracker: "Condition Tracker — konfiguration",
      help: "Hjælp",
      applied: "Anvendt",
      removed: "Tilstand fjernet",
      cleanup: "Oprydning fuldført",
      macroReinstalled: "Makro geninstalleret",
      handoutReinstalled: "Handout geninstalleret",
      warning: "Advarsel",
      error: "Fejl",
      turnOrder: "Turrækkefølge",
      noConditions: "Ingen tilstande",
      tokenMoved: "Token flyttet",
      markedDead: "Markeret som død",
      zeroHp: "{name} — 0 HP",
      moveToken: "{name} — Flyt token?",
      scriptReady: "Script klar",
      conditionReorder: "Turrækkefølge ændret",
    },
    heading: {
      quickActions: "Hurtighandlinger",
      settings: "Indstillinger",
      markerMappings: "Markørtilknytninger",
      result: "Resultat",
      info: "Info",
      commandOptions: "Kommandoindstillinger",
      promptUi: "Guide-brugerflade",
      examples: "Eksempler",
      summary: "Oversigt",
    },
    msg: {
      noActive: "Ingen aktive tilstande spores.",
      configReset: "Konfiguration nulstillet til modstandarder.",
      unknownConfig:
        "Ukendt konfigurationsindstilling. Brug --config for at se understøttede indstillinger.",
      macroReinstalled:
        "Makroerne {wizard} og {multiTarget} er geninstalleret for alle nuværende GM-spillere.",
      handoutReinstalled: "Hjælpe-handouttet {handout} er geninstalleret.",
      duplicate:
        "Den præcise kombination af kilde, subjekt, mål, tilstand og brugerdefineret tekst er allerede aktiv.",
      noTargets: "Ingen måltoken angivet til multi-mål-anvendelse.",
      noSelection:
        "Vælg mindst ét token på brættet, før du bruger --multi-target.",
      invalidIds: "Ingen gyldige token-id'er fundet i den aktuelle markering.",
      reSelectTokens:
        "Ingen af de oprindeligt valgte tokens kunne findes. Vælg tokens igen og prøv på ny.",
      conditionNotFound: "Tilstands-id blev ikke fundet.",
      gmOnly: "Condition Tracker-kommandoer er kun for GM'er.",
      commandFailed:
        "Kommandoen kunne ikke gennemføres sikkert. Tjek API-konsollen for detaljer.",
      sourceTokenNotFound: "Kildetoken kunne ikke findes.",
      targetTokenNotFound: "Måltoken kunne ikke findes.",
      subjectTokenNotFound: "Subjekttoken kunne ikke findes.",
      invalidCondition:
        "Tilstanden skal være en af de foruddefinerede tilstande eller Andet.",
      subjectOnlyCustom:
        "--subject er kun gyldigt for Besværgelse, Evne, Fordel, Ulempe og Andet.",
      subjectBypassInvalid:
        "--subjectPromptBypass forventer true eller false, når en værdi angives.",
      customDetailsRequired:
        "{condition}-detaljer er påkrævet. Brug --other til at angive dem.",
      markerConfigFormat:
        "Markørkonfigurationsformat: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Markørkonfiguration kræver et foruddefineret tilstandsnavn.",
      markerNameRequired: "Markørkonfiguration kræver et ikke-tomt markørnavn.",
      markerSet: "{condition}-markør sat til {marker}.",
      healthBarSet: "Helsebjælke sat til {bar}.",
      boolSet: "{key} sat til {value}.",
      expectedBoolean: "Forventede true eller false.",
      invalidHealthBar:
        "Helsebjælken skal være bar1_value, bar2_value eller bar3_value.",
      markersDisabled: "Markører er deaktiverede.",
      noMarkerConfigured: "Ingen markør er konfigureret for denne tilstand.",
      markerApplied: "Markør anvendt: {marker}",
      markerPresent: "Markør allerede til stede: {marker}",
      langSet: "Sprog sat til {locale}.",
      invalidLocale: "Ugyldig locale. Understøttede locales: {locales}.",
      otherDurationRequiresRounds:
        "Anden varighed kræver et numerisk rundeantal, for eksempel --duration 5 rounds.",
      invalidDuration:
        "Varighed skal være Indtil fjernet, en turslut-indstilling eller et positivt rundeantal.",
      zeroHpNoConditions: "{name} har nået 0 HP og har ingen aktive tilstande.",
      zeroHpConditions:
        "{name} har nået 0 HP. Vælg tilstande, der skal fjernes:",
      removeAllBtn: "Fjern alle tilstande for {name}",
      markIncapacitated: "Markér som ukampdygtig",
      removeFromTurnOrder: "Fjern fra turrækkefølge",
      alreadyIncapacitated: "{name} er allerede ukampdygtig.",
      tokenRemovedFromTurn: "{name} er fjernet fra turrækkefølgen.",
      tokenNotInTurn: "{name} blev ikke fundet i turrækkefølgen.",
      moveTokenPrompt:
        "Flyt {name} til kortlaget, så det forbliver synligt men ikke forstyrrer andre tokens?",
      moveTokenBtn: "Flyt {name} til kortlaget",
      tokenMoved: "{name} er blevet flyttet til kortlaget.",
      tokenNotFound: "Token ikke fundet.",
      noActiveConditions: "{name} har ingen aktive tilstande at fjerne.",
      deadNoConditions:
        "{name} blev markeret som død. Ingen tilstande var aktive.",
      scriptReady: "{name} er aktiv, og du bruger version {version}.",
      reachedZeroHp: "{name} nåede 0 HP",
      manuallyRemoved: "manuelt fjernet",
      durationExpired: "varighed udløbet",
      markedAsDead: "{name} blev markeret som død",
      conditionReorder:
        "Turrækkefølgen ændrede sig, og {count} sporet tilstandsrække(r) kan nu være fejlplaceret. Klik nedenfor for at gendanne dem efter deres tildelte tokens.",
      conditionsReordered:
        "Tilstandsrækker er omplaceret efter deres tildelte tokens.",
    },
    removal: {
      conditionField: "Tilstand",
      reasonField: "Årsag",
      turnRowField: "Tursporing-række",
      markerField: "Markør",
      notConfigured: "Ikke konfigureret",
      markerRemoved: "Fjernet ({marker})",
      markerRetained: "Beholdt ({marker})",
      rowRemoved: "Fjernet",
      rowMissing: "Allerede manglende",
      manualReason: "Manuel fjernelse",
    },
    cleanup: {
      orphaned: "Forladte tilstandsposter",
      stale: "Forældede tilstandsposter",
      orphanedRows: "Forladte tursporing-rækker",
      unusedMarkers: "Ubrugte markører",
    },
    apply: {
      turnAppended:
        "Mål var ikke i turrækkefølgen; tilstandsrække tilføjet til sidst.",
      turnInserted: "Tilstandsrække indsat under måltoken.",
    },
  },
  handout: {
    versionLabel: "Version",
    subtitle: "D&D 5e-statuseffektstyring",
    footerNote:
      "Dette handout oprettes og opdateres automatisk, hver gang scriptet indlæses.",
    overview: {
      heading: "Oversigt",
      body: "Condition Tracker styrer D&D 5e-statustilstande og brugerdefinerede effekter som mærkede rækker i Roll20's tursporing. Anvend tilstande på tokens, spor varigheder efter initiativrækkefølge, og fjern automatisk udløbne effekter, når en tur slutter. Alle kommandoer er kun tilgængelige for GM'en og kan udløses fra chatten eller via de installerede makroer.",
    },
    quickStart: {
      heading: "Hurtig start",
      colCommand: "Kommando",
      colDesc: "Beskrivelse",
      rows: [
        [
          "!condition-tracker --prompt",
          "Trin-for-trin-guide — vælg tilstand, tokens og varighed interaktivt. Også tilgængelig som makroen ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Anvend én tilstand på flere tokens samtidig. Også tilgængelig som makroen ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Åbn hovedmenuen med knapper til at anvende, gennemse eller fjerne tilstande.",
        ],
      ],
    },
    commandsRef: {
      heading: "Kommandoreference",
      colFlag: "Flag",
      colDesc: "Beskrivelse",
      rows: [
        ["--prompt", "Interaktiv trin-for-trin-guide"],
        ["--multi-target", "Anvend en tilstand på flere måltoken på én gang"],
        ["--menu", "Vis hovedmenu (tilføj remove for fjernelsesmenu)"],
        [
          "--source X --target Y --condition Z",
          "Anvend en tilstand direkte uden guiden",
        ],
        [
          "--duration &lt;værdi&gt;",
          "Varighed for direkte anvendelse (f.eks. 2 rounds)",
        ],
        [
          "--other &lt;tekst&gt;",
          "Brugerdefineret tekst til Besværgelse / Evne / Anden effekttype",
        ],
        [
          "--remove &lt;tilstands-id&gt;",
          "Fjern en bestemt tilstand via dens unikke id",
        ],
        [
          "--config &lt;indstilling&gt; &lt;værdi&gt;",
          "Juster konfigurationsindstillinger (se afsnittet Konfiguration nedenfor)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Tilsidesæt subjectPromptBypass kun for denne kommando (understøtter også --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Afstem tilstand — fjern forladte tilstande og tursporing-rækker",
        ],
        [
          "--reorder-conditions",
          "Flyt betingelsesrækker manuelt bag de tilknyttede tokens i turordenen",
        ],
        ["--reinstall-macro", "Genopret eller opdater GM-makroerne"],
        [
          "--reinstall-handout",
          "Genopret eller opdater det lokaliserede hjælpe-handout",
        ],
        [
          "--lang &lt;locale&gt;",
          "Udsend denne kommandos meddelelser på en yderligere locale (tosproget tilstand)",
        ],
        ["--help", "Vis et kort hjælpekort i chatten"],
      ],
    },
    standardConditions: {
      heading: "Standardtilstande (D&amp;D 5e)",
      colCondition: "Tilstand",
    },
    customEffects: {
      heading: "Brugerdefinerede effekttyper",
      colType: "Type",
      colNotes: "Noter",
      rows: [
        [
          "🔮 Besværgelse",
          "Spor en navngiven besværgelseseffekt — du vil blive bedt om besværgelsens navn",
        ],
        [
          "🎯 Evne",
          "Spor en navngiven klasse- eller raceevne — du vil blive bedt om evnens navn",
        ],
        [
          "🍀 Fordel",
          "Registrer fordel givet fra ét token til et andet; grupperet med kilden i initiativet",
        ],
        [
          "⬇️ Ulempe",
          "Registrer pålagt ulempe; grupperet med kilden i initiativet",
        ],
        [
          "📝 Andet",
          "Friform brugerdefineret etiket — du vil blive bedt om en beskrivelse",
        ],
      ],
    },
    durationOptions: {
      heading: "Varighedsindstillinger",
      intro:
        "Det resterende antal vises i pr-kolonnen i tursporing og nedsættes, når ankertokenets tur slutter.",
      colOption: "Indstilling",
      colBehaviour: "Adfærd",
      rows: [
        [
          "Indtil fjernet",
          "Permanent — skal fjernes manuelt via menuen eller --remove",
        ],
        [
          "Slutningen af målets næste tur",
          "Udløber, når måltoken's næste tur slutter i initiativet",
        ],
        [
          "Slutningen af kildens næste tur",
          "Udløber, når kildetoken's næste tur slutter i initiativet",
        ],
        [
          "1 / 2 / 3 / 10 runder",
          "Fast nedtælling; ét trin per ankertokens turslut",
        ],
      ],
    },
    configuration: {
      heading: "Konfiguration",
      intro:
        "Brug !condition-tracker --config &lt;indstilling&gt; &lt;værdi&gt; eller knappen Konfiguration i hovedmenuen.",
      colOption: "Indstilling",
      colValues: "Værdier",
      colDesc: "Beskrivelse",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Anvend Roll20-statusmarkører på tokens, når en tilstand tilføjes",
        ],
        [
          "useIcons",
          "true / false",
          "Vis korte ikonkoder (f.eks. [G]) i stedet for emoji i tursporing-rækker",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Spring det valgfrie subjekttrin over for Besværgelse / Evne / Andre effekter",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Tokenbjælke der overvåges; når den når 0, bliver GM bedt om at rydde op i tilstande",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Outputsprog for chatbeskeder og hjælpe-handouttet",
        ],
        [
          "marker",
          "&lt;Tilstand&gt;=&lt;markørnavn&gt;",
          "Tilsidesæt statusmarkøren for en bestemt tilstand (f.eks. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Standardstatusmarkører",
      colCondition: "Tilstand",
      colMarker: "Markørnavn",
    },
    availableLocales: {
      heading: "Tilgængelige oversættelser",
      intro:
        "Brug sprogkonfigurationsindstillingen til at indstille chatbeskeder og hjælpe-handouttet til en understøttet locale. Korte aliaser accepteres også for en, zh og pt.",
      colLocale: "Locale",
      colLanguage: "Sprog",
      colFile: "Oversættelsesfil",
    },
  },
};

export default TRANSLATION;
