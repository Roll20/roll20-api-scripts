const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "vasgegryp",
      verb: "gryp",
    },
    Restrained: {
      past: "beperk",
      verb: "beperk",
    },
    Prone: {
      past: "platgeslaan",
      verb: "slaan",
      suffix: "plat",
    },
    Poisoned: {
      past: "vergiftig",
      verb: "vergiftig",
    },
    Stunned: {
      past: "verdoof",
      verb: "verdoof",
    },
    Blinded: {
      past: "verblind",
      verb: "verblind",
    },
    Charmed: {
      past: "bekoor",
      verb: "bekoor",
    },
    Frightened: {
      past: "banggemaak",
      verb: "maak",
      suffix: "bang",
    },
    Incapacitated: {
      past: "onbekwaam",
      verb: "maak",
      suffix: "onbekwaam",
    },
    Invisible: {
      past: "onsigbaar",
      verb: "maak",
      suffix: "onsigbaar",
    },
    Paralyzed: {
      past: "verlam",
      verb: "verlam",
    },
    Petrified: {
      past: "versteen",
      verb: "versteen",
    },
    Unconscious: {
      past: "bewusteloos",
      verb: "maak",
      suffix: "bewusteloos",
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
      past: "het voordeel",
      verb: "gee voordeel aan",
      noBy: true,
    },
    Disadvantage: {
      past: "het nadeel",
      verb: "gee nadeel aan",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Vasgegryp",
    Restrained: "Beperk",
    Prone: "Neergewerp",
    Poisoned: "Vergiftig",
    Stunned: "Verdoof",
    Blinded: "Verblind",
    Charmed: "Bekoor",
    Frightened: "Bang",
    Incapacitated: "Onbekwaam",
    Invisible: "Onsigbaar",
    Paralyzed: "Verlam",
    Petrified: "Versteen",
    Unconscious: "Bewusteloos",
    Dazed: "Verdoof",
    Deafened: "Doof",
    Dominated: "Oorheers",
    Dying: "Sterf",
    Immobilized: "Geïmmobiliseer",
    Marked: "Gemerk",
    Slowed: "Vertraag",
    Weakened: "Verswak",
    Confused: "Verward",
    Cowering: "Ineenkrimpende",
    Dazzled: "Verblind",
    Disabled: "Gestrem",
    Exhausted: "Uitgeput",
    Fascinated: "Gefassineerd",
    Fatigued: "Moeg",
    "Flat-Footed": "Platvoet",
    Helpless: "Hulpeloos",
    Nauseated: "Naar",
    Panicked: "Paniekbevange",
    Pinned: "Vasgespeld",
    Shaken: "Geskud",
    Sickened: "Siek",
    Staggered: "Verstuik",
    Clumsy: "Lomp",
    Concealed: "Versteek",
    Controlled: "Beheer",
    Doomed: "Gedoem",
    Drained: "Gedreineer",
    Encumbered: "Beswaard",
    Enfeebled: "Verswak",
    Fleeing: "Vlug",
    Grabbed: "Gegryp",
    Hidden: "Versteek",
    "Off-Guard": "Onbewaak",
    Quickened: "Versnel",
    Stupefied: "Verdoof",
    Undetected: "Onbespeur",
    Wounded: "Gewonde",
    Asleep: "Aan die slaap",
    Bleeding: "Bloeding",
    Burning: "Brandende",
    Dead: "Dood",
    "Off-Kilter": "Off-Kilter",
    "Off-Target": "Buite-teiken",
    Overburdened: "Oorbelaai",
    Stable: "Stabiel",
    "Bleeding Out": "Uitbloei",
    Bound: "Gebonde",
    Distracted: "Afgelei",
    Berserk: "Berserk",
    "Indefinite Insanity": "Onbepaalde waansin",
    Injured: "Beseer",
    Mania: "Manie",
    Phobia: "Fobie",
    "Seriously Wounded": "Ernstig gewond",
    "Temporary Insanity": "Tydelike waansin",
    Ablaze: "Aan die brand",
    Broken: "Gebreek",
    Surprised: "Verras",
    Bleed: "Bloed",
    "Energy Drained": "Energie gedreineer",
    Entangled: "Verstrengel",
    Fear: "Vrees",
    Hampered: "Bemoeilik",
    "Ongoing Damage": "Deurlopende skade",
    Vulnerable: "Kwesbaar",
    Diseased: "Siek",
    Held: "Gehou",
    Compelled: "Gedwonge",
    Impaired: "Gestremde",
    Panicking: "Paniekbevange",
    Disoriented: "Gedisoriënteerd",
    Ensnared: "Verstrengel",
    Strained: "Gespanne",
    Afraid: "Bang",
    Angry: "Kwaad",
    Corrupted: "Korrupte",
    Harmed: "Benadeel",
    Hungry: "Honger",
    Infected: "Besmet",
    Isolated: "Geïsoleer",
    "Blood Bound": "Bloed gebind",
    Entranced: "Betree",
    Frenzied: "Waansinnig",
    Torpor: "Torpor",
    "Knocked Down": "Afgeslaan",
    Paradox: "Paradoks",
    "Willpower Spent": "Wilskrag spandeer",
    Bedlam: "Bedlam",
    "Chimera-Touched": "Chimera-aangeraak",
    "Mortally Wounded": "Dodelik gewond",
    Insane: "Waansinnig",
    Debilitated: "Verswakte",
    Deprived: "Ontneem",
    Shocked: "Geskok",
    Intoxicated: "Bedwelm",
    Spell: "Towerspreuk",
    Ability: "Vermoë",
    Advantage: "Voordeel",
    Disadvantage: "Nadeel",
    Other: "Ander",
  },
  templates: {
    display: {
      custom: "{emoji} {target} geraak deur {effect} ({source})",
      advantage: "{emoji} {source} het voordeel teen {target}{subject}",
      disadvantage: "{emoji} {source} het nadeel teen {target}{subject}",
      noBy: "PLEKHOUER0TOKEN PLEKHOUER1TOKEN PLEKHOUER2TOKEN (PLEKHOUER3TOKEN)",
      self: "{target} is {past}",
      standard: "{emoji} {target} {past} deur {source}",
    },
    apply: {
      custom: "{source} pas {effect} toe op {target}.",
      advantage: "{source} het voordeel teen {target}{subject}.",
      disadvantage: "{source} het nadeel teen {target}{subject}.",
      self: "{target} is {past}.",
      withSuffix:
        "PLEKHOUER0TOKEN PLEKHOUER1TOKEN PLEKHOUER2TOKEN PLEKHOUER3TOKEN.",
      standard: "PLEKHOUER0TOKEN PLEKHOUER1TOKEN PLEKHOUER2TOKEN.",
    },
    remove: {
      custom: "{target} word nie meer deur {effect} geraak nie.",
      advantage: "{source} het nie meer voordeel teen {target}{subject} nie.",
      disadvantage: "{source} het nie meer nadeel teen {target}{subject} nie.",
      noBy: "{target} is nie meer {past} nie.",
      self: "{target} is nie meer {past} nie.",
      standard: "{target} word nie meer {past} deur {source} nie.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Kies Toestand",
      selectSource: "Kies Bron-token",
      selectTarget: "Kies Teikentoken",
      selectSubject: "Kies Onderwerp",
      selectDuration: "Kies Duur",
      confirmTargetTitle: "Bevestig Teikenslys",
      applyEffectTitle: "Pas {condition}-effek toe",
      noTokens: "Geen benoemde tokens gevind op die aktiewe bladsy nie.",
      confirmIntro: "Die volgende tokens sal die toestand ontvang:",
      confirmBtn: "Bevestig teikenslys",
      enterDetails: "Voer effekbesonderhede in",
      noneBtn: "Geen",
      noneOrSourceBtn: "Geen of pas op bron toe",
      subjectDesc: "Kies wie of wat die effek toepas.",
      sourceDesc: "Kies die wese wat die toestand of effek skep.",
      targetDesc: "Kies die wese wat die toestand of effek ontvang.",
      otherText: "Aangepaste toestandteks",
      effectDetails: "{condition}-besonderhede",
    },
    col: {
      players: "Spelers",
      npcs: "NPS'e",
      conditions: "Toestande",
      customEffects: "Aangepaste Effekte",
      permanentTurnEnd: "Permanent / Beurt Einde",
      rounds: "Rondtes",
      command: "Opdrag",
      result: "Resultaat",
      field: "Veld",
      value: "Waarde",
      option: "Opsie",
      condition: "Toestand",
      marker: "Merker",
      item: "Item",
      removed: "Verwyder",
      details: "Besonderhede",
      description: "Beskrywing",
      scenario: "Scenario",
      gameSystem: "Spelstelsel",
      duration: "Duur",
    },
    dur: {
      untilRemoved: "Tot verwydering",
      endOfTargetTurn: "Einde van teiken se volgende beurt",
      endOfSourceTurn: "Einde van bron se volgende beurt",
      round1: "1 rondte",
      round2: "2 rondtes",
      round3: "3 rondtes",
      round10: "10 rondtes",
      custom: "Aangepas",
      customPrompt: "Aantal rondtes",
      untilRemovedDisplay: "Tot verwydering",
      turnsRemaining: "{n} beurt-einde(s) wat gevolg word, oor",
    },
    btn: {
      openWizard: "Maak Towenaar Oop",
      openMultiTarget: "Maak Multiteiken-towenaar Oop",
      openRemovalList: "Maak Verwyderlys Oop",
      showConfig: "Wys Konfigurasie",
      runCleanup: "Voer Opruiming Uit",
      reinstallMacro: "Herinstalleer Makro",
      reinstallHandout: "Herinstalleer Handout",
      showHelp: "Wys Hulp",
      reorderConditions: "Herrangskik Toestandrye",
      reportToken: "Rapporteer Token Voorwaardes",
      savedEffects: "Gestoorde effekte",
      addSavedEffect: "Voeg gestoorde effek by",
      editSaved: "Wysig",
      removeSaved: "Verwyder",
      promoteSaved: "Voeg by Turn Tracker",
      snoozeSaved: "Sluimer",
      clearSnooze: "Vee Sluimer uit",
    },
    title: {
      menu: "Kieslys",
      removalMenu: "Condition Tracker — Verwydering",
      config: "Konfigurasie",
      configTracker: "Condition Tracker — Konfigurasie",
      help: "Hulp",
      applied: "Toegepas",
      removed: "Toestand Verwyder",
      cleanup: "Opruiming Voltooi",
      macroReinstalled: "Makro Herinstalleer",
      handoutReinstalled: "Handout Herinstalleer",
      warning: "Waarskuwing",
      error: "Fout",
      turnOrder: "Beurtorde",
      noConditions: "Geen Toestande",
      tokenMoved: "Token Verskuif",
      markedDead: "As Dood Gemerk",
      zeroHp: "{name} — 0 LP",
      moveToken: "{name} — Verskuif Token?",
      scriptReady: "Skrip Gereed",
      conditionReorder: "Beurtorde Verander",
      tokenReport: "Token-toestandverslag",
      savedEffects: "Gestoorde effekte",
      savedAdd: "Voeg gestoorde effek by",
      savedEdit: "Wysig gestoorde effek",
      savedRemoved: "Gestoorde effek verwyder",
      savedPromoted: "Voeg by Turn Tracker",
      savedSnoozed: "Herinnering gesluimer",
      savedSnoozeCleared: "Sluimer is uitgevee",
      hiddenEffects: "Versteekte effekte — {name}",
    },
    heading: {
      quickActions: "Vinnige Aksies",
      settings: "Instellings",
      markerMappings: "Merkertoewysings",
      result: "Resultaat",
      info: "Inligting",
      commandOptions: "Opdragopsies",
      promptUi: "Towenaar-koppelvlak",
      examples: "Voorbeelde",
      summary: "Opsomming",
      appliedTo: "Voorwaardes van toepassing op",
      appliedBy: "Voorwaardes toegepas deur",
      savedEffectsFor: "Gestoorde effekte vir {name}",
      visibility: "Sigbaarheid",
      snoozeOptions: "Sluimerherinnering",
      promoteOptions: "Bevorder na Draai Tracker",
      editActions: "Wysig aksies",
    },
    msg: {
      noActive: "Geen aktiewe toestande word gevolg nie.",
      configReset: "Konfigurasie terugstel na verstekwaardes.",
      unknownConfig:
        "Onbekende konfigurasieopsie. Gebruik --config om ondersteunde instellings te sien.",
      macroReinstalled:
        "Die {wizard}-, {multiTarget}-, {reportToken}-, {saved}- en {classify}-makros is herinstalleer vir alle huidige GM-spelers.",
      handoutReinstalled: "Die hulp-handout {handout} is herinstalleer.",
      duplicate:
        "Hierdie presiese kombinasie van bron, onderwerp, teiken, toestand en aangepaste teks is reeds aktief.",
      noTargets:
        "Geen teikentoken gespesifiseer vir multiteiken-toepassing nie.",
      noSelection:
        "Kies ten minste een token op die bord voordat jy --multi-target gebruik.",
      invalidIds: "Geen geldige token-ID's gevind in die huidige keuse nie.",
      reSelectTokens:
        "Nie een van die oorspronklik gekose tokens kon gevind word nie. Kies tokens weer en probeer opnuut.",
      conditionNotFound: "Toestand-ID nie gevind nie.",
      gmOnly: "Condition Tracker-opdragte is slegs vir die GM.",
      commandFailed:
        "Die opdrag kon nie veilig voltooi word nie. Kyk die API-konsole vir besonderhede.",
      sourceTokenNotFound: "Bron-token kon nie gevind word nie.",
      targetTokenNotFound: "Teikentoken kon nie gevind word nie.",
      subjectTokenNotFound: "Onderwerp-token kon nie gevind word nie.",
      invalidGameSystem:
        "Ongeldige speletjiestelsel. Gebruik --config spelstelsel &lt;id&gt;. Ondersteunde stelsels:",
      gameSystemSet:
        "Speletjiestelsel gestel op {system}. Merkers is teruggestel na stelselverstellings.",
      invalidCondition:
        "Toestand moet een van die vooraf bepaalde toestande of Ander wees.",
      subjectOnlyCustom:
        "--subject is slegs geldig vir Towerspreuk, Vermoë, Voordeel, Nadeel en Ander.",
      subjectBypassInvalid:
        "--subjectPromptBypass verwag true of false wanneer 'n waarde verskaf word.",
      customDetailsRequired:
        "{condition}-besonderhede is vereis. Gebruik --other om dit te verskaf.",
      markerConfigFormat:
        "Merker-konfigurasieformaat is: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Merkerkonfigurasie vereis 'n vooraf bepaalde toestandnaam.",
      markerNameRequired: "Merkerkonfigurasie vereis 'n nie-leë merkernaam.",
      markerSet: "{condition}-merker gestel op {marker}.",
      healthBarSet: "Gesondheidsstaaf gestel op {bar}.",
      boolSet: "{key} gestel op {value}.",
      expectedBoolean: "true of false verwag.",
      invalidHealthBar:
        "Gesondheidsstaaf moet bar1_value, bar2_value of bar3_value wees.",
      markersDisabled: "Merkers is gedeaktiveer.",
      noMarkerConfigured: "Geen merker is opgestel vir hierdie toestand nie.",
      markerApplied: "Merker toegepas: {marker}",
      markerPresent: "Merker reeds teenwoordig: {marker}",
      langSet: "Taal gestel op {locale}.",
      invalidLocale: "Ongeldige lokaal. Ondersteunde lokale: {locales}.",
      otherDurationRequiresRounds:
        "Ander-duur vereis 'n numeriese rondte-telling, byvoorbeeld --duration 5 rounds.",
      invalidDuration:
        "Duur moet Tot verwydering, 'n beurt-einde-opsie of 'n positiewe rondte-telling wees.",
      zeroHpNoConditions:
        "{name} het 0 LP bereik en het geen aktiewe toestande nie.",
      zeroHpConditions:
        "{name} het 0 LP bereik. Kies toestande om te verwyder:",
      removeAllBtn: "Verwyder Alle Toestande vir {name}",
      markIncapacitated: "Merk as Onbekwaam",
      removeFromTurnOrder: "Verwyder uit Beurtorde",
      alreadyIncapacitated: "{name} is reeds Onbekwaam.",
      tokenRemovedFromTurn: "{name} is uit die beurtorde verwyder.",
      tokenNotInTurn: "{name} is nie in die beurtorde gevind nie.",
      moveTokenPrompt:
        "Verskuif {name} na die kaartlaag sodat dit sigbaar bly maar ander tokens nie steur nie?",
      moveTokenBtn: "Verskuif {name} na Kaartlaag",
      tokenMoved: "{name} is na die kaartlaag verskuif.",
      tokenNotFound: "Token nie gevind nie.",
      noActiveConditions:
        "{name} het geen aktiewe toestande om te verwyder nie.",
      deadNoConditions:
        "{name} is as dood gemerk. Geen toestande was aktief nie.",
      scriptReady: "{name} is aktief en jy gebruik weergawe {version}.",
      reachedZeroHp: "{name} het 0 LP bereik",
      manuallyRemoved: "dit is handmatig verwyder",
      durationExpired: "die duur het verstryk",
      markedAsDead: "{name} is as dood gemerk",
      conditionReorder:
        "Die beurtorde het verander en {count} gevolge toestandry(e) mag nou buite plek wees. Klik hieronder om hulle ná hul toegewysde tokens te herstel.",
      conditionsReordered:
        "Toestandrye is herposisioneer ná hul toegewysde tokens.",
      noTokensSelectedReport:
        "Kies ten minste een teken op die bord voordat jy --report-token gebruik.",
      noConditionsAppliedTo:
        "{name} het geen aktiewe voorwaardes daarop toegepas nie.",
      noConditionsAppliedBy:
        "{name} het geen aktiewe voorwaardes wat op ander toegepas is nie.",
      noSavedEffects: "Geen gestoorde effekte gestoor vir {name} nie.",
      noTokenSelectedSaved:
        "Kies 'n teken op die bord voordat jy --save gebruik.",
      savedEffectAdded: "Gestoorde effek bygevoeg vir {name}.",
      savedEffectUpdated: "Gestoorde effek is opgedateer.",
      savedEffectRemoved: "Gestoorde effek is verwyder.",
      savedEffectNotFound: "Gestoorde effek nie gevind nie.",
      savedInvalidVisibility:
        "Ongeldige sigbaarheid. Gebruik publiek, gemaskerde of GM.",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "Effek is as publiek by Turn Tracker gevoeg.",
      savedPromotedMasked:
        "Effek bygevoeg by Turn Tracker as gemaskerde — spelers sien: {publicLabel}.",
      savedPromotedGm:
        "Effek is slegs GM - geen Turn Tracker-ry sal geskep word nie. Die herinneringstelsel sal dit na vore kom wanneer hierdie teken die bokant van die beurtvolgorde bereik.",
      savedSnoozed: "Onthounota gesluimer: {scope}.",
      savedSnoozeCleared: "Sluimer is uitgevee.",
      hiddenEffectsReminder: "Versteekte effekte is aktief op {name}.",
      visibilityPublicHint: "volledige etiket sigbaar vir almal",
      visibilityMaskedHint: "vae etiket wat aan spelers gewys word",
      visibilityGmHint: "Slegs GM fluister, geen Turn Tracker-ry nie",
    },
    removal: {
      conditionField: "Toestand",
      reasonField: "Rede",
      turnRowField: "Beurtorde-ry",
      markerField: "Merker",
      notConfigured: "Nie opgestel nie",
      markerRemoved: "Verwyder ({marker})",
      markerRetained: "Behou ({marker})",
      rowRemoved: "Verwyder",
      rowMissing: "Reeds ontbreek",
      manualReason: "Handmatige verwydering",
    },
    saved: {
      visibility: {
        public: "Publiek",
        masked: "Gemasker",
        gm: "Slegs GM",
      },
      snooze: {
        thisTurn: "Hierdie draai",
        oneRound: "1 Rondte",
        threeRounds: "3 Rondtes",
        thisCombat: "Hierdie Geveg",
        rounds: "{n} rondte(s)",
      },
      field: {
        gmLabel: "GM Etiket",
        publicLabel: "Openbare Etiket",
        visibility: "Sigbaarheid",
        source: "Bron",
        condition: "Toestand",
      },
      prompt: {
        enterGmLabel: "Volledige effekbeskrywing (slegs GM)",
        enterPublicLabel: "Vae etiket gewys aan spelers",
      },
      snoozed: "gesluimer",
    },
    classify: {
      title: "Akteur-Klassifikasie",
      showTitle: "Klassifikasie-Diagnose",
      showHeading: "Token-Klassifikasie-Besonderhede",
      resultHeading: "Oorskrywing Toegepas",
      noSelection:
        "Kies ten minste een token op die bord voordat jy --classify gebruik.",
      invalidType:
        "Ongeldige klassifikasietipe: {type}. Gebruik pc, npc, ignored of auto.",
      set: "{name} → {type} (omvang: {scope})",
      cleared:
        "{name} oorskrywing uitgevee (omvang: {scope}) — outomatiese opsporing herstel.",
      setTokenFallback:
        "{name} → {type} (token-oorskrywing — geen karakterblad gekoppel nie).",
      clearedTokenFallback:
        "{name} token-oorskrywing uitgevee — outomatiese opsporing herstel.",
      fieldToken: "Teken",
      fieldType: "Klassifikasie",
      fieldSource: "Bron",
      fieldReason: "Rede",
    },
    cleanup: {
      orphaned: "Weesagtige toestandinskrywings",
      stale: "Verouderde toestandinskrywings",
      orphanedRows: "Weesagtige beurtorde-rye",
      unusedMarkers: "Ongebruikte merkers",
    },
    apply: {
      turnAppended:
        "Teiken was nie in die beurtorde nie; toestandry is aangeheg.",
      turnInserted: "Toestandry ingevoeg onder die teikentoken.",
    },
  },
  handout: {
    versionLabel: "Weergawe",
    subtitle: "D&D 5e Statuseffek-bestuurder",
    footerNote:
      "Hierdie handout word outomaties geskep en bygewerk elke keer as die skrip laai.",
    overview: {
      heading: "Oorsig",
      body: "Condition Tracker bestuur D&D 5e-statustoestande en aangepaste effekte as geëtiketteerde rye in die Roll20 Beurtopvolger. Pas toestande toe op tokens, volg duurtes op inisiatieford en verwyder verstekde effekte outomaties wanneer 'n beurt eindig. Alle opdragte is slegs vir die GM en kan vanuit die klets of via die geïnstalleerde makros uitgevoer word.",
    },
    quickStart: {
      heading: "Vinnige Begin",
      colCommand: "Opdrag",
      colDesc: "Beskrywing",
      rows: [
        [
          "!toestand-spoorsnyer --prompt",
          "Stap-vir-stap towenaar — kies toestand, tokens en duur interaktief. Ook beskikbaar as die ConditionTrackerWizard-makro.",
        ],
        [
          "!toestand-spoorsnyer --multi-teiken",
          "Pas een toestand gelyktydig op verskeie tokens toe. Ook beskikbaar as die ConditionTrackerMultiTarget-makro.",
        ],
        [
          "!toestand-spoorsnyer --verslag-token",
          "Kies eers een of meer tekens, voer dan hierdie opdrag uit om 'n GM-fluistering te kry wat elke toestand op en deur elke geselekteerde teken lys. Ook beskikbaar as die ConditionTrackerReportToken-makro.",
        ],
        [
          "!condition-tracker --menu",
          "Maak die hoofbestuurskieslys oop met knoppies om toestande toe te pas, te hersien of te verwyder.",
        ],
        [
          "!condition-tracker --classify wys",
          "Kies eers een of meer tekens en voer dan hierdie opdrag uit om 'n diagnostiese fluistering te sien wat elke teken se akteurklassifikasie, opsporingsbron en rede wys. Gebruik --classify pc|npc|geïgnoreer om te ignoreer, of --classify outomaties om outomatiese opsporing te herstel. Ook beskikbaar as die ConditionTrackerClassify-makro.",
        ],
        [
          "!toestand-spoorsnyer --menu",
          "Maak die hoofbestuurkieslys oop met knoppies om voorwaardes toe te pas, te hersien of te verwyder.",
        ],
      ],
    },
    commandsRef: {
      heading: "Opdragreferensie",
      colFlag: "Vlag",
      colDesc: "Beskrywing",
      rows: [
        ["-- prompt", "Interaktiewe stap-vir-stap towenaar-koppelvlak"],
        [
          "-- multi-teiken",
          "Pas 'n toestand op verskeie teikentoken gelyktydig toe",
        ],
        [
          "-- spyskaart",
          "Wys hoofkieslys (voeg remove by vir verwyderingskieslys)",
        ],
        [
          "--bron X --teiken Y --toestand Z",
          "Pas 'n toestand direk toe sonder die towenaar",
        ],
        [
          "--duration &lt;waarde&gt;",
          "Duur vir 'n direkte toepassing (bv. 2 rounds)",
        ],
        [
          "--other &lt;teks&gt;",
          "Aangepaste teks vir Towerspreuk / Vermoë / Ander effektipes",
        ],
        [
          "--remove &lt;toestand-ID&gt;",
          "Verwyder 'n spesifieke toestand met sy unieke ID",
        ],
        [
          "--config &lt;opsie&gt; &lt;waarde&gt;",
          "Pas konfigurasie-instellings aan (sien Konfigurasie-afdeling hieronder)",
        ],
        [
          "--prompt --subjectPromptBypass waar|onwaar",
          "Oorskryf subjectPromptBypass slegs vir hierdie opdrag (ondersteun ook --subject-prompt-bypass)",
        ],
        [
          "-- skoonmaak",
          "Versoen toestand — verwyder weesagtige toestande en beurtorde-rye",
        ],
        [
          "--herbestel-voorwaardes",
          "Verskuif toestandrye handmatig agter hul aangewese tokens in die beurtorde",
        ],
        ["--herinstalleer-makro", "Herskep of dateer GM-makros op"],
        [
          "--herinstalleer-uitdeelstuk",
          "Herskep of dateer die gelokaliseerde hulp-handout op",
        ],
        [
          "--verslag-token",
          "Fluister 'n GM-enigste toestandverslag vir elke geselekteerde teken (toestande wat daarop toegepas word en daardeur)",
        ],
        [
          "--lang &lt;lokaal&gt;",
          "Gee hierdie opdrag se boodskappe in 'n bykomende lokaal uit (tweetalige modus)",
        ],
        [
          "--classify pc|npc|ignored",
          "Skryf die akteur-tipe vir gekose tokens oor — kies eers token(s). Standaard omvang is karakter (skryf ct_mod_actor_type-kenmerk); voeg --scope token by om in skripstatus te stoor",
        ],
        [
          "--classify auto",
          "Verwyder die akteur-tipe-oorskrywing en herstel outomatiese opsporing vir gekose tokens",
        ],
        [
          "--classify show",
          "Fluister 'n klassifikasie-diagnose vir elke gekose token — wys die bepaalde tipe, opsporingsbron en rede",
        ],
        ["--help", "Wys 'n kort hulpkaart in die klets"],
        [
          "--saved sluimer &lt;id&gt; --scope draai|rondtes|geveg --rounds &lt;n&gt;",
          "Sluimer 'n gestoorde effek-herinnering vir die huidige beurt, N rondtes of hierdie geveg",
        ],
        [
          "--saved sluimer-vee &lt;id&gt;",
          "Vee 'n aktiewe sluimer op 'n gestoorde effek uit",
        ],
        [
          "--lang &lt;locale&gt;",
          "Voer hierdie opdrag se boodskappe in 'n bykomende plek uit (tweetalige modus)",
        ],
        [
          "--classify pc|npc|geïgnoreer",
          "Ignoreer die tipe akteur vir geselekteerde tekens - kies eers tekens. Verstek omvang is karakter (skryf ct_mod_actor_type kenmerk); voeg --scope token by om eerder in skriptoestand te stoor",
        ],
        [
          "--classify outomaties",
          "Verwyder die akteur-tipe ignorering en herstel outomatiese opsporing vir geselekteerde tokens",
        ],
        [
          "--classify wys",
          "Fluister 'n klassifikasie-diagnose vir elke geselekteerde teken - wys die bespeurde tipe, opsporingsbron en rede",
        ],
        ["--help", "Wys 'n kort hulpkaart in klets"],
      ],
    },
    standardConditions: {
      heading: "Standaard Toestande (D&amp;D 5e)",
      colCondition: "Toestand",
      none: "Geen standaardvoorwaardes gedefinieer vir hierdie speletjiestelsel nie. Gebruik die Ander pasgemaakte effektipe vir vrytekseffekte.",
    },
    customEffects: {
      heading: "Aangepaste Effektipes",
      colType: "Tipe",
      colNotes: "Notas",
      rows: [
        [
          "🔮 Towerspreuk",
          "Volg 'n benoemde towerspreukeffek — jy sal gevra word vir die spreukse naam",
        ],
        [
          "🎯 Vermoë",
          "Volg 'n benoemde klas- of rasvermoë — jy sal gevra word vir die naam",
        ],
        [
          "🍀 Voordeel",
          "Teken voordeel op van een token na 'n ander; gegroepeer met die bron in inisiatief",
        ],
        [
          "⬇️ Nadeel",
          "Teken opgelegde nadeel op; gegroepeer met die bron in inisiatief",
        ],
        [
          "📝 Ander",
          "Vryvorm aangepaste etiket — jy sal gevra word vir 'n beskrywing",
        ],
      ],
    },
    durationOptions: {
      heading: "Duuropsies",
      intro:
        "Die oorblywende telling word in die pr-kolom van die Beurtopvolger gewys en verminder wanneer die ankerteken se beurt eindig.",
      colOption: "Opsie",
      colBehaviour: "Gedrag",
      rows: [
        [
          "Tot verwydering",
          "Permanent — moet handmatig verwyder word via die kieslys of --remove",
        ],
        [
          "Einde van teiken se volgende beurt",
          "Verval wanneer die teikentoken se volgende beurt in inisiatief eindig",
        ],
        [
          "Einde van bron se volgende beurt",
          "Verval wanneer die bron-token se volgende beurt in inisiatief eindig",
        ],
        [
          "1 / 2 / 3 / 10 rondtes",
          "Vaste aftelrekening; een vermindering per ankerteken-beurt-einde",
        ],
      ],
    },
    savedEffects: {
      heading: "Gestoorde effekte",
      intro:
        "Gestoorde effekte laat jou toe om langtermyntoestande buite die Turn Tracker te stoor - vloeke, siektes, gifstowwe, verborge debuffs en ander nie-gevegstoestande. Hulle bly in skriftoestand en kan opsioneel na die Turn Tracker gekopieer word wanneer gevegte begin.",
      visibility: {
        heading: "Sigbaarheidmodusse",
        rows: [
          [
            "publiek",
            "Volledige effek-etiket is sigbaar in die Turn Tracker en publieke klets.",
          ],
          [
            "gemasker",
            "'n Vae publieke etiket word aan spelers gewys; volledige besonderhede is slegs vir GM.",
          ],
          [
            "gm",
            "Geen Draai Tracker-ry nie. Volledige besonderhede word in staat gestoor en aan die GM gefluister wanneer die geaffekteerde token die toppunt van inisiatief bereik.",
          ],
        ],
      },
      commands: {
        heading: "Gestoorde effekte-opdragte",
        intro:
          "Alle --gestoorde opdragte is slegs GM. Kies 'n teken voordat jy --gestoorde of --gestoorde byvoeging uitvoer.",
        rows: [
          [
            "!toestand-spoorsnyer --gestoor",
            "Bekyk gestoorde effekte vir die geselekteerde teken.",
          ],
          [
            "!condition-tracker --gestoorde byvoeging",
            "Begin die towenaar byvoeg-gestoor-effek.",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "Wysig etikette of sigbaarheid vir 'n bestaande gestoorde effek.",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "Verwyder 'n gestoorde effek permanent.",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "Kopieer 'n gestoorde effek na die Turn Tracker (publiek of gemaskerde) of bevestig dit is slegs GM-nagespoor.",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "Sluimer 'n GM-herinnering vir hierdie beurt, N rondtes of hierdie geveg.",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "Maak 'n aktiewe sluimer skoon sodat onthounotas onmiddellik hervat word.",
          ],
        ],
      },
      reminders: {
        heading: "GM-herinneringe",
        body: "Wanneer 'n teken met GM of gemaskerde gestoorde effekte die bokant van die Turn Tracker bereik, ontvang die GM 'n fluistering wat die verborge effekte met aksieknoppies lys. Duplikaatherinneringe binne dieselfde beurt word onderdruk. Gebruik die Sluimer-knoppies om herinneringe vir 'n beurt, 'n aantal rondtes of vir die res van die huidige geveg te onderdruk.",
      },
    },
    actorClassification: {
      heading: "Akteur-Klassifikasie",
      intro:
        "Condition Tracker bepaal outomaties of elke token 'n SC, NPC of 'n genegeerde voorwerp is (kaartpenne, dekorstukke, towerformulie-sjablone). Ongekoppelde tokens word standaard genegeer. Gebruik --classify om outomatiese opsporing vir enige token te oorskryf.",
      detectionOrder: {
        heading: "Opsporingsvolgorde",
        colStep: "Stap",
        colCheck: "Kontrole",
        colResult: "Resultaat",
        rows: [
          [
            "1",
            "Token-toestand-oorskrywing (--classify --scope token)",
            "pc / npc / geïgnoreer",
          ],
          [
            "2",
            "Karakter ct_mod_actor_type-kenmerk (--classify --scope character)",
            "pc / npc / geïgnoreer",
          ],
          ["3", "Ongekoppelde token — geen karakterblad", "geïgnoreer"],
          ["4", "Spelstelsel-adapter (npc / is_npc kenmerk)", "pc / npc"],
          [
            "5",
            "Generiese NPC-kenmerkskandering (npc, is_npc, npcflag, sheet_type, character_type)",
            "pc / npc",
          ],
          ["6", "Karakter controlledby-terugval", "pc / npc"],
        ],
      },
      types: {
        heading: "Klassifikasietipes",
        colType: "Tipe",
        colMeaning: "Betekenis",
        rows: [
          [
            "rekenaar",
            "Spelerkarakter — altyd ingesluit as SC in die towenaar en opsporing",
          ],
          ["npc", "Nie-spelerkarakter — altyd ingesluit as NPC"],
          [
            "geïgnoreer",
            "Nooit gewys of opgespoor nie — uitgesluit van die towenaar se token-kieser",
          ],
          [
            "onbekend",
            "Slegs outomatiese opsporing; kon nie tipe bepaal nie (as NPC in die towenaar behandel)",
          ],
        ],
      },
      commands: {
        heading: "Klassifikasieopdragte",
        intro:
          "Kies een of meer tokens voordat jy --classify-opdragte uitvoer.",
        rows: [
          [
            "!toestand-spoorsnyer --klassifiseer rekenaar",
            "Merk gekose tokens as SC's (standaard omvang: karakter).",
          ],
          [
            "!condition-tracker --klassifiseer npc",
            "Merk gekose tokens as NPC's.",
          ],
          [
            "!condition-tracker --klassifiseer geïgnoreer",
            "Sluit gekose tokens uit van alle nasporing.",
          ],
          [
            "!toestand-spoorsnyer --klassifiseer outomaties",
            "Verwyder oorskrywing — herstel outomatiese opsporing.",
          ],
          [
            "!toestand-spoorsnyer --klassifiseer vertoning",
            "Wys klassifikasie-diagnose (tipe, bron, rede) vir elke gekose token.",
          ],
          [
            "!condition-tracker --klassifiseer rekenaar --scope token",
            "Token-oorskrywing gestoor in skripstatus — nuttig vir ongekoppelde tokens.",
          ],
          [
            "!condition-tracker --klassifiseer rekenaar --scope karakter",
            "Karakter-oorskrywing geskryf na ct_mod_actor_type-kenmerk — geld vir alle tokens met dieselfde karakterblad.",
          ],
        ],
      },
    },
    configuration: {
      heading: "Konfigurasie",
      intro:
        "Gebruik !condition-tracker --config &lt;opsie&gt; &lt;waarde&gt; of die Konfigurasie-knoppie in die hoofkieslys.",
      colOption: "Opsie",
      colValues: "Waardes",
      colDesc: "Beskrywing",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Pas Roll20-statusmerkers op tokens toe wanneer 'n toestand bygevoeg word",
        ],
        [
          "useIcons",
          "waar / onwaar",
          "Wys kort ikonskodes (bv. [G]) in plaas van emoji in Beurtopvolger-rye",
        ],
        [
          "subjectPromptBypass",
          "waar / onwaar",
          "Slaan die opsionele onderwerp-tokenstap oor vir Towerspreuk / Vermoë / Ander effekte",
        ],
        [
          "suppressPublicChat",
          "waar / onwaar",
          "Onderdruk alle openbare kletsboodskappe (toepassing en verwydering). GM-fluisterings word nie beïnvloed nie.",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Tokenstaaf om te monitor; wanneer dit op 0 daal, word die GM gevra om toestande op te ruim",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Uitvoertaal vir kletsberoepe en die hulp-handout",
        ],
        [
          "marker",
          "&lt;Toestand&gt;=&lt;merkernaam&gt;",
          "Oorskryf die statusmerker wat gebruik word vir 'n spesifieke toestand (bv. marker Grappled=grab)",
        ],
        [
          "merker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Ignoreer die statusmerker wat vir 'n spesifieke toestand gebruik word (bv. merker Grappled=grab)",
        ],
      ],
    },
    gameSystems: {
      heading: "Ondersteunde speletjiestelsels",
      intro:
        "Gebruik !condition-tracker --config gameSystem &lt;id&gt; om stelsels te wissel. Omskakeling stel tokenmerker-afbeeldings terug na die nuwe stelsel se verstekke. Jou aktiewe toestande word bewaar.",
      colId: "Stelsel ID",
      colName: "Spelstelsel",
    },
    defaultMarkers: {
      heading: "Verstek Statusmerkers",
      colCondition: "Toestand",
      colMarker: "Merkernaam",
      none: "Geen verstekmerkers word vir hierdie speletjiestelsel gedefinieer nie.",
    },
    availableLocales: {
      heading: "Beskikbare Vertalings",
      intro:
        "Gebruik die taal-konfigurasie-opsie om kletsberoepe en die hulp-handout op 'n ondersteunde lokaal in te stel. Kort aliasse word ook aanvaar vir en, zh en pt.",
      colLocale: "Lokaal",
      colLanguage: "Taal",
      colFile: "Vertaallêer",
    },
  },
};

export default TRANSLATION;
