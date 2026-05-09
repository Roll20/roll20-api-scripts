const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "agafat",
      verb: "agafa",
    },
    Restrained: {
      past: "retingut",
      verb: "reté",
    },
    Prone: {
      past: "tombat",
      verb: "tomba",
      suffix: "propens",
    },
    Poisoned: {
      past: "enverinat",
      verb: "enverina",
    },
    Stunned: {
      past: "atordit",
      verb: "atordeix",
    },
    Blinded: {
      past: "cec",
      verb: "encega",
    },
    Charmed: {
      past: "encisat",
      verb: "encisa",
    },
    Frightened: {
      past: "espantat",
      verb: "espanta",
    },
    Incapacitated: {
      past: "incapacitat",
      verb: "incapacita",
    },
    Invisible: {
      past: "invisible",
      verb: "torna",
      suffix: "invisible",
    },
    Paralyzed: {
      past: "paralitzat",
      verb: "paralitza",
    },
    Petrified: {
      past: "petrificat",
      verb: "petrifica",
    },
    Unconscious: {
      past: "inconscient",
      verb: "deixa",
      suffix: "inconscient",
    },
    Spell: {
      past: "afectat per un encanteri",
      verb: "llança un encanteri sobre",
    },
    Ability: {
      past: "afectat per una habilitat",
      verb: "usa una habilitat sobre",
    },
    Advantage: {
      past: "té avantatge",
      verb: "atorga avantatge a",
      noBy: true,
    },
    Disadvantage: {
      past: "té desavantatge",
      verb: "imposa desavantatge a",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Agafat",
    Restrained: "Restringit",
    Prone: "Tombat",
    Poisoned: "Enverinat",
    Stunned: "Atordit",
    Blinded: "Cec",
    Charmed: "Encisat",
    Frightened: "Espantat",
    Incapacitated: "Incapacitat",
    Invisible: "Invisible",
    Paralyzed: "Paralitzat",
    Petrified: "Petrificat",
    Unconscious: "Inconscient",
    Dazed: "Atordit",
    Deafened: "Ensordit",
    Dominated: "Dominat",
    Dying: "Morir",
    Immobilized: "Immobilitzat",
    Marked: "Marcat",
    Slowed: "Reduït",
    Weakened: "Debilitat",
    Confused: "Confós",
    Cowering: "Encobert",
    Dazzled: "Enlluernat",
    Disabled: "Inhabilitat",
    Exhausted: "Esgotat",
    Fascinated: "Fascinat",
    Fatigued: "Cansat",
    "Flat-Footed": "De peu pla",
    Helpless: "Impotent",
    Nauseated: "Nàusees",
    Panicked: "En pànic",
    Pinned: "Fixat",
    Shaken: "Sacsejat",
    Sickened: "Emmalaltit",
    Staggered: "Esglaonat",
    Clumsy: "Maldestre",
    Concealed: "Ocult",
    Controlled: "Controlat",
    Doomed: "Condemnat",
    Drained: "Escorregut",
    Encumbered: "Gravat",
    Enfeebled: "Debilitat",
    Fleeing: "Fugint",
    Grabbed: "Agafat",
    Hidden: "Ocult",
    "Off-Guard": "Sense guàrdia",
    Quickened: "Accelerat",
    Stupefied: "Estupefacte",
    Undetected: "Sense detectar",
    Wounded: "Ferit",
    Asleep: "Dormida",
    Bleeding: "Sagnat",
    Burning: "Cremant",
    Dead: "Mort",
    "Off-Kilter": "Off-Kilter",
    "Off-Target": "Fora de l'objectiu",
    Overburdened: "Sobrecarregat",
    Stable: "Estable",
    "Bleeding Out": "Sagnant",
    Bound: "Lligat",
    Distracted: "Distret",
    Berserk: "Berserk",
    "Indefinite Insanity": "Bogeria indefinida",
    Injured: "Ferit",
    Mania: "Mania",
    Phobia: "Fòbia",
    "Seriously Wounded": "Ferit greu",
    "Temporary Insanity": "Bogeria temporal",
    Ablaze: "Encesa",
    Broken: "Trencat",
    Surprised: "Sorprès",
    Bleed: "Sagnar",
    "Energy Drained": "Energia drenada",
    Entangled: "Enredats",
    Fear: "Por",
    Hampered: "Obstaculitzat",
    "Ongoing Damage": "Danys en curs",
    Vulnerable: "Vulnerable",
    Diseased: "Malalt",
    Held: "Mantingut",
    Compelled: "Obligat",
    Impaired: "deteriorat",
    Panicking: "Entrant en pànic",
    Disoriented: "Desorientat",
    Ensnared: "Enganxat",
    Strained: "Colat",
    Afraid: "Por",
    Angry: "Enfadat",
    Corrupted: "Corrupta",
    Harmed: "Perjudicat",
    Hungry: "Famolenc",
    Infected: "Infectat",
    Isolated: "Aïllat",
    "Blood Bound": "Blood Lligat",
    Entranced: "Engrescat",
    Frenzied: "Frenejat",
    Torpor: "Torpor",
    "Knocked Down": "Enderrocat",
    Paradox: "Paradoxa",
    "Willpower Spent": "Força de voluntat gastada",
    Bedlam: "Bedlam",
    "Chimera-Touched": "Quimera-Tocat",
    "Mortally Wounded": "Ferit de mort",
    Insane: "Boig",
    Debilitated: "Debilitat",
    Deprived: "Privat",
    Shocked: "Sorpresa",
    Intoxicated: "Intoxicat",
    Spell: "Encanteri",
    Ability: "Habilitat",
    Advantage: "Avantatge",
    Disadvantage: "Desavantatge",
    Other: "Altres",
  },
  templates: {
    display: {
      custom: "{emoji} {target} afectat per {effect} ({source})",
      advantage: "{emoji} {source} té avantatge contra {target}{subject}",
      disadvantage: "{emoji} {source} té desavantatge contra {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} està {past}",
      standard: "{emoji} {target} {past} per {source}",
    },
    apply: {
      custom: "{source} aplica {effect} a {target}.",
      advantage: "{source} té avantatge contra {target}{subject}.",
      disadvantage: "{source} té desavantatge contra {target}{subject}.",
      self: "{target} està {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} ja no està afectat per {effect}.",
      advantage: "{source} ja no té avantatge contra {target}{subject}.",
      disadvantage: "{source} ja no té desavantatge contra {target}{subject}.",
      noBy: "{target} ja no {past}.",
      self: "{target} ja no està {past}.",
      standard: "{target} ja no està {past} per {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Selecciona una condició",
      selectSource: "Selecciona el testimoni origen",
      selectTarget: "Selecciona el testimoni destinatari",
      selectSubject: "Selecciona el subjecte",
      selectDuration: "Selecciona la durada",
      confirmTargetTitle: "Confirma la llista de destinataris",
      applyEffectTitle: "Aplica l'efecte {condition}",
      noTokens: "No s'han trobat testimonis amb nom a la pàgina activa.",
      confirmIntro: "Els testimonis següents rebran la condició:",
      confirmBtn: "Confirma la llista de destinataris",
      enterDetails: "Introdueix els detalls de l'efecte",
      noneBtn: "Cap",
      noneOrSourceBtn: "Cap o aplica a l'origen",
      subjectDesc: "Selecciona qui o què aplica l'efecte.",
      sourceDesc:
        "Selecciona la criatura que crea o genera la condició o l'efecte.",
      targetDesc: "Selecciona la criatura que rebrà la condició o l'efecte.",
      otherText: "Text de condició personalitzat",
      effectDetails: "Detalls de {condition}",
    },
    col: {
      players: "Jugadors",
      npcs: "PNJ",
      conditions: "Condicions",
      customEffects: "Efectes personalitzats",
      permanentTurnEnd: "Permanent / Fi de torn",
      rounds: "Rondes",
      command: "Ordre",
      result: "Resultat",
      field: "Camp",
      value: "Valor",
      option: "Opció",
      condition: "Condició",
      marker: "Marcador",
      item: "Element",
      removed: "Eliminat",
      details: "Detalls",
      description: "Descripció",
      scenario: "Escenari",
      gameSystem: "Sistema de joc",
      duration: "Durada",
    },
    dur: {
      untilRemoved: "Fins que s'elimini",
      endOfTargetTurn: "Fi del proper torn del destinatari",
      endOfSourceTurn: "Fi del proper torn de l'origen",
      round1: "1 ronda",
      round2: "2 rondes",
      round3: "3 rondes",
      round10: "10 rondes",
      custom: "Personalitzat",
      customPrompt: "Nombre de rondes",
      untilRemovedDisplay: "Fins que s'elimini",
      turnsRemaining: "{n} fi(ns) de torn restant(s)",
    },
    btn: {
      openWizard: "Obre l'assistent",
      openMultiTarget: "Obre l'assistent multi-destinatari",
      openRemovalList: "Obre la llista d'eliminació",
      showConfig: "Mostra la configuració",
      runCleanup: "Executa la neteja",
      reinstallMacros: "Reinstal·la la macro",
      reinstallHandout: "Reinstal·la el fullet",
      showHelp: "Mostra l'ajuda",
      reorderConditions: "Reordena les files de condicions",
      reportToken: "Informa de les condicions del testimoni",
      savedEffects: "Efectes guardats",
      addSavedEffect: "Afegeix l'efecte desat",
      editSaved: "Edita",
      removeSaved: "Eliminar",
      promoteSaved: "Afegeix a Turn Tracker",
      snoozeSaved: "Posposa",
      clearSnooze: "Esborra la posposació",
    },
    title: {
      menu: "Menú",
      removalMenu: "Eliminació — Condition Tracker",
      config: "Configuració",
      configTracker: "Configuració — Condition Tracker",
      help: "Ajuda",
      applied: "Aplicat",
      removed: "Condició eliminada",
      cleanup: "Neteja completada",
      macroReinstalled: "Macro reinstal·lada",
      handoutReinstalled: "Fullet reinstal·lat",
      warning: "Avís",
      error: "Error",
      turnOrder: "Ordre d'iniciativa",
      noConditions: "Sense condicions",
      tokenMoved: "Testimoni mogut",
      markedDead: "Marcat com a mort",
      zeroHp: "{name} — 0 PV",
      moveToken: "{name} — Mou el testimoni?",
      scriptReady: "Script llest",
      conditionReorder: "Ordre de torn modificat",
      tokenReport: "Informe de l'estat del testimoni",
      savedEffects: "Efectes guardats",
      savedAdd: "Afegeix l'efecte desat",
      savedEdit: "Edita l'efecte desat",
      savedRemoved: "S'ha eliminat l'efecte desat",
      savedPromoted: "Afegeix a Turn Tracker",
      savedSnoozed: "Recordatori posposat",
      savedSnoozeCleared: "S'ha esborrat la posposació",
      hiddenEffects: "Efectes ocults — {name}",
    },
    heading: {
      quickActions: "Accions ràpides",
      settings: "Paràmetres",
      markerMappings: "Correspondències dels marcadors",
      result: "Resultat",
      info: "Informació",
      commandOptions: "Opcions d'ordre",
      promptUi: "Interfície de l'assistent",
      examples: "Exemples",
      summary: "Resum",
      appliedTo: "Condicions aplicades",
      appliedBy: "Condicions aplicades per",
      savedEffectsFor: "Efectes desats per a {name}",
      visibility: "Visibilitat",
      snoozeOptions: "Recordatori de posposar",
      promoteOptions: "Ascens a Turn Tracker",
      editActions: "Edita accions",
    },
    msg: {
      noActive: "No hi ha cap condició activa en seguiment.",
      configReset: "Configuració restablerta als valors predeterminats.",
      unknownConfig:
        "Opció de configuració desconeguda. Usa --config per veure els paràmetres disponibles.",
      macroReinstalled:
        "Les macros {wizard}, {multiTarget}, {reportToken}, {saved} i {classify} s'han reinstal·lat per a tots els MJ actius.",
      handoutReinstalled: "El fullet d'ajuda {handout} s'ha reinstal·lat.",
      duplicate:
        "Aquesta combinació d'origen, subjecte, destinatari, condició i text personalitzat ja és activa.",
      noTargets:
        "No s'ha especificat cap testimoni destinatari per a l'aplicació multi-destinatari.",
      noSelection:
        "Selecciona almenys un testimoni al tauler abans d'usar --multi-target.",
      invalidIds:
        "No s'han trobat identificadors de testimoni vàlids a la selecció actual.",
      reSelectTokens:
        "No s'ha pogut trobar cap dels testimonis seleccionats originalment. Torna a seleccionar els testimonis i intenta-ho de nou.",
      conditionNotFound: "No s'ha trobat l'identificador de condició.",
      gmOnly: "Les ordres de Condition Tracker són exclusives del MJ.",
      commandFailed:
        "L'ordre no s'ha pogut completar de manera segura. Comprova la consola de l'API per obtenir detalls.",
      sourceTokenNotFound: "No s'ha trobat el testimoni origen.",
      targetTokenNotFound: "No s'ha trobat el testimoni destinatari.",
      subjectTokenNotFound: "No s'ha trobat el testimoni subjecte.",
      tokenRefNotFound:
        'No s\'ha pogut trobar el testimoni {role} "{value}" per identificador, nom de testimoni o nom de caràcter.',
      tokenRefAmbiguous:
        'El testimoni {role} "{value}" coincideix amb diversos testimonis: {matches}. Utilitzeu un identificador de testimoni o un nom més específic per desambiguar.',
      invalidGameSystem:
        "Sistema de joc no vàlid. Utilitza el sistema de joc --config &lt;id&gt;. Sistemes suportats:",
      gameSystemSet:
        "El sistema de joc s'ha configurat a {system}. Els marcadors s'han restablert als valors predeterminats del sistema.",
      invalidCondition:
        "La condició ha de ser una de les condicions predefinides o Altres.",
      subjectOnlyCustom:
        "--subject només és vàlid per a Encanteri, Habilitat, Avantatge, Desavantatge i Altres.",
      subjectBypassInvalid:
        "--subjectPromptBypass espera true o false quan es proporciona un valor.",
      customDetailsRequired:
        "Es requereixen detalls de {condition}. Usa --other per proporcionar-los.",
      markerConfigFormat:
        "El format de configuració del marcador és: --config marker Grappled=grab",
      markerPredefinedRequired:
        "La configuració del marcador requereix un nom de condició predefinit.",
      markerNameRequired:
        "La configuració del marcador requereix un nom de marcador no buit.",
      markerSet: "El marcador de {condition} s'ha establert a {marker}.",
      healthBarSet: "La barra de salut s'ha establert a {bar}.",
      boolSet: "{key} s'ha establert a {value}.",
      expectedBoolean: "S'esperava true o false.",
      invalidHealthBar:
        "La barra de salut ha de ser bar1_value, bar2_value o bar3_value.",
      markersDisabled: "Els marcadors estan desactivats.",
      noMarkerConfigured:
        "No hi ha cap marcador configurat per a aquesta condició.",
      markerApplied: "Marcador aplicat: {marker}",
      markerPresent: "Marcador ja present: {marker}",
      langSet: "Idioma establert a {locale}.",
      invalidLocale:
        "Configuració regional no vàlida. Configuracions regionals admeses: {locales}.",
      otherDurationRequiresRounds:
        "La durada Altre requereix un nombre de rondes, per exemple --duration 5 rounds.",
      invalidDuration:
        "La durada ha de ser Fins que s'elimini, una opció de fi de torn o un nombre de rondes positiu.",
      zeroHpNoConditions:
        "{name} ha arribat a 0 PV i no té cap condició activa.",
      zeroHpConditions:
        "{name} ha arribat a 0 PV. Tria les condicions a eliminar:",
      removeAllBtn: "Elimina totes les condicions de {name}",
      markIncapacitated: "Marca com a Incapacitat",
      removeFromTurnOrder: "Elimina de l'ordre d'iniciativa",
      alreadyIncapacitated: "{name} ja és Incapacitat.",
      tokenRemovedFromTurn: "{name} s'ha eliminat de l'ordre d'iniciativa.",
      tokenNotInTurn: "No s'ha trobat {name} a l'ordre d'iniciativa.",
      moveTokenPrompt:
        "Mou {name} al calque del mapa perquè romangui visible sense interferir amb altres testimonis?",
      moveTokenBtn: "Mou {name} al calque del mapa",
      tokenMoved: "{name} s'ha mogut al calque del mapa.",
      tokenNotFound: "No s'ha trobat el testimoni.",
      noActiveConditions: "{name} no té cap condició activa a eliminar.",
      deadNoConditions:
        "{name} s'ha marcat com a mort. No hi havia cap condició activa.",
      scriptReady: "{name} és actiu i estàs usant la versió {version}.",
      reachedZeroHp: "{name} ha arribat a 0 PV",
      manuallyRemoved: "s'ha eliminat manualment",
      durationExpired: "la seva durada ha expirat",
      markedAsDead: "{name} s'ha marcat com a mort",
      conditionReorder:
        "L'ordre de torn ha canviat i {count} fila(es) de condició seguida(es) pot estar fora de lloc. Fes clic a continuació per restaurar-les després dels seus testimonis assignats.",
      conditionsReordered:
        "Les files de condicions s'han reposicionat després dels seus testimonis assignats.",
      noTokensSelectedReport:
        "Seleccioneu almenys un testimoni al tauler abans d'utilitzar --report-token.",
      noConditionsAppliedTo: "{name} no té cap condició activa aplicada.",
      noConditionsAppliedBy:
        "{name} no té cap condició activa aplicada als altres.",
      noSavedEffects: "No s'ha guardat cap efecte desat per a {name}.",
      noTokenSelectedSaved:
        "Seleccioneu una fitxa al tauler abans d'utilitzar --saved.",
      savedEffectAdded: "S'ha afegit efecte desat per a {name}.",
      savedEffectUpdated: "S'ha actualitzat l'efecte desat.",
      savedEffectRemoved: "S'ha eliminat l'efecte desat.",
      savedEffectNotFound: "No s'ha trobat l'efecte desat.",
      savedInvalidVisibility:
        "Visibilitat no vàlida. Utilitzeu públic, emmascarat o gm.",
      savedConditionRequired:
        "Condition type is required. Use --condition <type>.",
      savedPromotedPublic: "S'ha afegit l'efecte al Turn Tracker com a públic.",
      savedPromotedMasked:
        "S'ha afegit l'efecte al Seguidor de torns com a emmascarat; els jugadors veuen: {publicLabel}.",
      savedPromotedGm:
        "L'efecte és només per a GM: no es crearà cap fila de seguiment de girs. El sistema de recordatoris apareixerà quan aquesta fitxa arribi al capdamunt de l'ordre de torn.",
      savedSnoozed: "S'ha posposat el recordatori: {scope}.",
      savedSnoozeCleared: "S'ha esborrat la posposació.",
      hiddenEffectsReminder: "Els efectes ocults estan actius a {name}.",
      visibilityPublicHint: "etiqueta completa visible per a tothom",
      visibilityMaskedHint: "etiqueta vaga mostrada als jugadors",
      visibilityGmHint: "Només xiuxiueig de GM, sense fila Turn Tracker",
    },
    removal: {
      conditionField: "Condició",
      reasonField: "Motiu",
      turnRowField: "Fila del registre de torns",
      markerField: "Marcador",
      notConfigured: "No configurat",
      markerRemoved: "Eliminat ({marker})",
      markerRetained: "Conservat ({marker})",
      rowRemoved: "Eliminat",
      rowMissing: "Ja absent",
      manualReason: "Eliminació manual",
    },
    saved: {
      visibility: {
        public: "Públic",
        masked: "Enmascarat",
        gm: "Només GM",
      },
      snooze: {
        thisTurn: "Aquest Torn",
        oneRound: "1 Ronda",
        threeRounds: "3 rondes",
        thisCombat: "Aquest Combat",
        rounds: "{n} rondes",
      },
      field: {
        gmLabel: "Etiqueta GM",
        publicLabel: "Etiqueta pública",
        visibility: "Visibilitat",
        source: "Font",
        condition: "Condició",
      },
      prompt: {
        enterGmLabel: "Descripció completa de l'efecte (només GM)",
        enterPublicLabel: "Es mostra una etiqueta vaga als jugadors",
      },
      snoozed: "adormit",
    },
    classify: {
      title: "Classificació d'Actor",
      showTitle: "Diagnòstic de Classificació",
      showHeading: "Detalls de Classificació del Token",
      resultHeading: "Substitució Aplicada",
      noSelection:
        "Selecciona almenys un token al tauler abans d'usar --classify.",
      invalidType:
        "Tipus de classificació no vàlid: {type}. Usa pc, npc, ignored o auto.",
      set: "{name} → {type} (àmbit: {scope})",
      cleared:
        "{name} substitució eliminada (àmbit: {scope}) — detecció automàtica restaurada.",
      setTokenFallback:
        "{name} → {type} (substitució de token — cap full de personatge vinculat).",
      clearedTokenFallback:
        "{name} substitució de token eliminada — detecció automàtica restaurada.",
      fieldToken: "Token",
      fieldType: "Classificació",
      fieldSource: "Font",
      fieldReason: "Motiu",
    },
    cleanup: {
      orphaned: "Entrades de condició òrfenes",
      stale: "Entrades de condició obsoletes",
      orphanedRows: "Files del registre de torns òrfenes",
      unusedMarkers: "Marcadors no usats",
    },
    apply: {
      turnAppended:
        "El destinatari no era a l'ordre d'iniciativa; la fila de condició s'ha afegit al final.",
      turnInserted: "Fila de condició inserida sota el testimoni destinatari.",
    },
  },
  handout: {
    versionLabel: "Versió",
    subtitle: "Gestor d'estats de D&D 5e",
    footerNote:
      "Aquest fullet es crea i s'actualitza automàticament cada vegada que es carrega el script.",
    overview: {
      heading: "Visió general",
      body: "Condition Tracker gestiona les condicions d'estat de D&D 5e i els efectes personalitzats com a files etiquetades al registre de torns de Roll20. Aplica condicions als testimonis, fes un seguiment de les durades per ordre d'iniciativa i elimina automàticament els efectes expirats quan acaba un torn. Totes les ordres són exclusives del MJ i es poden executar des del xat o mitjançant les macros instal·lades.",
    },
    quickStart: {
      heading: "Inici ràpid",
      colCommand: "Ordre",
      colDesc: "Descripció",
      rows: [
        [
          "!seguidor de condicions --indicatiu",
          "Assistent pas a pas — tria la condició, els testimonis i la durada de manera interactiva. També disponible com a macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Aplica una condició a diversos testimonis simultàniament. També disponible com a macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --report-token",
          "Seleccioneu primer un o més fitxes i, a continuació, executeu aquesta ordre per obtenir un xiuxiueig de GM que enumera totes les condicions aplicades a cada testimoni seleccionat. També disponible com a macro ConditionTrackerReportToken.",
        ],
        [
          "!condition-tracker --menu",
          "Obre el menú principal de gestió amb botons per aplicar, revisar o eliminar condicions.",
        ],
        [
          "!condition-tracker --classify mostra",
          "Seleccioneu primer un o més fitxes i, a continuació, executeu aquesta ordre per veure un xiuxiueig de diagnòstic que mostra la classificació d'actor, la font de detecció i el motiu de cada testimoni. Utilitzeu --classify pc|npc|ignorat per anul·lar o --classify automàtic per restaurar la detecció automàtica. També disponible com a macro ConditionTrackerClassify.",
        ],
        [
          "!condition-tracker --menu",
          "Obriu el menú de gestió principal amb botons per aplicar, revisar o eliminar condicions.",
        ],
      ],
    },
    examples: {
      heading: "Exemples de macro per a condicions habituals",
      intro:
        "Aquestes són macros d'inici que podeu enganxar en una macro d'acció de testimoni o de xat i, a continuació, ampliar segons sigui necessari. La concordança de noms no distingeix entre majúscules i minúscules; es prefereixen els noms exactes, després les coincidències parcials úniques.",
      colMacro: "Macro",
      colEvent: "Esdeveniment Comú",
      rows: [
        [
          "!condition-tracker --prompt --condition Grappled",
          "Agafeu o agafeu un objectiu i deixeu que l'assistent demani la font, l'objectiu i la durada.",
        ],
        [
          "!condition-tracker --prompt --condition Propens",
          "Toqueu un token propens amb la condició ja seleccionada.",
        ],
        [
          "!condition-tracker --prompt --condition Enverinat",
          "Preseleccioneu Enverinat per a efectes de verí, perills o atacs tòxics.",
        ],
        [
          "!condition-tracker --prompt --condition Sorpresa",
          "Preseleccioneu Stunned per a aturdir, efectes de xoc i efectes de control dur.",
        ],
        [
          "!condition-tracker --prompt --condition Cec",
          "Preseleccioneu Cec per a efectes de flaix, foscor, fum o alteracions de la visió.",
        ],
        [
          '!condition-tracker --source "Sir Galahad" --target "Goblin Boss" --condition Grappled --duration 1 ronda',
          "Aplicació directa utilitzant noms exactes de testimoni/caràcter (no distingeix entre majúscules i minúscules).",
        ],
        [
          "!condition-tracker --source gala --target cap --condition Prone --duration 1 ronda",
          "Aplicació directa amb noms parcials únics; si coincideixen múltiples fitxes, el mod demana un nom o identificador més específic.",
        ],
      ],
    },
    commandsRef: {
      heading: "Referència d'ordres",
      colFlag: "Opció",
      colDesc: "Descripció",
      rows: [
        ["--demanada", "Interfície de l'assistent pas a pas"],
        [
          "--multi-objectiu",
          "Aplica una condició a diversos testimonis destinataris alhora",
        ],
        [
          "--menú",
          "Mostra el menú principal (afegeix remove per al menú d'eliminació)",
        ],
        [
          "--source X --target Y --condició Z",
          "Aplica una condició directament sense l'assistent",
        ],
        [
          "--duration &lt;valor&gt;",
          "Durada per a una aplicació directa (p. ex. 2 rounds)",
        ],
        [
          "--altre <text>",
          "Text personalitzat per als tipus d'efecte Encanteri / Habilitat / Altres",
        ],
        [
          "--remove &lt;id-condició&gt;",
          "Elimina una condició específica pel seu identificador únic",
        ],
        [
          "--config &lt;opció&gt; &lt;valor&gt;",
          "Ajusta els paràmetres de configuració (vegeu la secció Configuració)",
        ],
        [
          "--prompt --subjectPromptBypass cert|fals",
          "Substitueix subjectPromptBypass per a aquesta ordre únicament (també admet --subject-prompt-bypass)",
        ],
        [
          "--neteja",
          "Reconcilia l'estat — elimina les condicions i files del registre de torns òrfenes",
        ],
        [
          "--condicions-de-reordenar",
          "Reposiciona manualment les files de condicions darrere dels seus tokens assignats a l'ordre de torns",
        ],
        ["--reinstall-macro", "Torna a crear o actualitza les macros del MJ"],
        [
          "--reinstall-handout",
          "Torna a crear o actualitza el fullet d'ajuda localitzat",
        ],
        [
          "--informe-token",
          "Xiuxiueja un informe de condicions només per a GM per a cada testimoni seleccionat (condicions aplicades a i per aquest)",
        ],
        [
          "--lang &lt;locale&gt;",
          "Mostra els missatges d'aquesta ordre en una configuració regional addicional (mode bilingüe)",
        ],
        [
          "--classify pc|npc|ignored",
          "Substitueix el tipus d'actor per als tokens seleccionats — selecciona primer els tokens. L'àmbit per defecte és el personatge (escriu l'atribut ct_mod_actor_type); afegeix --scope token per emmagatzemar a l'estat de l'script",
        ],
        [
          "--classify auto",
          "Elimina la substitució del tipus d'actor i restaura la detecció automàtica per als tokens seleccionats",
        ],
        [
          "--classify show",
          "Xiuxiueja un diagnòstic de classificació per a cada token seleccionat — mostra el tipus detectat, la font de detecció i el motiu",
        ],
        ["--help", "Mostra una targeta d'ajuda breu al xat"],
        [
          "--saved posposar &lt;id&gt; --scope gir|rons|combat --rounds &lt;n&gt;",
          "Posposa un recordatori d'efecte desat per al torn actual, N rondes o aquest combat",
        ],
        [
          "--saved snooze-clear &lt;id&gt;",
          "Esborra una repetició activa d'un efecte desat",
        ],
        [
          "--lang &lt;locale&gt;",
          "Emet els missatges d'aquesta ordre en una configuració regional addicional (mode bilingüe)",
        ],
        [
          "--classify pc|npc|ignorat",
          "Substituïu el tipus d'actor per a les fitxes seleccionades: seleccioneu primer les fitxes. L'àmbit per defecte és caràcter (escriu l'atribut ct_mod_actor_type); afegiu el testimoni --scope per emmagatzemar-lo en estat d'script",
        ],
        [
          "--classify automàtic",
          "Elimineu la substitució del tipus d'actor i restableixi la detecció automàtica dels fitxes seleccionats",
        ],
        [
          "Mostra --classify",
          "Xiuxiueja un diagnòstic de classificació per a cada testimoni seleccionat: mostra el tipus detectat, la font de detecció i el motiu",
        ],
        ["--help", "Mostra una targeta d'ajuda breu al xat"],
      ],
    },
    standardConditions: {
      heading: "Condicions estàndard (D&amp;D 5e)",
      colCondition: "Condició",
      none: "No s'han definit condicions estàndard per a aquest sistema de joc. Utilitzeu l'altre tipus d'efecte personalitzat per a efectes de text lliure.",
    },
    customEffects: {
      heading: "Tipus d'efectes personalitzats",
      colType: "Tipus",
      colNotes: "Notes",
      rows: [
        [
          "🔮 Encanteri",
          "Segueix un efecte d'encanteri amb nom — se't demanarà el nom de l'encanteri",
        ],
        [
          "🎯 Habilitat",
          "Segueix una habilitat de classe o raça amb nom — se't demanarà el nom",
        ],
        [
          "🍀 Avantatge",
          "Registra un avantatge atorgat d'un testimoni a un altre; agrupat amb l'origen a la iniciativa",
        ],
        [
          "⬇️ Desavantatge",
          "Registra un desavantatge imposat; agrupat amb l'origen a la iniciativa",
        ],
        [
          "📝 Altres",
          "Etiqueta personalitzada de forma lliure — se't demanarà una descripció",
        ],
      ],
    },
    durationOptions: {
      heading: "Opcions de durada",
      intro:
        "El recompte restant es mostra a la columna pr del registre de torns i disminueix quan acaba el torn del testimoni ancla.",
      colOption: "Opció",
      colBehaviour: "Comportament",
      rows: [
        [
          "Fins que s'elimini",
          "Permanent — s'ha d'eliminar manualment mitjançant el menú o --remove",
        ],
        [
          "Fi del proper torn del destinatari",
          "Expira quan acaba el proper torn del testimoni destinatari a la iniciativa",
        ],
        [
          "Fi del proper torn de l'origen",
          "Expira quan acaba el proper torn del testimoni origen a la iniciativa",
        ],
        [
          "1 / 2 / 3 / 10 rondes",
          "Compte enrere fix; un decrement per fi de torn del testimoni ancla",
        ],
      ],
    },
    savedEffects: {
      heading: "Efectes guardats",
      intro:
        "Els efectes desats us permeten emmagatzemar condicions a llarg termini fora del Turn Tracker: malediccions, malalties, verins, desavantatges ocults i altres condicions que no són de combat. Persisteixen en estat d'script i es poden copiar opcionalment al Seguidor de torns quan comença el combat.",
      visibility: {
        heading: "Modes de visibilitat",
        rows: [
          [
            "públic",
            "L'etiqueta d'efecte complet és visible al Seguidor de girs i al xat públic.",
          ],
          [
            "emmascarat",
            "Es mostra als jugadors una vaga etiqueta pública; Els detalls complets són només per a GM.",
          ],
          [
            "gm",
            "Sense fila de seguiment de torns. Els detalls complets s'emmagatzemen en estat i es xiuxiuegen al GM quan el testimoni afectat arriba al cim de la iniciativa.",
          ],
        ],
      },
      commands: {
        heading: "Ordres d'efectes desades",
        intro:
          "Totes les ordres --desades només són GM. Seleccioneu un testimoni abans d'executar --saved o --saved add.",
        rows: [
          [
            "!condition-tracker --desat",
            "Visualitza els efectes desats per al testimoni seleccionat.",
          ],
          [
            "!condition-tracker --afegit guardat",
            "Inicieu l'assistent per afegir efectes desats.",
          ],
          [
            "!condition-tracker --saved edit <id>",
            "Editeu les etiquetes o la visibilitat d'un efecte desat existent.",
          ],
          [
            "!condition-tracker --saved remove <id>",
            "Elimina permanentment un efecte desat.",
          ],
          [
            "!condition-tracker --saved promote <id> --visibility public|masked|gm",
            "Copieu un efecte desat al Seguidor de torns (públic o emmascarat) o confirmeu que només es fa un seguiment de GM.",
          ],
          [
            "!condition-tracker --saved snooze <id> --scope turn|rounds|combat --rounds <n>",
            "Posposa un recordatori de GM per a aquest torn, N rondes o aquest combat.",
          ],
          [
            "!condition-tracker --saved snooze-clear <id>",
            "Esborra una repetició activa perquè els recordatoris es reprenguin immediatament.",
          ],
        ],
      },
      reminders: {
        heading: "Recordatoris de GM",
        body: "Quan una fitxa amb gm o efectes desats emmascarats arriba a la part superior del seguiment de torns, el GM rep un xiuxiueig que enumera els efectes ocults amb botons d'acció. Els recordatoris duplicats dins del mateix torn es suprimeixen. Utilitzeu els botons Posposa per suprimir els recordatoris d'un torn, d'un nombre de rondes o durant la resta del combat actual.",
      },
    },
    actorClassification: {
      heading: "Classificació d'Actor",
      intro:
        "Condition Tracker determina automàticament si cada token és un PJ, PNJ o un objecte ignorat (agulles de mapa, decorat, plantilles d'encanteri). Els tokens no vinculats s'ignoren per defecte. Usa --classify per substituir la detecció automàtica per a qualsevol token.",
      detectionOrder: {
        heading: "Ordre de Detecció",
        colStep: "Pas",
        colCheck: "Comprovació",
        colResult: "Resultat",
        rows: [
          [
            "1",
            "Substitució d'estat del token (--classify --scope token)",
            "pc / npc / ignorat",
          ],
          [
            "2",
            "Atribut ct_mod_actor_type del personatge (--classify --scope character)",
            "pc / npc / ignorat",
          ],
          ["3", "Token no vinculat — cap full de personatge", "ignorat"],
          [
            "4",
            "Adaptador del sistema de joc (atribut npc / is_npc)",
            "pc / npc",
          ],
          [
            "5",
            "Escaneig d'atributs NPC genèrics (npc, is_npc, npcflag, sheet_type, character_type)",
            "pc / npc",
          ],
          ["6", "Alternativa controlledby del personatge", "pc / npc"],
        ],
      },
      types: {
        heading: "Tipus de Classificació",
        colType: "Tipus",
        colMeaning: "Significat",
        rows: [
          [
            "pc",
            "Personatge jugador — sempre inclòs com a PJ a l'assistent i la detecció",
          ],
          ["npc", "Personatge no jugador — sempre inclòs com a PNJ"],
          [
            "ignorat",
            "Mai mostrat ni rastreat — exclòs del selector de tokens de l'assistent",
          ],
          [
            "desconegut",
            "Només detecció automàtica; no s'ha pogut determinar el tipus (tractat com PNJ a l'assistent)",
          ],
        ],
      },
      commands: {
        heading: "Ordres de Classificació",
        intro:
          "Selecciona un o més tokens abans d'executar les ordres --classify.",
        rows: [
          [
            "!condition-tracker --classifica l'ordinador",
            "Marcar els tokens seleccionats com a PJs (àmbit de personatge per defecte).",
          ],
          [
            "!condition-tracker --classify npc",
            "Marcar els tokens seleccionats com a PNJs.",
          ],
          [
            "!condition-tracker --classificar ignorat",
            "Excloure els tokens seleccionats de tot seguiment.",
          ],
          [
            "!condition-tracker --classifica automàticament",
            "Eliminar la substitució — restaurar la detecció automàtica.",
          ],
          [
            "!condition-tracker --classifica l'espectacle",
            "Mostrar el diagnòstic de classificació (tipus, font, motiu) per a cada token seleccionat.",
          ],
          [
            "!indicador de condicions --classify ordinador --scope testimoni",
            "Substitució al nivell del token a l'estat de l'script — útil per a tokens no vinculats.",
          ],
          [
            "!condition-tracker --classify pc --scope caràcter",
            "Substitució al nivell del personatge a l'atribut ct_mod_actor_type — s'aplica a tots els tokens amb el mateix full de personatge.",
          ],
        ],
      },
    },
    configuration: {
      heading: "Configuració",
      intro:
        "Usa !condition-tracker --config &lt;opció&gt; &lt;valor&gt; o el botó Configuració del menú principal.",
      colOption: "Opció",
      colValues: "Valors",
      colDesc: "Descripció",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Aplica marcadors d'estat de Roll20 als testimonis quan s'afegeix una condició",
        ],
        [
          "useIcons",
          "vertader/fals",
          "Mostra codis d'icona curts (p. ex. [G]) en lloc d'emojis a les files del registre de torns",
        ],
        [
          "subjectPromptBypass",
          "vertader/fals",
          "Omet el pas del testimoni subjecte opcional per als efectes Encanteri / Habilitat / Altres",
        ],
        [
          "suppressPublicChat",
          "vertader/fals",
          "Suprimeix tots els anuncis públics de xat (missatges d'aplicació i eliminació). Els xiuxiuejos del DJ no es veuen afectats.",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Barra del testimoni a vigilar; quan arriba a 0 el MJ rep un avís per netejar les condicions",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Idioma dels missatges del xat i del fullet d'ajuda",
        ],
        [
          "marker",
          "&lt;Condició&gt;=&lt;nom del marcador&gt;",
          "Substitueix el marcador d'estat usat per a una condició específica (p. ex. marker Grappled=grab)",
        ],
        [
          "marcador",
          "&lt;Condition&gt;=&lt;marker name&gt;",
          "Substituïu el marcador d'estat utilitzat per a una condició específica (p. ex., marcador Grappled=agafar)",
        ],
      ],
    },
    gameSystems: {
      heading: "Sistemes de joc compatibles",
      intro:
        "Utilitzeu !condition-tracker --config gameSystem &lt;id&gt; per canviar de sistema. Si canvieu, restableix les assignacions dels marcadors de testimoni als valors predeterminats del nou sistema. Les teves condicions actives es conserven.",
      colId: "ID del sistema",
      colName: "Sistema de joc",
    },
    defaultMarkers: {
      heading: "Marcadors d'estat predeterminats",
      colCondition: "Condició",
      colMarker: "Nom del marcador",
      none: "No s'ha definit cap marcador predeterminat per a aquest sistema de joc.",
    },
    availableLocales: {
      heading: "Traduccions disponibles",
      intro:
        "Usa l'opció de configuració language per establir els missatges del xat i el fullet d'ajuda en qualsevol configuració regional admesa. Els àlies curts també s'accepten per a en, zh i pt.",
      colLocale: "Localització",
      colLanguage: "Idioma",
      colFile: "Fitxer de traducció",
    },
  },
};

export default TRANSLATION;
