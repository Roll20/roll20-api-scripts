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
      openWizard: "Open Wizard",
      openMultiTarget: "Open Multidoel-wizard",
      openRemovalList: "Open Verwijderlijst",
      showConfig: "Toon Configuratie",
      runCleanup: "Voer Opruiming Uit",
      reinstallMacro: "Macro Herinstalleren",
      reinstallHandout: "Handout Herinstalleren",
      showHelp: "Toon Help",
      reorderConditions: "Conditierijen Herordenen",
    },
    title: {
      menu: "Menu",
      removalMenu: "Condition Tracker — Verwijdering",
      config: "Configuratie",
      configTracker: "Condition Tracker — Configuratie",
      help: "Help",
      applied: "Toegepast",
      removed: "Conditie Verwijderd",
      cleanup: "Opruiming Voltooid",
      macroReinstalled: "Macro Herinstalleerd",
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
    },
    msg: {
      noActive: "Er worden geen actieve condities bijgehouden.",
      configReset: "Configuratie teruggezet naar standaardwaarden.",
      unknownConfig:
        "Onbekende configuratieoptie. Gebruik --config om ondersteunde instellingen te bekijken.",
      macroReinstalled:
        "De {wizard}- en {multiTarget}-macro's zijn herinstalleerd voor alle huidige GM-spelers.",
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
          "!condition-tracker --prompt",
          "Stap-voor-stap wizard — kies conditie, tokens en duur interactief. Ook beschikbaar als de ConditionTrackerWizard-macro.",
        ],
        [
          "!condition-tracker --multi-target",
          "Pas één conditie tegelijkertijd toe op meerdere tokens. Ook beschikbaar als de ConditionTrackerMultiTarget-macro.",
        ],
        [
          "!condition-tracker --menu",
          "Open het hoofdbeheermenu met knoppen om condities toe te passen, te bekijken of te verwijderen.",
        ],
      ],
    },
    commandsRef: {
      heading: "Opdrachtenoverzicht",
      colFlag: "Vlag",
      colDesc: "Beschrijving",
      rows: [
        ["--prompt", "Interactieve stap-voor-stap wizard-interface"],
        [
          "--multi-target",
          "Pas een conditie tegelijkertijd toe op meerdere doeltokens",
        ],
        ["--menu", "Toon hoofdmenu (voeg remove toe voor verwijdermenu)"],
        [
          "--source X --target Y --condition Z",
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
          "--prompt --subjectPromptBypass true|false",
          "Overschrijf subjectPromptBypass alleen voor deze opdracht (ondersteunt ook --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Herstel staat — verwijder verweesde condities en beurtenvolgorde-rijen",
        ],
        [
          "--reorder-conditions",
          "Conditierijen handmatig herpositioneren achter hun toegewezen tokens in de beurtvolgorde",
        ],
        ["--reinstall-macro", "Maak GM-macro's opnieuw aan of werk ze bij"],
        [
          "--reinstall-handout",
          "Maak de gelokaliseerde help-handout opnieuw aan of werk deze bij",
        ],
        [
          "--lang &lt;locale&gt;",
          "Geef de berichten van deze opdracht uit in een aanvullende locale (tweetalige modus)",
        ],
        ["--help", "Toon een beknopte helpkaart in de chat"],
      ],
    },
    standardConditions: {
      heading: "Standaard Condities (D&amp;D 5e)",
      colCondition: "Conditie",
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
          "true / false",
          "Toon korte pictogramcodes (bijv. [G]) in plaats van emoji in beurtopvolger-rijen",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Sla de optionele onderwerptokenstap over voor Spreuk / Vaardigheid / Overige effecten",
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
      ],
    },
    defaultMarkers: {
      heading: "Standaard Statusmarkeringen",
      colCondition: "Conditie",
      colMarker: "Markeringsnaam",
    },
    availableLocales: {
      heading: "Beschikbare Vertalingen",
      intro:
        "Gebruik de taalconfiguratieopties om chatberichten en de help-handout in te stellen op een ondersteunde locale. Korte aliassen worden ook geaccepteerd voor en, zh en pt.",
      colLocale: "Locale",
      colLanguage: "Taal",
      colFile: "Vertaalbestand",
    },
  },
};

export default TRANSLATION;
