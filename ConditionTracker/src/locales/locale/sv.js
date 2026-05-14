const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "fasthållen",
      verb: "håller fast",
    },
    Restrained: {
      past: "hindrad",
      verb: "hindrar",
    },
    Prone: {
      past: "liggande",
      verb: "slår",
      suffix: "omkull",
    },
    Poisoned: {
      past: "förgiftad",
      verb: "förgiftar",
    },
    Stunned: {
      past: "omtöcknad",
      verb: "omtöcknar",
    },
    Blinded: {
      past: "förblindad",
      verb: "förblindar",
    },
    Charmed: {
      past: "charmad",
      verb: "charmar",
    },
    Frightened: {
      past: "skrämd",
      verb: "skrämmer",
    },
    Incapacitated: {
      past: "oskadliggjord",
      verb: "oskadliggör",
    },
    Invisible: {
      past: "osynlig",
      verb: "gör",
      suffix: "osynlig",
    },
    Paralyzed: {
      past: "paralyserad",
      verb: "paralyserar",
    },
    Petrified: {
      past: "förstenad",
      verb: "förstenar",
    },
    Unconscious: {
      past: "medvetslös",
      verb: "gör",
      suffix: "medvetslös",
    },
    Spell: {
      past: "påverkad av en besvärjelse",
      verb: "kastar en besvärjelse på",
    },
    Ability: {
      past: "påverkad av en förmåga",
      verb: "använder en förmåga på",
    },
    Advantage: {
      past: "har fördel",
      verb: "ger fördel till",
      noBy: true,
    },
    Disadvantage: {
      past: "har nackdel",
      verb: "ger nackdel till",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Fasthållen",
    Restrained: "Hindrad",
    Prone: "Liggande",
    Poisoned: "Förgiftad",
    Stunned: "Omtöcknad",
    Blinded: "Förblindad",
    Charmed: "Charmad",
    Frightened: "Skrämd",
    Incapacitated: "Oskadliggjord",
    Invisible: "Osynlig",
    Paralyzed: "Paralyserad",
    Petrified: "Förstenad",
    Unconscious: "Medvetslös",
    Spell: "Besvärjelse",
    Ability: "Förmåga",
    Advantage: "Fördel",
    Disadvantage: "Nackdel",
    Other: "Annat",
  },
  templates: {
    display: {
      custom: "{emoji} {target} påverkad av {effect} ({source})",
      advantage: "{emoji} {source} har fördel mot {target}{subject}",
      disadvantage: "{emoji} {source} har nackdel mot {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} är {past}",
      standard: "{emoji} {target} {past} av {source}",
    },
    apply: {
      custom: "{source} applicerar {effect} på {target}.",
      advantage: "{source} har fördel mot {target}{subject}.",
      disadvantage: "{source} har nackdel mot {target}{subject}.",
      self: "{target} är {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} är inte längre påverkad av {effect}.",
      advantage: "{source} har inte längre fördel mot {target}{subject}.",
      disadvantage: "{source} har inte längre nackdel mot {target}{subject}.",
      noBy: "{target} är inte längre {past}.",
      self: "{target} är inte längre {past}.",
      standard: "{target} är inte längre {past} av {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Välj tillstånd",
      selectSource: "Välj källtoken",
      selectTarget: "Välj måltoken",
      selectSubject: "Välj subjekt",
      selectDuration: "Välj varaktighet",
      confirmTargetTitle: "Bekräfta mållista",
      applyEffectTitle: "Applicera {condition}-effekt",
      noTokens: "Inga namngivna tokens hittades på den aktiva sidan.",
      confirmIntro: "Följande tokens kommer att få tillståndet:",
      confirmBtn: "Bekräfta mållista",
      enterDetails: "Ange effektdetaljer",
      noneBtn: "Ingen",
      noneOrSourceBtn: "Ingen eller applicera på källa",
      subjectDesc: "Välj vem eller vad som levererar effekten.",
      sourceDesc:
        "Välj det väsen som skapar/genererar tillståndet eller effekten.",
      targetDesc:
        "Välj det väsen som kommer att ta emot tillståndet eller effekten.",
      otherText: "Anpassad tillståndstext",
      effectDetails: "{condition}-detaljer",
    },
    col: {
      players: "Spelare",
      npcs: "NPC:er",
      conditions: "Tillstånd",
      customEffects: "Anpassade effekter",
      permanentTurnEnd: "Permanent / Rundslutet",
      rounds: "Rundor",
      command: "Kommando",
      result: "Resultat",
      field: "Fält",
      value: "Värde",
      option: "Alternativ",
      condition: "Tillstånd",
      marker: "Markör",
      item: "Post",
      removed: "Borttagen",
      details: "Detaljer",
      description: "Beskrivning",
      scenario: "Scenario",
    },
    dur: {
      untilRemoved: "Tills borttagen",
      endOfTargetTurn: "Slutet av målets nästa tur",
      endOfSourceTurn: "Slutet av källans nästa tur",
      round1: "1 runda",
      round2: "2 rundor",
      round3: "3 rundor",
      round10: "10 rundor",
      custom: "Anpassad",
      customPrompt: "Antal rundor",
      untilRemovedDisplay: "Tills borttagen",
      turnsRemaining: "{n} spårad(e) turslut återstår",
    },
    btn: {
      openWizard: "Öppna guide",
      openMultiTarget: "Öppna guide för flera mål",
      openRemovalList: "Öppna borttagningslista",
      showConfig: "Visa konfiguration",
      runCleanup: "Kör rensning",
      reinstallMacro: "Installera om makro",
      reinstallHandout: "Installera om handout",
      showHelp: "Visa hjälp",
      reorderConditions: "Ordna om tillståndsrader",
    },
    title: {
      menu: "Meny",
      removalMenu: "Condition Tracker — borttagning",
      config: "Konfiguration",
      configTracker: "Condition Tracker — konfiguration",
      help: "Hjälp",
      applied: "Applicerad",
      removed: "Tillstånd borttaget",
      cleanup: "Rensning slutförd",
      macroReinstalled: "Makro ominstallerat",
      handoutReinstalled: "Handout ominstallerat",
      warning: "Varning",
      error: "Fel",
      turnOrder: "Turordning",
      noConditions: "Inga tillstånd",
      tokenMoved: "Token flyttad",
      markedDead: "Markerad som död",
      zeroHp: "{name} — 0 HP",
      moveToken: "{name} — Flytta token?",
      scriptReady: "Skript redo",
      conditionReorder: "Turordning ändrad",
    },
    heading: {
      quickActions: "Snabbåtgärder",
      settings: "Inställningar",
      markerMappings: "Markörsmappningar",
      result: "Resultat",
      info: "Info",
      commandOptions: "Kommandoalternativ",
      promptUi: "Guide-gränssnitt",
      examples: "Exempel",
      summary: "Sammanfattning",
    },
    msg: {
      noActive: "Inga aktiva tillstånd spåras.",
      configReset: "Konfigurationen återställd till standardvärden.",
      unknownConfig:
        "Okänt konfigurationsalternativ. Använd --config för att visa stödda inställningar.",
      macroReinstalled:
        "Makrona {wizard} och {multiTarget} har installerats om för alla nuvarande GM-spelare.",
      handoutReinstalled: "Hjälp-handouten {handout} har installerats om.",
      duplicate:
        "Exakt den kombinationen av källa, subjekt, mål, tillstånd och anpassad text är redan aktiv.",
      noTargets: "Inga måltoken angivna för tillämpning på flera mål.",
      noSelection:
        "Välj minst en token på spelplanen innan du använder --multi-target.",
      invalidIds: "Inga giltiga token-id:n hittades i det aktuella urvalet.",
      reSelectTokens:
        "Ingen av de ursprungligen valda tokenerna kunde hittas. Välj tokens igen och försök på nytt.",
      conditionNotFound: "Tillstånds-id hittades inte.",
      gmOnly: "Condition Tracker-kommandon är endast för GM:ar.",
      commandFailed:
        "Kommandot kunde inte slutföras säkert. Kontrollera API-konsolen för detaljer.",
      sourceTokenNotFound: "Källtoken kunde inte hittas.",
      targetTokenNotFound: "Måltoken kunde inte hittas.",
      subjectTokenNotFound: "Subjekttoken kunde inte hittas.",
      invalidCondition:
        "Tillståndet måste vara ett av de fördefinierade tillstånden eller Annat.",
      subjectOnlyCustom:
        "--subject är endast giltigt för Besvärjelse, Förmåga, Fördel, Nackdel och Annat.",
      subjectBypassInvalid:
        "--subjectPromptBypass förväntar true eller false när ett värde anges.",
      customDetailsRequired:
        "{condition}-detaljer krävs. Använd --other för att ange dem.",
      markerConfigFormat:
        "Format för markörskonfiguration: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Markörskonfiguration kräver ett fördefinierat tillståndsnamn.",
      markerNameRequired:
        "Markörskonfiguration kräver ett icke-tomt markörnamn.",
      markerSet: "{condition}-markör inställd på {marker}.",
      healthBarSet: "Hälsomätare inställd på {bar}.",
      boolSet: "{key} inställd på {value}.",
      expectedBoolean: "Förväntade true eller false.",
      invalidHealthBar:
        "Hälsomätaren måste vara bar1_value, bar2_value eller bar3_value.",
      markersDisabled: "Markörer är inaktiverade.",
      noMarkerConfigured: "Ingen markör är konfigurerad för detta tillstånd.",
      markerApplied: "Markör applicerad: {marker}",
      markerPresent: "Markör redan närvarande: {marker}",
      langSet: "Språk inställt på {locale}.",
      invalidLocale: "Ogiltig locale. Stödda localer: {locales}.",
      otherDurationRequiresRounds:
        "Annan varaktighet kräver ett numeriskt antal rundor, till exempel --duration 5 rounds.",
      invalidDuration:
        "Varaktigheten måste vara Tills borttagen, ett turslut-alternativ eller ett positivt antal rundor.",
      zeroHpNoConditions: "{name} har nått 0 HP och har inga aktiva tillstånd.",
      zeroHpConditions: "{name} har nått 0 HP. Välj tillstånd att ta bort:",
      removeAllBtn: "Ta bort alla tillstånd för {name}",
      markIncapacitated: "Markera som oskadliggjord",
      removeFromTurnOrder: "Ta bort från turordning",
      alreadyIncapacitated: "{name} är redan oskadliggjord.",
      tokenRemovedFromTurn: "{name} har tagits bort från turordningen.",
      tokenNotInTurn: "{name} hittades inte i turordningen.",
      moveTokenPrompt:
        "Flytta {name} till kartlagret så att den förblir synlig men inte stör andra tokens?",
      moveTokenBtn: "Flytta {name} till kartlagret",
      tokenMoved: "{name} har flyttats till kartlagret.",
      tokenNotFound: "Token hittades inte.",
      noActiveConditions: "{name} har inga aktiva tillstånd att ta bort.",
      deadNoConditions: "{name} markerades som död. Inga tillstånd var aktiva.",
      scriptReady: "{name} är aktiv och du använder version {version}.",
      reachedZeroHp: "{name} nådde 0 HP",
      manuallyRemoved: "manuellt borttagen",
      durationExpired: "varaktigheten löpte ut",
      markedAsDead: "{name} markerades som död",
      conditionReorder:
        "Turordningen ändrades och {count} spårad(e) tillståndsrad(er) kan nu vara felplacerade. Klicka nedan för att återställa dem efter sina tilldelade tokens.",
      conditionsReordered:
        "Tillståndsrader har ompositionerats efter sina tilldelade tokens.",
    },
    removal: {
      conditionField: "Tillstånd",
      reasonField: "Orsak",
      turnRowField: "Turspårningsrad",
      markerField: "Markör",
      notConfigured: "Ej konfigurerad",
      markerRemoved: "Borttagen ({marker})",
      markerRetained: "Behållen ({marker})",
      rowRemoved: "Borttagen",
      rowMissing: "Redan saknad",
      manualReason: "Manuell borttagning",
    },
    cleanup: {
      orphaned: "Övergivna tillståndsposter",
      stale: "Inaktuella tillståndsposter",
      orphanedRows: "Övergivna turspårningsrader",
      unusedMarkers: "Oanvända markörer",
    },
    apply: {
      turnAppended:
        "Målet var inte i turordningen; tillståndsrad lades till sist.",
      turnInserted: "Tillståndsrad infogad under måltoken.",
    },
  },
  handout: {
    versionLabel: "Version",
    subtitle: "D&D 5e-statuseffekthanterare",
    footerNote:
      "Detta handout skapas och uppdateras automatiskt varje gång skriptet laddas.",
    overview: {
      heading: "Översikt",
      body: "Condition Tracker hanterar D&D 5e-statustillstånd och anpassade effekter som märkta rader i Roll20:s turspårare. Applicera tillstånd på tokens, spåra varaktigheter efter initiativordning och ta automatiskt bort utgångna effekter när en tur slutar. Alla kommandon är GM-exklusiva och kan utlösas från chatten eller via de installerade makrona.",
    },
    quickStart: {
      heading: "Snabbstart",
      colCommand: "Kommando",
      colDesc: "Beskrivning",
      rows: [
        [
          "!condition-tracker --prompt",
          "Steg-för-steg-guide — välj tillstånd, tokens och varaktighet interaktivt. Finns även som makrot ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Applicera ett tillstånd på flera tokens samtidigt. Finns även som makrot ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Öppna huvudmenyn med knappar för att applicera, granska eller ta bort tillstånd.",
        ],
      ],
    },
    commandsRef: {
      heading: "Kommandoreferens",
      colFlag: "Flagga",
      colDesc: "Beskrivning",
      rows: [
        ["--prompt", "Interaktiv steg-för-steg-guide"],
        [
          "--multi-target",
          "Applicera ett tillstånd på flera måltoken på en gång",
        ],
        ["--menu", "Visa huvudmeny (lägg till remove för borttagningsmenyn)"],
        [
          "--source X --target Y --condition Z",
          "Applicera ett tillstånd direkt utan guiden",
        ],
        [
          "--duration &lt;värde&gt;",
          "Varaktighet för direkt applicering (t.ex. 2 rounds)",
        ],
        [
          "--other &lt;text&gt;",
          "Anpassad text för Besvärjelse / Förmåga / Annan effekttyp",
        ],
        [
          "--remove &lt;tillstånds-id&gt;",
          "Ta bort ett specifikt tillstånd via dess unika id",
        ],
        [
          "--config &lt;alternativ&gt; &lt;värde&gt;",
          "Justera konfigurationsinställningar (se avsnittet Konfiguration nedan)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Åsidosätt subjectPromptBypass enbart för detta kommando (stöder även --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Stäm av tillstånd — ta bort övergivna tillstånd och turspårningsrader",
        ],
        [
          "--reorder-conditions",
          "Flytta manuellt tillståndsrader bakom deras tilldelade tokens i turordningen",
        ],
        ["--reinstall-macro", "Återskapa eller uppdatera GM-makrona"],
        [
          "--reinstall-handout",
          "Återskapa eller uppdatera det lokaliserade hjälp-handouten",
        ],
        [
          "--lang &lt;locale&gt;",
          "Skicka detta kommandos meddelanden på ytterligare en locale (tvåspråkigt läge)",
        ],
        ["--help", "Visa ett kort hjälpkort i chatten"],
      ],
    },
    standardConditions: {
      heading: "Standardtillstånd (D&amp;D 5e)",
      colCondition: "Tillstånd",
    },
    customEffects: {
      heading: "Anpassade effekttyper",
      colType: "Typ",
      colNotes: "Anteckningar",
      rows: [
        [
          "🔮 Besvärjelse",
          "Spåra en namngiven besvärjelseeffekt — du uppmanas att ange besvärjelsens namn",
        ],
        [
          "🎯 Förmåga",
          "Spåra en namngiven klass- eller rasförmåga — du uppmanas att ange förmågans namn",
        ],
        [
          "🍀 Fördel",
          "Registrera fördel given från en token till en annan; grupperad med källan i initiativet",
        ],
        [
          "⬇️ Nackdel",
          "Registrera pålagd nackdel; grupperad med källan i initiativet",
        ],
        [
          "📝 Annat",
          "Fritext anpassad etikett — du uppmanas att ange en beskrivning",
        ],
      ],
    },
    durationOptions: {
      heading: "Varaktighetsalternativ",
      intro:
        "Det återstående antalet visas i pr-kolumnen i turspåraren och minskar när ankertokenens tur slutar.",
      colOption: "Alternativ",
      colBehaviour: "Beteende",
      rows: [
        [
          "Tills borttagen",
          "Permanent — måste tas bort manuellt via menyn eller --remove",
        ],
        [
          "Slutet av målets nästa tur",
          "Löper ut när måltoken:s nästa tur slutar i initiativet",
        ],
        [
          "Slutet av källans nästa tur",
          "Löper ut när källtoken:s nästa tur slutar i initiativet",
        ],
        [
          "1 / 2 / 3 / 10 rundor",
          "Fast nedräkning; ett steg per ankertokenens turslut",
        ],
      ],
    },
    configuration: {
      heading: "Konfiguration",
      intro:
        "Använd !condition-tracker --config &lt;alternativ&gt; &lt;värde&gt; eller knappen Konfiguration i huvudmenyn.",
      colOption: "Alternativ",
      colValues: "Värden",
      colDesc: "Beskrivning",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Applicera Roll20-statusmarkörer på tokens när ett tillstånd läggs till",
        ],
        [
          "useIcons",
          "true / false",
          "Visa korta ikonkoder (t.ex. [G]) istället för emoji i turspårningsrader",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Hoppa över det valfria subjektsteget för Besvärjelse / Förmåga / Andra effekter",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Token-mätare att bevaka; när den når 0 uppmanas GM att rensa upp tillstånd",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Utdataspråk för chattmeddelanden och hjälp-handouten",
        ],
        [
          "marker",
          "&lt;Tillstånd&gt;=&lt;markörnamn&gt;",
          "Åsidosätt statusmarkören för ett specifikt tillstånd (t.ex. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Standardstatusmarkörer",
      colCondition: "Tillstånd",
      colMarker: "Markörnamn",
    },
    availableLocales: {
      heading: "Tillgängliga översättningar",
      intro:
        "Använd språkkonfigurationsalternativet för att ställa in chattmeddelanden och hjälp-handouten till en stödd locale. Korta alias accepteras även för en, zh och pt.",
      colLocale: "Locale",
      colLanguage: "Språk",
      colFile: "Översättningsfil",
    },
  },
};

export default TRANSLATION;
