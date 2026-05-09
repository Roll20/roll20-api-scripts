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
    Dazed: "Benommen",
    Deafened: "Betäubt",
    Dominated: "Dominiert",
    Dying: "Sterben",
    Immobilized: "Immobilisiert",
    Marked: "Markiert",
    Slowed: "Verlangsamt",
    Weakened: "Geschwächt",
    Confused: "Verwirrt",
    Cowering: "Kauern",
    Dazzled: "Geblendet",
    Disabled: "Deaktiviert",
    Exhausted: "Erschöpft",
    Fascinated: "Fasziniert",
    Fatigued: "Erschöpft",
    "Flat-Footed": "Plattfüßig",
    Helpless: "Hilflos",
    Nauseated: "Übelkeit",
    Panicked: "In Panik geraten",
    Pinned: "Angepinnt",
    Shaken: "Erschüttert",
    Sickened: "Krank",
    Staggered: "Gestaffelt",
    Clumsy: "Unbeholfen",
    Concealed: "Verborgen",
    Controlled: "Kontrolliert",
    Doomed: "Zum Scheitern verurteilt",
    Drained: "Ausgelaugt",
    Encumbered: "Belastet",
    Enfeebled: "Geschwächt",
    Fleeing: "Auf der Flucht",
    Grabbed: "Geschnappt",
    Hidden: "Versteckt",
    "Off-Guard": "Unvorbereitet",
    Quickened: "Beschleunigt",
    Stupefied: "Verblüfft",
    Undetected: "Unentdeckt",
    Wounded: "Verwundet",
    Asleep: "Schlafend",
    Bleeding: "Blutung",
    Burning: "Verbrennung",
    Dead: "Tot",
    "Off-Kilter": "Aus dem Gleichgewicht geraten",
    "Off-Target": "Außerhalb des Ziels",
    Overburdened: "Überlastet",
    Stable: "Stabil",
    "Bleeding Out": "Ausbluten",
    Bound: "Gebunden",
    Distracted: "Abgelenkt",
    Berserk: "Berserker",
    "Indefinite Insanity": "Unbestimmter Wahnsinn",
    Injured: "Verletzt",
    Mania: "Manie",
    Phobia: "Phobie",
    "Seriously Wounded": "Schwer verwundet",
    "Temporary Insanity": "Vorübergehender Wahnsinn",
    Ablaze: "In Flammen",
    Broken: "Gebrochen",
    Surprised: "Überrascht",
    Bleed: "Bluten",
    "Energy Drained": "Energie verbraucht",
    Entangled: "Verstrickt",
    Fear: "Furcht",
    Hampered: "Behindert",
    "Ongoing Damage": "Anhaltender Schaden",
    Vulnerable: "Verletzlich",
    Diseased: "Krank",
    Held: "Gehalten",
    Compelled: "Gezwungen",
    Impaired: "Beeinträchtigt",
    Panicking: "Panik",
    Disoriented: "Desorientiert",
    Ensnared: "Verstrickt",
    Strained: "Gespannt",
    Afraid: "Besorgt",
    Angry: "Wütend",
    Corrupted: "Beschädigt",
    Harmed: "Verletzt",
    Hungry: "Hungrig",
    Infected: "Infiziert",
    Isolated: "Isoliert",
    "Blood Bound": "Blutgebunden",
    Entranced: "Eingebettet",
    Frenzied: "Wahnsinnig",
    Torpor: "Erstarrung",
    "Knocked Down": "Niedergeschlagen",
    Paradox: "Paradox",
    "Willpower Spent": "Willenskraft verbraucht",
    Bedlam: "Chaos",
    "Chimera-Touched": "Chimärenberührt",
    "Mortally Wounded": "Tödlich verwundet",
    Insane: "Verrückt",
    Debilitated: "Geschwächt",
    Deprived: "Beraubt",
    Shocked: "Schockiert",
    Intoxicated: "Berauscht",
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
      withSuffix:
        "PLATZHALTER0TOKEN PLATZHALTER1TOKEN PLATZHALTER2TOKEN PLATZHALTER3TOKEN.",
      standard: "PLATZHALTER0TOKEN PLATZHALTER1TOKEN PLATZHALTER2TOKEN.",
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
      reinstallHandout: "Handout neu installieren",
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
      gameSystem: "Spielsystem",
      duration: "Dauer",
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
      reinstallMacros: "Makro neu installieren",
      reinstallHandout: "Handout neu installieren",
      showHelp: "Hilfe anzeigen",
      reorderConditions: "Bedingungszeilen neu anordnen",
      reportToken: "Token-Bedingungen melden",
      savedEffects: "Gespeicherte Effekte",
      addSavedEffect: "Gespeicherten Effekt hinzufügen",
      editSaved: "Bearbeiten",
      removeSaved: "Entfernen",
      promoteSaved: "Zum Turn Tracker hinzufügen",
      snoozeSaved: "Schlummern",
      clearSnooze: "Schlummerfunktion löschen",
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
      tokenReport: "Token-Zustandsbericht",
      savedEffects: "Gespeicherte Effekte",
      savedAdd: "Gespeicherten Effekt hinzufügen",
      savedEdit: "Gespeicherten Effekt bearbeiten",
      savedRemoved: "Gespeicherter Effekt entfernt",
      savedPromoted: "Zum Turn Tracker hinzufügen",
      savedSnoozed: "Erinnerung im Schlummermodus",
      savedSnoozeCleared: "Schlummerfunktion gelöscht",
      hiddenEffects: "Versteckte Effekte – {name}",
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
      appliedTo: "Bedingungen, auf die zugegriffen wird",
      appliedBy: "Es gelten die Bedingungen von",
      savedEffectsFor: "Gespeicherte Effekte für {name}",
      visibility: "Sichtweite",
      snoozeOptions: "Schlummererinnerung",
      promoteOptions: "Zum Turn Tracker hochstufen",
      editActions: "Aktionen bearbeiten",
    },
    msg: {
      noActive: "Es werden keine aktiven Zustände verfolgt.",
      configReset: "Konfiguration auf Standardwerte zurückgesetzt.",
      unknownConfig:
        "Unbekannte Konfigurationsoption. Verwende --config, um unterstützte Einstellungen anzuzeigen.",
      macroReinstalled:
        "Die Makros {wizard}, {multiTarget}, {reportToken}, {saved} und {classify} wurden für alle aktuellen GM-Spieler neu installiert.",
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
      invalidGameSystem:
        "Ungültiges Spielsystem. Verwenden Sie --config gameSystem &lt;id&gt;. Unterstützte Systeme:",
      gameSystemSet:
        "Spielsystem auf {system} gesetzt. Die Markierungen wurden auf die Systemstandards zurückgesetzt.",
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
      noTokensSelectedReport:
        "Wählen Sie mindestens einen Token auf der Tafel aus, bevor Sie --report-token verwenden.",
      noConditionsAppliedTo:
        "Auf {name} wurden keine aktiven Bedingungen angewendet.",
      noConditionsAppliedBy:
        "Für {name} gelten keine aktiven Bedingungen für andere.",
      noSavedEffects: "Keine gespeicherten Effekte für {name} gespeichert.",
      noTokenSelectedSaved:
        "Wählen Sie einen Token auf der Tafel aus, bevor Sie --saved verwenden.",
      savedEffectAdded: "Gespeicherter Effekt für {name} hinzugefügt.",
      savedEffectUpdated: "Gespeicherter Effekt aktualisiert.",
      savedEffectRemoved: "Gespeicherter Effekt entfernt.",
      savedEffectNotFound: "Gespeicherter Effekt nicht gefunden.",
      savedInvalidVisibility:
        "Ungültige Sichtbarkeit. Verwenden Sie „public“, „masked“ oder „gm“.",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic:
        "Effekt als öffentlich zum Turn Tracker hinzugefügt.",
      savedPromotedMasked:
        "Effekt als maskiert zum Turn Tracker hinzugefügt – Spieler sehen: {publicLabel}.",
      savedPromotedGm:
        "Der Effekt gilt nur für GM – es wird keine Turn-Tracker-Zeile erstellt. Das Erinnerungssystem zeigt es an, wenn dieser Spielstein die Spitze der Zugreihenfolge erreicht.",
      savedSnoozed: "Erinnerung zurückgestellt: {scope}.",
      savedSnoozeCleared: "Schlummerfunktion gelöscht.",
      hiddenEffectsReminder: "Versteckte Effekte sind am {name} aktiv.",
      visibilityPublicHint: "Vollständiges Etikett für alle sichtbar",
      visibilityMaskedHint:
        "Den Spielern wird eine vage Beschriftung angezeigt",
      visibilityGmHint: "Nur GM-Flüstern, keine Turn-Tracker-Reihe",
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
    saved: {
      visibility: {
        public: "Öffentlich",
        masked: "Maskiert",
        gm: "Nur GM",
      },
      snooze: {
        thisTurn: "Diese Runde",
        oneRound: "1 Runde",
        threeRounds: "3 Runden",
        thisCombat: "Dieser Kampf",
        rounds: "{n} Runde(n)",
      },
      field: {
        gmLabel: "GM-Label",
        publicLabel: "Öffentliches Label",
        visibility: "Sichtweite",
        source: "Quelle",
        condition: "Zustand",
      },
      prompt: {
        enterGmLabel: "Vollständige Effektbeschreibung (nur GM)",
        enterPublicLabel: "Den Spielern wird eine vage Beschriftung angezeigt",
      },
      snoozed: "schlief",
    },
    classify: {
      title: "Akteur-Klassifizierung",
      showTitle: "Klassifizierungsdiagnose",
      showHeading: "Token-Klassifizierungsdetails",
      resultHeading: "Überschreibung angewendet",
      noSelection:
        "Wähle vor der Verwendung von --classify mindestens ein Token aus.",
      invalidType:
        "Ungültiger Klassifizierungstyp: {type}. Verwende pc, npc, ignored oder auto.",
      set: "{name} → {type} (Bereich: {scope})",
      cleared:
        "{name} Überschreibung gelöscht (Bereich: {scope}) — automatische Erkennung wiederhergestellt.",
      setTokenFallback:
        "{name} → {type} (Token-Überschreibung — kein Charakterbogen verknüpft).",
      clearedTokenFallback:
        "{name} Token-Überschreibung gelöscht — automatische Erkennung wiederhergestellt.",
      fieldToken: "Token",
      fieldType: "Klassifizierung",
      fieldSource: "Quelle",
      fieldReason: "Grund",
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
          "!condition-tracker --report-token",
          "Wählen Sie zuerst einen oder mehrere Token aus und führen Sie dann diesen Befehl aus, um eine GM-Flüstermeldung zu erhalten, in der alle Bedingungen aufgeführt sind, die auf und von jedem ausgewählten Token angewendet werden. Auch als ConditionTrackerReportToken-Makro verfügbar.",
        ],
        [
          "!condition-tracker --menu",
          "Hauptmenü öffnen, um Zustände anzuwenden, anzusehen oder zu entfernen.",
        ],
        [
          "!condition-tracker --classify anzeigen",
          "Wählen Sie zunächst ein oder mehrere Token aus und führen Sie dann diesen Befehl aus, um eine Diagnosemeldung anzuzeigen, die die Akteurklassifizierung, die Erkennungsquelle und den Grund jedes Tokens anzeigt. Verwenden Sie --classify pc|npc|ignored zum Überschreiben oder --classify auto, um die automatische Erkennung wiederherzustellen. Auch als ConditionTrackerClassify-Makro verfügbar.",
        ],
        [
          "!condition-tracker --menu",
          "Öffnen Sie das Hauptverwaltungsmenü mit Schaltflächen zum Anwenden, Überprüfen oder Entfernen von Bedingungen.",
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
          "--Speisekarte",
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
          "--prompt --subjectPromptBypass wahr|falsch",
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
          "--report-token",
          "Flüstern Sie einen Nur-GM-Zustandsbericht für jeden ausgewählten Token (auf ihn angewendete und von ihm angewendete Bedingungen)",
        ],
        [
          "--lang &lt;Locale&gt;",
          "Nachrichten dieses Befehls in einer zusätzlichen Locale ausgeben (zweisprachiger Modus)",
        ],
        [
          "--classify pc|npc|ignored",
          "Akteurtyp für ausgewählte Tokens überschreiben — zuerst Token auswählen. Standardbereich ist Charakter (schreibt ct_mod_actor_type-Attribut); --scope token hinzufügen, um stattdessen im Skriptstatus zu speichern",
        ],
        [
          "--classify auto",
          "Akteurtyp-Überschreibung entfernen und automatische Erkennung für ausgewählte Tokens wiederherstellen",
        ],
        [
          "--classify show",
          "Klassifizierungsdiagnose für jedes ausgewählte Token einflüstern — zeigt erkannten Typ, Erkennungsquelle und Grund",
        ],
        ["--help", "Kurze Hilfekarte im Chat anzeigen"],
        [
          "--saved Schlummern &lt;id&gt; --scope drehen|runden|kämpfen --rounds &lt;n&gt;",
          "Schalten Sie eine gespeicherte Effekterinnerung für die aktuelle Runde, N Runden oder diesen Kampf ein",
        ],
        [
          "--saved Schlummerfunktion &lt;id&gt;",
          "Löschen Sie eine aktive Schlummerfunktion für einen gespeicherten Effekt",
        ],
        [
          "--lang &lt;locale&gt;",
          "Geben Sie die Nachrichten dieses Befehls in einem zusätzlichen Gebietsschema aus (zweisprachiger Modus).",
        ],
        [
          "--classify pc|npc|ignoriert",
          "Überschreiben Sie den Akteurtyp für ausgewählte Token – wählen Sie zuerst Token aus. Der Standardbereich ist Zeichen (schreibt das Attribut ct_mod_actor_type); Fügen Sie stattdessen das Token --scope hinzu, um es im Skriptstatus zu speichern",
        ],
        [
          "--classify automatisch",
          "Entfernen Sie die Überschreibung des Akteurtyps und stellen Sie die automatische Erkennung für ausgewählte Token wieder her",
        ],
        [
          "--classify anzeigen",
          "Flüstern Sie eine Klassifizierungsdiagnose für jedes ausgewählte Token – zeigt den erkannten Typ, die Erkennungsquelle und den Grund an",
        ],
        ["--help", "Zeigen Sie im Chat eine kurze Hilfekarte an"],
      ],
    },
    standardConditions: {
      heading: "Standardzustände (D&D 5e)",
      colCondition: "Zustand",
      none: "Für dieses Spielsystem sind keine Standardbedingungen definiert. Verwenden Sie den benutzerdefinierten Effekttyp „Andere“ für Freitexteffekte.",
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
    savedEffects: {
      heading: "Gespeicherte Effekte",
      intro:
        "Mit gespeicherten Effekten können Sie langfristige Zustände außerhalb des Turn Trackers speichern – Flüche, Krankheiten, Gifte, versteckte Schwächungen und andere nicht kampfbezogene Zustände. Sie verbleiben im Skriptstatus und können optional in den Turn Tracker kopiert werden, wenn der Kampf beginnt.",
      visibility: {
        heading: "Sichtbarkeitsmodi",
        rows: [
          [
            "öffentlich",
            "Die vollständige Effektbezeichnung ist im Turn Tracker und im öffentlichen Chat sichtbar.",
          ],
          [
            "maskiert",
            "Den Spielern wird ein vages öffentliches Label angezeigt; Alle Details sind nur für GM verfügbar.",
          ],
          [
            "GM",
            "Keine Turn-Tracker-Reihe. Alle Details werden im Status gespeichert und an den GM geflüstert, wenn der betroffene Spielstein die Spitze der Initiative erreicht.",
          ],
        ],
      },
      commands: {
        heading: "Gespeicherte Effektbefehle",
        intro:
          "Alle --saved-Befehle sind nur GM. Wählen Sie ein Token aus, bevor Sie --saved oder --saved add ausführen.",
        rows: [
          [
            "!condition-tracker --saved",
            "Gespeicherte Effekte für das ausgewählte Token anzeigen.",
          ],
          [
            "!condition-tracker --saved hinzufügen",
            "Starten Sie den Assistenten zum Hinzufügen gespeicherter Effekte.",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "Bearbeiten Sie Beschriftungen oder Sichtbarkeit für einen vorhandenen gespeicherten Effekt.",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "Einen gespeicherten Effekt dauerhaft entfernen.",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "Kopieren Sie einen gespeicherten Effekt in den Turn Tracker (öffentlich oder maskiert) oder bestätigen Sie, dass er nur von GM verfolgt wird.",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "Schalten Sie eine GM-Erinnerung für diesen Zug, N Runden oder diesen Kampf aus.",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "Löschen Sie eine aktive Schlummerfunktion, damit die Erinnerungen sofort fortgesetzt werden.",
          ],
        ],
      },
      reminders: {
        heading: "GM-Erinnerungen",
        body: "Wenn ein Spielstein mit GM oder maskierten gespeicherten Effekten den oberen Rand des Spielzug-Trackers erreicht, erhält der GM ein Flüstern, das die versteckten Effekte mit Aktionsschaltflächen auflistet. Doppelte Erinnerungen innerhalb derselben Runde werden unterdrückt. Verwenden Sie die Snooze-Tasten, um Erinnerungen für eine Runde, mehrere Runden oder für den Rest des aktuellen Kampfes zu unterdrücken.",
      },
    },
    actorClassification: {
      heading: "Akteur-Klassifizierung",
      intro:
        "Condition Tracker erkennt automatisch, ob ein Token ein SC, NSC oder ein ignoriertes Objekt (Kartenpins, Kulissen, Zaubertemplates) ist. Nicht verknüpfte Tokens werden standardmäßig ignoriert. Verwende --classify, um die automatische Erkennung für beliebige Tokens zu überschreiben.",
      detectionOrder: {
        heading: "Erkennungsreihenfolge",
        colStep: "Schritt",
        colCheck: "Prüfung",
        colResult: "Ergebnis",
        rows: [
          [
            "1",
            "Token-Zustandsüberschreibung (--classify --scope token)",
            "PC / NPC / ignoriert",
          ],
          [
            "2",
            "Charakter ct_mod_actor_type-Attribut (--classify --scope character)",
            "PC / NPC / ignoriert",
          ],
          ["3", "Nicht verknüpftes Token — kein Charakterbogen", "ignoriert"],
          ["4", "Spielsystem-Adapter (npc / is_npc Attribut)", "PC / NPC"],
          [
            "5",
            "Generische NSC-Attributsuche (npc, is_npc, npcflag, sheet_type, character_type)",
            "PC / NPC",
          ],
          ["6", "Charakter controlledby-Fallback", "PC / NPC"],
        ],
      },
      types: {
        heading: "Klassifizierungstypen",
        colType: "Typ",
        colMeaning: "Bedeutung",
        rows: [
          [
            "Stk",
            "Spielercharakter — immer als SC im Assistenten und bei der Erkennung",
          ],
          ["NPC", "Nicht-Spieler-Charakter — immer als NSC"],
          [
            "ignoriert",
            "Wird nie angezeigt oder verfolgt — aus dem Token-Picker des Assistenten ausgeschlossen",
          ],
          [
            "unbekannt",
            "Nur automatisch erkannt; Typ konnte nicht bestimmt werden (als NSC im Assistenten behandelt)",
          ],
        ],
      },
      commands: {
        heading: "Klassifizierungsbefehle",
        intro:
          "Wähle ein oder mehrere Tokens aus, bevor du --classify-Befehle verwendest.",
        rows: [
          [
            "!condition-tracker --classify Stk",
            "Ausgewählte Tokens als SCs markieren (Standardbereich: Charakter).",
          ],
          [
            "!condition-tracker --classify npc",
            "Ausgewählte Tokens als NSCs markieren.",
          ],
          [
            "!condition-tracker --classify ignoriert",
            "Ausgewählte Tokens von der gesamten Verfolgung ausschließen.",
          ],
          [
            "!condition-tracker --classify auto",
            "Überschreibung entfernen — automatische Erkennung wiederherstellen.",
          ],
          [
            "!condition-tracker --classify anzeigen",
            "Klassifizierungsdiagnose (Typ, Quelle, Grund) für jedes ausgewählte Token anzeigen.",
          ],
          [
            "!condition-tracker --classify PC --scope Token",
            "Token-Ebenen-Überschreibung im Skriptstatus — nützlich für nicht verknüpfte Tokens.",
          ],
          [
            "!condition-tracker --classify pc --scope Zeichen",
            "Charakter-Ebenen-Überschreibung in das ct_mod_actor_type-Attribut — gilt für alle Tokens mit demselben Charakterbogen.",
          ],
        ],
      },
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
          "wahr / falsch",
          "Kurze Symbolcodes (z. B. [G]) statt Emojis in Rundentracker-Zeilen anzeigen",
        ],
        [
          "subjectPromptBypass",
          "wahr / falsch",
          "Den optionalen Subjektschritt für Zauber / Fähigkeit / Sonstiges überspringen",
        ],
        [
          "suppressPublicChat",
          "wahr / falsch",
          "Alle öffentlichen Chat-Ankündigungen (Hinzufügen und Entfernen) unterdrücken. GM-Flüstermeldungen sind nicht betroffen.",
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
        [
          "Marker",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Überschreiben Sie die Statusmarkierung, die für eine bestimmte Bedingung verwendet wird (z. B. Markierung Grappled=grab)",
        ],
      ],
    },
    gameSystems: {
      heading: "Unterstützte Spielsysteme",
      intro:
        "Verwenden Sie !condition-tracker --config gameSystem &lt;id&gt;, um das System zu wechseln. Durch den Wechsel werden die Token-Markierungszuordnungen auf die Standardeinstellungen des neuen Systems zurückgesetzt. Ihre aktiven Bedingungen bleiben erhalten.",
      colId: "System-ID",
      colName: "Spielsystem",
    },
    defaultMarkers: {
      heading: "Standard-Statusmarker",
      colCondition: "Zustand",
      colMarker: "Markername",
      none: "Für dieses Spielsystem sind keine Standardmarker definiert.",
    },
    availableLocales: {
      heading: "Verfügbare Übersetzungen",
      intro:
        "Verwende die Konfigurationsoption language, um Chat-Nachrichten und das Hilfe-Handout auf eine unterstützte Locale einzustellen. Kurze Aliase werden auch für en, zh und pt akzeptiert.",
      colLocale: "Gebietsschema",
      colLanguage: "Sprache",
      colFile: "Übersetzungsdatei",
    },
  },
};

export default TRANSLATION;
