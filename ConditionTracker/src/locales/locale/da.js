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
    Charmed: "Charmet",
    Frightened: "Skræmt",
    Incapacitated: "Ukampdygtig",
    Invisible: "Usynlig",
    Paralyzed: "Paralyseret",
    Petrified: "Forstenet",
    Unconscious: "Bevidstløs",
    Dazed: "Fortumlet",
    Deafened: "Døvet",
    Dominated: "Domineret",
    Dying: "Døende",
    Immobilized: "Immobiliseret",
    Marked: "Mærket",
    Slowed: "Bremset",
    Weakened: "Svækket",
    Confused: "Forvirret",
    Cowering: "Sammenkuende",
    Dazzled: "Blændet",
    Disabled: "Handicappet",
    Exhausted: "Udmattet",
    Fascinated: "Fascineret",
    Fatigued: "Træt",
    "Flat-Footed": "Fladfodet",
    Helpless: "Hjælpeløs",
    Nauseated: "Kvalme",
    Panicked: "Panik",
    Pinned: "Fastgjort",
    Shaken: "Rystet",
    Sickened: "Syg",
    Staggered: "Forskudt",
    Clumsy: "Klodset",
    Concealed: "Skjult",
    Controlled: "Kontrolleret",
    Doomed: "Dømt",
    Drained: "Drænet",
    Encumbered: "Behæftet",
    Enfeebled: "Svækket",
    Fleeing: "Flygter",
    Grabbed: "Tog fat",
    Hidden: "Skjult",
    "Off-Guard": "Off-guard",
    Quickened: "Hurtiget",
    Stupefied: "bedøvet",
    Undetected: "Uopdaget",
    Wounded: "Sårede",
    Asleep: "Søvn",
    Bleeding: "Blødende",
    Burning: "Brændende",
    Dead: "Død",
    "Off-Kilter": "Off-Kilter",
    "Off-Target": "Uden for mål",
    Overburdened: "Overbebyrdet",
    Stable: "Stabil",
    "Bleeding Out": "Bløder ud",
    Bound: "Indbundet",
    Distracted: "Distraheret",
    Berserk: "Bersærk",
    "Indefinite Insanity": "Ubestemt sindssyge",
    Injured: "Skadet",
    Mania: "Mani",
    Phobia: "Fobi",
    "Seriously Wounded": "Alvorligt såret",
    "Temporary Insanity": "Midlertidig sindssyge",
    Ablaze: "I flammer",
    Broken: "Ødelagt",
    Surprised: "Overrasket",
    Bleed: "Bløde",
    "Energy Drained": "Energi drænet",
    Entangled: "Indviklet",
    Fear: "Frygt",
    Hampered: "Hæmmet",
    "Ongoing Damage": "Løbende skade",
    Vulnerable: "Sårbar",
    Diseased: "Syg",
    Held: "Afholdt",
    Compelled: "Tvunget",
    Impaired: "Svækket",
    Panicking: "Panik",
    Disoriented: "Desorienteret",
    Ensnared: "Fanget",
    Strained: "Anstrengt",
    Afraid: "Bange",
    Angry: "Vred",
    Corrupted: "Ødelagt",
    Harmed: "Skadet",
    Hungry: "Sulten",
    Infected: "Inficeret",
    Isolated: "Isoleret",
    "Blood Bound": "Blod bundet",
    Entranced: "Indtrådt",
    Frenzied: "Frenzied",
    Torpor: "Torpor",
    "Knocked Down": "Slået ned",
    Paradox: "Paradoks",
    "Willpower Spent": "Viljestyrke brugt",
    Bedlam: "Bedlam",
    "Chimera-Touched": "Kimær-rørt",
    "Mortally Wounded": "Dødeligt såret",
    Insane: "Sindssyg",
    Debilitated: "Afkræftet",
    Deprived: "Frataget",
    Shocked: "Chokeret",
    Intoxicated: "Beruset",
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
      gameSystem: "Spil system",
      duration: "Varighed",
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
      reinstallMacros: "Geninstaller makro",
      reinstallHandout: "Geninstaller handout",
      showHelp: "Vis hjælp",
      reorderConditions: "Omarranger tilstandsrækker",
      reportToken: "Rapporter Token-betingelser",
      savedEffects: "Gemte effekter",
      addSavedEffect: "Tilføj gemt effekt",
      editSaved: "Redigere",
      removeSaved: "Fjerne",
      promoteSaved: "Føj til Turn Tracker",
      snoozeSaved: "Snooze",
      clearSnooze: "Ryd Snooze",
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
      zeroHp: "{name} — 0 HK",
      moveToken: "{name} — Flyt token?",
      scriptReady: "Script klar",
      conditionReorder: "Turrækkefølge ændret",
      tokenReport: "Token tilstandsrapport",
      savedEffects: "Gemte effekter",
      savedAdd: "Tilføj gemt effekt",
      savedEdit: "Rediger gemt effekt",
      savedRemoved: "Gemt effekt er fjernet",
      savedPromoted: "Føj til Turn Tracker",
      savedSnoozed: "Påmindelse udsat",
      savedSnoozeCleared: "Snooze ryddet",
      hiddenEffects: "Skjulte effekter — {name}",
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
      appliedTo: "Betingelser, der gælder for",
      appliedBy: "Betingelser anvendt af",
      savedEffectsFor: "Gemte effekter til {name}",
      visibility: "Sigtbarhed",
      snoozeOptions: "Snooze-påmindelse",
      promoteOptions: "Fremme til Turn Tracker",
      editActions: "Rediger handlinger",
    },
    msg: {
      noActive: "Ingen aktive tilstande spores.",
      configReset: "Konfiguration nulstillet til modstandarder.",
      unknownConfig:
        "Ukendt konfigurationsindstilling. Brug --config for at se understøttede indstillinger.",
      macroReinstalled:
        "Makroerne {wizard}, {multiTarget}, {reportToken}, {saved} og {classify} er geninstalleret for alle nuværende GM-spillere.",
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
      tokenRefNotFound:
        '{role} token "{value}" kunne ikke findes af id, tokennavn eller tegnnavn.',
      tokenRefAmbiguous:
        '{role} token "{value}" matchede flere tokens: {matches}. Brug et token-id eller et mere specifikt navn til at tvetydige.',
      invalidGameSystem:
        "Ugyldigt spilsystem. Brug --config gameSystem &lt;id&gt;. Understøttede systemer:",
      gameSystemSet:
        "Spilsystemet er indstillet til {system}. Markører er blevet nulstillet til systemstandarder.",
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
      noTokensSelectedReport:
        "Vælg mindst et token på tavlen, før du bruger --report-token.",
      noConditionsAppliedTo:
        "{name} har ingen aktive betingelser anvendt på sig.",
      noConditionsAppliedBy:
        "{name} har ingen aktive betingelser anvendt på andre.",
      noSavedEffects: "Ingen gemte effekter gemt for {name}.",
      noTokenSelectedSaved: "Vælg et token på brættet, før du bruger --gemt.",
      savedEffectAdded: "Gemt effekt tilføjet for {name}.",
      savedEffectUpdated: "Gemt effekt opdateret.",
      savedEffectRemoved: "Gemt effekt fjernet.",
      savedEffectNotFound: "Den gemte effekt blev ikke fundet.",
      savedInvalidVisibility:
        "Ugyldig synlighed. Brug offentlig, maskeret eller gm.",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "Effekt føjet til Turn Tracker som offentlig.",
      savedPromotedMasked:
        "Effekt tilføjet til Turn Tracker som maskeret — spillere se: {publicLabel}.",
      savedPromotedGm:
        "Effekten er kun for GM - ingen Turn Tracker-række vil blive oprettet. Påmindelsessystemet vil vise det, når dette token når toppen af ​​turrækkefølgen.",
      savedSnoozed: "Påmindelsen udsat: {scope}.",
      savedSnoozeCleared: "Snooze ryddet.",
      hiddenEffectsReminder: "Skjulte effekter er aktive på {name}.",
      visibilityPublicHint: "fuld etiket synlig for alle",
      visibilityMaskedHint: "vag etiket vist til spillere",
      visibilityGmHint: "Kun GM hvisker, ingen Turn Tracker række",
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
    saved: {
      visibility: {
        public: "Offentlig",
        masked: "Maskeret",
        gm: "Kun GM",
      },
      snooze: {
        thisTurn: "Denne omgang",
        oneRound: "1 runde",
        threeRounds: "3 runder",
        thisCombat: "Denne kamp",
        rounds: "{n} runde(r)",
      },
      field: {
        gmLabel: "GM-mærke",
        publicLabel: "Offentligt mærke",
        visibility: "Sigtbarhed",
        source: "Kilde",
        condition: "Tilstand",
      },
      prompt: {
        enterGmLabel: "Fuld effektbeskrivelse (kun GM)",
        enterPublicLabel: "Uklar etiket vist til spillere",
      },
      snoozed: "slumret",
    },
    classify: {
      title: "Aktørklassificering",
      showTitle: "Klassificeringsdiagnostik",
      showHeading: "Token-klassificeringsdetaljer",
      resultHeading: "Tilsidesættelse Anvendt",
      noSelection: "Vælg mindst ét token på brættet inden brug af --classify.",
      invalidType:
        "Ugyldigt klassificeringstype: {type}. Brug pc, npc, ignored eller auto.",
      set: "{name} → {type} (omfang: {scope})",
      cleared:
        "{name} tilsidesættelse slettet (omfang: {scope}) — automatisk registrering gendannet.",
      setTokenFallback:
        "{name} → {type} (token-tilsidesættelse — intet karakterark tilknyttet).",
      clearedTokenFallback:
        "{name} token-tilsidesættelse slettet — automatisk registrering gendannet.",
      fieldToken: "Token",
      fieldType: "Klassificering",
      fieldSource: "Kilde",
      fieldReason: "Årsag",
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
          "!condition-tracker --rapport-token",
          "Vælg først et eller flere tokens, og kør derefter denne kommando for at få en GM-hvisker med en liste over alle betingelser, der er anvendt på og af hvert valgt token. Også tilgængelig som ConditionTrackerReportToken-makroen.",
        ],
        [
          "!condition-tracker --menu",
          "Åbn hovedmenuen med knapper til at anvende, gennemse eller fjerne tilstande.",
        ],
        [
          "!condition-tracker --classify show",
          "Vælg først et eller flere tokens, og kør derefter denne kommando for at se en diagnostisk hvisken, der viser hver tokens aktørklassifikation, detekteringskilde og årsag. Brug --classify pc|npc|ignored for at tilsidesætte, eller --classify auto for at gendanne automatisk registrering. Også tilgængelig som ConditionTrackerClassify-makroen.",
        ],
        [
          "!condition-tracker --menu",
          "Åbn hovedmenuen til administration med knapper for at anvende, gennemgå eller fjerne betingelser.",
        ],
      ],
    },
    examples: {
      heading: "Makroeksempler for almindelige betingelser",
      intro:
        "Disse er startmakroer, du kan indsætte i en token-handlings- eller chatmakro og derefter udvide efter behov. Navnematching skelner mellem store og små bogstaver; eksakte navne foretrækkes, derefter unikke delvise matches.",
      colMacro: "Makro",
      colEvent: "Fælles begivenhed",
      rows: [
        [
          "!condition-tracker --prompt --condition Gribet",
          "Grib eller tag fat i et mål, og lad guiden bede om kilde, mål og varighed.",
        ],
        [
          "!condition-tracker --prompt --condition Tilbøjelig",
          "Slå en token tilbøjelig med tilstanden allerede valgt.",
        ],
        [
          "!condition-tracker --prompt --condition Forgiftet",
          "Forvælg Forgiftet for giftvirkninger, farer eller giftige angreb.",
        ],
        [
          "!condition-tracker --prompt --condition bedøvet",
          "Forvælg Bedøvet for bedøvelse, stødeffekter og hårde kontroleffekter.",
        ],
        [
          "!condition-tracker --prompt --condition Blændet",
          "Forvælg Blind for blitz, mørke, røg eller synsforstyrrende effekter.",
        ],
        [
          '!condition-tracker --source "Sir Galahad" --target "Goblin Boss" --condition Gribt --duration 1 runde',
          "Anvend direkte med nøjagtige token-/tegnnavne (der skelnes mellem store og små bogstaver).",
        ],
        [
          "!condition-tracker --source galla --target boss --condition Tilbøjelig --duration 1 runde",
          "Anvend direkte med unikke delnavne; hvis flere tokens matcher, beder mod'et om et mere specifikt navn eller token-id.",
        ],
      ],
    },
    commandsRef: {
      heading: "Kommandoreference",
      colFlag: "Flag",
      colDesc: "Beskrivelse",
      rows: [
        ["--hurtig", "Interaktiv trin-for-trin-guide"],
        ["--multimål", "Anvend en tilstand på flere måltoken på én gang"],
        ["--menu", "Vis hovedmenu (tilføj remove for fjernelsesmenu)"],
        [
          "--kilde X --mål Y --betingelse Z",
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
          "--prompt --subjectPromptBypass sand|falsk",
          "Tilsidesæt subjectPromptBypass kun for denne kommando (understøtter også --subject-prompt-bypass)",
        ],
        [
          "-- oprydning",
          "Afstem tilstand — fjern forladte tilstande og tursporing-rækker",
        ],
        [
          "--genbestillingsbetingelser",
          "Flyt betingelsesrækker manuelt bag de tilknyttede tokens i turordenen",
        ],
        ["--geninstaller-makro", "Genopret eller opdater GM-makroerne"],
        [
          "--geninstaller-handout",
          "Genopret eller opdater det lokaliserede hjælpe-handout",
        ],
        [
          "--rapport-token",
          "Hvisk en GM-kun tilstandsrapport for hvert valgt token (betingelser anvendt på og af det)",
        ],
        [
          "--lang &lt;locale&gt;",
          "Udsend denne kommandos meddelelser på en yderligere locale (tosproget tilstand)",
        ],
        [
          "--classify pc|npc|ignored",
          "Tilsidesæt aktørtypen for valgte tokens — vælg token(s) først. Standardomfang er karakter (skriver ct_mod_actor_type-attribut); tilføj --scope token for at gemme i scriptstatus",
        ],
        [
          "--classify auto",
          "Fjern aktørtype-tilsidesættelsen og gendan automatisk registrering for valgte tokens",
        ],
        [
          "--classify show",
          "Hvisker en klassificeringsdiagnostik for hvert valgt token — viser den registrerede type, registreringskilde og årsag",
        ],
        ["--help", "Vis et kort hjælpekort i chatten"],
        [
          "--saved snooze &lt;id&gt; --scope tur|runder|kamp --rounds &lt;n&gt;",
          "Udsæt en påmindelse om gemt effekt for det aktuelle sving, N runder eller denne kamp",
        ],
        [
          "--saved snooze-clear &lt;id&gt;",
          "Ryd en aktiv snooze på en gemt effekt",
        ],
        [
          "--lang &lt;locale&gt;",
          "Udskriv denne kommandos meddelelser i en ekstra lokalitet (tosproget tilstand)",
        ],
        [
          "--classify pc|npc|ignoreret",
          "Tilsidesæt skuespillertypen for valgte tokens – vælg først token(s). Standardomfang er karakter (skriver attributten ct_mod_actor_type); tilføj --scope token til at gemme i scripttilstand i stedet",
        ],
        [
          "--classify automatisk",
          "Fjern tilsidesættelsen af ​​skuespiller-typen, og gendan automatisk detektion for udvalgte tokens",
        ],
        [
          "--classify show",
          "Hvisk en klassifikationsdiagnostik for hvert valgt token — viser den detekterede type, detektionskilden og årsagen",
        ],
        ["--help", "Vis et kort hjælpekort i chatten"],
      ],
    },
    standardConditions: {
      heading: "Standardtilstande (D&amp;D 5e)",
      colCondition: "Tilstand",
      none: "Ingen standardbetingelser defineret for dette spilsystem. Brug den anden tilpassede effekttype til friteksteffekter.",
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
    savedEffects: {
      heading: "Gemte effekter",
      intro:
        "Gemte effekter giver dig mulighed for at gemme langsigtede tilstande uden for Turn Tracker - forbandelser, sygdomme, giftstoffer, skjulte debuffs og andre ikke-kamptilstande. De fortsætter i script-tilstand og kan eventuelt kopieres til Turn Tracker, når kampen begynder.",
      visibility: {
        heading: "Synlighedstilstande",
        rows: [
          [
            "offentlig",
            "Etiketten med fuld effekt er synlig i Turn Tracker og offentlig chat.",
          ],
          [
            "maskeret",
            "En vag offentlig etiket vises til spillere; alle detaljer er kun for GM.",
          ],
          [
            "gm",
            "Ingen Turn Tracker række. Alle detaljer gemmes i tilstanden og hviskes til GM, når det berørte token når toppen af ​​initiativet.",
          ],
        ],
      },
      commands: {
        heading: "Gemte effektkommandoer",
        intro:
          "Alle --gemte kommandoer er kun GM. Vælg et token før du kører --gemt eller --gemt tilføjelse.",
        rows: [
          [
            "!condition-tracker --gemt",
            "Se gemte effekter for det valgte token.",
          ],
          [
            "!condition-tracker --gemte tilføjelse",
            "Start guiden Tilføj-gemt-effekt.",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "Rediger etiketter eller synlighed for en eksisterende gemt effekt.",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "Fjern en gemt effekt permanent.",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "Kopier en gemt effekt til Turn Tracker (offentlig eller maskeret), eller bekræft, at den kun er GM-sporet.",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "Udsæt en GM-påmindelse for denne tur, N runder eller denne kamp.",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "Ryd en aktiv snooze, så påmindelser genoptages med det samme.",
          ],
        ],
      },
      reminders: {
        heading: "GM påmindelser",
        body: "Når en token med gm eller maskerede gemte effekter når toppen af ​​Turn Tracker, modtager GM en hvisken, der viser de skjulte effekter med handlingsknapper. Duplikerede påmindelser inden for samme tur undertrykkes. Brug Snooze-knapperne til at undertrykke påmindelser for en tur, et antal runder eller for resten af ​​den aktuelle kamp.",
      },
    },
    actorClassification: {
      heading: "Aktørklassificering",
      intro:
        "Condition Tracker afgør automatisk, om hvert token er en SK, NPC eller et ignoreret objekt (kortpinde, scenografi, trylleformelskabeloner). Ikke-tilknyttede tokens ignoreres som standard. Brug --classify til at tilsidesætte automatisk registrering for ethvert token.",
      detectionOrder: {
        heading: "Registreringsrækkefølge",
        colStep: "Trin",
        colCheck: "Kontrol",
        colResult: "Resultat",
        rows: [
          [
            "1",
            "Token-tilstandstilsidesættelse (--classify --scope token)",
            "pc / npc / ignoreret",
          ],
          [
            "2",
            "Karakter ct_mod_actor_type-attribut (--classify --scope character)",
            "pc / npc / ignoreret",
          ],
          ["3", "Ikke-tilknyttet token — intet karakterark", "ignoreret"],
          ["4", "Spilsystemsadapter (npc / is_npc attribut)", "pc / npc"],
          [
            "5",
            "Generisk NPC-attributscanning (npc, is_npc, npcflag, sheet_type, character_type)",
            "pc / npc",
          ],
          ["6", "Karakter controlledby-reserve", "pc / npc"],
        ],
      },
      types: {
        heading: "Klassificeringstyper",
        colType: "Type",
        colMeaning: "Betydning",
        rows: [
          [
            "pc",
            "Spillerkarakter — altid inkluderet som SK i guiden og registreringen",
          ],
          ["npc", "Ikke-spillerkarakter — altid inkluderet som NPC"],
          [
            "ignoreret",
            "Vises eller spores aldrig — udelukket fra guidens tokenvælger",
          ],
          [
            "ukendt",
            "Kun automatisk registrering; type kunne ikke bestemmes (behandles som NPC i guiden)",
          ],
        ],
      },
      commands: {
        heading: "Klassificeringskommandoer",
        intro:
          "Vælg et eller flere tokens, inden du kører --classify-kommandoer.",
        rows: [
          [
            "!condition-tracker --klassificere pc",
            "Markere valgte tokens som SK'er (standardomfang: karakter).",
          ],
          [
            "!condition-tracker --klassificer npc",
            "Markere valgte tokens som NPC'er.",
          ],
          [
            "!condition-tracker --classify ignoreret",
            "Udelukkelse af valgte tokens fra al sporing.",
          ],
          [
            "!condition-tracker --klassificere auto",
            "Fjern tilsidesættelse — gendan automatisk registrering.",
          ],
          [
            "!condition-tracker --klassificere show",
            "Vis klassificeringsdiagnostik (type, kilde, årsag) for hvert valgt token.",
          ],
          [
            "!condition-tracker --klassificer pc --scope token",
            "Token-tilsidesættelse gemt i scriptstatus — nyttigt for ikke-tilknyttede tokens.",
          ],
          [
            "!condition-tracker --klassificer pc --scope karakter",
            "Karakter-tilsidesættelse skrevet til ct_mod_actor_type-attribut — gælder for alle tokens med samme karakterark.",
          ],
        ],
      },
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
          "sandt / falsk",
          "Vis korte ikonkoder (f.eks. [G]) i stedet for emoji i tursporing-rækker",
        ],
        [
          "subjectPromptBypass",
          "sandt / falsk",
          "Spring det valgfrie subjekttrin over for Besværgelse / Evne / Andre effekter",
        ],
        [
          "suppressPublicChat",
          "sandt / falsk",
          "Undertryk alle offentlige chatbeskeder (anvend og fjern beskeder). GM-hvisker påvirkes ikke.",
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
        [
          "markør",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Tilsidesæt den statusmarkør, der bruges til en specifik tilstand (f.eks. markør Gribt=greb)",
        ],
      ],
    },
    gameSystems: {
      heading: "Understøttede spilsystemer",
      intro:
        "Brug !condition-tracker --config gameSystem &lt;id&gt; til at skifte system. Skift nulstiller token-markørtilknytninger til det nye systems standardindstillinger. Dine aktive forhold er bevaret.",
      colId: "System-id",
      colName: "Spil system",
    },
    defaultMarkers: {
      heading: "Standardstatusmarkører",
      colCondition: "Tilstand",
      colMarker: "Markørnavn",
      none: "Der er ikke defineret nogen standardmarkører for dette spilsystem.",
    },
    availableLocales: {
      heading: "Tilgængelige oversættelser",
      intro:
        "Brug sprogkonfigurationsindstillingen til at indstille chatbeskeder og hjælpe-handouttet til en understøttet locale. Korte aliaser accepteres også for en, zh og pt.",
      colLocale: "Lokalitet",
      colLanguage: "Sprog",
      colFile: "Oversættelsesfil",
    },
  },
};

export default TRANSLATION;
