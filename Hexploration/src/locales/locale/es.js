const TRANSLATION = {
  titles: {
    ready: 'La hexploración está lista.',
    settings: 'Configuración de hexploración',
    languages: 'Elige un idioma',
    pageSettings: 'Configuración de página: {page}',
    status: 'Estado de exploración: {page}',
    help: 'Comandos de hexploración',
    confirm: 'Por favor confirme',
  },
  discovery: {
    title: 'Ubicación descubierta',
  },
  menu: {
    draw: 'Dibujar',
    reveal: 'Revelar y ocultar',
    locations: 'Ubicaciones',
    tools: 'Herramientas',
    layerInUse: 'Se están dibujando nuevos hexágonos en {layer}.',
    pageSettingsHelp:
      'Esta configuración se aplica únicamente a esta página. Las configuraciones marcadas con ★ anulan la configuración global.',
  },
  buttons: {
    fill: 'Llenar',
    fillInverse: 'Relleno inverso',
    undo: 'Deshacer relleno',
    reveal: 'Revelar',
    conceal: 'Ocultar',
    explore: 'Explorar',
    revealPage: 'Revelar página',
    resetPage: 'Restablecer página',
    mark: 'Marcar ubicación',
    unmark: 'Desmarcar',
    name: 'Nombre hexadecimal',
    settings: 'Ajustes',
    pageSettings: 'Configuración de página',
    status: 'Estado',
    rescan: 'Volver a escanear',
    calibrate: 'Calibrar',
    calibrateReset: 'Restablecer calibración',
    help: 'Ayuda',
    change: 'Cambiar',
    menu: 'Menú',
    clearOverrides: 'Borrar anulaciones',
    confirmReset: 'Sí, eliminar todos los hexágonos',
  },
  prompts: {
    name: 'Nombre de la ubicación (déjelo vacío para borrarlo)',
  },
  values: {
    on: 'En',
    off: 'Apagado',
    none: 'Ninguno',
    hexLayer: {
      auto: 'Auto (primer plano si está disponible)',
      foreground: 'capa de primer plano',
      objects: 'capa de token',
    },
    revealBy: {
      players: 'fichas de jugador',
      characters: 'Fichas de personaje',
      all: 'Todas las fichas',
    },
    revealMode: {
      clear: 'Claro',
      glimpse: 'Vistazo',
    },
    announce: {
      all: 'Todos',
      gm: 'solo GM',
      off: 'Apagado',
    },
    orientation: {
      vertical: 'Hexágono (V)',
      horizontal: 'Hexagonal (H)',
    },
    fillKind: {
      fill: 'Llenar',
      fillInverse: 'Relleno inverso',
      conceal: 'Ocultar',
    },
  },
  settings: {
    language: {
      label: 'Idioma',
      desc: 'Idioma para menús, mensajes y folletos.',
    },
    hexLayer: {
      label: 'Capa hexagonal',
      desc: 'Donde se dibujan nuevos hexágonos. Auto prueba la capa de primer plano (sobre las fichas) y vuelve a la capa de fichas si el juego no lo admite.',
    },
    fillColor: {
      label: 'Color de relleno',
      desc: 'Color de nuevos hexágonos. Utilice rgba() para hexágonos transparentes, por ejemplo rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Color del borde',
      desc: 'Color del contorno de nuevos hexágonos.',
    },
    labelColor: {
      label: 'Color de la etiqueta',
      desc: 'Color de las etiquetas de nombres exclusivos para GM en hexágonos con nombre.',
    },
    glimpseColor: {
      label: 'Color de vislumbre',
      desc: 'Los hexágonos de color cambian cuando se vislumbran (modo de revelación Glimpse). Utilice un color rgba() transparente.',
    },
    strokeWidth: {
      label: 'Ancho del borde',
      desc: 'Ancho del contorno de nuevos hexágonos, en píxeles (0 a 20).',
    },
    maxDistance: {
      label: 'Distancia de revelación hexagonal',
      desc: 'Se aplica a los hexágonos a medida que se dibujan: una ficha debe estar dentro de esta cantidad de hexágonos para revelarlos, por muy lejos que pueda ver. Déjelo vacío sin límite.',
    },
    revealDistance: {
      label: 'Distancia de visión',
      desc: 'Cuántos hexágonos se revelan alrededor de una ficha en movimiento (0 a 20). 0 revela sólo los hexágonos por los que pasa la ficha.',
    },
    lineOfSight: {
      label: 'Línea de visión',
      desc: 'Cuando está activado, un hexágono sólo se revela si no hay ningún hexágono cubierto entre él y la ficha.',
    },
    revealPath: {
      label: 'Revelar a lo largo del camino',
      desc: 'Cuando está activado, se revela cada hexágono por el que pasa una ficha mientras es arrastrada (incluidos los puntos de ruta), no solo dónde se detiene.',
    },
    revealBy: {
      label: 'Fichas que revelan',
      desc: 'Qué fichas en la capa de fichas revelan hexágonos: fichas controladas por un jugador, fichas que representan cualquier personaje o todas las fichas.',
    },
    revealMode: {
      label: 'Modo revelar',
      desc: 'Borrar elimina hexágonos a la vista. En cambio, Glimpse los hace transparentes; se eliminan cuando una ficha ingresa en ellos.',
    },
    announce: {
      label: 'Anunciar descubrimientos',
      desc: 'Quién ve el mensaje de chat cuando se descubre una ubicación con nombre.',
    },
    pingDiscoveries: {
      label: 'Descubrimientos de ping',
      desc: 'Cuando está activado, los jugadores reciben un ping a una ubicación con nombre cuando se descubre.',
    },
    hideCoveredTokens: {
      label: 'Ocultar tokens cubiertos',
      desc: 'Roll20 dibuja nombres, barras y auras sobre hexágonos. Cuando están activadas, las fichas bajo un hexágono cubierto tienen su nombre, barras y auras visibles para el jugador desactivadas y se vuelven a activar cuando se descubren.',
    },
  },
  status: {
    engine: 'motor de juego',
    grid: 'Red',
    layer: 'capa hexagonal',
    hexes: 'Hexágonos',
    named: 'Hexágonos con nombre',
    icons: 'Fichas de ubicación',
    glimpsed: 'Hexágonos vislumbrados',
    pending: 'Ubicaciones esperando ser llenadas',
    calibrated: 'Calibrado',
    overrides: 'Anulaciones de página',
    undo: 'Deshacer disponible',
  },
  messages: {
    filled:
      'Llenar completo. Hexágonos dibujados: {created}. Rediseñado: {restyled}. Ubicaciones ocultas: {icons}.',
    revealed: 'Hexágonos revelados: {count}.',
    revealedPage: 'Cada hexágono en la página revelado ({count}).',
    confirmReset:
      '¿Eliminar todos los hexágonos de "{page}" ({count})? Los tokens de ubicación regresan a la capa de tokens. Deshacer no puede revertir esto.',
    resetPage: 'Hexes eliminados de la página: {count}.',
    undone:
      'Último relleno deshecho. Hexágonos eliminados: {removed}. Hexágonos rediseñados restaurados: {restored}.',
    named: 'Hexágonos denominados "{name}": {count}.',
    unnamed: 'Nombres borrados: {count}.',
    marked:
      'Ubicaciones ocultas en hexágonos existentes: {attached}. Esperando el siguiente relleno que los cubra: {pending}.',
    unmarked: 'Tokens que ya no son ubicaciones: {count}.',
    settingChanged: '{setting} establecido en {value}.',
    rescanned:
      'Volver a escanear completo. Mantenido: {kept}. Adoptado: {adopted}. Representado nuevamente: {moved}. Desaparecido y olvidado: {dropped}. Etiquetas vinculadas nuevamente: {labels}. Tokens de ubicación vueltos a vincular: {icons}.',
    calibrated:
      'Cuadrícula calibrada (paso de columna {colStep}px, paso de fila {rowStep}px). Volver a escanear: mantuvo {kept}, volvió a presentar {moved}, adoptó {adopted}.',
    calibrationReset:
      'Se eliminó la calibración. Volver a escanear: mantuvo {kept}, volvió a presentar {moved}, adoptó {adopted}.',
    journalRebuilt: 'Se han reconstruido los folletos "{help}" y "{deck}".',
    migrated:
      'Tus mapas hexadecimales de Hexploration 1.x han sido actualizados. Si este juego fue copiado de un juego heredado, ejecuta Volver a escanear en cada página del mapa hexadecimal.',
    pruned:
      'Hexágonos guardados que ya no existen y fueron olvidados: {dropped}. Si este juego o página fue copiado, ejecuta Volver a escanear en la página para recuperar sus hexágonos nuevamente.',
    readyHint:
      'Escriba !hexploration para el menú o abra el folleto "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Este juego no admite dibujar en la capa de primer plano, por lo que los hexágonos se dibujaron en la capa de fichas.',
    someFailed:
      'Hexágonos que no se pudieron dibujar: {count}. Consulte la consola API para obtener más detalles.',
  },
  errors: {
    noPage: 'No se pudo encontrar la página para trabajar.',
    notHex: 'Esta página no utiliza una cuadrícula hexadecimal.',
    noPolygons: 'Seleccione una o más formas dibujadas para rellenar.',
    emptyArea: 'El área seleccionada no contiene ningún centro hexadecimal.',
    tooMany: 'Eso crearía demasiados hexágonos de una sola vez ({count}).',
    nothingToConceal: 'Seleccione formas dibujadas o fichas para ocultar.',
    nothingToReveal: 'Selecciona hexágonos, formas dibujadas o fichas para revelar.',
    noTokens: 'Seleccione uno o más tokens primero.',
    noHexes: 'Selecciona uno o más hexágonos (o fichas que se encuentren en hexágonos) primero.',
    nothingToUndo: 'No hay ningún relleno que deshacer.',
    unknownCommand: 'Comando desconocido: {command}',
    unknownSetting: 'Configuración desconocida: {key}',
    unknownPageSetting: 'Configuraciones que se pueden establecer por página: {keys}',
    invalidValue: '"{value}" no es un valor válido para {key}.',
    calibrateNeedsTokens: 'Seleccione una o dos fichas colocadas en centros hexadecimales.',
    calibrateFailed: 'Esas fichas no se pueden utilizar para calibrar.',
    unexpected: 'Algo salió mal: {message}',
  },
  hints: {
    noPage: 'Abra la página en la que desea trabajar o seleccione algo en ella.',
    notHex:
      'Establezca la cuadrícula de la página en Hex (V) o Hex (H) en Configuración de página.',
    noPolygons:
      'Dibuja un polígono, un rectángulo, una elipse o una forma a mano alzada alrededor del área, selecciónala y vuelve a intentarlo.',
    emptyArea:
      'Dibuja una forma más grande o verifica la configuración de la cuadrícula de la página.',
    tooMany: 'Rellene un área más pequeña o divida el área en varias formas.',
    noHexes:
      'Los hexágonos están en primer plano o en la capa de fichas; cambie a esa capa para seleccionarlas.',
    unknownCommand: 'Escriba !hexploration help para enumerar los comandos.',
    unknownSetting: 'Escriba !hexploration set para ver todas las configuraciones.',
    calibrateNeedsTokens:
      'Coloca una ficha en el centro de un hexágono y selecciónala. Seleccione una segunda ficha colocada en un hexágono vecino en la misma fila (Hex V) o columna (Hex H) para corregir también el tamaño del hex.',
    calibrateFailed:
      'Dos fichas deben estar en la misma fila (Hex V) o en la misma columna (Hex H), separadas por al menos un hex.',
    unexpected: 'Los detalles se encuentran en el registro de la consola API.',
  },
  help: {
    menu: 'Mostrar el menú.',
    fill: 'Cubre las formas dibujadas seleccionadas con hexágonos.',
    fillInverse: 'Cubre toda la página excepto el interior de las formas seleccionadas.',
    undo: 'Deshaga el último relleno, invierta el relleno u oculte y restaure las formas que utilizó.',
    reveal:
      'Revela los hexágonos seleccionados y los hexágonos debajo de las formas y fichas seleccionadas.',
    revealPage: 'Revela cada hexágono de la página sin anuncios.',
    conceal: 'Cubre el área debajo de las formas y fichas seleccionadas con hexágonos nuevamente.',
    explore: 'Muestra las fichas seleccionadas como si acabaran de mudarse allí.',
    resetPage: 'Elimina todos los hexágonos de la página (pregunta primero).',
    name: 'Nombra los hexágonos seleccionados, o los hexágonos debajo de las fichas seleccionadas. Deje el nombre vacío para borrarlo.',
    mark: 'Convierte las fichas seleccionadas en ubicaciones ocultas.',
    unmark: 'Evite que los tokens seleccionados sean ubicaciones ocultas.',
    set: 'Cambie una configuración o muestre todas las configuraciones.',
    pageSet: 'Anula una configuración de revelación solo en la página actual.',
    pageClear: 'Elimine las anulaciones de la página actual.',
    rescan:
      'Reconstruya la lista hexadecimal de la página, por ejemplo, después de copiar una página o un juego.',
    calibrate:
      'Alinea la cuadrícula hexagonal con una o dos fichas seleccionadas encajadas en los centros hexagonales.',
    calibrateReset: 'Elimina la calibración de la página actual.',
    status: 'Muestra lo que Hexploration sabe sobre la página actual.',
    journal: 'Reconstruya los folletos de Ayuda y Comando.',
    help: 'Muestra esta lista.',
    handout: 'Las instrucciones completas se encuentran en el folleto "{name}".',
  },
  deck: {
    subtitle: 'Cubierta de mando',
    drawDesc:
      'Dibuja formas alrededor de un área, selecciónalas y luego rellénalas. Deshacer invierte el último relleno.',
    revealDesc:
      'Selecciona hexágonos, formas o fichas para revelarlos o cubrirlos nuevamente. Explore las revelaciones alrededor de las fichas seleccionadas como si se hubieran movido.',
    locationsDesc:
      'Selecciona fichas para ocultarlas como ubicaciones debajo de hexágonos. Selecciona hexágonos o fichas para nombrar un hexágono.',
    toolsDesc:
      'Configuraciones, anulaciones de páginas, estado, volver a escanear páginas copiadas y calibrar la cuadrícula.',
    footer: 'Consulte el folleto "{help}" para obtener instrucciones completas.',
  },
  handout: {
    versionLabel: 'Versión',
    subtitle: 'Exploración hexágono por hexágono para Roll20',
    footer: 'Utilice el folleto "{deck}" para obtener controles con un solo clic.',
    overview: {
      heading: 'Descripción general',
      body: 'La hexploración cubre un mapa de hexágonos con hexágonos opacos. A medida que el grupo se mueve, los hexágonos por los que pasa (y, si lo desea, los hexágonos que los rodean) se eliminan, por lo que el mapa se descubre un hexágono a la vez. Las ubicaciones ocultas se pueden colocar debajo de hexágonos y se anuncian cuando se encuentran. Funciona en juegos Jumpgate y Legacy, en cuadrículas Hex (V) y Hex (H) de cualquier tamaño.',
      demo: 'Vea una breve demostración (de la versión 1)',
    },
    quickStart: {
      heading: 'Inicio rápido',
      steps: [
        'Abra una página cuya cuadrícula esté configurada en Hex (V) o Hex (H).',
        'Dibuja una o más formas (polígono, rectángulo, elipse o a mano alzada) alrededor del área a ocultar.',
        'Seleccione las formas y haga clic en Rellenar en Command Deck (o escriba !hexploration fill). Las formas son reemplazadas por hexágonos.',
        'Opcional: antes de completar, seleccione fichas para lugares importantes y haga clic en Marcar ubicación. Están ocultos debajo de los hexágonos y se anuncian cuando se descubren.',
        'Mueve una ficha de jugador. Se revelan cada hexágono por el que pasa y los hexágonos dentro de su distancia de visión.',
      ],
    },
    commands: {
      heading: 'Comandos',
      intro:
        'Sólo los GM pueden usar estos comandos. La mayoría actúa sobre los objetos seleccionados; el resto actúa sobre la página que estás viendo.',
      colCommand: 'Dominio',
      colDesc: 'que hace',
    },
    revealing: {
      heading: 'Cómo funciona la revelación',
      points: [
        'Sólo las fichas en la capa de fichas revelan hexágonos. El número de fichas lo establece Fichas que revelan: fichas de jugador de forma predeterminada, por lo que el DJ puede mover monstruos sin descubrir el mapa.',
        'Una ficha revela cada hexágono que cubre (las fichas grandes cubren varios) y, con Revelar a lo largo del camino activado, cada hexágono de la ruta por la que fue arrastrado, incluidos los puntos de ruta.',
        'La distancia de visión revela los hexágonos alrededor de cada uno de esos hexágonos. Con la Línea de Visión activada, un hexágono sólo se revela si no hay ningún hexágono cubierto en el medio.',
        'La distancia de revelación de hexágonos se almacena en los hexágonos a medida que se dibujan. Esos hexágonos sólo se revelan desde dentro de esa cantidad de hexágonos, por muy lejos que pueda ver una ficha. Úselo para montañas o bosques que ocultan lo que hay detrás de ellos.',
        'En el modo Vistazo, los hexágonos a la vista se vuelven transparentes en lugar de desaparecer, y se eliminan cuando una ficha ingresa en ellos.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        'La API no informa movimientos realizados por otros mods. Los movimientos de TokenMod se detectan automáticamente; para otras modificaciones, seleccione los tokens y haga clic en Explorar, o llame a Hexploration.revealAround(token) desde su propio mod.',
      ],
    },
    locations: {
      heading: 'Hexágonos y ubicaciones con nombre',
      points: [
        'Marcar ubicación convierte los tokens seleccionados en ubicaciones ocultas. Una ficha que ya se encuentra bajo un hexágono se oculta inmediatamente; de lo contrario, queda oculto por el siguiente relleno que lo cubre.',
        'Las fichas con el marcador de estado de la torre blanca también se tratan como ubicaciones cuando las llenas, como en la versión 1.',
        'Las fichas de ubicación oculta se mueven a la capa de GM. Cuando se revela su hexágono, regresan a la capa de fichas con su nombre mostrado y se anuncia su descubrimiento.',
        'Name Hex le da a un hexágono un nombre sin ficha. El nombre se muestra al DJ como una etiqueta en la capa del GM y se anuncia cuando se revela el hexágono.',
        'Announce Discoveries elige si todos, solo el DJ o nadie, ven el anuncio. Ping Discoveries también mueve la vista de los jugadores a la ubicación.',
      ],
    },
    settings: {
      heading: 'Ajustes',
      intro:
        'Cambie la configuración con el conjunto de exploración (o el botón Configuración). La capa hexagonal, los tokens que revelan y el idioma también se pueden configurar en la página de configuración del Mod.',
      colKey: 'Llave',
      colName: 'Configuración',
      colDesc: 'Descripción',
      perPage: '(Se puede configurar por página).',
    },
    jumpgate: {
      heading: 'Jumpgate y legado',
      points: [
        'Hexploration determina qué motor utiliza el juego y dibuja el tipo de forma correspondiente. Las formas dibujadas en cualquiera de los editores se pueden rellenar.',
        'Con Hex Layer configurada en Auto, los hexágonos se dibujan en la capa de primer plano, encima de las fichas, para que los jugadores no puedan ver lo que hay debajo. Si la capa de primer plano no está disponible, se utiliza la capa de token en su lugar.',
        'Jumpgate dibuja hexágonos matemáticamente regulares, que tienen una forma ligeramente diferente a los hexágonos Legacy. Si los hexágonos no se alinean con la cuadrícula de una página, ajuste una ficha a un centro hexadecimal, selecciónela y haga clic en Calibrar. Seleccione dos fichas en hexágonos vecinos de la misma fila (Hex V) o columna (Hex H) para corregir también el tamaño del hex.',
        'Cuando se copia una página o un juego, sus hexágonos obtienen nuevos ID. Ejecute Volver a escanear en la página para recuperarlos nuevamente, junto con sus etiquetas de nombre y tokens de ubicación.',
      ],
    },
    upgrading: {
      heading: 'Actualización desde la versión 1',
      points: [
        'La versión 2 ya no necesita PathMath, MatrixMath, Vector Math o HTML Builder. Puedes eliminarlos a menos que otro mod los use.',
        'Los mapas hexadecimales, los nombres, las fichas de ubicación y las configuraciones existentes se actualizan automáticamente en el primer inicio.',
        'Los comandos de la versión 1, incluida la macro Hexploration_menu, todavía funcionan.',
        'La versión 1 permitía que cualquier ficha que representara un personaje revelara hexágonos. Establezca fichas que revelen fichas de personaje para mantener ese comportamiento.',
      ],
      colV1: 'Comando versión 1',
      colV2: 'Comando versión 2',
    },
    troubleshooting: {
      heading: 'Solución de problemas',
      points: [
        'No sucede nada cuando un token se mueve: verifique que el token esté en la capa del token y coincida con los Tokens que revelan, y que la página tenga hexágonos (!hestado de exploración).',
        'Los hexágonos están desplazados de la cuadrícula: usa Calibrar, luego verifica con una ficha en algunos hexágonos del mapa.',
        'Los maleficios dejaron de revelarse después de copiar una página o un juego: ejecuta Volver a escanear en la página.',
        'Fill dice que el área no tiene centros de hexágonos: la forma debe contener el centro de al menos un hexágono.',
        'Para cualquier otra cosa, consulte el registro de la consola API e incluya sus mensajes cuando solicite ayuda.',
      ],
    },
    languages: {
      heading: 'Idiomas',
      body: 'Elija un idioma con !hexploration set language. Idiomas disponibles:',
    },
    credits: {
      heading: 'Créditos',
      original: 'Mod original de',
      maintainer: 'Versión 2 mantenida por',
      marketplace: 'Paquetes de arte de Ada en Roll20 Marketplace',
      support:
        'Si encuentra un error o tiene una idea, publíquelo en el foro Roll20 Mod o abra un problema en GitHub e incluya cualquier mensaje del registro de la consola API.',
    },
  },
};

export default TRANSLATION;
