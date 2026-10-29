const TRANSLATION = {
  titles: {
    ready: "L'exploració està a punt.",
    settings: "Configuració d'exploració",
    languages: "Trieu un idioma",
    pageSettings: "Configuració de la pàgina: {page}",
    status: "Estat de l'exploració: {page}",
    help: "Comandes d'exploració",
    confirm: "Si us plau, confirmeu",
  },
  discovery: {
    title: "Localització descoberta",
  },
  menu: {
    draw: "Dibuixa",
    reveal: "Revela i amaga",
    locations: "Ubicacions",
    tools: "Eines",
    layerInUse: "S'estan dibuixant nous hexagones al {layer}.",
    pageSettingsHelp:
      "Aquesta configuració només s'aplica a aquesta pàgina. La configuració marcada amb ★ anul·la la configuració global.",
  },
  buttons: {
    fill: "Omplir",
    fillInverse: "Farciment invers",
    undo: "Desfer el farciment",
    reveal: "Revelar",
    conceal: "Ocultar",
    explore: "Explora",
    revealPage: "Revela la pàgina",
    resetPage: "Restableix la pàgina",
    mark: "Marca la ubicació",
    unmark: "Desmarca",
    name: "Nom Hex",
    settings: "Configuració",
    pageSettings: "Configuració de la pàgina",
    status: "Estat",
    rescan: "Torna a escanejar",
    calibrate: "Calibrar",
    calibrateReset: "Restableix la calibració",
    help: "Ajuda",
    change: "Canviar",
    menu: "Menú",
    clearOverrides: "Esborra les substitucions",
    confirmReset: "Sí, traieu tots els hexagones",
  },
  prompts: {
    name: "Nom de la ubicació (deixeu en blanc per esborrar)",
  },
  values: {
    on: "Encès",
    off: "Apagat",
    none: "Cap",
    hexLayer: {
      auto: "Automàtic (en primer pla si està disponible)",
      foreground: "capa de primer pla",
      objects: "capa de testimoni",
    },
    revealBy: {
      players: "Fitxes de jugador",
      characters: "Fitxes de personatges",
      all: "Totes les fitxes",
    },
    revealMode: {
      clear: "Clar",
      glimpse: "Un cop d'ull",
    },
    announce: {
      all: "Tothom",
      gm: "Només GM",
      off: "Apagat",
    },
    orientation: {
      vertical: "Hexadecimal (V)",
      horizontal: "Hex (H)",
    },
    fillKind: {
      fill: "Omplir",
      fillInverse: "Farciment invers",
      conceal: "Ocultar",
    },
  },
  settings: {
    language: {
      label: "Llengua",
      desc: "Idioma per a menús, missatges i fullets.",
    },
    hexLayer: {
      label: "Capa hexagonal",
      desc: "On es dibuixen nous hexagones. Auto prova la capa de primer pla (a sobre de fitxes) i torna a caure a la capa de fitxes si el joc no l'admet.",
    },
    fillColor: {
      label: "Color de farciment",
      desc: "Color dels nous hexagonals. Utilitzeu rgba() per a hexadecimals transparents, per exemple rgba(0,0,0,0.8).",
    },
    strokeColor: {
      label: "Color de la vora",
      desc: "Color del contorn dels nous hexagonals.",
    },
    labelColor: {
      label: "Color de l'etiqueta",
      desc: "Color de les etiquetes de nom només de GM en hexadecims amb nom.",
    },
    glimpseColor: {
      label: "Color d'ull",
      desc: "Els hexagonals de color canvien a quan es veuen (mode de revelació de vista). Utilitzeu un color rgba() transparent.",
    },
    strokeWidth: {
      label: "Amplada de la vora",
      desc: "Amplada del contorn dels nous hexadecimals, en píxels (0 a 20).",
    },
    maxDistance: {
      label: "Distància de revelació hexagonal",
      desc: "S'aplica als hexàgons a mesura que es dibuixen: una fitxa ha d'estar dins d'aquests hexagones per revelar-los, per molt lluny que pugui veure. Deixeu buit sense límit.",
    },
    revealDistance: {
      label: "Distància de visió",
      desc: "Quants hexagones es mostren al voltant d'una fitxa en moviment (de 0 a 20). 0 només revela els hexagones pels quals passa la fitxa.",
    },
    lineOfSight: {
      label: "Línia de visió",
      desc: "Quan està activat, un hexàgon només es revela si no hi ha cap hexagonal cobert entre ell i la fitxa.",
    },
    revealPath: {
      label: "Revela al llarg del camí",
      desc: "Quan està activat, es revela cada hexàgono per on passa una fitxa mentre és arrossegada (inclosos els waypoints), no només on s'atura.",
    },
    revealBy: {
      label: "Fitxes que revelen",
      desc: "Quines fitxes de la capa de fitxes revelen hexagones: fitxes controlades per un jugador, fitxes que representen qualsevol personatge o cada fitxa.",
    },
    revealMode: {
      label: "Mode de revelació",
      desc: "Clear elimina els hexàgons a la vista. En canvi, la vista els fa veure a través; s'eliminen quan hi entra una fitxa.",
    },
    announce: {
      label: "Anunciar descobriments",
      desc: "Qui veu el missatge de xat quan es descobreix una ubicació amb nom.",
    },
    pingDiscoveries: {
      label: "Ping Descobriments",
      desc: "Quan està activat, els jugadors reben un ping a una ubicació amb nom quan es descobreix.",
    },
  },
  status: {
    engine: "Motor de joc",
    grid: "Quadrícula",
    layer: "Capa hexagonal",
    hexes: "Hexes",
    named: "Hexagones anomenats",
    icons: "Fitxes d'ubicació",
    glimpsed: "Hexagones albirats",
    pending: "Ubicacions a l'espera d'omplir-se",
    calibrated: "Calibrat",
    overrides: "Anul·lació de la pàgina",
    undo: "Desfer disponible",
  },
  messages: {
    filled:
      "Ompliment complet: {created} hexadecimals dibuixats, {restyled} redissenyats, {icons} ubicacions amagades.",
    revealed: "{count} hexadecimals revelats.",
    revealedPage: "S'han revelat tots els {count} hexadecificis de la pàgina.",
    confirmReset:
      'Vols suprimir tots els {count} hexadecimals de "{page}"? Les fitxes d\'ubicació tornen a la capa de fitxes. Desfer no pot revertir això.',
    resetPage: "{count} hexadecimals eliminats de la pàgina.",
    undone:
      "Últim farciment desfet: {removed} hexadecimals eliminats, {restored} hexadecimals restaurats.",
    named: '{count} hexadecimals anomenats "{name}".',
    unnamed: "S'ha esborrat el nom de {count} hexadecimals.",
    marked:
      "{attached} ubicacions amagades als hexàgons existents; {pending} s'amagarà pel següent farcit que els cobreixi.",
    unmarked: "Les fitxes {count} ja no són ubicacions.",
    settingChanged: "{setting} s'ha establert en {value}.",
    rescanned:
      "S'ha completat la tornada de l'exploració: {kept} hexadecimals conservats, {adopted} adoptat, {moved} tornat a arxivar, {dropped} hexadecimals que falten oblidats, __HEX_PLACEHOLDER_4_etiquetes_4__ S'han tornat a enllaçar {icons} fitxes d'ubicació.",
    calibrated:
      "Quadrícula calibrada (pas de columna {colStep}px, pas de fila {rowStep}px). Torna a escanejar: {kept} conservat, {moved} tornat a arxivar, {adopted} adoptat.",
    calibrationReset:
      "S'ha eliminat el calibratge. Torna a escanejar: {kept} conservat, {moved} tornat a arxivar, {adopted} adoptat.",
    journalRebuilt: 'Els fullets "{help}" i "{deck}" s\'han reconstruït.',
    migrated:
      "Els vostres mapes hexadecimals d'Hexploration 1.x s'han actualitzat. Si aquest joc s'ha copiat d'un joc Legacy, executeu Reexplora a cada pàgina de mapa hexadecimal.",
    pruned:
      "Els {dropped} desats ja no existeixen i s'han oblidat. Si s'ha copiat aquest joc o pàgina, executeu Tornar a escanejar a la pàgina per recollir-ne els hexàgons.",
    readyHint:
      'Escriviu !hexploration per al menú o obriu el fullet "Hexploration - Conjunt d\'ordres".',
  },
  warnings: {
    foregroundUnavailable:
      "Aquest joc no admet dibuixar a la capa de primer pla, de manera que es van dibuixar hexagones a la capa de fitxes.",
    someFailed:
      "No s'han pogut dibuixar {count} hexadecimals. Consulteu la consola de l'API per obtenir més informació.",
  },
  errors: {
    noPage: "No s'ha pogut trobar la pàgina per treballar.",
    notHex: "Aquesta pàgina no utilitza una graella hexadecimal.",
    noPolygons: "Seleccioneu una o més formes dibuixades per omplir.",
    emptyArea: "L'àrea seleccionada no conté cap centre hexagonal.",
    tooMany: "Això crearia {count} hexadecimals, que són massa d'una vegada.",
    nothingToConceal: "Seleccioneu formes dibuixades o fitxes per ocultar.",
    nothingToReveal:
      "Seleccioneu hexagonals, formes dibuixades o fitxes per revelar.",
    noTokens: "Seleccioneu primer un o més fitxes.",
    noHexes:
      "Seleccioneu primer un o més hexagones (o fitxes situades en hexagones).",
    nothingToUndo: "No hi ha cap emplenament per desfer.",
    unknownCommand: "Ordre desconeguda: {command}",
    unknownSetting: "Configuració desconeguda: {key}",
    unknownPageSetting: "Configuració que es pot establir per pàgina: {keys}",
    invalidValue: '"{value}" no és un valor vàlid per a {key}.',
    calibrateNeedsTokens:
      "Seleccioneu una o dues fitxes encaixades als centres hexagonals.",
    calibrateFailed: "Aquestes fitxes no es poden utilitzar per calibrar.",
    unexpected: "S'ha produït un error: {message}",
  },
  hints: {
    noPage:
      "Obriu la pàgina en què voleu treballar o seleccioneu-hi alguna cosa.",
    notHex:
      "Estableix la quadrícula de la pàgina a Hex (V) o Hex (H) a la configuració de la pàgina.",
    noPolygons:
      "Dibuixa un polígon, un rectangle, una el·lipse o una forma a mà alçada al voltant de l'àrea, selecciona'l i torna-ho a provar.",
    emptyArea:
      "Dibuixa una forma més gran o comprova la configuració de la quadrícula de la pàgina.",
    tooMany: "Omple una àrea més petita o divideix l'àrea en diverses formes.",
    noHexes:
      "Els hexagonals es troben en primer pla o capa de fitxes; canvieu a aquesta capa per seleccionar-los.",
    unknownCommand: "Escriviu !hexploration help per llistar les ordres.",
    unknownSetting: "Escriviu !hexploration set per veure tots els paràmetres.",
    calibrateNeedsTokens:
      "Col·loca una fitxa al centre d'un hexagonal i selecciona-la. Seleccioneu una segona fitxa enganxada a un hexadecimal veí a la mateixa fila (hexadecimal V) o columna (hexadecimal H) per corregir també la mida de l'hexadecimal.",
    calibrateFailed:
      "Dues fitxes han d'estar a la mateixa fila (hexadecimal V) o a la mateixa columna (hexadecimal H), almenys un hexadecimal de distància.",
    unexpected: "Els detalls es troben al registre de la consola de l'API.",
  },
  help: {
    menu: "Mostra el menú.",
    fill: "Cobriu les formes dibuixades seleccionades amb hexagonals.",
    fillInverse:
      "Cobriu tota la pàgina excepte dins de les formes seleccionades.",
    undo: "Desfer l'últim farciment, farciment invers o ocultar i restaurar les formes que utilitzava.",
    reveal:
      "Revela els hexagones seleccionats i els hexagonals sota les formes i fitxes seleccionades.",
    revealPage: "Revela cada hexadecimal de la pàgina sense anuncis.",
    conceal:
      "Torneu a cobrir l'àrea sota les formes i fitxes seleccionades amb hexagonals.",
    explore:
      "Revela les fitxes seleccionades com si acabessin de moure's allà.",
    resetPage: "Traieu tots els hexadecimals de la pàgina (demana primer).",
    name: "Anomena els hexagones seleccionats o els hexadegons que hi ha a sota de les fitxes seleccionades. Deixeu el nom buit per esborrar-lo.",
    mark: "Converteix les fitxes seleccionades en llocs ocults.",
    unmark: "Deixeu que les fitxes seleccionades siguin ubicacions ocultes.",
    set: "Canvia un paràmetre o mostra tots els paràmetres.",
    pageSet:
      "Substituïu una configuració de revelació només a la pàgina actual.",
    pageClear: "Elimina les substitucions de la pàgina actual.",
    rescan:
      "Reconstrueix la llista hexadecimal de la pàgina, per exemple després de copiar una pàgina o un joc.",
    calibrate:
      "Alineeu la quadrícula hexagonal amb una o dues fitxes seleccionades enganxades als centres hexagonals.",
    calibrateReset: "Elimineu el calibratge de la pàgina actual.",
    status: "Mostra què sap Hexploration sobre la pàgina actual.",
    journal: "Reconstruïu els fulls d'ajuda i de comandaments.",
    help: "Mostra aquesta llista.",
    handout: 'Les instruccions completes es troben al fullet "{name}".',
  },
  deck: {
    subtitle: "Comandament de la plataforma",
    drawDesc:
      "Dibuixa formes al voltant d'una àrea, selecciona-les i omple. Desfer inverteix l'últim farcit.",
    revealDesc:
      "Seleccioneu hexagonals, formes o fitxes per revelar-los o tornar-los a cobrir. Explora revelacions al voltant de fitxes seleccionades com si s'haguessin mogut.",
    locationsDesc:
      "Seleccioneu fitxes per amagar-les com a ubicacions sota hexagones. Seleccioneu hexadecimals o fitxes per anomenar un hexadecimal.",
    toolsDesc:
      "Configuració, substitucions de pàgines, estat, reescaneig de pàgines copiades i calibratge de la quadrícula.",
    footer: 'Consulteu el fullet "{help}" per obtenir instruccions completes.',
  },
  handout: {
    versionLabel: "Versió",
    subtitle: "Exploració hexadecimal per hexadecimal per a Roll20",
    footer: 'Utilitzeu el fullet "{deck}" per als controls amb un sol clic.',
    overview: {
      heading: "Visió general",
      body: "Hexploration cobreix un mapa hexagonal amb hexagonals opacs. A mesura que el grup es mou, els hexàgons pels quals travessen (i, si voleu, els hexagonals que els envolten) s'eliminen, de manera que el mapa es descobreix un hexàgono a la vegada. Les ubicacions ocultes es poden col·locar sota hexagones i s'anuncien quan es troben. Funciona en jocs Jumpgate i Legacy, en quadrícules Hex (V) i Hex (H) de qualsevol mida.",
      demo: "Mira una petita demostració (de la versió 1)",
    },
    quickStart: {
      heading: "Inici ràpid",
      steps: [
        "Obriu una pàgina la graella de la qual estigui configurada en Hex (V) o Hex (H).",
        "Dibuixa una o més formes (polígon, rectangle, el·lipse o mà alçada) al voltant de l'àrea per amagar.",
        "Seleccioneu les formes i feu clic a Emplenar el conjunt d'ordres (o escriviu !hexploration fill). Les formes es substitueixen per hexagonals.",
        "Opcional: abans d'omplir, seleccioneu fitxes per a llocs importants i feu clic a Marca la ubicació. S'amaguen sota els hexàgons i s'anuncien quan es descobreixen.",
        "Mou una fitxa de jugador. Es revelen tots els hexàgons que travessa i els hexàgons dins de la seva distància de visió.",
      ],
    },
    commands: {
      heading: "Ordres",
      intro:
        "Només els GM poden utilitzar aquestes ordres. La majoria actuen sobre els objectes seleccionats; la resta actuen a la pàgina que esteu veient.",
      colCommand: "Comandament",
      colDesc: "Què fa",
    },
    revealing: {
      heading: "Com funciona la revelació",
      points: [
        "Només les fitxes de la capa de fitxes revelen hexagones. El nombre de fitxes està establert per Fitxes que revelen: fitxes de jugador per defecte, de manera que el GM pot moure monstres sense descobrir el mapa.",
        "Una fitxa revela tots els hexàgons que cobreix (les fitxes grans en cobreixen diversos) i, amb Reveal Along Path activat, tots els hexàgons de la ruta per on s'ha arrossegat, inclosos els waypoints.",
        "La distància de visió revela els hexagones al voltant de cadascun d'aquests hexagones. Amb la línia de visió activada, un hexàgon només es revela si no hi ha cap hexagonal cobert entremig.",
        "Hex Reveal La distància s'emmagatzema en hexagonals a mesura que es dibuixen. Aquests hexagones només es revelen des de dins tants hexagones, per molt lluny que pugui veure una fitxa. Utilitzeu-lo per muntanyes o boscos que amaguen el que hi ha darrere.",
        "En el mode Visió visual, els hexàgons a la vista esdevenen transparents en lloc de desaparèixer, i s'eliminen quan hi entra una fitxa.",
        "L'API no informa dels moviments fets per altres modificacions. Els moviments de TokenMod es recullen automàticament; per a altres modificacions, seleccioneu les fitxes i feu clic a Explora, o truqueu a Hexploration.revealAround(token) des del vostre propi mod.",
      ],
    },
    locations: {
      heading: "Hexes i ubicacions anomenades",
      points: [
        "Marca la ubicació converteix les fitxes seleccionades en ubicacions ocultes. Una fitxa que ja està sota un hexàgon s'amaga immediatament; en cas contrari queda amagat pel següent farciment que el cobreix.",
        "Els fitxes amb el marcador d'estat de la torre blanca també es tracten com a ubicacions quan ompliu, com a la versió 1.",
        "Les fitxes d'ubicació ocultes es mouen a la capa de GM. Quan es revela el seu hex, tornen a la capa de fitxes amb el seu nom mostrat i s'anuncia el seu descobriment.",
        "Name Hex dóna un nom a un hexadecimal sense cap testimoni. El nom es mostra al GM com una etiqueta a la capa de GM i s'anuncia quan es revela l'hex.",
        "Announce Discoveries tria si tothom, només el GM, o ningú veu l'anunci. Ping Discoveries també mou la vista dels jugadors a la ubicació.",
      ],
    },
    settings: {
      heading: "Configuració",
      intro:
        "Canvieu la configuració amb !hexploration set (o el botó Configuració). La capa hexadecimal, els fitxes que revelen i l'idioma també es poden configurar a la pàgina de configuració del mod.",
      colKey: "clau",
      colName: "Configuració",
      colDesc: "Descripció",
      perPage: "(Es pot configurar per pàgina.)",
    },
    jumpgate: {
      heading: "Jumpgate i Legacy",
      points: [
        "Hexploration determina quin motor utilitza el joc i dibuixa el tipus de forma corresponent. Les formes dibuixades en qualsevol dels editors es poden omplir.",
        "Amb la capa hexadecimal establerta a Automàtic, els hexadecimals es dibuixen a la capa de primer pla, per sobre de les fitxes, de manera que els jugadors no poden veure què hi ha a sota. Si la capa de primer pla no està disponible, s'utilitza la capa de testimoni.",
        "Jumpgate dibuixa hexagones matemàticament regulars, que tenen una forma lleugerament diferent dels hexagones heretats. Si els hexadecimals no s'alineen amb la quadrícula d'una pàgina, col·loqueu un testimoni a un centre hexadecimal, seleccioneu-lo i feu clic a Calibrar. Seleccioneu dues fitxes en hexàgons veïns de la mateixa fila (hexadecimal V) o columna (hexadecimal H) per corregir també la mida de l'hexadecimal.",
        "Quan es copia una pàgina o un joc, els seus hexadecimals obtenen nous identificadors. Executeu Torna a escanejar a la pàgina per tornar-los a recollir, juntament amb les etiquetes de noms i fitxes d'ubicació.",
      ],
    },
    upgrading: {
      heading: "Actualització de la versió 1",
      points: [
        "La versió 2 ja no necessita PathMath, MatrixMath, Vector Math o HTML Builder. Podeu eliminar-los tret que els utilitzi un altre mod.",
        "Els mapes hexadecimals, els noms, les fitxes d'ubicació i la configuració existents s'actualitzen automàticament al primer inici.",
        "Les ordres de la versió 1, inclosa la macro Hexploration_menu, encara funcionen.",
        "La versió 1 permetia que qualsevol fitxa que representés un personatge revelés hexagones. Estableix fitxes que revelen en fitxes de personatge per mantenir aquest comportament.",
      ],
      colV1: "Comandament de la versió 1",
      colV2: "Comandament de la versió 2",
    },
    troubleshooting: {
      heading: "Resolució de problemes",
      points: [
        "No passa res quan un testimoni es mou: comproveu que el testimoni estigui a la capa de fitxes i coincideixi amb els fitxes que es revelen i que la pàgina tingui hexadecimals (estat! hexploration).",
        "Els hexagones es desplacen de la quadrícula: utilitzeu Calibrar i, a continuació, comproveu amb una fitxa en uns quants hexagones del mapa.",
        "Hexes va deixar de revelar-se després de copiar una pàgina o un joc: executeu Tornar a explorar la pàgina.",
        "El farciment diu que l'àrea no té centres hexagonals: la forma ha de contenir el centre d'almenys un hexagonal.",
        "Per a qualsevol altra cosa, comproveu el registre de la consola de l'API i incloeu-ne els missatges quan demaneu ajuda.",
      ],
    },
    languages: {
      heading: "Idiomes",
      body: "Trieu un idioma amb l'idioma definit de !hexploration. Idiomes disponibles:",
    },
    credits: {
      heading: "Crèdits",
      original: "Mod original de",
      maintainer: "Versió 2 mantinguda per",
      marketplace: "Els paquets d'art de l'Ada al mercat Roll20",
      support:
        "Si trobeu un error o teniu una idea, publiqueu-lo al fòrum Roll20 Mod o obriu un problema a GitHub i incloeu qualsevol missatge del registre de la consola de l'API.",
    },
  },
};

export default TRANSLATION;
