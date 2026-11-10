const TRANSLATION = {
  titles: {
    ready: 'La concentració està a punt.',
    menu: 'Configuració de concentració',
    help: 'Ordres de concentració',
    status: 'Qui es concentra',
    advantage: "Avantatge en l'estalvi de concentració",
    reset: 'Restableix la concentració',
    concentration: 'Concentració',
    save: 'Estalvi de concentració',
    check: 'Control de concentració',
  },
  messages: {
    migrated:
      "Actualitzat des de la versió 1.0. La vostra configuració i la vostra llista d'avantatges es van mantenir i les vostres macros antigues encara funcionen.",
    reconciled:
      "S'han posat al dia amb el mapa: s'han trobat fitxes de concentració {added}, s'han eliminat entrades antigues {dropped}.",
    readyHint: 'Escriviu {command} per a la configuració o obriu el fullet de comandaments.',
    settingChanged: '{setting} és ara {value}.',
    confirmReset:
      "Voleu tornar cada paràmetre al seu valor predeterminat i esborrar la llista d'avantatges? Els marcadors de concentració queden al mapa.",
    reset: 'La configuració torna als seus valors predeterminats.',
    journal: 'Fullets reconstruïts: {help} i {deck}.',
  },
  notices: {
    started: '{name} ara es concentra en {spell}.',
    startedNoSpell: "{name} ara s'està concentrant.",
    switched: '{name} deixa de concentrar-se en {old} i ara es concentra en {spell}.',
    switchedNoSpell: "{name} ara s'està concentrant.",
    ended: '{name} ja no es concentra en {spell}.',
    endedNoSpell: '{name} ja no es concentra.',
    lost: '{name} perd la concentració en {spell}.',
    lostNoSpell: '{name} perd la concentració.',
    kept: '{name} continua concentrant-se en {spell}.',
    keptNoSpell: '{name} es manté concentrat.',
    zeroHp: '{name} baixa a 0 punts de vida i perd la concentració a {spell}.',
    zeroHpNoSpell: '{name} baixa a 0 punts de vida i perd la concentració.',
    checkNeeded:
      '{name} ha de fer una tirada de salvació de la Constitució per mantenir la concentració: {dc}.',
  },
  save: {
    dc: 'DC',
    dcValue: 'DC {dc}',
    modifier: 'Modificador',
    roll: 'Rotlla',
    advantageRoll: '{first} i {second} (avantatge)',
    success: 'Èxit',
    failure: 'Fracàs',
  },
  menu: {
    concentratingCount: 'Concentrant-se ara: {count}',
    settings: 'Configuració',
    footer:
      'Escriviu {command} per tornar aquí. Tots els botons també es troben al fullet "{deck}".',
  },
  status: {
    none: 'Ningú es concentra.',
  },
  advantage: {
    intro:
      "Els personatges establerts a On roll, la seva concentració salva amb avantatge, com amb la proesa War Caster. Això s'aplica als desats automàtics.",
    none: 'No hi ha personatges en aquest joc.',
  },
  buttons: {
    roll: 'Rotlla',
    advantage: 'Avantatge',
    status: 'Estat',
    advantageMenu: 'Menú Avantatge',
    help: 'Ajuda',
    reset: 'Restableix',
    confirmReset: 'Restableix la configuració',
    end: 'Final',
    menu: 'Menú',
    concentrate: "Concentra't en…",
    toggle: 'Commuta',
    journal: 'Reconstrueix els fullets',
  },
  prompts: {
    spell: 'Encanteri',
  },
  values: {
    on: 'Encès',
    off: 'Apagat',
    bar: 'Barra {bar}',
    unnamed: 'Sense nom',
    sendTo: {
      everyone: 'Tothom',
      character: 'Caràcter',
      gm: 'GM',
    },
    supportMode: {
      basic: 'Bàsica',
      detailed: 'Detallat',
    },
  },
  settings: {
    language: {
      label: 'Llengua',
      desc: "L'idioma dels missatges de xat i fullets.",
    },
    command: {
      label: 'Comandament',
      desc: 'L\'ordre de xat, sense "!". Les macros de la versió 1.0 utilitzen concentració.',
    },
    statusmarker: {
      label: "Marcador d'estat",
      desc: 'El marcador que mostra la concentració. Es poden utilitzar marcadors de testimoni personalitzats.',
    },
    bar: {
      label: 'HP Bar',
      desc: 'La barra de fitxes que conté els punts de vida. El dany al mateix requereix una estalvi de concentració.',
    },
    send_reminder_to: {
      label: 'Enviar recordatori a',
      desc: "Qui veu missatges de concentració i salva: tothom, el GM o els jugadors del personatge (el GM n'obté una còpia).",
    },
    auto_add_concentration_marker: {
      label: 'Afegeix automàticament Con. Marcador',
      desc: "Afegiu el marcador quan es faci un encanteri de concentració des d'un full.",
      hint: 'Fulls D&D 5e 2014 (OGL) i 2024.',
    },
    auto_roll_save: {
      label: 'Desar automàticament',
      desc: 'Tira la salva tan bon punt una fitxa de concentració pateix danys. Quan està desactivat, el recordatori té els botons Roll i Avantatge.',
    },
    show_roll_button: {
      label: 'Botó Roll',
      desc: "Afegeix els botons Roll i Advantage al recordatori quan l'opció Auto Roll Save està desactivada.",
    },
    end_at_zero: {
      label: 'Finalitza a 0 HP',
      desc: 'Finalitza la concentració sense salvar quan una fitxa baixa a 0 punts de vida.',
    },
    bonus_attribute: {
      label: 'Atribut de bonificació',
      desc: "L'atribut de full afegit a la concentració estalvia. constitution_save_mod funciona en fulls D&D 5e 2014 i 2024.",
    },
    debug: {
      label: 'Mode de depuració',
      desc: "Escriu notes sobre la detecció d'ortografia i desa-les a la consola de l'API, per a sol·licituds d'assistència.",
    },
    support_mode: {
      label: 'Mode de suport',
      desc: 'Quant escriu el mode de depuració: bàsic (curt) o detallat.',
    },
  },
  help: {
    menu: 'Sense res seleccionat (GM): obriu la configuració. Amb fitxes seleccionades: iniciar o acabar la concentració.',
    toggle:
      'Comenceu a concentrar-vos en un encanteri amb les fitxes seleccionades. Anomena un encanteri diferent per canviar; torna a executar-lo per acabar.',
    end: 'Finalitzar la concentració de les fitxes seleccionades.',
    status: "Llista qui s'està concentrant, amb els botons Finalitzar.",
    config: 'Canvieu una configuració, per exemple config auto_roll_save|false.',
    advantageMenu: "Trieu quins personatges s'estalvia la concentració de tirades amb avantatge.",
    toggleAdvantage: "Activa o desactiva l'avantatge d'un personatge.",
    roll: "Tira una desada des del botó Tira o Avantatge d'un recordatori.",
    journal: "Reconstruïu els fulls d'ajuda i de comandaments.",
    reset: 'Torneu a posar cada paràmetre al seu valor predeterminat.',
    help: 'Mostra aquesta llista.',
    footer:
      'Les instruccions completes es troben al fullet "{help}"; els botons es troben al fullet "{deck}".',
    playerFooter: 'Seleccioneu primer el vostre testimoni.',
  },
  errors: {
    noSelection: 'Seleccioneu primer un testimoni.',
    notYours: 'Només podeu canviar la concentració per a fitxes que controleu.',
    gmOnly: 'Només el GM pot utilitzar aquesta ordre.',
    notConcentrating: 'Aquest testimoni no es concentra.',
    unknownSetting: 'No hi ha cap configuració anomenada "{key}".',
    badSettingValue: '"{value}" no és un valor vàlid per a {key}.',
    rollExpired: 'Aquest botó ha caducat.',
    unknownCharacter: 'Aquest personatge ja no existeix.',
    internal: "Alguna cosa va fallar. La consola de l'API té els detalls.",
  },
  hints: {
    noSelection:
      "Seleccioneu el testimoni del llançador i, a continuació, torneu a executar l'ordre.",
    rollExpired:
      'Els botons funcionen una vegada i durant 10 minuts. Torneu a danyar el testimoni per fer-ne un de nou.',
    unknownSetting: "Escriviu l'ordre sense seleccionar res per veure la configuració.",
  },
  warnings: {
    unknownMarker:
      'El marcador d\'estat "{marker}" no és un dels marcadors d\'aquest joc. Trieu-ne un altre a la configuració.',
  },
  deck: {
    subtitle: 'Comandament de la plataforma',
    selected: 'Fitxes seleccionades',
    selectedDesc: 'Seleccioneu primer el testimoni del llançador.',
    table: 'La Taula',
    tableDesc: 'Mireu qui es concentra i qui té avantatge en les seves parades.',
    tools: 'Eines',
    toolsDesc: "Configuració, la llista d'ordres i els fullets.",
    footer: 'Les instruccions completes es troben al fullet "{help}".',
  },
  handout: {
    versionLabel: 'Versió',
    subtitle: 'Marcadors de concentració, recordatoris i estalvis per a D&D 5e',
    overview: {
      heading: 'Visió general',
      body: 'La concentració fa un seguiment de qui es concentra en quin encanteri. Posa un marcador a la fitxa del llançador, tira (o demana) una salvació de Constitució quan aquesta fitxa rep dany i indica a la taula quan acaba la concentració.',
    },
    quickStart: {
      heading: 'Inici ràpid',
      steps: [
        "Seleccioneu la fitxa del llançador i escriviu !concentration seguit de l'encanteri, per exemple !concentration Bless.",
        "Canvia els punts d'impacte de la fitxa a la seva bombolla de barra. Es tira una salvació amb CD 10, o la meitat del dany si és més gran.",
        'Torneu a executar la mateixa ordre o traieu el marcador per acabar la concentració.',
        'Escriviu !concentration sense seleccionar res per obrir la configuració.',
      ],
    },
    concentrating: {
      heading: 'Concentrant-se',
      points: [
        'Anomenar un encanteri diferent canvia la concentració, com ho fa llançar un nou encanteri de concentració.',
        "Posar el marcador en una fitxa amb la mà comença la concentració sense encanteri; treure'l, o suprimir el testimoni, l'acaba.",
        "Una nova fitxa enllaçada d'un personatge que es concentra obté el marcador i es fa un seguiment d'una fitxa enganxada que porta el marcador.",
        "Les fitxes d'un personatge amb una barra de punts de visita enllaçada comparteixen concentració. Les fitxes no enllaçades, com ara un paquet de follets d'un full, es concentren soles.",
        'Tothom veu un missatge quan comença, canvia o acaba la concentració, tret que Envia recordatori a digui el contrari.',
      ],
    },
    saves: {
      heading: 'La concentració salva',
      points: [
        'La CD és 10 o la meitat del dany rebut, el que sigui més gran, fins a 30 CD.',
        "El modificador prové de l'atribut de bonificació del full del personatge; un valor que falta compta com a 0.",
        'Rotlla automàtica Desa rotlles alhora. Quan està desactivat, el recordatori té botons Roll i Avantatge per al jugador o GM.',
        "Una parada fallida acaba amb la concentració. Amb End a 0 HP activat, baixar a 0 punts de vida s'acaba sense salvar.",
        'El menú Avantatges ofereix un avantatge de personatge en els desats automàtics, com ho fa la gesta de War Caster.',
      ],
    },
    automatic: {
      heading: "Encanteris fets des d'un llençol",
      points: [
        "Amb Auto Add Con. Marcador activat, llançant un encanteri de concentració des d'un full de D&D 5e 2014 (OGL) o 2024 afegeix el marcador.",
        "Les fitxes del llançador a la pàgina que està veient estan marcades; si no n'hi ha, hi ha fitxes de qualsevol pàgina.",
        'Només compten les cartes del GM, un altre mod o un dels jugadors del personatge. Tornar a llançar el mateix encanteri no canvia res.',
        'Una targeta de D&D 2024 que només esmenta la concentració al seu text, com ara la gesta de War Caster, pot iniciar la concentració però mai substitueix un encanteri.',
        "És possible que els fulls D&D 2024 necessitin el servidor de l'API experimental. Activa el mode de depuració per veure per què s'ha detectat o no un encanteri.",
      ],
    },
    players: {
      heading: 'Jugadors',
      points: [
        "Els jugadors poden iniciar i finalitzar la concentració de fitxes que controlen, i utilitzar els botons de tirar i d'avantatge en els seus propis desats.",
        'Amb Enviar recordatori per configurar-lo com a Caràcter, els missatges es xiuxiuegen als jugadors del personatge i al GM.',
      ],
    },
    commands: {
      heading: 'Ordres',
      intro: 'Altres mods, com ara ScriptCards, també poden enviar aquestes ordres.',
      colCommand: 'Comandament',
      colDesc: 'Què fa',
    },
    settings: {
      heading: 'Configuració',
      intro:
        'Canvieu la configuració amb els botons de la targeta de configuració o amb la configuració <clau>|<valor>. Alguns també es poden configurar a la pàgina del mod.',
      colKey: 'clau',
      colName: 'Nom',
      colDesc: 'Què fa',
    },
    upgrading: {
      heading: 'Actualització de la versió 1.0',
      points: [
        "La configuració, la llista d'avantatges i cada comanda segueixen funcionant.",
        'Els missatges ara diuen quan acaba la concentració i en quin encanteri.',
        "Les fitxes que ja porten el marcador es recullen a l'inici.",
      ],
    },
    troubleshooting: {
      heading: 'Resolució de problemes',
      points: [
        "No hi ha cap desa quan baixen els punts de vida: comproveu que la fitxa tingui el marcador i que la barra d'HP sigui la barra que heu canviat. Els canvis fets per altres mods mitjançant l'API no generen esdeveniments, de manera que no es veuen.",
        "El modificador és 0: comproveu l'atribut de bonificació amb el full del personatge.",
        "Els encanteris llançats des del full no es detecten: activeu el mode de depuració, torneu a fer l'encanteri i llegiu la consola de l'API.",
        'Dos personatges comparteixen un nom: la detecció utilitza la primera coincidència. Doneu als personatges noms únics.',
      ],
    },
    languages: {
      heading: 'Idiomes',
      body: "La concentració es tradueix als idiomes següents. Trieu-ne un amb la configuració d'Idioma.",
      colCode: 'Codi',
      colName: 'Llengua',
      colNative: 'Nom nadiu',
    },
    credits: {
      heading: 'Crèdits',
      original: 'Mod original de',
      maintainer: 'Mantingut per',
      support: "Informa d'errors i idees al fòrum Roll20 Mod o a GitHub.",
    },
    footer: 'Els botons per a cada acció es troben al fullet "{deck}".',
  },
};

export default TRANSLATION;
