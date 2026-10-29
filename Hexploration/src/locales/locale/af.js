const TRANSLATION = {
  titles: {
    ready: 'Hexploration is gereed.',
    settings: 'Hexploration-instellings',
    languages: "Kies 'n taal",
    pageSettings: 'Bladsyinstellings: {page}',
    status: 'Hexploration-status: {page}',
    help: 'Hexploration-opdragte',
    confirm: 'Bevestig asseblief',
  },
  discovery: {
    title: 'Ligging ontdek',
  },
  menu: {
    draw: 'Teken',
    reveal: 'Openbaar en versteek',
    locations: 'Liggings',
    tools: 'Gereedskap',
    layerInUse: 'Nuwe seshoeke word op die {layer} geteken.',
    pageSettingsHelp:
      'Hierdie instellings geld slegs vir hierdie bladsy. Instellings gemerk met ★ oorskryf die globale instellings.',
  },
  buttons: {
    fill: 'Vul',
    fillInverse: 'Omgekeerde vulling',
    undo: 'Ontdoen vulling',
    reveal: 'Onthul',
    conceal: 'Versteek',
    explore: 'Verken',
    revealPage: 'Onthul bladsy',
    resetPage: 'Stel bladsy terug',
    mark: 'Merk ligging',
    unmark: 'Ontmerk',
    name: 'Benoem seshoek',
    settings: 'Instellings',
    pageSettings: 'Bladsy-instellings',
    status: 'Status',
    rescan: 'Skandeer weer',
    calibrate: 'Kalibreer',
    calibrateReset: 'Stel kalibrasie terug',
    help: 'Hulp',
    change: 'Verander',
    menu: 'Kieslys',
    clearOverrides: 'Vee oorskrywings uit',
    confirmReset: 'Ja, verwyder alle seshoeke',
  },
  prompts: {
    name: 'Liggingnaam (laat leeg om skoon te maak)',
  },
  values: {
    on: 'Aan',
    off: 'Af',
    none: 'Geen',
    hexLayer: {
      auto: 'Outo (voorgrond indien beskikbaar)',
      foreground: 'voorgrondlaag',
      objects: 'tokenlaag',
    },
    revealBy: {
      players: 'Speler-tokens',
      characters: 'Karaktertokens',
      all: 'Alle tokens',
    },
    revealMode: {
      clear: 'Verwyder',
      glimpse: 'Glimp',
    },
    announce: {
      all: 'Almal',
      gm: 'Slegs GM',
      off: 'Af',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Vul',
      fillInverse: 'Omgekeerde vulling',
      conceal: 'Versteek',
    },
  },
  settings: {
    language: {
      label: 'Taal',
      desc: 'Taal vir kieslyste, boodskappe en uitdeelstukke.',
    },
    hexLayer: {
      label: 'Seshoeklaag',
      desc: 'Waar nuwe seshoeke geteken word. Outo probeer die voorgrondlaag (bo tokens) en val terug na die tokenlaag as die speletjie dit nie ondersteun nie.',
    },
    fillColor: {
      label: 'Vulkleur',
      desc: 'Kleur van nuwe seshoeke. Gebruik rgba() vir deursigtige seshoeke, byvoorbeeld rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Randkleur',
      desc: 'Kleur van die buitelyn van nuwe seshoeke.',
    },
    labelColor: {
      label: 'Etiketkleur',
      desc: 'Kleur van die naametikette wat net die GM sien, op benoemde seshoeke.',
    },
    glimpseColor: {
      label: 'Glimpkleur',
      desc: "Kleur waarna seshoeke verander wanneer hulle deurskynend word (Glimp-onthullingsmodus). Gebruik 'n deurskynende rgba()-kleur.",
    },
    strokeWidth: {
      label: 'Randdikte',
      desc: 'Dikte van die buitelyn van nuwe seshoeke, in pieksels (0 tot 20).',
    },
    maxDistance: {
      label: 'Seshoek-onthullingsafstand',
      desc: "Word op seshoeke toegepas wanneer hulle geteken word: 'n token moet binne soveel seshoeke wees om hulle te onthul, hoe ver dit ook al kan sien. Laat leeg vir geen beperking nie.",
    },
    revealDistance: {
      label: 'Sigafstand',
      desc: "Hoeveel seshoeke rondom 'n bewegende token onthul word (0 tot 20). 0 onthul slegs die seshoeke waardeur die token beweeg.",
    },
    lineOfSight: {
      label: 'Siglyn',
      desc: "Wanneer dit aan is, word 'n seshoek slegs onthul as geen bedekte seshoek tussen dit en die token lê nie.",
    },
    revealPath: {
      label: 'Onthul langs pad',
      desc: "Wanneer dit aan is, word elke seshoek waardeur 'n token beweeg terwyl dit gesleep word (insluitend tussenpunte), onthul, nie net waar dit stop nie.",
    },
    revealBy: {
      label: 'Tokens wat onthul',
      desc: "Watter tokens op die tokenlaag seshoeke onthul: tokens wat deur 'n speler beheer word, tokens wat enige karakter verteenwoordig, of elke token.",
    },
    revealMode: {
      label: 'Onthullingsmodus',
      desc: "Met Verwyder word seshoeke binne sig verwyder. Met Glimp word hulle eerder deurskynend; hulle word verwyder wanneer 'n token hulle binnegaan.",
    },
    announce: {
      label: 'Kondig ontdekkings aan',
      desc: "Wie sien die kletsboodskap wanneer 'n genoemde ligging ontdek word.",
    },
    pingDiscoveries: {
      label: 'Ping ontdekkings',
      desc: "Wanneer aan, word spelers na 'n genoemde plek geping wanneer dit ontdek word.",
    },
    hideCoveredTokens: {
      label: 'Versteek bedekte tokens',
      desc: "Roll20 teken name, balke en auras bo seshoeke. Wanneer dit aan is, word die naam, balke en auras wat spelers kan sien, afgeskakel vir tokens onder 'n bedekte seshoek, en weer aangeskakel wanneer hulle ontbloot word.",
    },
  },
  status: {
    engine: 'Spelenjin',
    grid: 'Rooster',
    layer: 'Seshoeklaag',
    hexes: 'Seshoeke',
    named: 'Benoemde seshoeke',
    icons: 'Liggingtokens',
    glimpsed: 'Deurskynende seshoeke',
    pending: "Liggings wat op 'n vulling wag",
    calibrated: 'Gekalibreer',
    overrides: 'Bladsy-oorskrywings',
    undo: 'Ontdoen beskikbaar',
  },
  messages: {
    filled:
      'Vulling voltooi. Seshoeke geteken: {created}. Herstileer: {restyled}. Liggings versteek: {icons}.',
    revealed: 'Seshoeke onthul: {count}.',
    revealedPage: 'Elke seshoek op die bladsy is onthul ({count}).',
    confirmReset:
      'Verwyder elke seshoek van "{page}" ({count})? Liggingtokens keer terug na die tokenlaag. Ontdoen kan dit nie omkeer nie.',
    resetPage: 'Seshoeke van die bladsy verwyder: {count}.',
    undone:
      'Laaste vulling ontdoen. Seshoeke verwyder: {removed}. Herstileerde seshoeke herstel: {restored}.',
    named: 'Seshoeke benoem as "{name}": {count}.',
    unnamed: 'Name skoongemaak: {count}.',
    marked:
      'Liggings versteek in bestaande seshoeke: {attached}. Wag vir die volgende vulling wat hulle bedek: {pending}.',
    unmarked: 'Tokens wat nie meer liggings is nie: {count}.',
    settingChanged: '{setting} gestel na {value}.',
    rescanned:
      'Herskandeer voltooi. Gehou: {kept}. Aangeneem: {adopted}. Herliasseer: {moved}. Ontbreek en vergeet: {dropped}. Etikette herskakel: {labels}. Liggingtokens herskakel: {icons}.',
    calibrated:
      'Rooster gekalibreer (kolomstap {colStep}px, rystap {rowStep}px). Herskandeer: behou {kept}, herliasseer {moved}, het {adopted} aangeneem.',
    calibrationReset:
      'Kalibrasie verwyder. Herskandeer: behou {kept}, herliasseer {moved}, het {adopted} aangeneem.',
    journalRebuilt: 'Die "{help}" en "{deck}"-uitdeelstukke is herbou.',
    migrated:
      "Jou Hexploration 1.x-seshoekkaarte is opgegradeer. As hierdie speletjie uit 'n Legacy-speletjie gekopieer is, gebruik Skandeer weer op elke seshoekkaartbladsy.",
    pruned:
      'Gestoorde seshoeke wat nie meer bestaan nie en vergeet is: {dropped}. As hierdie speletjie of bladsy gekopieer is, gebruik Skandeer weer op die bladsy om sy seshoeke weer op te tel.',
    readyHint:
      'Tik !hexploration vir die kieslys, of maak die "Hexploration - Command Deck"-uitdeelstuk oop.',
  },
  warnings: {
    foregroundUnavailable:
      'Hierdie speletjie ondersteun nie teken op die voorgrondlaag nie, dus is die seshoeke op die tokenlaag geteken.',
    someFailed:
      'Seshoeke wat nie geteken kon word nie: {count}. Kyk in die API-konsole vir besonderhede.',
  },
  errors: {
    noPage: 'Kon nie die bladsy vind om aan te werk nie.',
    notHex: "Hierdie bladsy gebruik nie 'n seshoekrooster nie.",
    noPolygons: 'Kies een of meer getekende vorms om te vul.',
    emptyArea: 'Die geselekteerde gebied bevat geen seshoekmiddelpunte nie.',
    tooMany: 'Dit sal te veel seshoeke op een slag skep ({count}).',
    nothingToConceal: 'Kies getekende vorms of tokens om te versteek.',
    nothingToReveal: 'Kies seshoeke, getekende vorms of tokens om te onthul.',
    noTokens: 'Kies eers een of meer tokens.',
    noHexes: 'Kies eers een of meer seshoeke (of tokens wat op seshoeke staan).',
    nothingToUndo: 'Daar is geen vul om ongedaan te maak nie.',
    unknownCommand: 'Onbekende opdrag: {command}',
    unknownSetting: 'Onbekende instelling: {key}',
    unknownPageSetting: 'Instellings wat per bladsy gestel kan word: {keys}',
    invalidValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
    calibrateNeedsTokens: 'Kies een of twee tokens wat op seshoekmiddelpunte vasgeklik is.',
    calibrateFailed: 'Daardie tokens kan nie gebruik word om te kalibreer nie.',
    unexpected: 'Iets het verkeerd geloop: {message}',
  },
  hints: {
    noPage: 'Maak die bladsy oop waaraan jy wil werk, of kies iets daarop.',
    notHex: 'Stel die bladsyrooster op Hex (V) of Hex (H) in Bladsy-instellings.',
    noPolygons:
      "Teken 'n veelhoek, reghoek, ellips of vryhandvorm om die area, kies dit en probeer dan weer.",
    emptyArea: "Teken 'n groter vorm, of gaan die bladsyroosterinstellings na.",
    tooMany: "Vul 'n kleiner gebied, of verdeel die gebied in verskeie vorms.",
    noHexes:
      'Seshoeke is op die voorgrond- of tokenlaag; skakel oor na daardie laag om hulle te kies.',
    unknownCommand: 'Tik !hexploration help om die opdragte te lys.',
    unknownSetting: 'Tik !hexploration set om elke instelling te sien.',
    calibrateNeedsTokens:
      "Klik 'n token vas in die middel van 'n seshoek en kies dit. Kies 'n tweede token wat op 'n naburige seshoek in dieselfde ry (Hex V) of kolom (Hex H) vasgeklik is om ook die seshoekgrootte reg te stel.",
    calibrateFailed:
      'Die twee tokens moet in dieselfde ry (Hex V) of dieselfde kolom (Hex H) wees, minstens een seshoek uitmekaar.',
    unexpected: 'Besonderhede is in die API-konsole-logboek.',
  },
  help: {
    menu: 'Wys die kieslys.',
    fill: 'Bedek die geselekteerde getekende vorms met seshoeke.',
    fillInverse: 'Bedek die hele bladsy behalwe binne die geselekteerde vorms.',
    undo: 'Ontdoen die laaste vulling, omgekeerde vulling of versteek, en herstel die vorms wat dit gebruik het.',
    reveal:
      'Onthul die geselekteerde seshoeke, en die seshoeke onder die geselekteerde vorms en tokens.',
    revealPage: 'Onthul elke seshoek op die bladsy sonder aankondigings.',
    conceal: 'Bedek die gebied onder die geselekteerde vorms en tokens weer met seshoeke.',
    explore: 'Onthul rondom die geselekteerde tokens asof hulle pas daarheen beweeg het.',
    resetPage: 'Verwyder elke seshoek op die bladsy (vra eers).',
    name: 'Benoem die geselekteerde seshoeke, of die seshoeke onder die geselekteerde tokens. Laat die naam leeg om dit uit te vee.',
    mark: 'Verander die geselekteerde tokens in versteekte liggings.',
    unmark: 'Stop dat die geselekteerde tokens versteekte liggings is.',
    set: "Verander 'n instelling, of wys alle instellings.",
    pageSet: "Oorskryf 'n onthullingsinstelling slegs op die huidige bladsy.",
    pageClear: 'Verwyder die huidige bladsy se oorskrywings.',
    rescan:
      "Herbou die bladsy se seshoeklys, byvoorbeeld nadat jy 'n bladsy of speletjie gekopieer het.",
    calibrate:
      'Belyn die seshoekrooster met een of twee geselekteerde tokens wat op seshoekmiddelpunte vasgeklik is.',
    calibrateReset: 'Verwyder die huidige bladsy se kalibrasie.',
    status: 'Wys wat Hexploration van die huidige bladsy weet.',
    journal: 'Herbou die Help- en Command Deck-uitdeelstukke.',
    help: 'Wys hierdie lys.',
    handout: 'Volledige instruksies is in die "{name}"-uitdeelstuk.',
  },
  deck: {
    drawDesc: "Teken vorms om 'n area, kies hulle en vul dan. Ontdoen keer die laaste vulling om.",
    revealDesc:
      'Kies seshoeke, vorms of tokens om hulle te onthul of weer te bedek. Verken onthul rondom geselekteerde tokens asof hulle beweeg het.',
    locationsDesc:
      "Kies tokens om hulle as liggings onder seshoeke te versteek. Kies seshoeke of tokens om 'n seshoek te benoem.",
    toolsDesc:
      'Instellings, bladsy-oorskrywings, status, herskandering van gekopieerde bladsye en kalibrering van die rooster.',
    footer: 'Sien die "{help}"-uitdeelstuk vir volledige instruksies.',
  },
  handout: {
    versionLabel: 'Weergawe',
    subtitle: 'Seshoek-vir-seshoek-verkenning vir Roll20',
    footer: 'Gebruik die "{deck}"-uitdeelstuk vir een-klik kontroles.',
    overview: {
      heading: 'Oorsig',
      body: "Hexploration bedek 'n seshoekkaart met ondeursigtige seshoeke. Soos die groep beweeg, word die seshoeke waardeur hulle gaan (en, as jy wil, die seshoeke rondom hulle) verwyder, sodat die kaart een seshoek op 'n slag ontbloot word. Versteekte liggings kan onder seshoeke geplaas word en word aangekondig wanneer hulle gevind word. Dit werk in Jumpgate- en Legacy-speletjies, op Hex (V)- en Hex (H)-roosters van enige grootte.",
      demo: "Kyk na 'n kort demonstrasie (vanaf weergawe 1)",
    },
    quickStart: {
      heading: 'Vinnige Begin',
      steps: [
        "Maak 'n bladsy oop waarvan die rooster op Hex (V) of Hex (H) gestel is.",
        'Teken een of meer vorms (veelhoek, reghoek, ellips of vryhand) om die area om weg te steek.',
        'Kies die vorms en klik op Vul in die Command Deck (of tik !hexploration fill). Die vorms word deur seshoeke vervang.',
        'Opsioneel: kies voor die vulling tokens vir belangrike plekke en klik Merk ligging. Hulle word onder die seshoeke versteek en aangekondig wanneer hulle ontdek word.',
        "Beweeg 'n speler-token. Elke seshoek waardeur dit beweeg, en die seshoeke binne sy Sigafstand, word onthul.",
      ],
    },
    commands: {
      heading: 'Opdragte',
      intro:
        "Slegs GM'e kan hierdie opdragte gebruik. Die meeste werk op die geselekteerde voorwerpe; die res tree op op die bladsy wat jy bekyk.",
      colCommand: 'Bevel',
      colDesc: 'Wat dit doen',
    },
    revealing: {
      heading: 'Hoe onthulling werk',
      points: [
        'Slegs tokens op die tokenlaag onthul seshoeke. Watter tokens tel, word deur Tokens wat onthul bepaal: by verstek speler-tokens, sodat die GM monsters kan skuif sonder om die kaart te ontbloot.',
        "'n Token onthul elke seshoek wat dit bedek (groot tokens bedek verskeie) en, met Onthul langs pad aan, elke seshoek op die roete waarlangs dit gesleep is, insluitend tussenpunte.",
        "Sigafstand onthul die seshoeke rondom elk van daardie seshoeke. Met Siglyn aan, word 'n seshoek slegs onthul as geen bedekte seshoek tussenin lê nie.",
        "Seshoek-onthullingsafstand word op seshoeke gestoor wanneer hulle geteken word. Daardie seshoeke word slegs van binne soveel seshoeke onthul, hoe ver 'n token ook al kan sien. Gebruik dit vir berge of woude wat versteek wat agter hulle lê.",
        "In Glimp-modus word seshoeke binne sig deurskynend in plaas daarvan om te verdwyn, en hulle word verwyder wanneer 'n token hulle binnegaan.",
        "Roll20 teken tokenname, balke en auras bo seshoeke. Met Versteek bedekte tokens aan, word die naam, balke en auras wat spelers kan sien, afgeskakel vir 'n token onder 'n bedekte seshoek totdat dit ontbloot word, sodat versteekte monsters hulself nie verklap nie. As jy een daarvan aanskakel terwyl die token bedek is, bly dit versteek en word dit aangeskakel wanneer die token ontbloot word.",
        'Die API rapporteer nie bewegings wat deur ander mods gemaak is nie. TokenMod-skuiwe word outomaties opgetel; vir ander mods, kies die tokens en klik Explore, of bel Hexploration.revealAround(token) vanaf jou eie mod.',
      ],
    },
    locations: {
      heading: 'Benoemde seshoeke en liggings',
      points: [
        "Merk ligging verander die geselekteerde tokens in versteekte liggings. 'n Token wat reeds onder 'n seshoek is, word dadelik versteek; anders word dit versteek deur die volgende vulling wat dit bedek.",
        'Tokens met die wittoring-statusmerker word ook as liggings hanteer wanneer jy vul, soos in weergawe 1.',
        'Versteekte liggingtokens word na die GM-laag geskuif. Wanneer hul seshoek onthul word, keer hulle terug na die tokenlaag met hul naam sigbaar, en hul ontdekking word aangekondig.',
        "Benoem seshoek gee 'n seshoek 'n naam sonder 'n token. Die naam word aan die GM gewys as 'n etiket op die GM-laag en aangekondig wanneer die seshoek onthul word.",
        'Announce Discoveries kies of almal, net die GM, of niemand die aankondiging sien nie. Ping Discoveries skuif ook die spelers se uitsig na die ligging.',
      ],
    },
    settings: {
      heading: 'Instellings',
      intro:
        'Verander instellings met !hexploration set (of die Instellings-knoppie). Seshoeklaag, Tokens wat onthul en Taal kan ook op die Mod se instellingsbladsy gestel word.',
      colKey: 'Sleutel',
      colName: 'Instelling',
      colDesc: 'Beskrywing',
      perPage: '(Kan per bladsy gestel word.)',
    },
    jumpgate: {
      heading: 'Jumpgate en Legacy',
      points: [
        'Hexploration bepaal watter enjin die speletjie gebruik en teken die ooreenstemmende soort vorm. Vorms wat in enige van die twee redigeerders geteken is, kan gevul word.',
        'Met Seshoeklaag op Outo gestel, word seshoeke op die voorgrondlaag bo tokens geteken, sodat spelers nie kan sien wat daaronder is nie. As die voorgrondlaag nie beskikbaar is nie, word die tokenlaag eerder gebruik.',
        "Jumpgate teken wiskundig reëlmatige seshoeke, wat 'n effens ander vorm as Legacy-seshoeke het. As die seshoeke nie met 'n bladsy se rooster belyn nie, klik 'n token vas op 'n seshoekmiddelpunt, kies dit en klik Kalibreer. Kies twee tokens in naburige seshoeke van dieselfde ry (Hex V) of kolom (Hex H) om ook die seshoekgrootte reg te stel.",
        "Wanneer 'n bladsy of speletjie gekopieer word, kry sy seshoeke nuwe ID's. Gebruik Skandeer weer op die bladsy om hulle weer op te tel, saam met hul naametikette en liggingtokens.",
      ],
    },
    upgrading: {
      heading: 'Opgradering vanaf weergawe 1',
      points: [
        "Weergawe 2 het nie meer PathMath, MatrixMath, Vector Math of HTML Builder nodig nie. Jy kan hulle verwyder tensy 'n ander mod dit gebruik.",
        'Bestaande seshoekkaarte, name, liggingtokens en instellings word met die eerste begin outomaties opgegradeer.',
        'Die weergawe 1-opdragte, insluitend die Hexploration_menu-makro, werk steeds.',
        "Weergawe 1 het enige token wat 'n karakter verteenwoordig, seshoeke laat onthul. Stel Tokens wat onthul op Karaktertokens om daardie gedrag te behou.",
      ],
      colV1: 'Weergawe 1 opdrag',
      colV2: 'Weergawe 2 opdrag',
    },
    troubleshooting: {
      heading: 'Probleemoplossing',
      points: [
        "Niks gebeur wanneer 'n token beweeg nie: maak seker dat die token op die tokenlaag is en by Tokens wat onthul pas, en dat die bladsy seshoeke het (!hexploration status).",
        "Seshoeke is van die rooster af verskuif: gebruik Kalibreer en kyk dan met 'n token op 'n paar seshoeke oor die kaart heen.",
        "Seshoeke word nie meer onthul nadat 'n bladsy of speletjie gekopieer is nie: gebruik Skandeer weer op die bladsy.",
        'Vul sê die gebied het geen seshoekmiddelpunte nie: die vorm moet die middelpunt van ten minste een seshoek bevat.',
        'Vir enigiets anders, gaan die API-konsole-logboek na en sluit sy boodskappe in wanneer jy om hulp vra.',
      ],
    },
    languages: {
      heading: 'Tale',
      body: "Kies 'n taal met !hexploration stel taal. Beskikbare tale:",
      colLanguage: 'Taal',
      colNative: 'Naam in eie taal',
      colCode: 'Kode',
    },
    credits: {
      heading: 'Krediete',
      original: 'Oorspronklike mod deur',
      maintainer: 'Weergawe 2 onderhou deur',
      marketplace: 'Ada se kunspakkies op die Roll20 Marketplace',
      support:
        "As jy 'n fout vind of 'n idee het, plaas in die Roll20 Mod-forum of maak 'n probleem op GitHub oop, en sluit enige boodskappe van die API-konsole-logboek in.",
    },
  },
};

export default TRANSLATION;
