const TRANSLATION = {
  titles: {
    ready: 'La concentración está lista.',
    menu: 'Configuración de concentración',
    help: 'Comandos de concentración',
    status: '¿Quién se está concentrando?',
    advantage: 'Ventaja en ahorros de concentración',
    reset: 'Restablecer concentración',
    concentration: 'Concentración',
    save: 'Ahorro de concentración',
    check: 'Control de concentración',
  },
  messages: {
    migrated:
      'Actualizado desde la versión 1.0. Se conservaron sus configuraciones y lista de ventajas, y sus macros antiguas aún funcionan.',
    reconciled:
      'Al día con el mapa: se encontraron tokens de concentración {added}, se eliminaron entradas antiguas {dropped}.',
    readyHint: 'Escriba {command} para la configuración o abra el folleto Command Deck.',
    settingChanged: '{setting} ahora es {value}.',
    confirmReset:
      '¿Volver a poner cada configuración a su valor predeterminado y borrar la lista de ventajas? Los marcadores de concentración en el mapa permanecen.',
    reset: 'La configuración vuelve a sus valores predeterminados.',
    journal: 'Documentos reconstruidos: {help} y {deck}.',
  },
  notices: {
    started: '{name} ahora se concentra en {spell}.',
    startedNoSpell: '{name} ahora se está concentrando.',
    switched: '{name} deja de concentrarse en {old} y ahora se concentra en {spell}.',
    switchedNoSpell: '{name} ahora se está concentrando.',
    ended: '{name} ya no se concentra en {spell}.',
    endedNoSpell: '{name} ya no se concentra.',
    lost: '{name} pierde la concentración en {spell}.',
    lostNoSpell: '{name} pierde la concentración.',
    kept: '{name} sigue concentrándose en {spell}.',
    keptNoSpell: '{name} sigue concentrándose.',
    zeroHp: '{name} cae a 0 puntos de vida y pierde la concentración en {spell}.',
    zeroHpNoSpell: '{name} cae a 0 puntos de vida y pierde la concentración.',
    checkNeeded:
      '{name} debe realizar una tirada de salvación de Constitución para seguir concentrándose: {dc}.',
  },
  save: {
    dc: 'corriente continua',
    dcValue: 'CC {dc}',
    modifier: 'Modificador',
    roll: 'Rollo',
    advantageRoll: '{first} y {second} (ventaja)',
    success: 'Éxito',
    failure: 'Falla',
  },
  menu: {
    concentratingCount: 'Concentrándonos ahora: {count}',
    settings: 'Ajustes',
    footer:
      'Escriba {command} para volver aquí. Cada botón también se encuentra en el folleto "{deck}".',
  },
  status: {
    none: 'Nadie se está concentrando.',
  },
  advantage: {
    intro:
      'Los personajes configurados para activar sus salvaciones de concentración con ventaja, como ocurre con la hazaña War Caster. Esto se aplica a los guardados automáticos.',
    none: 'No hay personajes en este juego.',
  },
  buttons: {
    roll: 'Rollo',
    advantage: 'Ventaja',
    status: 'Estado',
    advantageMenu: 'Menú de ventajas',
    help: 'Ayuda',
    reset: 'Reiniciar',
    confirmReset: 'Restablecer configuración',
    end: 'Fin',
    menu: 'Menú',
    concentrate: 'Concéntrate en…',
    toggle: 'Palanca',
    journal: 'Reconstruir folletos',
  },
  prompts: {
    spell: 'Deletrear',
  },
  values: {
    on: 'En',
    off: 'Apagado',
    bar: 'Barra {bar}',
    unnamed: 'Sin nombre',
    sendTo: {
      everyone: 'Todos',
      character: 'Personaje',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Básico',
      detailed: 'Detallado',
    },
  },
  settings: {
    language: {
      label: 'Idioma',
      desc: 'El idioma de los mensajes de chat y los folletos.',
    },
    command: {
      label: 'Dominio',
      desc: 'El comando de chat, sin el "!". Las macros de la versión 1.0 usan concentración.',
    },
    statusmarker: {
      label: 'Marcador de estado',
      desc: 'El marcador simbólico que muestra concentración. Se pueden utilizar marcadores de tokens personalizados.',
    },
    bar: {
      label: 'Barra de HP',
      desc: 'La barra de fichas que contiene puntos de vida. Dañarlo exige una salvación de concentración.',
    },
    send_reminder_to: {
      label: 'Enviar recordatorio a',
      desc: 'Quién ve los mensajes de concentración y guarda: todos, el DJ o los jugadores del personaje (el DJ recibe una copia).',
    },
    auto_add_concentration_marker: {
      label: 'Agregar configuración automática. Marcador',
      desc: 'Añade el marcador cuando se lanza un hechizo de concentración desde una hoja.',
      hint: 'D&D 5e 2014 (OGL) y hojas 2024.',
    },
    auto_roll_save: {
      label: 'Guardar rollo automático',
      desc: 'Tira la salvación tan pronto como una ficha de concentración sufra daño. Cuando está apagado, el recordatorio tiene botones Roll y Advantage.',
    },
    show_roll_button: {
      label: 'Botón de rollo',
      desc: 'Agregue los botones Roll y Advantage al recordatorio cuando Auto Roll Save esté desactivado.',
    },
    end_at_zero: {
      label: 'Terminar en 0 HP',
      desc: 'Finaliza la concentración sin guardar cuando una ficha cae a 0 puntos de vida.',
    },
    bonus_attribute: {
      label: 'Atributo de bonificación',
      desc: 'El atributo de hoja agregado a los guardados de concentración. Constitution_save_mod funciona en hojas de D&D 5e 2014 y 2024.',
    },
    debug: {
      label: 'Modo de depuración',
      desc: 'Escriba notas sobre la detección ortográfica y guárdelas en la consola API para solicitudes de soporte.',
    },
    support_mode: {
      label: 'Modo de soporte',
      desc: 'Cuánto escribe el modo de depuración: básico (corto) o detallado.',
    },
  },
  help: {
    menu: 'Sin nada seleccionado (GM): abre la configuración. Con fichas seleccionadas: inicio o fin de la concentración.',
    toggle:
      'Comienza a concentrarte en un hechizo con las fichas seleccionadas. Nombra un hechizo diferente para cambiar; ejecútelo nuevamente para finalizar.',
    end: 'Finalizar la concentración de los tokens seleccionados.',
    status: 'Enumere quién se está concentrando, con los botones Finalizar.',
    config: 'Cambie una configuración, por ejemplo config auto_roll_save|false.',
    advantageMenu: 'Elige qué personajes tiran las salvaciones de concentración con ventaja.',
    toggleAdvantage: 'Activa o desactiva la ventaja para un personaje.',
    roll: 'Tira una partida guardada desde el botón Tirar o Ventaja de un recordatorio.',
    journal: 'Reconstruya los folletos de la plataforma de ayuda y comando.',
    reset: 'Vuelva a poner cada configuración en su valor predeterminado.',
    help: 'Muestra esta lista.',
    footer:
      'Las instrucciones completas se encuentran en el folleto "{help}"; Los botones se encuentran en el folleto "{deck}".',
    playerFooter: 'Seleccione su token primero.',
  },
  errors: {
    noSelection: 'Seleccione un token primero.',
    notYours: 'Sólo puedes cambiar la concentración de las fichas que controlas.',
    gmOnly: 'Sólo el DJ puede usar ese comando.',
    notConcentrating: 'Esa ficha no se está concentrando.',
    unknownSetting: 'No hay ninguna configuración llamada "{key}".',
    badSettingValue: '"{value}" no es un valor válido para {key}.',
    rollExpired: 'Ese botón ha caducado.',
    unknownCharacter: 'Ese personaje ya no existe.',
    internal: 'Algo salió mal. La consola API tiene los detalles.',
  },
  hints: {
    noSelection: 'Seleccione la ficha del lanzador y luego ejecute el comando nuevamente.',
    rollExpired:
      'Los botones funcionan una vez y durante 10 minutos. Daña la ficha nuevamente para obtener una nueva.',
    unknownSetting: 'Escriba el comando sin nada seleccionado para ver la configuración.',
  },
  warnings: {
    unknownMarker:
      'El marcador de estado "{marker}" no es uno de los marcadores de este juego. Elige otro en la configuración.',
  },
  deck: {
    subtitle: 'Cubierta de mando',
    selected: 'Fichas seleccionadas',
    selectedDesc: 'Primero selecciona la ficha del lanzador.',
    table: 'la mesa',
    tableDesc: 'Vea quién se está concentrando y quién tiene ventaja en sus paradas.',
    tools: 'Herramientas',
    toolsDesc: 'Configuración, la lista de comandos y los folletos.',
    footer: 'Las instrucciones completas se encuentran en el folleto "{help}".',
  },
  handout: {
    versionLabel: 'Versión',
    subtitle: 'Marcadores de concentración, recordatorios y guardados para D&D 5e',
    overview: {
      heading: 'Descripción general',
      body: 'La concentración realiza un seguimiento de quién se concentra en qué hechizo. Pone un marcador en la ficha del lanzador, tira (o solicita) una salvación de Constitución cuando esa ficha sufre daño y le dice a la mesa cuándo termina la concentración.',
    },
    quickStart: {
      heading: 'Inicio rápido',
      steps: [
        'Selecciona la ficha del lanzador y escribe !concentración seguido del hechizo, por ejemplo !concentración Bendecir.',
        'Cambia los puntos de vida del token en su burbuja de barra. Se obtiene una salvación con CD 10, o la mitad del daño si es mayor.',
        'Ejecute el mismo comando nuevamente o retire el marcador para finalizar la concentración.',
        'Escribe !concentración sin nada seleccionado para abrir la configuración.',
      ],
    },
    concentrating: {
      heading: 'Concentrarse',
      points: [
        'Nombrar un hechizo diferente cambia la concentración, como lo hace lanzar un nuevo hechizo de concentración.',
        'Poner el marcador en una ficha con la mano inicia la concentración sin un hechizo; quitarlo o eliminar el token lo finaliza.',
        'Una nueva ficha vinculada de un personaje concentrado obtiene el marcador, y se rastrea una ficha pegada que lleva el marcador.',
        'Las fichas de un personaje con una barra de puntos de vida vinculada comparten concentración. Las fichas no vinculadas, como un grupo de duendes de una hoja, se concentran solas.',
        'Todos ven un mensaje cuando la concentración comienza, cambia o termina, a menos que Enviar recordatorio a indique lo contrario.',
      ],
    },
    saves: {
      heading: 'La concentración salva',
      points: [
        'La CD es 10 o la mitad del daño recibido, lo que sea mayor, hasta CD 30.',
        'El modificador proviene del Atributo Bonus en la hoja del personaje; un valor faltante cuenta como 0.',
        'Rollo automático Guarda rollos a la vez. Cuando está desactivado, el recordatorio tiene botones Roll y Advantage para el jugador o GM.',
        'Una salvación fallida pone fin a la concentración. Con End at 0 HP activado, bajar a 0 puntos de vida termina sin guardar.',
        'El menú de ventajas le da al personaje una ventaja en las partidas guardadas automáticamente, como lo hace la hazaña War Caster.',
      ],
    },
    automatic: {
      heading: 'Hechizos lanzados desde una hoja',
      points: [
        'Con Auto Agregar Con. Marcador encendido, lanzar un hechizo de concentración desde una hoja de D&D 5e 2014 (OGL) o 2024 agrega el marcador.',
        'Las fichas del lanzador en la página que está viendo están marcadas; si no hay ninguno, los tokens de cualquier página sí lo son.',
        'Sólo cuentan las cartas del DJ, de otro Mod o de uno de los jugadores del personaje. Lanzar el mismo hechizo nuevamente no cambia nada.',
        'Una carta de D&D 2024 que solo menciona la concentración en su texto, como la hazaña War Caster, puede iniciar la concentración pero nunca reemplaza un hechizo.',
        'Es posible que las hojas de D&D 2024 necesiten el servidor API experimental. Activa el modo de depuración para ver por qué se detectó o no un hechizo.',
      ],
    },
    players: {
      heading: 'Jugadores',
      points: [
        'Los jugadores pueden iniciar y finalizar la concentración de las fichas que controlan y usar los botones Tirar y Ventaja en sus propias partidas guardadas.',
        'Con Enviar recordatorio para configurar en Personaje, los mensajes se susurran a los jugadores del personaje y al DJ.',
      ],
    },
    commands: {
      heading: 'Comandos',
      intro: 'Otros Mods, como ScriptCards, también pueden enviar estos comandos.',
      colCommand: 'Dominio',
      colDesc: 'que hace',
    },
    settings: {
      heading: 'Ajustes',
      intro:
        'Cambie la configuración con los botones en la tarjeta de configuración o con config <clave>|<valor>. Algunos también se pueden configurar en la página del Mod.',
      colKey: 'Llave',
      colName: 'Nombre',
      colDesc: 'que hace',
    },
    upgrading: {
      heading: 'Actualización desde la versión 1.0',
      points: [
        'La configuración, la lista de ventajas y todos los comandos siguen funcionando.',
        'Los mensajes ahora dicen cuándo termina la concentración y en qué hechizo.',
        'Las fichas que ya llevan el marcador se recogen al inicio.',
      ],
    },
    troubleshooting: {
      heading: 'Solución de problemas',
      points: [
        'No guardar cuando los puntos de vida caen: verifica que la ficha tenga el marcador y que la barra de HP sea la barra que cambiaste. Los cambios realizados por otros Mods a través de la API no generan eventos, por lo que no se ven.',
        'El modificador es 0: compara el Atributo de Bonificación con la hoja del personaje.',
        'Los hechizos lanzados desde la hoja no se detectan: active el modo de depuración, vuelva a lanzar el hechizo y lea la consola API.',
        'Dos personajes comparten un nombre: la detección utiliza la primera coincidencia. Dale a los personajes nombres únicos.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'La concentración está traducida a los siguientes idiomas. Elija uno con la configuración de Idioma.',
      colCode: 'Código',
      colName: 'Idioma',
      colNative: 'nombre nativo',
    },
    credits: {
      heading: 'Créditos',
      original: 'Mod original de',
      maintainer: 'Mantenido por',
      support: 'Informe errores e ideas en el foro Roll20 Mod o en GitHub.',
    },
    footer: 'Los botones para cada acción se encuentran en el folleto "{deck}".',
  },
};

export default TRANSLATION;
