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
      reinstallMacro: "Reinstal·la la macro",
      reinstallHandout: "Reinstal·la el fullet",
      showHelp: "Mostra l'ajuda",
      reorderConditions: "Reordena les files de condicions",
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
    },
    msg: {
      noActive: "No hi ha cap condició activa en seguiment.",
      configReset: "Configuració restablerta als valors predeterminats.",
      unknownConfig:
        "Opció de configuració desconeguda. Usa --config per veure els paràmetres disponibles.",
      macroReinstalled:
        "Les macros {wizard} i {multiTarget} s'han reinstal·lat per a tots els MJ actius.",
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
          "!condition-tracker --prompt",
          "Assistent pas a pas — tria la condició, els testimonis i la durada de manera interactiva. També disponible com a macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Aplica una condició a diversos testimonis simultàniament. També disponible com a macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Obre el menú principal de gestió amb botons per aplicar, revisar o eliminar condicions.",
        ],
      ],
    },
    commandsRef: {
      heading: "Referència d'ordres",
      colFlag: "Opció",
      colDesc: "Descripció",
      rows: [
        ["--prompt", "Interfície de l'assistent pas a pas"],
        [
          "--multi-target",
          "Aplica una condició a diversos testimonis destinataris alhora",
        ],
        [
          "--menu",
          "Mostra el menú principal (afegeix remove per al menú d'eliminació)",
        ],
        [
          "--source X --target Y --condition Z",
          "Aplica una condició directament sense l'assistent",
        ],
        [
          "--duration &lt;valor&gt;",
          "Durada per a una aplicació directa (p. ex. 2 rounds)",
        ],
        [
          "--other &lt;text&gt;",
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
          "--prompt --subjectPromptBypass true|false",
          "Substitueix subjectPromptBypass per a aquesta ordre únicament (també admet --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Reconcilia l'estat — elimina les condicions i files del registre de torns òrfenes",
        ],
        [
          "--reorder-conditions",
          "Reposiciona manualment les files de condicions darrere dels seus tokens assignats a l'ordre de torns",
        ],
        ["--reinstall-macro", "Torna a crear o actualitza les macros del MJ"],
        [
          "--reinstall-handout",
          "Torna a crear o actualitza el fullet d'ajuda localitzat",
        ],
        [
          "--lang &lt;locale&gt;",
          "Mostra els missatges d'aquesta ordre en una configuració regional addicional (mode bilingüe)",
        ],
        ["--help", "Mostra una targeta d'ajuda breu al xat"],
      ],
    },
    standardConditions: {
      heading: "Condicions estàndard (D&amp;D 5e)",
      colCondition: "Condició",
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
          "true / false",
          "Mostra codis d'icona curts (p. ex. [G]) en lloc d'emojis a les files del registre de torns",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Omet el pas del testimoni subjecte opcional per als efectes Encanteri / Habilitat / Altres",
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
      ],
    },
    defaultMarkers: {
      heading: "Marcadors d'estat predeterminats",
      colCondition: "Condició",
      colMarker: "Nom del marcador",
    },
    availableLocales: {
      heading: "Traduccions disponibles",
      intro:
        "Usa l'opció de configuració language per establir els missatges del xat i el fullet d'ajuda en qualsevol configuració regional admesa. Els àlies curts també s'accepten per a en, zh i pt.",
      colLocale: "Locale",
      colLanguage: "Idioma",
      colFile: "Fitxer de traducció",
    },
  },
};

export default TRANSLATION;
