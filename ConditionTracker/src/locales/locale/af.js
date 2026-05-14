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
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} is {past}",
      standard: "{emoji} {target} {past} deur {source}",
    },
    apply: {
      custom: "{source} pas {effect} toe op {target}.",
      advantage: "{source} het voordeel teen {target}{subject}.",
      disadvantage: "{source} het nadeel teen {target}{subject}.",
      self: "{target} is {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
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
    },
    msg: {
      noActive: "Geen aktiewe toestande word gevolg nie.",
      configReset: "Konfigurasie terugstel na verstekwaardes.",
      unknownConfig:
        "Onbekende konfigurasieopsie. Gebruik --config om ondersteunde instellings te sien.",
      macroReinstalled:
        "Die {wizard}- en {multiTarget}-makros is herinstalleer vir alle huidige GM-spelers.",
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
          "!condition-tracker --prompt",
          "Stap-vir-stap towenaar — kies toestand, tokens en duur interaktief. Ook beskikbaar as die ConditionTrackerWizard-makro.",
        ],
        [
          "!condition-tracker --multi-target",
          "Pas een toestand gelyktydig op verskeie tokens toe. Ook beskikbaar as die ConditionTrackerMultiTarget-makro.",
        ],
        [
          "!condition-tracker --menu",
          "Maak die hoofbestuurskieslys oop met knoppies om toestande toe te pas, te hersien of te verwyder.",
        ],
      ],
    },
    commandsRef: {
      heading: "Opdragreferensie",
      colFlag: "Vlag",
      colDesc: "Beskrywing",
      rows: [
        ["--prompt", "Interaktiewe stap-vir-stap towenaar-koppelvlak"],
        [
          "--multi-target",
          "Pas 'n toestand op verskeie teikentoken gelyktydig toe",
        ],
        ["--menu", "Wys hoofkieslys (voeg remove by vir verwyderingskieslys)"],
        [
          "--source X --target Y --condition Z",
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
          "--prompt --subjectPromptBypass true|false",
          "Oorskryf subjectPromptBypass slegs vir hierdie opdrag (ondersteun ook --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Versoen toestand — verwyder weesagtige toestande en beurtorde-rye",
        ],
        [
          "--reorder-conditions",
          "Verskuif toestandrye handmatig agter hul aangewese tokens in die beurtorde",
        ],
        ["--reinstall-macro", "Herskep of dateer GM-makros op"],
        [
          "--reinstall-handout",
          "Herskep of dateer die gelokaliseerde hulp-handout op",
        ],
        [
          "--lang &lt;lokaal&gt;",
          "Gee hierdie opdrag se boodskappe in 'n bykomende lokaal uit (tweetalige modus)",
        ],
        ["--help", "Wys 'n kort hulpkaart in die klets"],
      ],
    },
    standardConditions: {
      heading: "Standaard Toestande (D&amp;D 5e)",
      colCondition: "Toestand",
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
          "true / false",
          "Wys kort ikonskodes (bv. [G]) in plaas van emoji in Beurtopvolger-rye",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Slaan die opsionele onderwerp-tokenstap oor vir Towerspreuk / Vermoë / Ander effekte",
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
      ],
    },
    defaultMarkers: {
      heading: "Verstek Statusmerkers",
      colCondition: "Toestand",
      colMarker: "Merkernaam",
    },
    availableLocales: {
      heading: "Beskikbare Vertalings",
      intro:
        "Gebruik die taal-konfigurasie-opsie om kletsberoepe en die hulp-handout op 'n ondersteunde lokaal in te stel. Kort aliasse word ook aanvaar vir en, zh en pt.",
      colLocale: "Locale",
      colLanguage: "Taal",
      colFile: "Vertaallêer",
    },
  },
};

export default TRANSLATION;
