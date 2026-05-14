const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "afferrato",
      verb: "afferra",
    },
    Restrained: {
      past: "trattenuto",
      verb: "trattiene",
    },
    Prone: {
      past: "a terra",
      verb: "butta",
      suffix: "a terra",
    },
    Poisoned: {
      past: "avvelenato",
      verb: "avvelena",
    },
    Stunned: {
      past: "stordito",
      verb: "stordisce",
    },
    Blinded: {
      past: "accecato",
      verb: "acceca",
    },
    Charmed: {
      past: "affascinato",
      verb: "affascina",
    },
    Frightened: {
      past: "spaventato",
      verb: "spaventa",
    },
    Incapacitated: {
      past: "incapacitato",
      verb: "incapacita",
    },
    Invisible: {
      past: "invisibile",
      verb: "rende",
      suffix: "invisibile",
    },
    Paralyzed: {
      past: "paralizzato",
      verb: "paralizza",
    },
    Petrified: {
      past: "pietrificato",
      verb: "pietrifica",
    },
    Unconscious: {
      past: "privo di sensi",
      verb: "rende",
      suffix: "privo di sensi",
    },
    Spell: {
      past: "influenzato da un incantesimo",
      verb: "lancia un incantesimo su",
    },
    Ability: {
      past: "influenzato da un'abilità",
      verb: "usa un'abilità su",
    },
    Advantage: {
      past: "ha vantaggio",
      verb: "concede vantaggio a",
      noBy: true,
    },
    Disadvantage: {
      past: "ha svantaggio",
      verb: "impone svantaggio a",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Afferrato",
    Restrained: "Trattenuto",
    Prone: "A terra",
    Poisoned: "Avvelenato",
    Stunned: "Stordito",
    Blinded: "Accecato",
    Charmed: "Affascinato",
    Frightened: "Spaventato",
    Incapacitated: "Incapacitato",
    Invisible: "Invisibile",
    Paralyzed: "Paralizzato",
    Petrified: "Pietrificato",
    Unconscious: "Privo di sensi",
    Spell: "Incantesimo",
    Ability: "Abilità",
    Advantage: "Vantaggio",
    Disadvantage: "Svantaggio",
    Other: "Altro",
  },
  templates: {
    display: {
      custom: "{emoji} {target} influenzato da {effect} ({source})",
      advantage: "{emoji} {source} ha vantaggio contro {target}{subject}",
      disadvantage: "{emoji} {source} ha svantaggio contro {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} è {past}",
      standard: "{emoji} {target} {past} da {source}",
    },
    apply: {
      custom: "{source} applica {effect} a {target}.",
      advantage: "{source} ha vantaggio contro {target}{subject}.",
      disadvantage: "{source} ha svantaggio contro {target}{subject}.",
      self: "{target} è {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} non è più influenzato da {effect}.",
      advantage: "{source} non ha più vantaggio contro {target}{subject}.",
      disadvantage: "{source} non ha più svantaggio contro {target}{subject}.",
      noBy: "{target} non è più {past}.",
      self: "{target} non è più {past}.",
      standard: "{target} non è più {past} da {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Seleziona condizione",
      selectSource: "Seleziona token sorgente",
      selectTarget: "Seleziona token bersaglio",
      selectSubject: "Seleziona soggetto",
      selectDuration: "Seleziona durata",
      confirmTargetTitle: "Conferma lista bersagli",
      applyEffectTitle: "Applica effetto {condition}",
      noTokens: "Nessun token con nome trovato nella pagina attiva.",
      confirmIntro: "I seguenti token riceveranno la condizione:",
      confirmBtn: "Conferma lista bersagli",
      enterDetails: "Inserisci dettagli effetto",
      noneBtn: "Nessuno",
      noneOrSourceBtn: "Nessuno o applica alla fonte",
      subjectDesc: "Seleziona chi o cosa applica l'effetto.",
      sourceDesc:
        "Seleziona la creatura che crea o genera la condizione o l'effetto.",
      targetDesc:
        "Seleziona la creatura che riceverà la condizione o l'effetto.",
      otherText: "Testo condizione personalizzato",
      effectDetails: "Dettagli {condition}",
    },
    col: {
      players: "Giocatori",
      npcs: "PNG",
      conditions: "Condizioni",
      customEffects: "Effetti personalizzati",
      permanentTurnEnd: "Permanente / Fine turno",
      rounds: "Round",
      command: "Comando",
      result: "Risultato",
      field: "Campo",
      value: "Valore",
      option: "Opzione",
      condition: "Condizione",
      marker: "Indicatore",
      item: "Elemento",
      removed: "Rimosso",
      details: "Dettagli",
      description: "Descrizione",
      scenario: "Scenario",
    },
    dur: {
      untilRemoved: "Fino alla rimozione",
      endOfTargetTurn: "Fine del prossimo turno del bersaglio",
      endOfSourceTurn: "Fine del prossimo turno della sorgente",
      round1: "1 round",
      round2: "2 round",
      round3: "3 round",
      round10: "10 round",
      custom: "Personalizzato",
      customPrompt: "Numero di round",
      untilRemovedDisplay: "Fino alla rimozione",
      turnsRemaining: "{n} fine/i turno rimanente/i",
    },
    btn: {
      openWizard: "Apri procedura guidata",
      openMultiTarget: "Apri procedura guidata multi-bersaglio",
      openRemovalList: "Apri lista rimozione",
      showConfig: "Mostra configurazione",
      runCleanup: "Esegui pulizia",
      reinstallMacro: "Reinstalla macro",
      reinstallHandout: "Reinstalla documento",
      showHelp: "Mostra aiuto",
      reorderConditions: "Riordina righe condizioni",
    },
    title: {
      menu: "Menu",
      removalMenu: "Rimozione — Condition Tracker",
      config: "Configurazione",
      configTracker: "Configurazione — Condition Tracker",
      help: "Aiuto",
      applied: "Applicato",
      removed: "Condizione rimossa",
      cleanup: "Pulizia completata",
      macroReinstalled: "Macro reinstallata",
      handoutReinstalled: "Documento reinstallato",
      warning: "Avviso",
      error: "Errore",
      turnOrder: "Ordine di iniziativa",
      noConditions: "Nessuna condizione",
      tokenMoved: "Token spostato",
      markedDead: "Segnato come morto",
      zeroHp: "{name} — 0 PF",
      moveToken: "{name} — Spostare il token?",
      scriptReady: "Script pronto",
      conditionReorder: "Ordine di turno modificato",
    },
    heading: {
      quickActions: "Azioni rapide",
      settings: "Impostazioni",
      markerMappings: "Mappatura indicatori",
      result: "Risultato",
      info: "Informazioni",
      commandOptions: "Opzioni comando",
      promptUi: "Interfaccia procedura guidata",
      examples: "Esempi",
      summary: "Riepilogo",
    },
    msg: {
      noActive: "Nessuna condizione attiva è tracciata.",
      configReset: "Configurazione ripristinata ai valori predefiniti del mod.",
      unknownConfig:
        "Opzione di configurazione sconosciuta. Usa --config per visualizzare le impostazioni supportate.",
      macroReinstalled:
        "Le macro {wizard} e {multiTarget} sono state reinstallate per tutti i GM attivi.",
      handoutReinstalled:
        "Il documento di aiuto {handout} è stato reinstallato.",
      duplicate:
        "Questa combinazione esatta di sorgente, soggetto, bersaglio, condizione e testo personalizzato è già attiva.",
      noTargets:
        "Nessun token bersaglio specificato per l'applicazione multi-bersaglio.",
      noSelection:
        "Seleziona almeno un token sulla mappa prima di usare --multi-target.",
      invalidIds: "Nessun ID token valido trovato nella selezione corrente.",
      reSelectTokens:
        "Nessuno dei token originariamente selezionati è stato trovato. Seleziona nuovamente i token e riprova.",
      conditionNotFound: "ID condizione non trovato.",
      gmOnly: "I comandi di Condition Tracker sono riservati al GM.",
      commandFailed:
        "Il comando non è stato completato in modo sicuro. Controlla la console API per i dettagli.",
      sourceTokenNotFound: "Token sorgente non trovato.",
      targetTokenNotFound: "Token bersaglio non trovato.",
      subjectTokenNotFound: "Token soggetto non trovato.",
      invalidCondition:
        "La condizione deve essere una delle condizioni predefinite oppure Altro.",
      subjectOnlyCustom:
        "--subject è valido solo per Incantesimo, Abilità, Vantaggio, Svantaggio e Altro.",
      subjectBypassInvalid:
        "--subjectPromptBypass richiede true o false quando viene fornito un valore.",
      customDetailsRequired:
        "I dettagli di {condition} sono obbligatori. Usa --other per fornirli.",
      markerConfigFormat:
        "Il formato di configurazione dell'indicatore è: --config marker Grappled=grab",
      markerPredefinedRequired:
        "La configurazione dell'indicatore richiede un nome di condizione predefinito.",
      markerNameRequired:
        "La configurazione dell'indicatore richiede un nome di indicatore non vuoto.",
      markerSet: "Indicatore di {condition} impostato su {marker}.",
      healthBarSet: "Barra della salute impostata su {bar}.",
      boolSet: "{key} impostato su {value}.",
      expectedBoolean: "Previsto true o false.",
      invalidHealthBar:
        "La barra della salute deve essere bar1_value, bar2_value o bar3_value.",
      markersDisabled: "Gli indicatori sono disabilitati.",
      noMarkerConfigured:
        "Nessun indicatore configurato per questa condizione.",
      markerApplied: "Indicatore applicato: {marker}",
      markerPresent: "Indicatore già presente: {marker}",
      langSet: "Lingua impostata su {locale}.",
      invalidLocale: "Lingua non valida. Lingue supportate: {locales}.",
      otherDurationRequiresRounds:
        "La durata Altro richiede un numero di round, ad esempio --duration 5 rounds.",
      invalidDuration:
        "La durata deve essere Fino alla rimozione, un'opzione di fine turno o un numero positivo di round.",
      zeroHpNoConditions:
        "{name} ha raggiunto 0 PF e non ha condizioni attive.",
      zeroHpConditions:
        "{name} ha raggiunto 0 PF. Scegli le condizioni da rimuovere:",
      removeAllBtn: "Rimuovi tutte le condizioni di {name}",
      markIncapacitated: "Segna come Incapacitato",
      removeFromTurnOrder: "Rimuovi dall'ordine di iniziativa",
      alreadyIncapacitated: "{name} è già Incapacitato.",
      tokenRemovedFromTurn: "{name} è stato rimosso dall'ordine di iniziativa.",
      tokenNotInTurn: "{name} non è stato trovato nell'ordine di iniziativa.",
      moveTokenPrompt:
        "Sposta {name} al livello mappa in modo che rimanga visibile senza interferire con altri token?",
      moveTokenBtn: "Sposta {name} al livello mappa",
      tokenMoved: "{name} è stato spostato al livello mappa.",
      tokenNotFound: "Token non trovato.",
      noActiveConditions: "{name} non ha condizioni attive da rimuovere.",
      deadNoConditions:
        "{name} è stato segnato come morto. Nessuna condizione era attiva.",
      scriptReady: "{name} è attivo e stai usando la versione {version}.",
      reachedZeroHp: "{name} ha raggiunto 0 PF",
      manuallyRemoved: "è stata rimossa manualmente",
      durationExpired: "la sua durata è scaduta",
      markedAsDead: "{name} è stato segnato come morto",
      conditionReorder:
        "L'ordine di turno è cambiato e {count} riga/righe di condizione tracciata/e potrebbe/potrebbero essere fuori posto. Clicca sotto per riposizionarle dopo i rispettivi token assegnati.",
      conditionsReordered:
        "Le righe delle condizioni sono state riposizionate dopo i rispettivi token assegnati.",
    },
    removal: {
      conditionField: "Condizione",
      reasonField: "Motivo",
      turnRowField: "Riga del registro dei turni",
      markerField: "Indicatore",
      notConfigured: "Non configurato",
      markerRemoved: "Rimosso ({marker})",
      markerRetained: "Mantenuto ({marker})",
      rowRemoved: "Rimosso",
      rowMissing: "Già assente",
      manualReason: "Rimozione manuale",
    },
    cleanup: {
      orphaned: "Voci di condizione orfane",
      stale: "Voci di condizione obsolete",
      orphanedRows: "Righe orfane del registro dei turni",
      unusedMarkers: "Indicatori inutilizzati",
    },
    apply: {
      turnAppended:
        "Il bersaglio non era nell'ordine di iniziativa; la riga della condizione è stata aggiunta in fondo.",
      turnInserted: "Riga della condizione inserita sotto il token bersaglio.",
    },
  },
  handout: {
    versionLabel: "Versione",
    subtitle: "Gestore effetti di stato D&D 5e",
    footerNote:
      "Questo documento viene creato e aggiornato automaticamente ogni volta che lo script viene caricato.",
    overview: {
      heading: "Panoramica",
      body: "Condition Tracker gestisce le condizioni di stato di D&D 5e e gli effetti personalizzati come righe etichettate nel Registro dei Turni di Roll20. Applica condizioni ai token, tieni traccia delle durate per ordine di iniziativa e rimuovi automaticamente gli effetti scaduti al termine di un turno. Tutti i comandi sono riservati al GM e possono essere attivati dalla chat o tramite le macro installate.",
    },
    quickStart: {
      heading: "Avvio rapido",
      colCommand: "Comando",
      colDesc: "Descrizione",
      rows: [
        [
          "!condition-tracker --prompt",
          "Procedura guidata passo dopo passo — scegli condizione, token e durata in modo interattivo. Disponibile anche come macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Applica una condizione a più token contemporaneamente. Disponibile anche come macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Apri il menu principale di gestione con pulsanti per applicare, rivedere o rimuovere condizioni.",
        ],
      ],
    },
    commandsRef: {
      heading: "Riferimento comandi",
      colFlag: "Flag",
      colDesc: "Descrizione",
      rows: [
        ["--prompt", "Interfaccia della procedura guidata passo dopo passo"],
        [
          "--multi-target",
          "Applica una condizione a più token bersaglio contemporaneamente",
        ],
        [
          "--menu",
          "Mostra il menu principale (aggiungi remove per il menu di rimozione)",
        ],
        [
          "--source X --target Y --condition Z",
          "Applica una condizione direttamente senza la procedura guidata",
        ],
        [
          "--duration &lt;valore&gt;",
          "Durata per un'applicazione diretta (es. 2 rounds)",
        ],
        [
          "--other &lt;testo&gt;",
          "Testo personalizzato per i tipi di effetto Incantesimo / Abilità / Altro",
        ],
        [
          "--remove &lt;id-condizione&gt;",
          "Rimuovi una condizione specifica tramite il suo ID univoco",
        ],
        [
          "--config &lt;opzione&gt; &lt;valore&gt;",
          "Modifica le impostazioni di configurazione (vedi sezione Configurazione)",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Sostituisci subjectPromptBypass solo per questo comando (supporta anche --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Riconcilia lo stato — rimuovi condizioni e righe del registro dei turni orfane",
        ],
        [
          "--reorder-conditions",
          "Riposizionare manualmente le righe di condizione dopo i token assegnati nell'ordine dei turni",
        ],
        ["--reinstall-macro", "Ricrea o aggiorna le macro del GM"],
        [
          "--reinstall-handout",
          "Ricrea o aggiorna il documento di aiuto localizzato",
        ],
        [
          "--lang &lt;locale&gt;",
          "Mostra i messaggi di questo comando in una lingua aggiuntiva (modalità bilingue)",
        ],
        ["--help", "Mostra una scheda di aiuto rapida nella chat"],
      ],
    },
    standardConditions: {
      heading: "Condizioni standard (D&amp;D 5e)",
      colCondition: "Condizione",
    },
    customEffects: {
      heading: "Tipi di effetti personalizzati",
      colType: "Tipo",
      colNotes: "Note",
      rows: [
        [
          "🔮 Incantesimo",
          "Traccia un effetto di incantesimo nominato — ti verrà chiesto il nome dell'incantesimo",
        ],
        [
          "🎯 Abilità",
          "Traccia un'abilità di classe o razza nominata — ti verrà chiesto il nome",
        ],
        [
          "🍀 Vantaggio",
          "Registra un vantaggio concesso da un token a un altro; raggruppato con la sorgente nell'iniziativa",
        ],
        [
          "⬇️ Svantaggio",
          "Registra uno svantaggio imposto; raggruppato con la sorgente nell'iniziativa",
        ],
        [
          "📝 Altro",
          "Etichetta personalizzata libera — ti verrà chiesta una descrizione",
        ],
      ],
    },
    durationOptions: {
      heading: "Opzioni durata",
      intro:
        "Il conteggio rimanente viene mostrato nella colonna pr del Registro dei Turni e si decrementa al termine del turno del token ancora.",
      colOption: "Opzione",
      colBehaviour: "Comportamento",
      rows: [
        [
          "Fino alla rimozione",
          "Permanente — deve essere rimossa manualmente tramite il menu o --remove",
        ],
        [
          "Fine del prossimo turno del bersaglio",
          "Scade al termine del prossimo turno del token bersaglio nell'iniziativa",
        ],
        [
          "Fine del prossimo turno della sorgente",
          "Scade al termine del prossimo turno del token sorgente nell'iniziativa",
        ],
        [
          "1 / 2 / 3 / 10 round",
          "Conto alla rovescia fisso; un decremento per ogni fine turno del token ancora",
        ],
      ],
    },
    configuration: {
      heading: "Configurazione",
      intro:
        "Usa !condition-tracker --config &lt;opzione&gt; &lt;valore&gt; o il pulsante Configurazione nel menu principale.",
      colOption: "Opzione",
      colValues: "Valori",
      colDesc: "Descrizione",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Applica indicatori di stato Roll20 ai token quando viene aggiunta una condizione",
        ],
        [
          "useIcons",
          "true / false",
          "Mostra codici icona brevi (es. [G]) invece di emoji nelle righe del Registro dei Turni",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Salta il passaggio facoltativo del token soggetto per gli effetti Incantesimo / Abilità / Altro",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Barra del token da monitorare; quando scende a 0 il GM viene invitato a rimuovere le condizioni",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Lingua dei messaggi nella chat e del documento di aiuto",
        ],
        [
          "marker",
          "&lt;Condizione&gt;=&lt;nome indicatore&gt;",
          "Sostituisci l'indicatore di stato usato per una condizione specifica (es. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Indicatori di stato predefiniti",
      colCondition: "Condizione",
      colMarker: "Nome indicatore",
    },
    availableLocales: {
      heading: "Traduzioni disponibili",
      intro:
        "Usa l'opzione di configurazione language per impostare i messaggi della chat e il documento di aiuto su qualsiasi lingua supportata. Gli alias brevi sono accettati anche per en, zh e pt.",
      colLocale: "Locale",
      colLanguage: "Lingua",
      colFile: "File di traduzione",
    },
  },
};

export default TRANSLATION;
