const TRANSLATION = {
  titles: {
    ready: 'Hexploration està a punt.',
    settings: "Configuració d'Hexploration",
    languages: 'Trieu un idioma',
    pageSettings: 'Configuració de la pàgina: {page}',
    status: "Estat d'Hexploration: {page}",
    help: "Comandes d'Hexploration",
    confirm: 'Si us plau, confirmeu',
  },
  discovery: {
    title: 'Ubicació descoberta',
  },
  menu: {
    draw: 'Dibuixa',
    reveal: 'Revela i amaga',
    locations: 'Ubicacions',
    tools: 'Eines',
    layerInUse: "S'estan dibuixant hexàgons nous a la {layer}.",
    pageSettingsHelp:
      "Aquesta configuració només s'aplica a aquesta pàgina. La configuració marcada amb ★ anul·la la configuració global.",
  },
  buttons: {
    fill: 'Omple',
    fillInverse: 'Emplenament invers',
    undo: "Desfés l'emplenament",
    reveal: 'Revela',
    conceal: 'Amaga',
    explore: 'Explora',
    revealPage: 'Revela la pàgina',
    resetPage: 'Restableix la pàgina',
    mark: 'Marca la ubicació',
    unmark: 'Desmarca',
    name: "Anomena l'hexàgon",
    settings: 'Configuració',
    pageSettings: 'Configuració de la pàgina',
    status: 'Estat',
    rescan: 'Torna a escanejar',
    calibrate: 'Calibra',
    calibrateReset: 'Restableix la calibració',
    help: 'Ajuda',
    change: 'Canvia',
    menu: 'Menú',
    clearOverrides: 'Esborra les substitucions',
    confirmReset: 'Sí, elimina tots els hexàgons',
  },
  prompts: {
    name: 'Nom de la ubicació (deixeu en blanc per esborrar)',
  },
  values: {
    on: 'Activat',
    off: 'Desactivat',
    none: 'Cap',
    hexLayer: {
      auto: 'Automàtic (primer pla si està disponible)',
      foreground: 'capa de primer pla',
      objects: 'capa de fitxes',
    },
    revealBy: {
      players: 'Fitxes de jugador',
      characters: 'Fitxes de personatges',
      all: 'Totes les fitxes',
    },
    revealMode: {
      clear: 'Neteja',
      glimpse: "Cop d'ull",
    },
    announce: {
      all: 'Tothom',
      gm: 'Només el GM',
      off: 'Desactivat',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Omple',
      fillInverse: 'Emplenament invers',
      conceal: 'Amaga',
    },
  },
  settings: {
    language: {
      label: 'Llengua',
      desc: 'Idioma per a menús, missatges i fullets.',
    },
    hexLayer: {
      label: 'Capa dels hexàgons',
      desc: "On es dibuixen els hexàgons nous. Automàtic prova la capa de primer pla (per sobre de les fitxes) i recorre a la capa de fitxes si el joc no l'admet.",
    },
    fillColor: {
      label: 'Color de farciment',
      desc: 'Color dels hexàgons nous. Utilitzeu rgba() per a hexàgons transparents, per exemple rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Color de la vora',
      desc: 'Color del contorn dels nous hexagonals.',
    },
    labelColor: {
      label: "Color de l'etiqueta",
      desc: 'Color de les etiquetes de nom, visibles només per al GM, dels hexàgons amb nom.',
    },
    glimpseColor: {
      label: "Color de cop d'ull",
      desc: "Color que prenen els hexàgons quan es veuen de cop d'ull (mode de revelació Cop d'ull). Utilitzeu un color rgba() transparent.",
    },
    strokeWidth: {
      label: 'Amplada de la vora',
      desc: 'Amplada del contorn dels hexàgons nous, en píxels (de 0 a 20).',
    },
    maxDistance: {
      label: 'Distància de revelació dels hexàgons',
      desc: "Es desa als hexàgons quan s'omplen, així que configureu-la abans d'omplir: canviar-la després no afecta els hexàgons que ja són al mapa. Una fitxa ha d'estar com a màxim a aquest nombre d'hexàgons per revelar-los, per lluny que pugui veure; amb 0, només es revelen quan s'hi entra. Utilitzeu-la per a muntanyes o boscos. Deixeu-ho buit perquè no hi hagi límit.",
    },
    revealDistance: {
      label: 'Distància de visió',
      desc: "Quants hexagones es mostren al voltant d'una fitxa en moviment (de 0 a 20). 0 només revela els hexagones pels quals passa la fitxa.",
    },
    lineOfSight: {
      label: 'Línia de visió',
      desc: 'Quan està activat, els hexàgons que continuen coberts, com ara muntanyes omplertes amb una Distància de revelació dels hexàgons, amaguen els hexàgons que hi ha darrere. Només té efecte amb una Distància de visió de 2 o més.',
    },
    revealPath: {
      label: 'Revela al llarg del camí',
      desc: "Quan està activat, es revela cada hexàgono per on passa una fitxa mentre és arrossegada (inclosos els waypoints), no només on s'atura.",
    },
    revealBy: {
      label: 'Fitxes que revelen',
      desc: 'Quines fitxes de la capa de fitxes revelen hexagones: fitxes controlades per un jugador, fitxes que representen qualsevol personatge o cada fitxa.',
    },
    revealMode: {
      label: 'Mode de revelació',
      desc: "Neteja elimina els hexàgons a la vista. Cop d'ull, en canvi, els fa transparents; s'eliminen quan hi entra una fitxa.",
    },
    announce: {
      label: 'Anunciar descobriments',
      desc: 'Qui veu el missatge de xat quan es descobreix una ubicació amb nom.',
    },
    pingDiscoveries: {
      label: 'Fer ping als descobriments',
      desc: 'Quan està activat, els jugadors reben un ping a una ubicació amb nom quan es descobreix.',
    },
    hideCoveredTokens: {
      label: 'Amaga les fitxes cobertes',
      desc: 'Roll20 dibuixa noms, barres i aures per sobre dels hexagones. Quan està activat, les fitxes sota un hexagonal cobert tenen el seu nom visible per al jugador, les barres i les aures desactivades, i tornen a activar-se quan es destaquen.',
    },
  },
  status: {
    engine: 'Motor de joc',
    grid: 'Quadrícula',
    layer: 'Capa dels hexàgons',
    hexes: 'Hexàgons',
    named: 'Hexàgons amb nom',
    icons: "Fitxes d'ubicació",
    glimpsed: 'Hexàgons albirats',
    pending: "Ubicacions pendents d'emplenament",
    calibrated: 'Calibrat',
    overrides: 'Substitucions de la pàgina',
    undo: 'Es pot desfer',
  },
  messages: {
    filled:
      'Emplenament completat. Hexàgons dibuixats: {created}. Amb estil nou: {restyled}. Ubicacions amagades: {icons}.',
    revealed: 'Hexagones revelats: {count}.',
    revealedPage: "S'han revelat tots els hexàgons de la pàgina ({count}).",
    confirmReset:
      'Voleu eliminar tots els hexàgons de "{page}" ({count})? Les fitxes d\'ubicació tornen a la capa de fitxes. Aquesta acció no es pot revertir amb Desfer.',
    resetPage: 'Hexàgons eliminats de la pàgina: {count}.',
    undone:
      'Últim farciment desfet. Hexagones eliminats: {removed}. Hexagones redissenyats restaurats: {restored}.',
    named: 'Hexàgons anomenats "{name}": {count}.',
    unnamed: 'Noms esborrats: {count}.',
    marked:
      'Ubicacions amagades en hexàgons existents: {attached}. Pendents del següent farciment que les cobreixi: {pending}.',
    unmarked: 'Fitxes que ja no són ubicacions: {count}.',
    settingChanged: "{setting} s'ha establert en {value}.",
    rescanned:
      "Torna a escanejar completat. Conservat: {kept}. Adoptat: {adopted}. Tornada a arxivar: {moved}. Falta i oblidat: {dropped}. Etiquetes tornades a enllaçar: {labels}. S'han tornat a enllaçar fitxes d'ubicació: {icons}.",
    calibrated:
      "Quadrícula calibrada (pas de columna {colStep}px, pas de fila {rowStep}px). Torna a escanejar: s'ha mantingut {kept}, s'ha tornat a arxivar {moved}, s'ha adoptat {adopted}.",
    calibrationReset:
      "S'ha eliminat el calibratge. Torna a escanejar: s'ha mantingut {kept}, s'ha tornat a arxivar {moved}, s'ha adoptat {adopted}.",
    journalRebuilt: 'Els fullets "{help}" i "{deck}" s\'han reconstruït.',
    migrated:
      "Els vostres mapes d'hexàgons d'Hexploration 1.x s'han actualitzat. Si aquest joc s'ha copiat d'un joc Legacy, executeu Torna a escanejar a cada pàgina amb mapa d'hexàgons.",
    pruned:
      "Hexàgons desats que ja no existeixen i s'han oblidat: {dropped}. Si s'ha copiat aquest joc o pàgina, executeu Torna a escanejar a la pàgina per recuperar-ne els hexàgons.",
    readyHint:
      'Escriviu !hexploration per obrir el menú o obriu el fullet "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Aquest joc no admet dibuixar a la capa de primer pla, de manera que es van dibuixar hexagones a la capa de fitxes.',
    someFailed:
      "Hexagones que no s'han pogut dibuixar: {count}. Consulteu la consola de l'API per obtenir més informació.",
  },
  errors: {
    noPage: "No s'ha pogut trobar la pàgina per treballar.",
    notHex: 'Aquesta pàgina no utilitza una graella hexagonal.',
    noPolygons: 'Seleccioneu una o més formes dibuixades per omplir.',
    emptyArea: "L'àrea seleccionada no conté cap centre hexagonal.",
    tooMany: "Això crearia massa hexagones d'una vegada ({count}).",
    nothingToConceal: 'Seleccioneu formes dibuixades o fitxes per ocultar.',
    nothingToReveal: 'Seleccioneu hexagonals, formes dibuixades o fitxes per revelar.',
    noTokens: 'Seleccioneu primer un o més fitxes.',
    noHexes: 'Seleccioneu primer un o més hexagones (o fitxes situades en hexagones).',
    nothingToUndo: 'No hi ha cap emplenament per desfer.',
    unknownCommand: 'Ordre desconeguda: {command}',
    unknownSetting: 'Configuració desconeguda: {key}',
    unknownPageSetting: 'Configuració que es pot establir per pàgina: {keys}',
    invalidValue: '"{value}" no és un valor vàlid per a {key}.',
    calibrateNeedsTokens: 'Seleccioneu una o dues fitxes encaixades als centres hexagonals.',
    calibrateFailed: 'Aquestes fitxes no es poden utilitzar per calibrar.',
    unexpected: "S'ha produït un error: {message}",
  },
  hints: {
    noPage: 'Obriu la pàgina en què voleu treballar o seleccioneu-hi alguna cosa.',
    notHex:
      'Estableix la quadrícula de la pàgina a Hex (V) o Hex (H) a la configuració de la pàgina.',
    noPolygons:
      "Dibuixa un polígon, un rectangle, una el·lipse o una forma a mà alçada al voltant de l'àrea, selecciona'l i torna-ho a provar.",
    emptyArea:
      'Dibuixa una forma més gran o comprova la configuració de la quadrícula de la pàgina.',
    tooMany: "Omple una àrea més petita o divideix l'àrea en diverses formes.",
    noHexes:
      'Els hexàgons són a la capa de primer pla o a la de fitxes; canvieu a aquesta capa per seleccionar-los.',
    unknownCommand: 'Escriviu !hexploration help per llistar les ordres.',
    unknownSetting: 'Escriviu !hexploration set per veure tots els paràmetres.',
    calibrateNeedsTokens:
      "Col·loqueu una fitxa al centre d'un hexàgon i seleccioneu-la. Seleccioneu una segona fitxa ajustada a un hexàgon veí de la mateixa fila (Hex V) o columna (Hex H) per corregir també la mida de l'hexàgon.",
    calibrateFailed:
      "Les dues fitxes han d'estar a la mateixa fila (Hex V) o a la mateixa columna (Hex H), separades almenys per un hexàgon.",
    unexpected: "Els detalls es troben al registre de la consola de l'API.",
  },
  help: {
    menu: 'Mostra el menú.',
    fill: 'Cobriu les formes dibuixades seleccionades amb hexagonals.',
    fillInverse: 'Cobriu tota la pàgina excepte dins de les formes seleccionades.',
    undo: "Desfer l'últim farciment, farciment invers o ocultar i restaurar les formes que utilitzava.",
    reveal:
      'Revela els hexagones seleccionats i els hexagonals sota les formes i fitxes seleccionades.',
    revealPage: 'Revela tots els hexàgons de la pàgina sense anuncis.',
    conceal: "Torneu a cobrir l'àrea sota les formes i fitxes seleccionades amb hexagonals.",
    explore: "Revela les fitxes seleccionades com si acabessin de moure's allà.",
    resetPage: 'Elimina tots els hexàgons de la pàgina (primer ho pregunta).',
    name: 'Anomena els hexagones seleccionats o els hexadegons que hi ha a sota de les fitxes seleccionades. Deixeu el nom buit per esborrar-lo.',
    mark: 'Converteix les fitxes seleccionades en llocs ocults.',
    unmark: 'Deixeu que les fitxes seleccionades siguin ubicacions ocultes.',
    set: 'Canvia un paràmetre o mostra tots els paràmetres.',
    pageSet: 'Substituïu una configuració de revelació només a la pàgina actual.',
    pageClear: 'Elimina les substitucions de la pàgina actual.',
    rescan:
      "Reconstrueix la llista d'hexàgons de la pàgina, per exemple després de copiar una pàgina o un joc.",
    calibrate:
      'Alineeu la quadrícula hexagonal amb una o dues fitxes seleccionades enganxades als centres hexagonals.',
    calibrateReset: 'Elimineu el calibratge de la pàgina actual.',
    status: 'Mostra què sap Hexploration sobre la pàgina actual.',
    journal: "Reconstrueix els fullets d'Ajuda i del Command Deck.",
    help: 'Mostra aquesta llista.',
    handout: 'Les instruccions completes es troben al fullet "{name}".',
  },
  deck: {
    drawDesc:
      "Dibuixa formes al voltant d'una àrea, selecciona-les i omple. Desfés l'emplenament reverteix l'últim emplenament.",
    revealDesc:
      "Selecciona hexàgons, formes o fitxes per revelar-los o tornar-los a cobrir. Explora revela el voltant de les fitxes seleccionades com si s'haguessin mogut.",
    locationsDesc:
      'Seleccioneu fitxes per amagar-les com a ubicacions sota els hexàgons. Seleccioneu hexàgons o fitxes per posar nom a un hexàgon.',
    toolsDesc:
      'Configuració, substitucions de pàgines, estat, reescaneig de pàgines copiades i calibratge de la quadrícula.',
    footer: 'Consulteu el fullet "{help}" per obtenir instruccions completes.',
  },
  handout: {
    versionLabel: 'Versió',
    subtitle: 'Exploració hexàgon a hexàgon per a Roll20',
    footer: 'Utilitzeu el fullet "{deck}" per als controls amb un sol clic.',
    overview: {
      heading: 'Visió general',
      body: "Hexploration cobreix un mapa hexagonal amb hexagonals opacs. A mesura que el grup es mou, els hexàgons pels quals travessen (i, si voleu, els hexagonals que els envolten) s'eliminen, de manera que el mapa es descobreix un hexàgono a la vegada. Les ubicacions ocultes es poden col·locar sota hexagones i s'anuncien quan es troben. Funciona en jocs Jumpgate i Legacy, en quadrícules Hex (V) i Hex (H) de qualsevol mida.",
      demo: 'Mira una petita demostració (de la versió 1)',
    },
    quickStart: {
      heading: 'Inici ràpid',
      steps: [
        'Obriu una pàgina la graella de la qual estigui configurada en Hex (V) o Hex (H).',
        "Dibuixa una o més formes (polígon, rectangle, el·lipse o mà alçada) al voltant de l'àrea per amagar.",
        'Seleccioneu les formes i feu clic a Omple al Command Deck (o escriviu !hexploration fill). Les formes se substitueixen per hexàgons.',
        "Opcional: abans d'omplir, seleccioneu fitxes per a llocs importants i feu clic a Marca la ubicació. S'amaguen sota els hexàgons i s'anuncien quan es descobreixen.",
        'Mou una fitxa de jugador. Es revelen tots els hexàgons que travessa i els hexàgons dins de la seva distància de visió.',
      ],
    },
    commands: {
      heading: 'Ordres',
      intro:
        'Només els GM poden utilitzar aquestes ordres. La majoria actuen sobre els objectes seleccionats; la resta actuen a la pàgina que esteu veient.',
      colCommand: 'Comandament',
      colDesc: 'Què fa',
    },
    revealing: {
      heading: 'Com funciona la revelació',
      points: [
        'Només les fitxes de la capa de fitxes revelen hexàgons. Quines fitxes compten ho determina Fitxes que revelen: per defecte, les fitxes de jugador, de manera que el GM pot moure monstres sense descobrir el mapa.',
        "Una fitxa revela tots els hexàgons que cobreix (les fitxes grans en cobreixen diversos) i, amb Revela al llarg del camí activat, tots els hexàgons de la ruta per on s'ha arrossegat, inclosos els punts de pas.",
        "La Distància de visió revela els hexàgons al voltant de cadascun d'aquests hexàgons, començant pels més propers. Amb la Línia de visió activada, un hexàgon no es revela mentre hi hagi un hexàgon cobert entre ell i la fitxa. Normalment els hexàgons més propers es revelen primer, de manera que en terreny obert la Línia de visió no canvia res: només importa amb una Distància de visió de 2 o més i hexàgons que continuen coberts, com ara terreny omplert amb una Distància de revelació dels hexàgons.",
        "La Distància de revelació dels hexàgons es desa a cada hexàgon quan s'omple, així que configureu-la abans d'omplir; canviar-la després no afecta els hexàgons que ja són al mapa. Una fitxa ha d'estar com a màxim a aquest nombre d'hexàgons per revelar-los, per lluny que pugui veure, i amb 0 només es revelen quan s'hi entra. Per a una serralada: poseu la Distància de revelació dels hexàgons a 0, ompliu les muntanyes, torneu-la a deixar sense límit i després ompliu les terres de més enllà. Amb una Distància de visió de 3 i la Línia de visió activada, el grup veu el terreny obert al seu voltant, però no les muntanyes ni el que hi ha darrere. Cada hexàgon de muntanya es revela quan una fitxa hi entra.",
        "En el mode Cop d'ull, els hexàgons a la vista es tornen transparents en lloc de desaparèixer, i s'eliminen quan hi entra una fitxa. Els hexàgons transparents del mode Cop d'ull no bloquegen la Línia de visió.",
        "Roll20 dibuixa els noms, les barres i les aures de les fitxes per sobre dels hexàgons. Amb Amaga les fitxes cobertes activat, una fitxa sota un hexàgon cobert té el nom, les barres i les aures visibles per als jugadors desactivats fins que es descobreix, perquè els monstres amagats no es delatin. Si n'activeu algun mentre la fitxa està coberta, continua amagat i s'activa quan la fitxa es descobreix.",
        "L'API no informa dels moviments fets per altres modificacions. Els moviments de TokenMod es recullen automàticament; per a altres modificacions, seleccioneu les fitxes i feu clic a Explora, o truqueu a Hexploration.revealAround(token) des del vostre propi mod.",
      ],
    },
    locations: {
      heading: 'Hexes i ubicacions anomenades',
      points: [
        "Marca la ubicació converteix les fitxes seleccionades en ubicacions ocultes. Una fitxa que ja està sota un hexàgon s'amaga immediatament; en cas contrari queda amagat pel següent farciment que el cobreix.",
        "Els fitxes amb el marcador d'estat de la torre blanca també es tracten com a ubicacions quan ompliu, com a la versió 1.",
        "Les fitxes d'ubicació ocultes es mouen a la capa de GM. Quan es revela el seu hex, tornen a la capa de fitxes amb el seu nom mostrat i s'anuncia el seu descobriment.",
        "Anomena l'hexàgon dona nom a un hexàgon sense cap fitxa. El nom es mostra al GM com una etiqueta a la capa del GM i s'anuncia quan es revela l'hexàgon. Jumpgate dibuixa la capa del GM per sota de la capa de primer pla, així que a Jumpgate les etiquetes només es veuen quan Capa dels hexàgons està establerta a la capa de fitxes.",
        "Anunciar descobriments tria si veuen l'anunci tothom, només el GM o ningú. Fer ping als descobriments també mou la vista dels jugadors a la ubicació.",
      ],
    },
    settings: {
      heading: 'Configuració',
      intro:
        'Canvieu la configuració amb !hexploration set (o amb el botó Configuració). Capa dels hexàgons, Fitxes que revelen i Llengua també es poden configurar a la pàgina de configuració del mod.',
      colKey: 'clau',
      colName: 'Configuració',
      colDesc: 'Descripció',
      perPage: '(Es pot configurar per pàgina.)',
    },
    jumpgate: {
      heading: 'Jumpgate i Legacy',
      points: [
        'Hexploration determina quin motor utilitza el joc i dibuixa el tipus de forma corresponent. Les formes dibuixades en qualsevol dels editors es poden omplir.',
        "Amb Capa dels hexàgons establerta a Automàtic, els hexàgons es dibuixen a la capa de primer pla, per sobre de les fitxes, perquè els jugadors no puguin veure què hi ha a sota. Si la capa de primer pla no està disponible, s'utilitza la capa de fitxes.",
        "Jumpgate dibuixa hexàgons matemàticament regulars, que tenen una forma lleugerament diferent dels hexàgons de Legacy. Si els hexàgons no s'alineen amb la graella d'una pàgina, ajusteu una fitxa al centre d'un hexàgon, seleccioneu-la i feu clic a Calibra. Seleccioneu dues fitxes en hexàgons veïns de la mateixa fila (Hex V) o columna (Hex H) per corregir també la mida de l'hexàgon.",
        "Quan es copia una pàgina o un joc, els seus hexàgons reben identificadors nous. Executeu Torna a escanejar a la pàgina per tornar-los a recuperar, juntament amb les etiquetes de nom i les fitxes d'ubicació.",
      ],
    },
    upgrading: {
      heading: 'Actualització de la versió 1',
      points: [
        'La versió 2 ja no necessita PathMath, MatrixMath, Vector Math o HTML Builder. Podeu eliminar-los tret que els utilitzi un altre mod.',
        "Els mapes d'hexàgons, els noms, les fitxes d'ubicació i la configuració existents s'actualitzen automàticament la primera vegada que s'inicia.",
        'Les ordres de la versió 1, inclosa la macro Hexploration_menu, encara funcionen.',
        'La versió 1 permetia que qualsevol fitxa que representés un personatge revelés hexàgons. Establiu Fitxes que revelen a Fitxes de personatges per mantenir aquest comportament.',
      ],
      colV1: 'Comandament de la versió 1',
      colV2: 'Comandament de la versió 2',
    },
    troubleshooting: {
      heading: 'Resolució de problemes',
      points: [
        'No passa res quan es mou una fitxa: comproveu que la fitxa és a la capa de fitxes i que coincideix amb Fitxes que revelen, i que la pàgina té hexàgons (!hexploration status).',
        'Els hexàgons estan desplaçats respecte de la quadrícula: utilitzeu Calibra i, a continuació, comproveu-ho amb una fitxa en uns quants hexàgons del mapa.',
        'Els hexàgons han deixat de revelar-se després de copiar una pàgina o un joc: executeu Torna a escanejar a la pàgina.',
        "Omple diu que l'àrea no té centres d'hexàgon: la forma ha de contenir el centre d'almenys un hexàgon.",
        "Per a qualsevol altra cosa, comproveu el registre de la consola de l'API i incloeu-ne els missatges quan demaneu ajuda.",
      ],
    },
    languages: {
      heading: 'Idiomes',
      body: "Trieu un idioma amb l'idioma definit de !hexploration. Idiomes disponibles:",
      colLanguage: 'Llengua',
      colNative: 'Nom original',
      colCode: 'Codi',
    },
    credits: {
      heading: 'Crèdits',
      original: 'Mod original de',
      maintainer: 'Versió 2 mantinguda per',
      marketplace: "Els paquets d'art de l'Ada al mercat Roll20",
      support:
        "Si trobeu un error o teniu una idea, publiqueu-lo al fòrum Roll20 Mod o obriu un problema a GitHub i incloeu qualsevol missatge del registre de la consola de l'API.",
    },
  },
};

export default TRANSLATION;
