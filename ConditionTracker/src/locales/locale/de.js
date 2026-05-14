const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "gepackt",
      verb: "packt",
    },
    Restrained: {
      past: "gefesselt",
      verb: "fesselt",
    },
    Prone: {
      past: "niedergeworfen",
      verb: "wirft",
      suffix: "nieder",
    },
    Poisoned: {
      past: "vergiftet",
      verb: "vergiftet",
    },
    Stunned: {
      past: "betäubt",
      verb: "betäubt",
    },
    Blinded: {
      past: "geblendet",
      verb: "blendet",
    },
    Charmed: {
      past: "bezaubert",
      verb: "bezaubert",
    },
    Frightened: {
      past: "verängstigt",
      verb: "verängstigt",
    },
    Incapacitated: {
      past: "kampfunfähig",
      verb: "macht kampfunfähig",
    },
    Invisible: {
      past: "unsichtbar",
      verb: "macht",
      suffix: "unsichtbar",
    },
    Paralyzed: {
      past: "gelähmt",
      verb: "lähmt",
    },
    Petrified: {
      past: "versteinert",
      verb: "versteinert",
    },
    Unconscious: {
      past: "bewusstlos",
      verb: "macht",
      suffix: "bewusstlos",
    },
    Spell: {
      past: "von einem Zauber betroffen",
      verb: "wirkt einen Zauber auf",
    },
    Ability: {
      past: "von einer Fähigkeit betroffen",
      verb: "setzt eine Fähigkeit gegen",
    },
    Advantage: {
      past: "hat Vorteil",
      verb: "gewährt Vorteil für",
      noBy: true,
    },
    Disadvantage: {
      past: "hat Nachteil",
      verb: "verhängt Nachteil gegen",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Gepackt",
    Restrained: "Gefesselt",
    Prone: "Liegend",
    Poisoned: "Vergiftet",
    Stunned: "Betäubt",
    Blinded: "Geblendet",
    Charmed: "Bezaubert",
    Frightened: "Verängstigt",
    Incapacitated: "Kampfunfähig",
    Invisible: "Unsichtbar",
    Paralyzed: "Gelähmt",
    Petrified: "Versteinert",
    Unconscious: "Bewusstlos",
    Spell: "Zauber",
    Ability: "Fähigkeit",
    Advantage: "Vorteil",
    Disadvantage: "Nachteil",
    Other: "Sonstiges",
  },
  templates: {
    display: {
      custom: "{emoji} {target} betroffen von {effect} ({source})",
      advantage: "{emoji} {source} hat Vorteil gegen {target}{subject}",
      disadvantage: "{emoji} {source} hat Nachteil gegen {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} ist {past}",
      standard: "{emoji} {target} {past} durch {source}",
    },
    apply: {
      custom: "{source} wendet {effect} auf {target} an.",
      advantage: "{source} hat Vorteil gegen {target}{subject}.",
      disadvantage: "{source} hat Nachteil gegen {target}{subject}.",
      self: "{target} ist {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} ist nicht mehr von {effect} betroffen.",
      advantage: "{source} hat keinen Vorteil mehr gegen {target}{subject}.",
      disadvantage:
        "{source} hat keinen Nachteil mehr gegen {target}{subject}.",
      noBy: "{target} ist nicht mehr {past}.",
      self: "{target} ist nicht mehr {past}.",
      standard: "{target} ist nicht mehr {past} durch {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Zustand wählen",
      selectSource: "Quell-Token wählen",
      selectTarget: "Ziel-Token wählen",
      selectSubject: "Subjekt wählen",
      selectDuration: "Dauer wählen",
      reinstallHandout: "Handout neu installieren",
      confirmTargetTitle: "Zielliste bestätigen",
      applyEffectTitle: "Effekt {condition} anwenden",
      noTokens: "Keine benannten Tokens auf der aktiven Seite gefunden.",
      confirmIntro: "Die folgenden Tokens erhalten die Bedingung:",
      confirmBtn: "Zielliste bestätigen",
      enterDetails: "Effektdetails eingeben",
      noneBtn: "Keines",
      noneOrSourceBtn: "Keines oder auf Quelle anwenden",
      subjectDesc: "Wähle aus, wer oder was den Effekt auslöst.",
      sourceDesc: "Wähle das Wesen, das die Bedingung oder den Effekt erzeugt.",
      targetDesc: "Wähle das Wesen, das die Bedingung oder den Effekt erhält.",
      otherText: "Benutzerdefinierter Bedingungstext",
      effectDetails: "Details zu {condition}",
    },
    col: {
      players: "Spieler",
      npcs: "NSC",
      conditions: "Zustände",
      customEffects: "Benutzerdefinierte Effekte",
      permanentTurnEnd: "Permanent / Rundende",
      rounds: "Runden",
      command: "Befehl",
      result: "Ergebnis",
      field: "Feld",
      value: "Wert",
      option: "Option",
      condition: "Zustand",
      marker: "Marker",
      item: "Eintrag",
      removed: "Entfernt",
      details: "Details",
      description: "Beschreibung",
      scenario: "Szenario",
    },
    dur: {
      untilRemoved: "Bis zur Entfernung",
      endOfTargetTurn: "Ende des nächsten Zugs des Ziels",
      endOfSourceTurn: "Ende des nächsten Zugs der Quelle",
      round1: "1 Runde",
      round2: "2 Runden",
      round3: "3 Runden",
      round10: "10 Runden",
      custom: "Benutzerdefiniert",
      customPrompt: "Anzahl der Runden",
      untilRemovedDisplay: "Bis zur Entfernung",
      turnsRemaining: "{n} verbleibende Zugende(n)",
    },
    btn: {
      openWizard: "Assistent öffnen",
      openMultiTarget: "Mehrfachziel-Assistent öffnen",
      openRemovalList: "Entfernungsliste öffnen",
      showConfig: "Konfiguration anzeigen",
      runCleanup: "Bereinigung starten",
      reinstallMacro: "Makro neu installieren",
      reinstallHandout: "Handout neu installieren",
      showHelp: "Hilfe anzeigen",
      reorderConditions: "Bedingungszeilen neu anordnen",
    },
    title: {
      menu: "Menü",
      removalMenu: "Condition Tracker — Entfernen",
      config: "Konfiguration",
      configTracker: "Condition Tracker — Konfiguration",
      help: "Hilfe",
      applied: "Angewendet",
      removed: "Zustand entfernt",
      cleanup: "Bereinigung abgeschlossen",
      macroReinstalled: "Makro neu installiert",
      handoutReinstalled: "Handout neu installiert",
      warning: "Warnung",
      error: "Fehler",
      turnOrder: "Rundenreihenfolge",
      noConditions: "Keine Zustände",
      tokenMoved: "Token verschoben",
      markedDead: "Als tot markiert",
      zeroHp: "{name} — 0 TP",
      moveToken: "{name} — Token verschieben?",
      scriptReady: "Skript bereit",
      conditionReorder: "Rundenreihenfolge geändert",
    },
    heading: {
      quickActions: "Schnellaktionen",
      settings: "Einstellungen",
      markerMappings: "Markerzuordnungen",
      result: "Ergebnis",
      info: "Informationen",
      commandOptions: "Befehlsoptionen",
      promptUi: "Assistent-Oberfläche",
      examples: "Beispiele",
      summary: "Zusammenfassung",
    },
    msg: {
      noActive: "Es werden keine aktiven Zustände verfolgt.",
      configReset: "Konfiguration auf Standardwerte zurückgesetzt.",
      unknownConfig:
        "Unbekannte Konfigurationsoption. Verwende --config, um unterstützte Einstellungen anzuzeigen.",
      macroReinstalled:
        "Die Makros {wizard} und {multiTarget} wurden für alle aktuellen GM-Spieler neu installiert.",
      handoutReinstalled: "Das Hilfe-Handout {handout} wurde neu installiert.",
      duplicate:
        "Diese exakte Kombination aus Quelle, Subjekt, Ziel, Zustand und benutzerdefiniertem Text ist bereits aktiv.",
      noTargets: "Keine Ziel-Tokens für die Mehrfachanwendung angegeben.",
      noSelection:
        "Wähle mindestens einen Token auf dem Spielfeld aus, bevor du --multi-target verwendest.",
      invalidIds: "Keine gültigen Token-IDs in der aktuellen Auswahl gefunden.",
      reSelectTokens:
        "Keiner der ursprünglich ausgewählten Tokens konnte gefunden werden. Tokens neu auswählen und erneut versuchen.",
      conditionNotFound: "Zustands-ID nicht gefunden.",
      gmOnly: "Condition Tracker-Befehle sind nur für GMs verfügbar.",
      commandFailed:
        "Der Befehl konnte nicht sicher ausgeführt werden. Bitte API-Konsole prüfen.",
      sourceTokenNotFound: "Quell-Token konnte nicht gefunden werden.",
      targetTokenNotFound: "Ziel-Token konnte nicht gefunden werden.",
      subjectTokenNotFound: "Subjekt-Token konnte nicht gefunden werden.",
      invalidCondition:
        "Der Zustand muss einer der vordefinierten Zustände oder Sonstiges sein.",
      subjectOnlyCustom:
        "--subject ist nur für Zauber, Fähigkeit, Vorteil, Nachteil und Sonstiges gültig.",
      subjectBypassInvalid:
        "--subjectPromptBypass erwartet true oder false, wenn ein Wert angegeben wird.",
      customDetailsRequired:
        "Details für {condition} sind erforderlich. Verwende --other, um sie anzugeben.",
      markerConfigFormat:
        "Marker-Konfigurationsformat: --config marker Grappled=grab",
      markerPredefinedRequired:
        "Die Marker-Konfiguration erfordert einen vordefinierten Zustandsnamen.",
      markerNameRequired:
        "Die Marker-Konfiguration erfordert einen nicht-leeren Markernamen.",
      markerSet: "Marker für {condition} auf {marker} gesetzt.",
      healthBarSet: "Gesundheitsleiste auf {bar} gesetzt.",
      boolSet: "{key} auf {value} gesetzt.",
      expectedBoolean: "true oder false erwartet.",
      invalidHealthBar:
        "Die Gesundheitsleiste muss bar1_value, bar2_value oder bar3_value sein.",
      markersDisabled: "Marker sind deaktiviert.",
      noMarkerConfigured: "Für diesen Zustand ist kein Marker konfiguriert.",
      markerApplied: "Marker angewendet: {marker}",
      markerPresent: "Marker bereits vorhanden: {marker}",
      langSet: "Sprache auf {locale} gesetzt.",
      invalidLocale: "Ungültige Locale. Unterstützte Locales: {locales}.",
      otherDurationRequiresRounds:
        "Die Dauer Sonstiges erfordert eine numerische Rundenzahl, zum Beispiel --duration 5 rounds.",
      invalidDuration:
        "Die Dauer muss Bis zur Entfernung, eine Zugende-Option oder eine positive Rundenzahl sein.",
      zeroHpNoConditions:
        "{name} hat 0 TP erreicht und hat keine aktiven Zustände.",
      zeroHpConditions:
        "{name} hat 0 TP erreicht. Zustände zum Entfernen auswählen:",
      removeAllBtn: "Alle Zustände für {name} entfernen",
      markIncapacitated: "Als kampfunfähig markieren",
      removeFromTurnOrder: "Aus Rundenreihenfolge entfernen",
      alreadyIncapacitated: "{name} ist bereits kampfunfähig.",
      tokenRemovedFromTurn: "{name} wurde aus der Rundenreihenfolge entfernt.",
      tokenNotInTurn: "{name} wurde nicht in der Rundenreihenfolge gefunden.",
      moveTokenPrompt:
        "{name} auf die Kartenebene verschieben, damit es sichtbar bleibt, aber andere Tokens nicht stört?",
      moveTokenBtn: "{name} auf Kartenebene verschieben",
      tokenMoved: "{name} wurde auf die Kartenebene verschoben.",
      tokenNotFound: "Token nicht gefunden.",
      noActiveConditions: "{name} hat keine aktiven Zustände zum Entfernen.",
      deadNoConditions:
        "{name} wurde als tot markiert. Keine Zustände waren aktiv.",
      scriptReady: "{name} ist aktiv und du verwendest Version {version}.",
      reachedZeroHp: "{name} hat 0 TP erreicht",
      manuallyRemoved: "manuell entfernt",
      durationExpired: "Dauer abgelaufen",
      markedAsDead: "{name} wurde als tot markiert",
      conditionReorder:
        "Die Rundenreihenfolge wurde geändert und {count} verfolgte Bedingungszeile(n) könnte(n) nun falsch platziert sein. Klicke unten, um sie hinter ihre zugewiesenen Tokens zu verschieben.",
      conditionsReordered:
        "Bedingungszeilen wurden hinter ihre zugewiesenen Tokens verschoben.",
    },
    removal: {
      conditionField: "Zustand",
      reasonField: "Grund",
      turnRowField: "Rundenreihenfolge-Zeile",
      markerField: "Marker",
      notConfigured: "Nicht konfiguriert",
      markerRemoved: "Entfernt ({marker})",
      markerRetained: "Beibehalten ({marker})",
      rowRemoved: "Entfernt",
      rowMissing: "Bereits fehlend",
      manualReason: "Manuelle Entfernung",
    },
    cleanup: {
      orphaned: "Verwaiste Zustandseinträge",
      stale: "Verältete Zustandseinträge",
      orphanedRows: "Verwaiste Rundenreihenfolge-Zeilen",
      unusedMarkers: "Unbenutzte Marker",
    },
    apply: {
      turnAppended:
        "Ziel war nicht in der Rundenreihenfolge; Zustandszeile wurde angehängt.",
      turnInserted: "Zustandszeile unterhalb des Ziel-Tokens eingefügt.",
    },
  },
  handout: {
    versionLabel: "Version",
    subtitle: "D&D 5e Statuseffekt-Verwaltung",
    footerNote:
      "Dieses Handout wird bei jedem Skriptstart automatisch erstellt und aktualisiert.",
    overview: {
      heading: "Übersicht",
      body: "Condition Tracker verwaltet D&D 5e-Statuszustände und benutzerdefinierte Effekte als beschriftete Zeilen im Roll20-Rundenvählungstracker. Wende Zustände auf Tokens an, verfolge Dauern nach Initiativereihenfolge und entferne abgelaufene Effekte am Zugende automatisch. Alle Befehle sind GM-exklusiv.",
    },
    quickStart: {
      heading: "Schnellstart",
      colCommand: "Befehl",
      colDesc: "Beschreibung",
      rows: [
        [
          "!condition-tracker --prompt",
          "Schritt-für-Schritt-Assistent — Zustand, Tokens und Dauer interaktiv auswählen. Auch als Makro ConditionTrackerWizard verfügbar.",
        ],
        [
          "!condition-tracker --multi-target",
          "Einen Zustand gleichzeitig auf mehrere Tokens anwenden. Auch als Makro ConditionTrackerMultiTarget verfügbar.",
        ],
        [
          "!condition-tracker --menu",
          "Hauptmenü öffnen, um Zustände anzuwenden, anzusehen oder zu entfernen.",
        ],
      ],
    },
    commandsRef: {
      heading: "Befehlsreferenz",
      colFlag: "Option",
      colDesc: "Beschreibung",
      rows: [
        ["--prompt", "Schritt-für-Schritt-Assistent-Oberfläche"],
        ["--multi-target", "Zustand auf mehrere Ziel-Tokens anwenden"],
        [
          "--menu",
          "Hauptmenü anzeigen (remove für Entfernungsmenü hinzufügen)",
        ],
        [
          "--source X --target Y --condition Z",
          "Zustand direkt ohne Assistenten anwenden",
        ],
        [
          "--duration &lt;Wert&gt;",
          "Dauer für direkte Anwendung (z. B. 2 rounds)",
        ],
        [
          "--other &lt;Text&gt;",
          "Benutzerdefinierter Text für Zauber / Fähigkeit / Sonstiges",
        ],
        [
          "--remove &lt;Zustands-ID&gt;",
          "Bestimmten Zustand per eindeutiger ID entfernen",
        ],
        [
          "--config &lt;Option&gt; &lt;Wert&gt;",
          "Konfigurationseinstellungen anpassen",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "subjectPromptBypass nur für diesen Befehl überschreiben (unterstützt auch --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Status bereinigen — verwaiste Zustände und Zeilen entfernen",
        ],
        [
          "--reorder-conditions",
          "Bedingungszeilen manuell hinter ihre zugewiesenen Tokens in der Rundenreihenfolge verschieben",
        ],
        ["--reinstall-macro", "GM-Makros neu erstellen oder aktualisieren"],
        [
          "--reinstall-handout",
          "Lokalisiertes Hilfe-Handout neu erstellen oder aktualisieren",
        ],
        [
          "--lang &lt;Locale&gt;",
          "Nachrichten dieses Befehls in einer zusätzlichen Locale ausgeben (zweisprachiger Modus)",
        ],
        ["--help", "Kurze Hilfekarte im Chat anzeigen"],
      ],
    },
    standardConditions: {
      heading: "Standardzustände (D&D 5e)",
      colCondition: "Zustand",
    },
    customEffects: {
      heading: "Benutzerdefinierte Effekttypen",
      colType: "Typ",
      colNotes: "Hinweise",
      rows: [
        [
          "🔮 Zauber",
          "Benannten Zaubereffekt verfolgen — du wirst nach dem Zaubernamen gefragt",
        ],
        [
          "🎯 Fähigkeit",
          "Benannte Klassen- oder Rassafähigkeit verfolgen — du wirst nach dem Namen gefragt",
        ],
        [
          "🍀 Vorteil",
          "Vorteil von einem Token auf einen anderen aufzeichnen; in der Initiative mit der Quelle gruppiert",
        ],
        [
          "⬇️ Nachteil",
          "Nachteil aufzeichnen; in der Initiative mit der Quelle gruppiert",
        ],
        [
          "📝 Sonstiges",
          "Freies benutzerdefiniertes Etikett — du wirst nach einer Beschreibung gefragt",
        ],
      ],
    },
    durationOptions: {
      heading: "Daueroptionen",
      intro:
        "Die verbleibende Anzahl wird in der pr-Spalte des Rundentracker angezeigt und verringert sich, wenn der Ankerzug des Tokens endet.",
      colOption: "Option",
      colBehaviour: "Verhalten",
      rows: [
        [
          "Bis zur Entfernung",
          "Dauerhaft — muss manuell über das Menü oder --remove entfernt werden",
        ],
        [
          "Ende des nächsten Zugs des Ziels",
          "Verfällt am Ende des nächsten Zugs des Ziel-Tokens",
        ],
        [
          "Ende des nächsten Zugs der Quelle",
          "Verfällt am Ende des nächsten Zugs des Quell-Tokens",
        ],
        [
          "1 / 2 / 3 / 10 Runden",
          "Fester Countdown; ein Dekrement pro Zugende des Ankertokens",
        ],
      ],
    },
    configuration: {
      heading: "Konfiguration",
      intro:
        "Verwende !condition-tracker --config &lt;Option&gt; &lt;Wert&gt; oder die Schaltfläche Konfiguration im Hauptmenü.",
      colOption: "Option",
      colValues: "Werte",
      colDesc: "Beschreibung",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Roll20-Statusmarker auf Tokens anwenden, wenn ein Zustand hinzugefügt wird",
        ],
        [
          "useIcons",
          "true / false",
          "Kurze Symbolcodes (z. B. [G]) statt Emojis in Rundentracker-Zeilen anzeigen",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Den optionalen Subjektschritt für Zauber / Fähigkeit / Sonstiges überspringen",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Zu überwachende Leiste; wenn sie auf 0 fällt, wird der GM zur Bereinigung aufgefordert",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Ausgabesprache für Chat-Nachrichten und das Hilfe-Handout",
        ],
        [
          "marker",
          "&lt;Zustand&gt;=&lt;Markername&gt;",
          "Den Marker für einen bestimmten Zustand überschreiben (z. B. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Standard-Statusmarker",
      colCondition: "Zustand",
      colMarker: "Markername",
    },
    availableLocales: {
      heading: "Verfügbare Übersetzungen",
      intro:
        "Verwende die Konfigurationsoption language, um Chat-Nachrichten und das Hilfe-Handout auf eine unterstützte Locale einzustellen. Kurze Aliase werden auch für en, zh und pt akzeptiert.",
      colLocale: "Locale",
      colLanguage: "Sprache",
      colFile: "Übersetzungsdatei",
    },
  },
};

export default TRANSLATION;
