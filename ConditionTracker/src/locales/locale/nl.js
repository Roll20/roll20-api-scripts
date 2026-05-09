const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "gegrepen",
      verb: "grijpt",
    },
    Restrained: {
      past: "vastgebonden",
      verb: "bindt vast",
    },
    Prone: {
      past: "neergehaald",
      verb: "haalt",
      suffix: "neer",
    },
    Poisoned: {
      past: "vergiftigd",
      verb: "vergiftigt",
    },
    Stunned: {
      past: "verdoofd",
      verb: "verdooft",
    },
    Blinded: {
      past: "verblind",
      verb: "verblindt",
    },
    Charmed: {
      past: "gecharmeerd",
      verb: "charmeert",
    },
    Frightened: {
      past: "bang",
      verb: "maakt",
      suffix: "bang",
    },
    Incapacitated: {
      past: "uitgeschakeld",
      verb: "schakelt uit",
    },
    Invisible: {
      past: "onzichtbaar",
      verb: "maakt",
      suffix: "onzichtbaar",
    },
    Paralyzed: {
      past: "verlamd",
      verb: "verlamt",
    },
    Petrified: {
      past: "versteend",
      verb: "versteent",
    },
    Unconscious: {
      past: "bewusteloos",
      verb: "maakt",
      suffix: "bewusteloos",
    },
    Spell: {
      past: "beïnvloed door een spreuk",
      verb: "spreekt een spreuk uit over",
    },
    Ability: {
      past: "beïnvloed door een vaardigheid",
      verb: "gebruikt een vaardigheid op",
    },
    Advantage: {
      past: "heeft voordeel",
      verb: "geeft voordeel aan",
      noBy: true,
    },
    Disadvantage: {
      past: "heeft nadeel",
      verb: "geeft nadeel aan",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Gegrepen",
    Restrained: "Vastgebonden",
    Prone: "Liggend",
    Poisoned: "Vergiftigd",
    Stunned: "Verdoofd",
    Blinded: "Verblind",
    Charmed: "Gecharmeerd",
    Frightened: "Bang",
    Incapacitated: "Uitgeschakeld",
    Invisible: "Onzichtbaar",
    Paralyzed: "Verlamd",
    Petrified: "Versteend",
    Unconscious: "Bewusteloos",
    Dazed: "Versuft",
    Deafened: "Verdoofd",
    Dominated: "Gedomineerd",
    Dying: "Sterven",
    Immobilized: "Geïmmobiliseerd",
    Marked: "Gemarkeerd",
    Slowed: "Vertraagd",
    Weakened: "Verzwakt",
    Confused: "Verward",
    Cowering: "Ineenkrimpen",
    Dazzled: "Verblind",
    Disabled: "Gehandicapt",
    Exhausted: "Uitgeput",
    Fascinated: "Gefascineerd",
    Fatigued: "Vermoeid",
    "Flat-Footed": "Overrompelend",
    Helpless: "Hulpeloos",
    Nauseated: "Misselijk",
    Panicked: "In paniek",
    Pinned: "Vastgezet",
    Shaken: "Geschud",
    Sickened: "Ziek",
    Staggered: "Gespreid",
    Clumsy: "Onhandig",
    Concealed: "Verborgen",
    Controlled: "Gecontroleerd",
    Doomed: "Verdoemd",
    Drained: "Afgevoerd",
    Encumbered: "Belast",
    Enfeebled: "Verzwakt",
    Fleeing: "Op de vlucht",
    Grabbed: "Gegrepen",
    Hidden: "Verborgen",
    "Off-Guard": "Overrompeld",
    Quickened: "Versneld",
    Stupefied: "Verbijsterd",
    Undetected: "Onopgemerkt",
    Wounded: "Gewond",
    Asleep: "In slaap",
    Bleeding: "Bloeden",
    Burning: "Branden",
    Dead: "Dood",
    "Off-Kilter": "Buiten Kilter",
    "Off-Target": "Buiten het doel",
    Overburdened: "Overbelast",
    Stable: "Stabiel",
    "Bleeding Out": "Uitbloeden",
    Bound: "Gebonden",
    Distracted: "Afgeleid",
    Berserk: "Gek",
    "Indefinite Insanity": "Oneindige waanzin",
    Injured: "Gewond",
    Mania: "Manie",
    Phobia: "Fobie",
    "Seriously Wounded": "Ernstig gewond",
    "Temporary Insanity": "Tijdelijke waanzin",
    Ablaze: "In vuur en vlam",
    Broken: "Gebroken",
    Surprised: "Verrast",
    Bleed: "Bloeden",
    "Energy Drained": "Energie afgevoerd",
    Entangled: "Verstrikt",
    Fear: "Angst",
    Hampered: "Gehinderd",
    "Ongoing Damage": "Aanhoudende schade",
    Vulnerable: "Kwetsbaar",
    Diseased: "Ziek",
    Held: "Gehouden",
    Compelled: "Gedwongen",
    Impaired: "Verzwakt",
    Panicking: "In paniek raken",
    Disoriented: "Gedesoriënteerd",
    Ensnared: "Verstrikt",
    Strained: "Gespannen",
    Afraid: "Bang",
    Angry: "Boos",
    Corrupted: "Beschadigd",
    Harmed: "Gewond",
    Hungry: "Hongerig",
    Infected: "Besmet",
    Isolated: "Geïsoleerd",
    "Blood Bound": "Bloedgebonden",
    Entranced: "In vervoering",
    Frenzied: "Waanzinnig",
    Torpor: "Verdoving",
    "Knocked Down": "Neergeslagen",
    Paradox: "Paradox",
    "Willpower Spent": "Wilskracht besteed",
    Bedlam: "Bedlam",
    "Chimera-Touched": "Chimera-aangeraakt",
    "Mortally Wounded": "Dodelijk gewond",
    Insane: "Gestoord",
    Debilitated: "Verzwakt",
    Deprived: "Ontnomen",
    Shocked: "Geschokt",
    Intoxicated: "Dronken",
    Spell: "Spreuk",
    Ability: "Vaardigheid",
    Advantage: "Voordeel",
    Disadvantage: "Nadeel",
    Other: "Overig",
  },
  templates: {
    display: {
      custom: "{emoji} {target} beïnvloed door {effect} ({source})",
      advantage: "{emoji} {source} heeft voordeel tegen {target}{subject}",
      disadvantage: "{emoji} {source} heeft nadeel tegen {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} is {past}",
      standard: "{emoji} {target} {past} door {source}",
    },
    apply: {
      custom: "{source} past {effect} toe op {target}.",
      advantage: "{source} heeft voordeel tegen {target}{subject}.",
      disadvantage: "{source} heeft nadeel tegen {target}{subject}.",
      self: "{target} is {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} wordt niet langer beïnvloed door {effect}.",
      advantage: "{source} heeft niet langer voordeel tegen {target}{subject}.",
      disadvantage:
        "{source} heeft niet langer nadeel tegen {target}{subject}.",
      noBy: "{target} is niet langer {past}.",
      self: "{target} is niet langer {past}.",
      standard: "{target} wordt niet langer {past} door {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Kies Conditie",
      selectSource: "Kies Brontoken",
      selectTarget: "Kies Doeltoken",
      selectSubject: "Kies Onderwerp",
      selectDuration: "Kies Duur",
      confirmTargetTitle: "Bevestig Doellijst",
      applyEffectTitle: "Pas {condition}-effect toe",
      noTokens: "Geen benoemde tokens gevonden op de actieve pagina.",
      confirmIntro: "De volgende tokens ontvangen de conditie:",
      confirmBtn: "Bevestig doellijst",
      enterDetails: "Voer effectdetails in",
      noneBtn: "Geen",
      noneOrSourceBtn: "Geen of toepassen op bron",
      subjectDesc: "Selecteer wie of wat het effect veroorzaakt.",
      sourceDesc: "Selecteer het wezen dat de conditie of het effect creëert.",
      targetDesc: "Selecteer het wezen dat de conditie of het effect ontvangt.",
      otherText: "Aangepaste conditietekst",
      effectDetails: "{condition}-details",
    },
    col: {
      players: "Spelers",
      npcs: "NPC's",
      conditions: "Condities",
      customEffects: "Aangepaste Effecten",
      permanentTurnEnd: "Permanent / Beurt Einde",
      rounds: "Rondes",
      command: "Opdracht",
      result: "Resultaat",
      field: "Veld",
      value: "Waarde",
      option: "Optie",
      condition: "Conditie",
      marker: "Markering",
      item: "Item",
      removed: "Verwijderd",
      details: "Details",
      description: "Beschrijving",
      scenario: "Scenario",
      gameSystem: "Spelsysteem",
      duration: "Duur",
    },
    dur: {
      untilRemoved: "Tot verwijdering",
      endOfTargetTurn: "Einde van de volgende beurt van het doel",
      endOfSourceTurn: "Einde van de volgende beurt van de bron",
      round1: "1 ronde",
      round2: "2 rondes",
      round3: "3 rondes",
      round10: "10 rondes",
      custom: "Aangepast",
      customPrompt: "Aantal rondes",
      untilRemovedDisplay: "Tot verwijdering",
      turnsRemaining: "{n} bijgehouden beurteinde(s) resterend",
    },
    btn: {
      openWizard: "Wizard openen",
      openMultiTarget: "Open Multidoel-wizard",
      openRemovalList: "Open Verwijderlijst",
      showConfig: "Toon Configuratie",
      runCleanup: "Voer Opruiming Uit",
      reinstallMacro: "Macro Herinstalleren",
      reinstallHandout: "Handout Herinstalleren",
      showHelp: "Toon Help",
      reorderConditions: "Conditierijen Herordenen",
      reportToken: "Tokenvoorwaarden rapporteren",
      savedEffects: "Opgeslagen effecten",
      addSavedEffect: "Opgeslagen effect toevoegen",
      editSaved: "Bewerking",
      removeSaved: "Verwijderen",
      promoteSaved: "Toevoegen aan Turn Tracker",
      snoozeSaved: "Snoozen",
      clearSnooze: "Snooze wissen",
    },
    title: {
      menu: "Menu",
      removalMenu: "Condition Tracker — Verwijdering",
      config: "Configuratie",
      configTracker: "Condition Tracker — Configuratie",
      help: "Hulp",
      applied: "Toegepast",
      removed: "Conditie Verwijderd",
      cleanup: "Opruiming Voltooid",
      macroReinstalled: "Macro herinstalleerd",
      handoutReinstalled: "Handout Herinstalleerd",
      warning: "Waarschuwing",
      error: "Fout",
      turnOrder: "Beurtenvolgorde",
      noConditions: "Geen Condities",
      tokenMoved: "Token Verplaatst",
      markedDead: "Gemarkeerd als Dood",
      zeroHp: "{name} — 0 LP",
      moveToken: "{name} — Token Verplaatsen?",
      scriptReady: "Script Gereed",
      conditionReorder: "Beurtenvolgorde Gewijzigd",
      tokenReport: "Tokenconditierapport",
      savedEffects: "Opgeslagen effecten",
      savedAdd: "Opgeslagen effect toevoegen",
      savedEdit: "Bewerk opgeslagen effect",
      savedRemoved: "Opgeslagen effect verwijderd",
      savedPromoted: "Toevoegen aan Turn Tracker",
      savedSnoozed: "Herinnering gesnoozed",
      savedSnoozeCleared: "Snooze gewist",
      hiddenEffects: "Verborgen effecten — {name}",
    },
    heading: {
      quickActions: "Snelle Acties",
      settings: "Instellingen",
      markerMappings: "Markeertoewijzingen",
      result: "Resultaat",
      info: "Informatie",
      commandOptions: "Opdrachtopties",
      promptUi: "Wizard-interface",
      examples: "Voorbeelden",
      summary: "Samenvatting",
      appliedTo: "Voorwaarden van toepassing op",
      appliedBy: "Voorwaarden toegepast door",
      savedEffectsFor: "Opgeslagen effecten voor {name}",
      visibility: "Zichtbaarheid",
      snoozeOptions: "Snooze-herinnering",
      promoteOptions: "Promoveren tot Turn Tracker",
      editActions: "Acties bewerken",
    },
    msg: {
      noActive: "Er worden geen actieve condities bijgehouden.",
      configReset: "Configuratie teruggezet naar standaardwaarden.",
      unknownConfig:
        "Onbekende configuratieoptie. Gebruik --config om ondersteunde instellingen te bekijken.",
      macroReinstalled:
        "De {wizard}-, {multiTarget}-, {reportToken}-, {saved}- en {classify}-macro's zijn herinstalleerd voor alle huidige GM-spelers.",
      handoutReinstalled: "De help-handout {handout} is herinstalleerd.",
      duplicate:
        "Deze exacte combinatie van bron, onderwerp, doel, conditie en aangepaste tekst is al actief.",
      noTargets: "Geen doeltokens opgegeven voor multidoel-toepassing.",
      noSelection:
        "Selecteer ten minste één token op het bord voordat je --multi-target gebruikt.",
      invalidIds: "Geen geldige token-ID's gevonden in de huidige selectie.",
      reSelectTokens:
        "Geen van de oorspronkelijk geselecteerde tokens kon worden gevonden. Selecteer tokens opnieuw en probeer het nogmaals.",
      conditionNotFound: "Conditie-ID niet gevonden.",
      gmOnly: "Condition Tracker-opdrachten zijn alleen voor de GM.",
      commandFailed:
        "De opdracht kon niet veilig worden voltooid. Controleer de API-console voor details.",
      sourceTokenNotFound: "Brontoken kon niet worden gevonden.",
      targetTokenNotFound: "Doeltoken kon niet worden gevonden.",
      subjectTokenNotFound: "Onderwerptoken kon niet worden gevonden.",
      invalidGameSystem:
        "Ongeldig spelsysteem. Gebruik --config gamesysteem &lt;id&gt;. Ondersteunde systemen:",
      gameSystemSet:
        "Spelsysteem ingesteld op {system}. Markeringen zijn teruggezet naar de systeemstandaarden.",
      invalidCondition:
        "Conditie moet een van de voorgedefinieerde condities of Overig zijn.",
      subjectOnlyCustom:
        "--subject is alleen geldig voor Spreuk, Vaardigheid, Voordeel, Nadeel en Overig.",
      subjectBypassInvalid:
        "--subjectPromptBypass verwacht true of false wanneer een waarde wordt opgegeven.",
      customDetailsRequired:
        "{condition}-details zijn vereist. Gebruik --other om deze op te geven.",
      markerConfigFormat:
        "Markeringsconfiguratieformaat is: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Markeringsconfiguratie vereist een voorgedefinieerde conditienaam.",
      markerNameRequired:
        "Markeringsconfiguratie vereist een niet-lege markeringsnaam.",
      markerSet: "{condition}-markering ingesteld op {marker}.",
      healthBarSet: "Gezondheidsbalk ingesteld op {bar}.",
      boolSet: "{key} ingesteld op {value}.",
      expectedBoolean: "true of false verwacht.",
      invalidHealthBar:
        "Gezondheidsbalk moet bar1_value, bar2_value of bar3_value zijn.",
      markersDisabled: "Markeringen zijn uitgeschakeld.",
      noMarkerConfigured:
        "Er is geen markering geconfigureerd voor deze conditie.",
      markerApplied: "Markering toegepast: {marker}",
      markerPresent: "Markering al aanwezig: {marker}",
      langSet: "Taal ingesteld op {locale}.",
      invalidLocale: "Ongeldige locale. Ondersteunde locales: {locales}.",
      otherDurationRequiresRounds:
        "Overige duur vereist een numeriek aantal rondes, bijvoorbeeld --duration 5 rounds.",
      invalidDuration:
        "Duur moet Tot verwijdering, een beurteindeoptie of een positief aantal rondes zijn.",
      zeroHpNoConditions:
        "{name} heeft 0 LP bereikt en heeft geen actieve condities.",
      zeroHpConditions:
        "{name} heeft 0 LP bereikt. Kies condities om te verwijderen:",
      removeAllBtn: "Verwijder Alle Condities voor {name}",
      markIncapacitated: "Markeer als Uitgeschakeld",
      removeFromTurnOrder: "Verwijder uit Beurtenvolgorde",
      alreadyIncapacitated: "{name} is al Uitgeschakeld.",
      tokenRemovedFromTurn: "{name} is verwijderd uit de beurtenvolgorde.",
      tokenNotInTurn: "{name} werd niet gevonden in de beurtenvolgorde.",
      moveTokenPrompt:
        "Verplaats {name} naar de kaartlaag zodat het zichtbaar blijft maar andere tokens niet hindert?",
      moveTokenBtn: "Verplaats {name} naar Kaartlaag",
      tokenMoved: "{name} is verplaatst naar de kaartlaag.",
      tokenNotFound: "Token niet gevonden.",
      noActiveConditions:
        "{name} heeft geen actieve condities om te verwijderen.",
      deadNoConditions:
        "{name} is gemarkeerd als dood. Er waren geen actieve condities.",
      scriptReady: "{name} is actief en je gebruikt versie {version}.",
      reachedZeroHp: "{name} heeft 0 LP bereikt",
      manuallyRemoved: "het is handmatig verwijderd",
      durationExpired: "de duur is verlopen",
      markedAsDead: "{name} is gemarkeerd als dood",
      conditionReorder:
        "De beurtenvolgorde is gewijzigd en {count} bijgehouden conditierij(en) staan mogelijk op de verkeerde plek. Klik hieronder om ze te herstellen na hun toegewezen tokens.",
      conditionsReordered:
        "Conditierijen zijn hergeplaatst na hun toegewezen tokens.",
      noTokensSelectedReport:
        "Selecteer ten minste één token op het bord voordat u --report-token gebruikt.",
      noConditionsAppliedTo:
        "Op {name} zijn geen actieve voorwaarden van toepassing.",
      noConditionsAppliedBy:
        "Op {name} zijn geen actieve voorwaarden van toepassing op anderen.",
      noSavedEffects: "Geen opgeslagen effecten opgeslagen voor {name}.",
      noTokenSelectedSaved:
        "Selecteer een token op het bord voordat u --saved gebruikt.",
      savedEffectAdded: "Opgeslagen effect toegevoegd voor {name}.",
      savedEffectUpdated: "Opgeslagen effect bijgewerkt.",
      savedEffectRemoved: "Opgeslagen effect verwijderd.",
      savedEffectNotFound: "Opgeslagen effect niet gevonden.",
      savedInvalidVisibility:
        "Ongeldige zichtbaarheid. Gebruik openbaar, gemaskeerd of gm.",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "Effect toegevoegd aan Turn Tracker als openbaar.",
      savedPromotedMasked:
        "Effect toegevoegd aan Turn Tracker als gemaskeerd — spelers zien: {publicLabel}.",
      savedPromotedGm:
        "Het effect is alleen voor GM: er wordt geen Turn Tracker-rij gemaakt. Het herinneringssysteem zal het weergeven wanneer dit token de top van de speelvolgorde bereikt.",
      savedSnoozed: "Herinnering gesnoozed: {scope}.",
      savedSnoozeCleared: "Snooze gewist.",
      hiddenEffectsReminder: "Verborgen effecten zijn actief op {name}.",
      visibilityPublicHint: "volledig label zichtbaar voor iedereen",
      visibilityMaskedHint: "vaag label getoond aan spelers",
      visibilityGmHint: "Alleen GM-fluisteren, geen Turn Tracker-rij",
    },
    removal: {
      conditionField: "Conditie",
      reasonField: "Reden",
      turnRowField: "Beurtenvolgorde-rij",
      markerField: "Markering",
      notConfigured: "Niet geconfigureerd",
      markerRemoved: "Verwijderd ({marker})",
      markerRetained: "Behouden ({marker})",
      rowRemoved: "Verwijderd",
      rowMissing: "Al ontbrekend",
      manualReason: "Handmatige verwijdering",
    },
    saved: {
      visibility: {
        public: "Openbaar",
        masked: "Gemaskeerd",
        gm: "Alleen GM",
      },
      snooze: {
        thisTurn: "Deze beurt",
        oneRound: "1 Ronde",
        threeRounds: "3 rondes",
        thisCombat: "Dit gevecht",
        rounds: "{n} ronde(s)",
      },
      field: {
        gmLabel: "GM-label",
        publicLabel: "Openbaar etiket",
        visibility: "Zichtbaarheid",
        source: "Bron",
        condition: "Voorwaarde",
      },
      prompt: {
        enterGmLabel: "Volledige effectbeschrijving (alleen GM)",
        enterPublicLabel: "Vaag label getoond aan spelers",
      },
      snoozed: "gesnoozed",
    },
    classify: {
      title: "Acteurclassificatie",
      showTitle: "Classificatiediagnostiek",
      showHeading: "Token-classificatiedetails",
      resultHeading: "Overschrijving Toegepast",
      noSelection:
        "Selecteer ten minste één token op het bord voordat je --classify gebruikt.",
      invalidType:
        "Ongeldig classificatietype: {type}. Gebruik pc, npc, ignored of auto.",
      set: "{name} → {type} (bereik: {scope})",
      cleared:
        "{name} overschrijving gewist (bereik: {scope}) — automatische detectie hersteld.",
      setTokenFallback:
        "{name} → {type} (tokenoverschrijving — geen karakterblad gekoppeld).",
      clearedTokenFallback:
        "{name} tokenoverschrijving gewist — automatische detectie hersteld.",
      fieldToken: "Token",
      fieldType: "Classificatie",
      fieldSource: "Bron",
      fieldReason: "Reden",
    },
    cleanup: {
      orphaned: "Verweesde conditie-items",
      stale: "Verouderde conditie-items",
      orphanedRows: "Verweesde beurtenvolgorde-rijen",
      unusedMarkers: "Ongebruikte markeringen",
    },
    apply: {
      turnAppended:
        "Doel stond niet in de beurtenvolgorde; conditierij is toegevoegd.",
      turnInserted: "Conditierij ingevoegd onder het doeltoken.",
    },
  },
  handout: {
    versionLabel: "Versie",
    subtitle: "D&D 5e Statuseffect-beheerder",
    footerNote:
      "Deze handout wordt automatisch aangemaakt en bijgewerkt telkens wanneer het script wordt geladen.",
    overview: {
      heading: "Overzicht",
      body: "Condition Tracker beheert D&D 5e-statuscondities en aangepaste effecten als gelabelde rijen in de Roll20-beurtopvolger. Pas condities toe op tokens, volg duur bij aan de hand van initiatiefvolgorde, en verwijder verlopen effecten automatisch wanneer een beurt eindigt. Alle opdrachten zijn alleen voor de GM en kunnen worden geactiveerd via de chat of de geïnstalleerde macro's.",
    },
    quickStart: {
      heading: "Snel Starten",
      colCommand: "Opdracht",
      colDesc: "Beschrijving",
      rows: [
        [
          "!conditietracker --prompt",
          "Stap-voor-stap wizard — kies conditie, tokens en duur interactief. Ook beschikbaar als de ConditionTrackerWizard-macro.",
        ],
        [
          "!condition-tracker --meerdere doelen",
          "Pas één conditie tegelijkertijd toe op meerdere tokens. Ook beschikbaar als de ConditionTrackerMultiTarget-macro.",
        ],
        [
          "!conditietracker --report-token",
          "Selecteer eerst een of meer tokens en voer vervolgens deze opdracht uit om een ​​GM-gefluister te krijgen met een lijst van alle voorwaarden die op en door elk geselecteerd token worden toegepast. Ook beschikbaar als de macro ConditionTrackerReportToken.",
        ],
        [
          "!condition-tracker --menu",
          "Open het hoofdbeheermenu met knoppen om condities toe te passen, te bekijken of te verwijderen.",
        ],
        [
          "!condition-tracker --classify weergeven",
          "Selecteer eerst een of meer tokens en voer vervolgens deze opdracht uit om een ​​diagnostisch gefluister te zien waarin de actorclassificatie, detectiebron en reden van elk token wordt weergegeven. Gebruik --classify pc|npc|genegeerd om te overschrijven, of --classify auto om de automatische detectie te herstellen. Ook beschikbaar als de ConditionTrackerClassify-macro.",
        ],
        [
          "!conditietracker --menu",
          "Open het hoofdbeheermenu met knoppen om voorwaarden toe te passen, te bekijken of te verwijderen.",
        ],
      ],
    },
    commandsRef: {
      heading: "Opdrachtenoverzicht",
      colFlag: "Vlag",
      colDesc: "Beschrijving",
      rows: [
        ["--snel", "Interactieve stap-voor-stap wizard-interface"],
        [
          "--meerdere doelen",
          "Pas een conditie tegelijkertijd toe op meerdere doeltokens",
        ],
        ["--menu", "Toon hoofdmenu (voeg remove toe voor verwijdermenu)"],
        [
          "--bron X --doel Y --voorwaarde Z",
          "Pas een conditie direct toe zonder de wizard",
        ],
        [
          "--duration &lt;waarde&gt;",
          "Duur voor directe toepassing (bijv. 2 rounds)",
        ],
        [
          "--other &lt;tekst&gt;",
          "Aangepaste tekst voor Spreuk / Vaardigheid / Overige effecttypen",
        ],
        [
          "--remove &lt;conditie-ID&gt;",
          "Verwijder een specifieke conditie via zijn unieke ID",
        ],
        [
          "--config &lt;optie&gt; &lt;waarde&gt;",
          "Pas configuratie-instellingen aan (zie het Configuratie-gedeelte hieronder)",
        ],
        [
          "--prompt --subjectPromptBypass waar|onwaar",
          "Overschrijf subjectPromptBypass alleen voor deze opdracht (ondersteunt ook --subject-prompt-bypass)",
        ],
        [
          "--opruimen",
          "Herstel staat — verwijder verweesde condities en beurtenvolgorde-rijen",
        ],
        [
          "--herbestelvoorwaarden",
          "Conditierijen handmatig herpositioneren achter hun toegewezen tokens in de beurtvolgorde",
        ],
        ["--reinstall-macro", "Maak GM-macro's opnieuw aan of werk ze bij"],
        [
          "--herinstalleer-hand-out",
          "Maak de gelokaliseerde help-handout opnieuw aan of werk deze bij",
        ],
        [
          "--rapport-token",
          "Fluister een GM-only conditierapport voor elk geselecteerd token (voorwaarden toegepast op en door het token)",
        ],
        [
          "--lang &lt;locale&gt;",
          "Geef de berichten van deze opdracht uit in een aanvullende locale (tweetalige modus)",
        ],
        [
          "--classify pc|npc|ignored",
          "Het acteurtype voor geselecteerde tokens overschrijven — selecteer eerst de tokens. Standaardbereik is karakter (schrijft ct_mod_actor_type-attribuut); voeg --scope token toe om op te slaan in scriptstatus",
        ],
        [
          "--classify auto",
          "De acteurtype-overschrijving verwijderen en automatische detectie voor geselecteerde tokens herstellen",
        ],
        [
          "--classify show",
          "Een classificatiediagnostiek fluisteren voor elk geselecteerd token — toont het gedetecteerde type, detectiebron en reden",
        ],
        ["--help", "Toon een beknopte helpkaart in de chat"],
        [
          "--saved snoozen &lt;id&gt; --scope draaien|ronden|vechten --rounds &lt;n&gt;",
          "Sluimer een herinnering met een opgeslagen effect voor de huidige beurt, N rondes of dit gevecht",
        ],
        [
          "--saved snooze-clear &lt;id&gt;",
          "Wis een actieve snooze voor een opgeslagen effect",
        ],
        [
          "--lang &lt;locale&gt;",
          "Voer de berichten van dit commando uit in een extra landinstelling (tweetalige modus)",
        ],
        [
          "--classify pc|npc|genegeerd",
          "Overschrijf het actortype voor geselecteerde tokens: selecteer eerst token(s). Standaardbereik is karakter (schrijft het attribuut ct_mod_actor_type); voeg in plaats daarvan het token --scope toe om op te slaan in de scriptstatus",
        ],
        [
          "--classify automatisch",
          "Verwijder de overschrijving van het acteurtype en herstel de automatische detectie voor geselecteerde tokens",
        ],
        [
          "--classify weergeven",
          "Fluister een classificatiediagnose voor elk geselecteerd token: toont het gedetecteerde type, de detectiebron en de reden",
        ],
        ["--help", "Toon een korte hulpkaart in de chat"],
      ],
    },
    standardConditions: {
      heading: "Standaard Condities (D&amp;D 5e)",
      colCondition: "Conditie",
      none: "Er zijn geen standaardvoorwaarden gedefinieerd voor dit spelsysteem. Gebruik het type Ander aangepast effect voor vrije-teksteffecten.",
    },
    customEffects: {
      heading: "Aangepaste Effecttypen",
      colType: "Type",
      colNotes: "Notities",
      rows: [
        [
          "🔮 Spreuk",
          "Volg een benoemd spreukeneffect — je wordt gevraagd naar de spreuknaam",
        ],
        [
          "🎯 Vaardigheid",
          "Volg een benoemde klasse- of rasvaardigheid — je wordt gevraagd naar de naam",
        ],
        [
          "🍀 Voordeel",
          "Registreer voordeel van het ene token naar het andere; gegroepeerd bij de bron in initiatief",
        ],
        [
          "⬇️ Nadeel",
          "Registreer opgelegd nadeel; gegroepeerd bij de bron in initiatief",
        ],
        [
          "📝 Overig",
          "Vrij aangepast label — je wordt gevraagd naar een beschrijving",
        ],
      ],
    },
    durationOptions: {
      heading: "Duuropties",
      intro:
        "Het resterende aantal wordt weergegeven in de pr-kolom van de beurtopvolger en vermindert telkens wanneer de beurt van het ankertToken eindigt.",
      colOption: "Optie",
      colBehaviour: "Gedrag",
      rows: [
        [
          "Tot verwijdering",
          "Permanent — moet handmatig worden verwijderd via het menu of --remove",
        ],
        [
          "Einde van de volgende beurt van het doel",
          "Verloopt wanneer de volgende beurt van het doeltoken eindigt in het initiatief",
        ],
        [
          "Einde van de volgende beurt van de bron",
          "Verloopt wanneer de volgende beurt van het brontoken eindigt in het initiatief",
        ],
        [
          "1 / 2 / 3 / 10 rondes",
          "Vaste aftelling; één vermindering per beurteindigng van het ankertoken",
        ],
      ],
    },
    savedEffects: {
      heading: "Opgeslagen effecten",
      intro:
        "Met opgeslagen effecten kun je langdurige omstandigheden buiten de Turn Tracker opslaan: vloeken, ziekten, gifstoffen, verborgen debuffs en andere niet-gevechtsomstandigheden. Ze blijven in scriptstatus behouden en kunnen optioneel naar de Turn Tracker worden gekopieerd wanneer het gevecht begint.",
      visibility: {
        heading: "Zichtbaarheidsmodi",
        rows: [
          [
            "publiek",
            "Label met volledig effect is zichtbaar in de Turn Tracker en de openbare chat.",
          ],
          [
            "gemaskerd",
            "Spelers krijgen een vaag openbaar label te zien; volledige details zijn alleen voor GM.",
          ],
          [
            "gm",
            "Geen Turn Tracker-rij. Volledige details worden in de staat opgeslagen en naar de GM gefluisterd wanneer het betreffende token de top van het initiatief bereikt.",
          ],
        ],
      },
      commands: {
        heading: "Opgeslagen effectopdrachten",
        intro:
          "Alle --saved commando's zijn alleen voor GM. Selecteer een token voordat u --saved of --saved add uitvoert.",
        rows: [
          [
            "!conditie-tracker --opgeslagen",
            "Bekijk opgeslagen effecten voor het geselecteerde token.",
          ],
          [
            "!condition-tracker --opgeslagen toevoeging",
            "Start de wizard voor het toevoegen van opgeslagen effecten.",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "Bewerk labels of zichtbaarheid voor een bestaand opgeslagen effect.",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "Verwijder een opgeslagen effect definitief.",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "Kopieer een opgeslagen effect naar de Turn Tracker (openbaar of gemaskeerd) of bevestig dat het alleen door GM wordt gevolgd.",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "Sluimer een GM-herinnering voor deze beurt, N rondes of dit gevecht.",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "Wis een actieve snooze zodat herinneringen onmiddellijk worden hervat.",
          ],
        ],
      },
      reminders: {
        heading: "GM-herinneringen",
        body: "Wanneer een token met GM of gemaskeerde opgeslagen effecten de bovenkant van de Turn Tracker bereikt, ontvangt de GM een gefluister met een lijst van de verborgen effecten met actieknoppen. Dubbele herinneringen binnen dezelfde beurt worden onderdrukt. Gebruik de snooze-knoppen om herinneringen voor een beurt, een aantal rondes of voor de rest van het huidige gevecht te onderdrukken.",
      },
    },
    actorClassification: {
      heading: "Acteurclassificatie",
      intro:
        "Condition Tracker bepaalt automatisch of elk token een SC, NPC of genegeerd object is (kaartspelden, decor, tovertemplates). Niet-gekoppelde tokens worden standaard genegeerd. Gebruik --classify om automatische detectie voor elk token te overschrijven.",
      detectionOrder: {
        heading: "Detectievolgorde",
        colStep: "Stap",
        colCheck: "Controle",
        colResult: "Resultaat",
        rows: [
          [
            "1",
            "Token-statusoverschrijving (--classify --scope token)",
            "pc / npc / genegeerd",
          ],
          [
            "2",
            "Karakter ct_mod_actor_type-attribuut (--classify --scope character)",
            "pc / npc / genegeerd",
          ],
          ["3", "Niet-gekoppeld token — geen karakterblad", "genegeerd"],
          ["4", "Spelsysteemadapter (npc / is_npc attribuut)", "pc / npc"],
          [
            "5",
            "Generieke NPC-attribuutscan (npc, is_npc, npcflag, sheet_type, character_type)",
            "pc / npc",
          ],
          ["6", "Karakter controlledby-terugval", "pc / npc"],
        ],
      },
      types: {
        heading: "Classificatietypen",
        colType: "Type",
        colMeaning: "Betekenis",
        rows: [
          [
            "pc",
            "Spelerkarakter — altijd opgenomen als SC in de wizard en detectie",
          ],
          ["npc", "Niet-spelerkarakter — altijd opgenomen als NPC"],
          [
            "genegeerd",
            "Nooit weergegeven of bijgehouden — uitgesloten van de token-kiezer van de wizard",
          ],
          [
            "onbekend",
            "Alleen automatisch gedetecteerd; type kon niet worden bepaald (als NPC behandeld in de wizard)",
          ],
        ],
      },
      commands: {
        heading: "Classificatieopdrachten",
        intro:
          "Selecteer één of meer tokens voordat je --classify-opdrachten uitvoert.",
        rows: [
          [
            "!condition-tracker --classificeer pc",
            "Geselecteerde tokens als SC's markeren (standaard bereik: karakter).",
          ],
          [
            "!condition-tracker --classificeer npc",
            "Geselecteerde tokens als NPC's markeren.",
          ],
          [
            "!condition-tracker --classify genegeerd",
            "Geselecteerde tokens uitsluiten van alle tracking.",
          ],
          [
            "!condition-tracker --classificeer auto",
            "Overschrijving verwijderen — automatische detectie herstellen.",
          ],
          [
            "!condition-tracker --classificeer show",
            "Classificatiediagnostiek (type, bron, reden) weergeven voor elk geselecteerd token.",
          ],
          [
            "!condition-tracker --classify pc --scope-token",
            "Tokenoverschrijving opgeslagen in scriptstatus — nuttig voor niet-gekoppelde tokens.",
          ],
          [
            "!condition-tracker --classify pc --scope karakter",
            "Karakteroverschrijving geschreven naar ct_mod_actor_type-attribuut — geldt voor alle tokens met hetzelfde karakterblad.",
          ],
        ],
      },
    },
    configuration: {
      heading: "Configuratie",
      intro:
        "Gebruik !condition-tracker --config &lt;optie&gt; &lt;waarde&gt; of de Configuratie-knop in het hoofdmenu.",
      colOption: "Optie",
      colValues: "Waarden",
      colDesc: "Beschrijving",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Pas Roll20-statusmarkeringen toe op tokens wanneer een conditie wordt toegevoegd",
        ],
        [
          "useIcons",
          "waar / onwaar",
          "Toon korte pictogramcodes (bijv. [G]) in plaats van emoji in beurtopvolger-rijen",
        ],
        [
          "subjectPromptBypass",
          "waar / onwaar",
          "Sla de optionele onderwerptokenstap over voor Spreuk / Vaardigheid / Overige effecten",
        ],
        [
          "suppressPublicChat",
          "waar / onwaar",
          "Onderdruk alle openbare chatberichten (toepassen en verwijderen berichten). GM-fluisteringen worden niet beïnvloed.",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Token-balk om te bewaken; wanneer deze op 0 komt, wordt de GM gevraagd condities op te ruimen",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Uitvoertaal voor chatberichten en de help-handout",
        ],
        [
          "marker",
          "&lt;Conditie&gt;=&lt;markeringsnaam&gt;",
          "Overschrijf de statusmarkering voor een specifieke conditie (bijv. marker Grappled=grab)",
        ],
        [
          "markering",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Overschrijf de statusmarkering die voor een specifieke aandoening wordt gebruikt (bijvoorbeeld markering Grappled=grab)",
        ],
      ],
    },
    gameSystems: {
      heading: "Ondersteunde spelsystemen",
      intro:
        "Gebruik !condition-tracker --config gameSystem &lt;id&gt; om van systeem te wisselen. Als u overschakelt, worden de tokenmarkeringstoewijzingen opnieuw ingesteld op de standaardwaarden van het nieuwe systeem. Uw actieve omstandigheden blijven behouden.",
      colId: "Systeem-ID",
      colName: "Spelsysteem",
    },
    defaultMarkers: {
      heading: "Standaard Statusmarkeringen",
      colCondition: "Conditie",
      colMarker: "Markeringsnaam",
      none: "Er zijn geen standaardmarkeringen gedefinieerd voor dit spelsysteem.",
    },
    availableLocales: {
      heading: "Beschikbare Vertalingen",
      intro:
        "Gebruik de taalconfiguratieopties om chatberichten en de help-handout in te stellen op een ondersteunde locale. Korte aliassen worden ook geaccepteerd voor en, zh en pt.",
      colLocale: "Lokaal",
      colLanguage: "Taal",
      colFile: "Vertaalbestand",
    },
  },
};

export default TRANSLATION;
