const TRANSLATION = {
  conditions: {
    Grappled: {
      past: "aferrado",
      verb: "aferra",
    },
    Restrained: {
      past: "restringido",
      verb: "restringe",
    },
    Prone: {
      past: "derribado",
      verb: "derriba",
    },
    Poisoned: {
      past: "envenenado",
      verb: "envenena",
    },
    Stunned: {
      past: "aturdido",
      verb: "aturde",
    },
    Blinded: {
      past: "cegado",
      verb: "ciega",
    },
    Charmed: {
      past: "encantado",
      verb: "encanta",
    },
    Frightened: {
      past: "asustado",
      verb: "asusta",
    },
    Incapacitated: {
      past: "incapacitado",
      verb: "incapacita",
    },
    Invisible: {
      past: "invisible",
      verb: "vuelve",
      suffix: "invisible",
    },
    Paralyzed: {
      past: "paralizado",
      verb: "paraliza",
    },
    Petrified: {
      past: "petrificado",
      verb: "petrifica",
    },
    Unconscious: {
      past: "inconsciente",
      verb: "deja",
      suffix: "inconsciente",
    },
    Spell: {
      past: "afectado por un conjuro",
      verb: "lanza un conjuro sobre",
    },
    Ability: {
      past: "afectado por una habilidad",
      verb: "usa una habilidad en",
    },
    Advantage: {
      past: "tiene ventaja",
      verb: "otorga ventaja a",
      noBy: true,
    },
    Disadvantage: {
      past: "tiene desventaja",
      verb: "impone desventaja en",
      noBy: true,
    },
  },
  condNames: {
    Grappled: "Aferrado",
    Restrained: "Restringido",
    Prone: "Derribado",
    Poisoned: "Envenenado",
    Stunned: "Aturdido",
    Blinded: "Cegado",
    Charmed: "Encantado",
    Frightened: "Asustado",
    Incapacitated: "Incapacitado",
    Invisible: "Invisible",
    Paralyzed: "Paralizado",
    Petrified: "Petrificado",
    Unconscious: "Inconsciente",
    Spell: "Conjuro",
    Ability: "Habilidad",
    Advantage: "Ventaja",
    Disadvantage: "Desventaja",
    Other: "Otro",
  },
  templates: {
    display: {
      custom: "{emoji} {target} afectado por {effect} ({source})",
      advantage: "{emoji} {source} tiene ventaja contra {target}{subject}",
      disadvantage:
        "{emoji} {source} tiene desventaja contra {target}{subject}",
      noBy: "{emoji} {target} {past} ({source})",
      self: "{target} está {past}",
      standard: "{emoji} {target} {past} por {source}",
    },
    apply: {
      custom: "{source} aplica {effect} a {target}.",
      advantage: "{source} tiene ventaja contra {target}{subject}.",
      disadvantage: "{source} tiene desventaja contra {target}{subject}.",
      self: "{target} está {past}.",
      withSuffix: "{source} {verb} {target} {suffix}.",
      standard: "{source} {verb} {target}.",
    },
    remove: {
      custom: "{target} ya no está afectado por {effect}.",
      advantage: "{source} ya no tiene ventaja contra {target}{subject}.",
      disadvantage: "{source} ya no tiene desventaja contra {target}{subject}.",
      noBy: "{target} ya no está {past}.",
      self: "{target} ya no está {past}.",
      standard: "{target} ya no está {past} por {source}.",
    },
  },
  ui: {
    wizard: {
      selectCondition: "Seleccionar condición",
      selectSource: "Seleccionar ficha de origen",
      selectTarget: "Seleccionar ficha objetivo",
      selectSubject: "Seleccionar sujeto",
      selectDuration: "Seleccionar duración",
      confirmTargetTitle: "Confirmar lista de objetivos",
      applyEffectTitle: "Aplicar efecto {condition}",
      noTokens: "No se encontraron fichas con nombre en la página activa.",
      confirmIntro: "Las siguientes fichas recibirán la condición:",
      confirmBtn: "Confirmar lista de objetivos",
      enterDetails: "Introducir detalles del efecto",
      noneBtn: "Ninguno",
      noneOrSourceBtn: "Ninguno o aplicar al origen",
      subjectDesc: "Selecciona quién o qué aplica el efecto.",
      sourceDesc:
        "Selecciona la criatura que crea o genera la condición o efecto.",
      targetDesc: "Selecciona la criatura que recibirá la condición o efecto.",
      otherText: "Texto de condición personalizada",
      effectDetails: "Detalles de {condition}",
    },
    col: {
      players: "Jugadores",
      npcs: "PNJ",
      conditions: "Condiciones",
      customEffects: "Efectos personalizados",
      permanentTurnEnd: "Permanente / Fin de turno",
      rounds: "Rondas",
      command: "Comando",
      result: "Resultado",
      field: "Campo",
      value: "Valor",
      option: "Opción",
      condition: "Condición",
      marker: "Marcador",
      item: "Elemento",
      removed: "Eliminado",
      details: "Detalles",
      description: "Descripción",
      scenario: "Escenario",
    },
    dur: {
      untilRemoved: "Hasta retirar",
      endOfTargetTurn: "Fin del próximo turno del objetivo",
      endOfSourceTurn: "Fin del próximo turno de la fuente",
      round1: "1 ronda",
      round2: "2 rondas",
      round3: "3 rondas",
      round10: "10 rondas",
      custom: "Personalizado",
      customPrompt: "Número de rondas",
      untilRemovedDisplay: "Hasta retirar",
      turnsRemaining: "{n} fin(es) de turno restante(s)",
    },
    btn: {
      openWizard: "Abrir asistente",
      openMultiTarget: "Abrir asistente multiobjetivo",
      openRemovalList: "Abrir lista de eliminación",
      showConfig: "Mostrar configuración",
      runCleanup: "Ejecutar limpieza",
      reinstallMacro: "Reinstalar macro",
      reinstallHandout: "Reinstalar folleto",
      showHelp: "Mostrar ayuda",
      reorderConditions: "Reordenar filas de condición",
    },
    title: {
      menu: "Menú",
      removalMenu: "Eliminación — Condition Tracker",
      config: "Configuración",
      configTracker: "Configuración — Condition Tracker",
      help: "Ayuda",
      applied: "Aplicado",
      removed: "Condición eliminada",
      cleanup: "Limpieza completada",
      macroReinstalled: "Macro reinstalada",
      handoutReinstalled: "Folleto reinstalado",
      warning: "Advertencia",
      error: "Error",
      turnOrder: "Orden de iniciativa",
      noConditions: "Sin condiciones",
      tokenMoved: "Ficha movida",
      markedDead: "Marcado como muerto",
      zeroHp: "{name} — 0 PV",
      moveToken: "{name} — ¿Mover ficha?",
      scriptReady: "Script listo",
      conditionReorder: "Orden de turno cambiado",
    },
    heading: {
      quickActions: "Acciones rápidas",
      settings: "Ajustes",
      markerMappings: "Asignación de marcadores",
      result: "Resultado",
      info: "Información",
      commandOptions: "Opciones de comando",
      promptUi: "Interfaz del asistente",
      examples: "Ejemplos",
      summary: "Resumen",
    },
    msg: {
      noActive: "No se están rastreando condiciones activas.",
      configReset: "Configuración restablecida a los valores predeterminados.",
      unknownConfig:
        "Opción de configuración desconocida. Usa --config para ver los ajustes disponibles.",
      macroReinstalled:
        "Las macros {wizard} y {multiTarget} se han reinstalado para todos los GM actuales.",
      handoutReinstalled: "El folleto de ayuda {handout} se reinstaló.",
      duplicate:
        "Esa combinación exacta de fuente, sujeto, objetivo, condición y texto personalizado ya está activa.",
      noTargets:
        "No se especificaron fichas objetivo para la aplicación múltiple.",
      noSelection:
        "Selecciona al menos una ficha en el tablero antes de usar --multi-target.",
      invalidIds:
        "No se encontraron identificadores de ficha válidos en la selección actual.",
      reSelectTokens:
        "No se encontró ninguna de las fichas seleccionadas originalmente. Vuelve a seleccionarlas e inténtalo de nuevo.",
      conditionNotFound: "No se encontró el identificador de condición.",
      gmOnly: "Los comandos de Condition Tracker son solo para el GM.",
      commandFailed:
        "El comando no pudo completarse de forma segura. Revisa la consola de la API.",
      sourceTokenNotFound: "No se encontró la ficha de origen.",
      targetTokenNotFound: "No se encontró la ficha objetivo.",
      subjectTokenNotFound: "No se encontró la ficha del sujeto.",
      invalidCondition: "La condición debe ser una de las predefinidas u Otro.",
      subjectOnlyCustom:
        "--subject solo es válido para Conjuro, Habilidad, Ventaja, Desventaja y Otro.",
      subjectBypassInvalid:
        "--subjectPromptBypass espera true o false cuando se proporciona un valor.",
      customDetailsRequired:
        "Se requieren los detalles de {condition}. Usa --other para proporcionarlos.",
      markerConfigFormat:
        "Formato de configuración del marcador: --config marker Grappled=grab",
      markerPredefinedRequired:
        "La configuración del marcador requiere un nombre de condición predefinido.",
      markerNameRequired:
        "La configuración del marcador requiere un nombre de marcador no vacío.",
      markerSet: "Marcador de {condition} establecido en {marker}.",
      healthBarSet: "Barra de salud establecida en {bar}.",
      boolSet: "{key} establecido en {value}.",
      expectedBoolean: "Se esperaba true o false.",
      invalidHealthBar:
        "La barra de salud debe ser bar1_value, bar2_value o bar3_value.",
      markersDisabled: "Los marcadores están desactivados.",
      noMarkerConfigured:
        "No hay ningún marcador configurado para esta condición.",
      markerApplied: "Marcador aplicado: {marker}",
      markerPresent: "Marcador ya presente: {marker}",
      langSet: "Idioma establecido en {locale}.",
      invalidLocale:
        "Configuración regional no válida. Locales admitidas: {locales}.",
      otherDurationRequiresRounds:
        "La duración Otro requiere un número de rondas, por ejemplo --duration 5 rounds.",
      invalidDuration:
        "La duración debe ser Hasta retirar, una opción de fin de turno o un número positivo de rondas.",
      zeroHpNoConditions:
        "{name} ha llegado a 0 PV y no tiene condiciones activas.",
      zeroHpConditions:
        "{name} ha llegado a 0 PV. Elige las condiciones a eliminar:",
      removeAllBtn: "Eliminar todas las condiciones de {name}",
      markIncapacitated: "Marcar como incapacitado",
      removeFromTurnOrder: "Eliminar del orden de iniciativa",
      alreadyIncapacitated: "{name} ya está incapacitado.",
      tokenRemovedFromTurn: "{name} ha sido eliminado del orden de iniciativa.",
      tokenNotInTurn: "{name} no se encontró en el orden de iniciativa.",
      moveTokenPrompt:
        "¿Mover {name} a la capa del mapa para que permanezca visible sin interferir con otras fichas?",
      moveTokenBtn: "Mover {name} a la capa del mapa",
      tokenMoved: "{name} ha sido movido a la capa del mapa.",
      tokenNotFound: "Ficha no encontrada.",
      noActiveConditions: "{name} no tiene condiciones activas que eliminar.",
      deadNoConditions:
        "{name} fue marcado como muerto. No había condiciones activas.",
      scriptReady: "{name} está activo y usas la versión {version}.",
      reachedZeroHp: "{name} alcanzó 0 PV",
      manuallyRemoved: "eliminación manual",
      durationExpired: "su duración expiró",
      markedAsDead: "{name} fue marcado como muerto",
      conditionReorder:
        "El orden de turno ha cambiado y {count} fila(s) de condición rastreada(s) puede(n) estar fuera de lugar. Haz clic abajo para restaurarlas después de sus tokens asignados.",
      conditionsReordered:
        "Las filas de condición han sido reposicionadas después de sus tokens asignados.",
    },
    removal: {
      conditionField: "Condición",
      reasonField: "Razón",
      turnRowField: "Fila de iniciativa",
      markerField: "Marcador",
      notConfigured: "No configurado",
      markerRemoved: "Eliminado ({marker})",
      markerRetained: "Conservado ({marker})",
      rowRemoved: "Eliminado",
      rowMissing: "Ya faltaba",
      manualReason: "Eliminación manual",
    },
    cleanup: {
      orphaned: "Entradas de condición huérfanas",
      stale: "Entradas de condición obsoletas",
      orphanedRows: "Filas de iniciativa huérfanas",
      unusedMarkers: "Marcadores sin usar",
    },
    apply: {
      turnAppended:
        "El objetivo no estaba en el orden de iniciativa; se agregó la fila de condición.",
      turnInserted: "Fila de condición insertada debajo de la ficha objetivo.",
    },
  },
  handout: {
    versionLabel: "Versión",
    subtitle: "Gestor de efectos de estado de D&D 5e",
    footerNote:
      "Este folleto se crea y actualiza automáticamente cada vez que se carga el script.",
    overview: {
      heading: "Descripción general",
      body: "Condition Tracker gestiona las condiciones de estado de D&D 5e y los efectos personalizados como filas etiquetadas en el rastreador de turno de Roll20. Aplica condiciones a fichas, rastrea duraciones por orden de iniciativa y elimina automáticamente los efectos caducados al finalizar un turno. Todos los comandos son exclusivos para el GM.",
    },
    quickStart: {
      heading: "Inicio rápido",
      colCommand: "Comando",
      colDesc: "Descripción",
      rows: [
        [
          "!condition-tracker --prompt",
          "Asistente paso a paso — elige condición, fichas y duración de forma interactiva. También disponible como macro ConditionTrackerWizard.",
        ],
        [
          "!condition-tracker --multi-target",
          "Aplicar una condición a varias fichas simultáneamente. También disponible como macro ConditionTrackerMultiTarget.",
        ],
        [
          "!condition-tracker --menu",
          "Abrir el menú principal para aplicar, revisar o eliminar condiciones.",
        ],
      ],
    },
    commandsRef: {
      heading: "Referencia de comandos",
      colFlag: "Opción",
      colDesc: "Descripción",
      rows: [
        ["--prompt", "Interfaz del asistente paso a paso"],
        ["--multi-target", "Aplicar una condición a varias fichas objetivo"],
        [
          "--menu",
          "Mostrar menú principal (añadir remove para el menú de eliminación)",
        ],
        [
          "--source X --target Y --condition Z",
          "Aplicar una condición directamente sin el asistente",
        ],
        [
          "--duration &lt;valor&gt;",
          "Duración para aplicación directa (p. ej. 2 rounds)",
        ],
        [
          "--other &lt;texto&gt;",
          "Texto personalizado para tipos Conjuro / Habilidad / Otro",
        ],
        [
          "--remove &lt;id-condición&gt;",
          "Eliminar una condición específica por su ID único",
        ],
        [
          "--config &lt;opción&gt; &lt;valor&gt;",
          "Ajustar opciones de configuración",
        ],
        [
          "--prompt --subjectPromptBypass true|false",
          "Sobrescribir subjectPromptBypass solo para este comando (también admite --subject-prompt-bypass)",
        ],
        [
          "--cleanup",
          "Reconciliar estado — eliminar condiciones y filas huérfanas",
        ],
        [
          "--reorder-conditions",
          "Reposicionar manualmente las filas de condición detrás de sus fichas asignadas en el orden de turno",
        ],
        ["--reinstall-macro", "Recrear o actualizar las macros del GM"],
        [
          "--reinstall-handout",
          "Recrear o actualizar el folleto de ayuda localizado",
        ],
        [
          "--lang &lt;locale&gt;",
          "Emitir los mensajes de este comando en una locale adicional (modo bilingüe)",
        ],
        ["--help", "Mostrar una tarjeta de ayuda breve en el chat"],
      ],
    },
    standardConditions: {
      heading: "Condiciones estándar (D&D 5e)",
      colCondition: "Condición",
    },
    customEffects: {
      heading: "Tipos de efectos personalizados",
      colType: "Tipo",
      colNotes: "Notas",
      rows: [
        [
          "🔮 Conjuro",
          "Rastrear un efecto de conjuro nombrado — se te pedirá el nombre del conjuro",
        ],
        [
          "🎯 Habilidad",
          "Rastrear una habilidad de clase o racial — se te pedirá el nombre",
        ],
        [
          "🍀 Ventaja",
          "Registrar ventaja otorgada de una ficha a otra; agrupada con la fuente en la iniciativa",
        ],
        [
          "⬇️ Desventaja",
          "Registrar desventaja impuesta; agrupada con la fuente en la iniciativa",
        ],
        [
          "📝 Otro",
          "Etiqueta personalizada libre — se te pedirá una descripción",
        ],
      ],
    },
    durationOptions: {
      heading: "Opciones de duración",
      intro:
        "El conteo restante se muestra en la columna pr del rastreador de turno y disminuye cuando termina el turno de la ficha ancla.",
      colOption: "Opción",
      colBehaviour: "Comportamiento",
      rows: [
        [
          "Hasta retirar",
          "Permanente — debe eliminarse manualmente mediante el menú o --remove",
        ],
        [
          "Fin del próximo turno del objetivo",
          "Expira cuando termina el próximo turno del objetivo en la iniciativa",
        ],
        [
          "Fin del próximo turno de la fuente",
          "Expira cuando termina el próximo turno de la fuente en la iniciativa",
        ],
        [
          "1 / 2 / 3 / 10 rondas",
          "Cuenta regresiva fija; un decremento por cada fin de turno del ancla",
        ],
      ],
    },
    configuration: {
      heading: "Configuración",
      intro:
        "Usa !condition-tracker --config &lt;opción&gt; &lt;valor&gt; o el botón Configuración en el menú principal.",
      colOption: "Opción",
      colValues: "Valores",
      colDesc: "Descripción",
      rows: [
        [
          "useMarkers",
          "true / false",
          "Aplicar marcadores de estado de Roll20 a las fichas al agregar una condición",
        ],
        [
          "useIcons",
          "true / false",
          "Mostrar códigos de ícono cortos (p. ej. [G]) en las filas del rastreador de turno",
        ],
        [
          "subjectPromptBypass",
          "true / false",
          "Omitir el paso de sujeto opcional para efectos Conjuro / Habilidad / Otro",
        ],
        [
          "healthBar",
          "bar1_value / bar2_value / bar3_value",
          "Barra a vigilar; cuando llega a 0 se le pide al GM que limpie las condiciones",
        ],
        [
          "language",
          "en-US / fr / de / es / pt-BR / ko",
          "Idioma de los mensajes de chat y el folleto de ayuda",
        ],
        [
          "marker",
          "&lt;Condición&gt;=&lt;nombre del marcador&gt;",
          "Reemplazar el marcador usado para una condición específica (p. ej. marker Grappled=grab)",
        ],
      ],
    },
    defaultMarkers: {
      heading: "Marcadores de estado predeterminados",
      colCondition: "Condición",
      colMarker: "Nombre del marcador",
    },
    availableLocales: {
      heading: "Traducciones disponibles",
      intro:
        "Usa la opción de configuración language para establecer los mensajes de chat y el folleto de ayuda en cualquier idioma compatible. También se aceptan alias cortos para en, zh y pt.",
      colLocale: "Configuración regional",
      colLanguage: "Idioma",
      colFile: "Archivo de traducción",
    },
  },
};

export default TRANSLATION;
