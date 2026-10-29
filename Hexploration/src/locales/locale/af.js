const TRANSLATION = {
  titles: {
    ready: 'Heeksplorasie is gereed.',
    settings: 'Heksplorasie-instellings',
    languages: "Kies 'n taal",
    pageSettings: 'Bladsyinstellings: {page}',
    status: 'Heksplorasiestatus: {page}',
    help: 'Heksplorasie-opdragte',
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
    layerInUse: 'Nuwe hekse word op die {layer} geteken.',
    pageSettingsHelp:
      'Hierdie instellings is slegs van toepassing op hierdie bladsy. Instellings gemerk ★ ignoreer die globale instellings.',
  },
  buttons: {
    fill: 'Vul',
    fillInverse: 'Omgekeerde vul',
    undo: 'Ontdoen vul',
    reveal: 'Onthul',
    conceal: 'Versteek',
    explore: 'Verken',
    revealPage: 'Onthul bladsy',
    resetPage: 'Stel bladsy terug',
    mark: 'Merk ligging',
    unmark: 'Ontmerk',
    name: 'Noem Hex',
    settings: 'Instellings',
    pageSettings: 'Bladsy-instellings',
    status: 'Status',
    rescan: 'Skandeer weer',
    calibrate: 'Kalibreer',
    calibrateReset: 'Stel Kalibrasie terug',
    help: 'Help',
    change: 'Verander',
    menu: 'Spyskaart',
    clearOverrides: 'Vee oorskrywings uit',
    confirmReset: 'Ja, verwyder alle hekse',
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
      foreground: 'voorgrond laag',
      objects: 'tekenlaag',
    },
    revealBy: {
      players: 'Speler tokens',
      characters: 'Karaktertekens',
      all: 'Alle tekens',
    },
    revealMode: {
      clear: 'Duidelik',
      glimpse: 'Glimpie',
    },
    announce: {
      all: 'Almal',
      gm: 'Slegs GM',
      off: 'Af',
    },
    orientation: {
      vertical: 'Heks (V)',
      horizontal: 'Heks (H)',
    },
    fillKind: {
      fill: 'Vul',
      fillInverse: 'Omgekeerde vul',
      conceal: 'Versteek',
    },
  },
  settings: {
    language: {
      label: 'Taal',
      desc: 'Taal vir spyskaarte, boodskappe en uitdeelstukke.',
    },
    hexLayer: {
      label: 'Hex laag',
      desc: 'Waar nuwe hekkies geteken word. Outo probeer die voorgrondlaag (bo tokens) en val terug na die token laag as die speletjie dit nie ondersteun nie.',
    },
    fillColor: {
      label: 'Vul kleur',
      desc: 'Kleur van nuwe hekkies. Gebruik rgba() vir deursigtige hekse, byvoorbeeld rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Rand Kleur',
      desc: 'Kleur van die buitelyn van nuwe hekse.',
    },
    labelColor: {
      label: 'Etiket Kleur',
      desc: 'Kleur van die GM-net naametikette op benoemde hekse.',
    },
    glimpseColor: {
      label: 'Glimp kleur',
      desc: "Kleur hekkies verander na wanneer gekyk word (Glimpse onthullingsmodus). Gebruik 'n deurskynende rgba()-kleur.",
    },
    strokeWidth: {
      label: 'Grens breedte',
      desc: 'Breedte van die buitelyn van nuwe hekse, in pixels (0 tot 20).',
    },
    maxDistance: {
      label: 'Hex Reveal Distance',
      desc: "Toegepas op hekse soos hulle geteken word: 'n teken moet binne hierdie baie hekse wees om hulle te openbaar, hoe ver dit ook al kan sien. Laat leeg vir geen beperking nie.",
    },
    revealDistance: {
      label: 'Sigafstand',
      desc: "Hoeveel hekkies rondom 'n bewegende teken word geopenbaar (0 tot 20). 0 openbaar slegs die hekkies waardeur die teken gaan.",
    },
    lineOfSight: {
      label: 'Siglyn',
      desc: "Wanneer dit aan is, word 'n hex slegs geopenbaar as geen bedekte hex tussen dit en die teken lê nie.",
    },
    revealPath: {
      label: 'Openbaar Langs Pad',
      desc: "Wanneer dit aan is, word elke heks wat 'n teken deurgaan terwyl dit gesleep word (insluitend waypoints) geopenbaar, nie net waar dit stop nie.",
    },
    revealBy: {
      label: 'Tekens wat openbaar',
      desc: "Watter tekens op die tekenlaag openbaar hekse: tekens wat deur 'n speler beheer word, tekens wat enige karakter verteenwoordig, of elke teken.",
    },
    revealMode: {
      label: 'Onthullingsmodus',
      desc: "Clear verwyder hekkies binne sig. Glimpse maak hulle eerder deurskynend; hulle word verwyder wanneer 'n teken hulle binnekom.",
    },
    announce: {
      label: 'Kondig ontdekkings aan',
      desc: "Wie sien die kletsboodskap wanneer 'n genoemde ligging ontdek word.",
    },
    pingDiscoveries: {
      label: 'Ping Ontdekkings',
      desc: "Wanneer aan, word spelers na 'n genoemde plek geping wanneer dit ontdek word.",
    },
    hideCoveredTokens: {
      label: 'Versteek bedekte tekens',
      desc: "Roll20 teken name, stawe en aura's bo hekkies. Wanneer dit aan is, word hul speler-sigbare naam, balke en aura's onder 'n bedekte hekshoek afgeskakel en weer aangeskakel wanneer hulle ontbloot word.",
    },
  },
  status: {
    engine: 'Spel enjin',
    grid: 'Rooster',
    layer: 'Hex laag',
    hexes: 'Hekse',
    named: 'Benoemde hekse',
    icons: 'Liggingtekens',
    glimpsed: 'Geskimpte hekkies',
    pending: "Liggings wat wag vir 'n vulling",
    calibrated: 'Gekalibreer',
    overrides: 'Bladsy ignoreer',
    undo: 'Ontdoen beskikbaar',
  },
  messages: {
    filled:
      'Vul voltooi. Hekse getrek: {created}. Herstileer: {restyled}. Liggings versteek: {icons}.',
    revealed: 'Hekse geopenbaar: {count}.',
    revealedPage: 'Elke heksie op die bladsy is geopenbaar ({count}).',
    confirmReset:
      'Verwyder elke heks van "{page}" ({count})? Liggingtokens keer terug na die tokenlaag. Ontdoen kan dit nie omkeer nie.',
    resetPage: 'Hekse verwyder van die bladsy: {count}.',
    undone:
      'Laaste vulling ontdoen. Hekse verwyder: {removed}. Herstileerde hekkies is herstel: {restored}.',
    named: 'Hekse genaamd "{name}": {count}.',
    unnamed: 'Name skoongemaak: {count}.',
    marked:
      'Liggings versteek in bestaande hekkies: {attached}. Wag vir die volgende vul wat hulle dek: {pending}.',
    unmarked: 'Tekens wat nie meer liggings is nie: {count}.',
    settingChanged: '{setting} gestel na {value}.',
    rescanned:
      'Herskandeer voltooi. Gehou: {kept}. Aangeneem: {adopted}. Herliasseer: {moved}. Ontbreek en vergeet: {dropped}. Etikette herskakel: {labels}. Liggingtokens herskakel: {icons}.',
    calibrated:
      'Rooster gekalibreer (kolomstap {colStep}px, rystap {rowStep}px). Herskandeer: behou {kept}, herliasseer {moved}, het {adopted} aangeneem.',
    calibrationReset:
      'Kalibrasie verwyder. Herskandeer: behou {kept}, herliasseer {moved}, het {adopted} aangeneem.',
    journalRebuilt: 'Die "{help}" en "{deck}"-uitdeelstukke is herbou.',
    migrated:
      "Jou Hexploration 1.x-hex-kaarte is opgegradeer. As hierdie speletjie uit 'n Legacy-speletjie gekopieer is, voer Rescan op elke hekskaartbladsy uit.",
    pruned:
      'Gestoorde hekkies wat nie meer bestaan ​​nie en vergeet is: {dropped}. As hierdie speletjie of bladsy gekopieer is, hardloop Rescan op die bladsy om sy hekkies weer op te tel.',
    readyHint:
      'Tik !hexploration vir die spyskaart, of maak die "Hexploration - Command Deck"-uitdeelstuk oop.',
  },
  warnings: {
    foregroundUnavailable:
      'Hierdie speletjie ondersteun nie tekening op die voorgrondlaag nie, dus is hekse op die tekenlaag geteken.',
    someFailed:
      'Hekse wat nie geteken kon word nie: {count}. Gaan die API-konsole na vir besonderhede.',
  },
  errors: {
    noPage: 'Kon nie die bladsy vind om aan te werk nie.',
    notHex: "Hierdie bladsy gebruik nie 'n hex-rooster nie.",
    noPolygons: 'Kies een of meer getekende vorms om te vul.',
    emptyArea: 'Die geselekteerde area bevat geen heksasiemiddels nie.',
    tooMany: 'Dit sal te veel hekkies in een slag skep ({count}).',
    nothingToConceal: 'Kies getekende vorms of tekens om te versteek.',
    nothingToReveal: 'Kies hekkies, getekende vorms of tekens om te openbaar.',
    noTokens: 'Kies eers een of meer tekens.',
    noHexes: 'Kies eers een of meer hekse (of tekens wat op hekse staan).',
    nothingToUndo: 'Daar is geen vul om ongedaan te maak nie.',
    unknownCommand: 'Onbekende opdrag: {command}',
    unknownSetting: 'Onbekende instelling: {key}',
    unknownPageSetting: 'Instellings wat per bladsy gestel kan word: {keys}',
    invalidValue: '"{value}" is nie \'n geldige waarde vir {key} nie.',
    calibrateNeedsTokens: 'Kies een of twee tokens wat aan heksende middelpunte geknip is.',
    calibrateFailed: 'Daardie tekens kan nie gebruik word om te kalibreer nie.',
    unexpected: 'Iets het verkeerd geloop: {message}',
  },
  hints: {
    noPage: 'Maak die bladsy oop waaraan jy wil werk, of kies iets daarop.',
    notHex: 'Stel die bladsyrooster op Hex (V) of Hex (H) in Bladsy-instellings.',
    noPolygons:
      "Teken 'n veelhoek, reghoek, ellips of vryhandvorm om die area, kies dit en probeer dan weer.",
    emptyArea: "Teken 'n groter vorm, of gaan die bladsyroosterinstellings na.",
    tooMany: 'Vul `n kleiner area, of verdeel die area in verskeie vorms.',
    noHexes: 'Hekse is op die voorgrond of tekenlaag; skakel oor na daardie laag om hulle te kies.',
    unknownCommand: 'Tik !hexploration help om die opdragte te lys.',
    unknownSetting: 'Tik !hexploration set om elke instelling te sien.',
    calibrateNeedsTokens:
      "Knip 'n teken in die middel van 'n hekshoek en kies dit. Kies 'n tweede teken wat aan 'n naburige heks in dieselfde ry (Hex V) of kolom (Hex H) geknip is om ook die heksgrootte reg te stel.",
    calibrateFailed:
      'Twee tekens moet in dieselfde ry (Hex V) of dieselfde kolom (Hex H) wees, ten minste een heks van mekaar.',
    unexpected: 'Besonderhede is in die API-konsole-logboek.',
  },
  help: {
    menu: 'Wys die spyskaart.',
    fill: 'Bedek die geselekteerde getekende vorms met hekse.',
    fillInverse: 'Bedek die hele bladsy behalwe binne die geselekteerde vorms.',
    undo: 'Ontdoen die laaste vulling, omgekeerde vulling of versteek, en herstel die vorms wat dit gebruik het.',
    reveal: 'Onthul die geselekteerde hekse, en die hekse onder die geselekteerde vorms en tekens.',
    revealPage: 'Onthul elke heksie op die bladsy sonder aankondigings.',
    conceal: 'Bedek die area onder die geselekteerde vorms en tekens weer met hekkies.',
    explore: 'Onthul rondom die geselekteerde tekens asof hulle net daarheen verhuis het.',
    resetPage: 'Verwyder elke heks op die bladsy (vra eers).',
    name: 'Noem die geselekteerde hekse, of die hekse onder die geselekteerde tokens. Laat die naam leeg om dit skoon te maak.',
    mark: 'Verander die geselekteerde tekens in versteekte liggings.',
    unmark: 'Stop dat die geselekteerde tokens versteekte liggings is.',
    set: "Verander 'n instelling, of wys alle instellings.",
    pageSet: "Ignoreer slegs 'n onthulling-instelling op die huidige bladsy.",
    pageClear: 'Verwyder die huidige bladsy se ignorering.',
    rescan:
      "Herbou die bladsy se hex lys, byvoorbeeld nadat jy 'n bladsy of speletjie gekopieer het.",
    calibrate:
      'Voer die hekselrooster uit met een of twee geselekteerde tokens wat aan heksmiddelmiddels vasgemaak is.',
    calibrateReset: 'Verwyder die huidige bladsy se kalibrasie.',
    status: 'Wys wat Hexploration van die huidige bladsy weet.',
    journal: 'Herbou die hulp- en beveldek-uitdeelstukke.',
    help: 'Wys hierdie lys.',
    handout: 'Volledige instruksies is in die "{name}"-uitdeelstuk.',
  },
  deck: {
    subtitle: 'Beveldek',
    drawDesc: "Teken vorms om 'n area, kies hulle en vul dan. Ontdoen keer die laaste vulling om.",
    revealDesc:
      'Kies hekkies, vorms of tekens om dit weer te openbaar of te bedek. Verken onthullings rondom geselekteerde tekens asof hulle beweeg het.',
    locationsDesc:
      "Kies tekens om hulle as liggings onder hekkies te versteek. Kies hekkies of tekens om 'n heks te noem.",
    toolsDesc:
      'Instellings, bladsy ignoreer, status, herskandeer van gekopieerde bladsye en kalibrering van die rooster.',
    footer: 'Sien die "{help}"-uitdeelstuk vir volledige instruksies.',
  },
  handout: {
    versionLabel: 'Weergawe',
    subtitle: 'Heks-vir-heks verkenning vir Roll20',
    footer: 'Gebruik die "{deck}"-uitdeelstuk vir een-klik kontroles.',
    overview: {
      heading: 'Oorsig',
      body: "Heksplorasie dek 'n hekskaart met ondeursigtige hekse. Soos die party beweeg, word die hekkies waardeur hulle gaan (en, as jy wil, die hekse rondom hulle) verwyder, sodat die kaart een hek op 'n slag ontbloot word. Versteekte liggings kan onder hekkies geplaas word en word aangekondig wanneer dit gevind word. Dit werk in Jumpgate en Legacy-speletjies, op Hex (V) en Hex (H) roosters van enige grootte.",
      demo: "Kyk na 'n kort demonstrasie (vanaf weergawe 1)",
    },
    quickStart: {
      heading: 'Vinnige Begin',
      steps: [
        "Maak 'n bladsy oop waarvan die rooster op Hex (V) of Hex (H) gestel is.",
        'Teken een of meer vorms (veelhoek, reghoek, ellips of vryhand) om die area om weg te steek.',
        'Kies die vorms en klik Vul die Command Deck in (of tik !hexploration fill). Die vorms word deur hekse vervang.',
        'Opsioneel: voor invul, kies tekens vir belangrike plekke en klik Merk ligging. Hulle word onder die hekse versteek en aangekondig wanneer hulle ontdek word.',
        "Beweeg 'n spelertoken. Elke heks wat dit deurgaan, en die hekse binne sy sigafstand, word geopenbaar.",
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
        'Slegs tekens op die tekenlaag openbaar hekse. Watter tokens telling word bepaal deur Tokens That Reveal: speler tokens by verstek, sodat die GM monsters kan skuif sonder om die kaart te ontbloot.',
        "'n Teken onthul elke hek wat dit dek (groot tokens dek verskeie) en, met Reveal Along Path op, elke hek op die roete wat dit meegesleep is, insluitend waypoints.",
        "Sigafstand openbaar die hekse rondom elkeen van daardie hekse. Met siglyn aan, word 'n hekshoek slegs geopenbaar as geen bedekte heks tussenin lê nie.",
        "Hex Reveal Distance word op hekse gestoor soos hulle geteken word. Daardie hekse word net van binne geopenbaar soveel hekse, hoe ver 'n teken ook al kan sien. Gebruik dit vir berge of woude wat versteek wat agter hulle is.",
        "In Glimpse-modus word hekkies binne sig deurskynend in plaas daarvan om te verdwyn, en word verwyder wanneer 'n teken hulle binnekom.",
        'Die API rapporteer nie bewegings wat deur ander mods gemaak is nie. TokenMod-skuiwe word outomaties opgetel; vir ander mods, kies die tokens en klik Explore, of bel Hexploration.revealAround(token) vanaf jou eie mod.',
        'Die API rapporteer nie bewegings wat deur ander mods gemaak is nie. TokenMod-skuiwe word outomaties opgetel; vir ander mods, kies die tokens en klik Explore, of bel Hexploration.revealAround(token) vanaf jou eie mod.',
      ],
    },
    locations: {
      heading: 'Genoemde hekse en liggings',
      points: [
        "Merk ligging verander die geselekteerde tekens in versteekte liggings. 'n Teken wat reeds onder 'n heksel is, word dadelik weggesteek; anders word dit weggesteek deur die volgende vul wat dit bedek.",
        'Tekens met die wittoringstatusmerker word ook as liggings hanteer wanneer jy invul, soos in weergawe 1.',
        'Versteekte liggingtokens word na die GM-laag geskuif. Wanneer hul heks onthul word, keer hulle terug na die tekenlaag met hul naam gewys, en hul ontdekking word aangekondig.',
        "Name Hex gee 'n hex 'n naam sonder 'n teken. Die naam word aan die GM gewys as 'n etiket op die GM-laag en aangekondig wanneer die heksel bekend gemaak word.",
        'Announce Discoveries kies of almal, net die GM, of niemand die aankondiging sien nie. Ping Discoveries skuif ook die spelers se uitsig na die ligging.',
      ],
    },
    settings: {
      heading: 'Instellings',
      intro:
        'Verander instellings met !hexploration set (of die Instellings-knoppie). Hex Layer, Tokens That Reveal en Language kan ook op die Mod se instellingsbladsy ingestel word.',
      colKey: 'Sleutel',
      colName: 'Instelling',
      colDesc: 'Beskrywing',
      perPage: '(Kan per bladsy gestel word.)',
    },
    jumpgate: {
      heading: 'Jumpgate en Legacy',
      points: [
        'Heeksplorasie werk uit watter enjin die speletjie gebruik en teken die bypassende soort vorm. Vorms wat in enige redigeerder geteken is, kan gevul word.',
        'Met Hex Layer op Outo gestel, word hekse op die voorgrondlaag bo tekens geteken, sodat spelers nie kan sien wat onder is nie. As die voorgrondlaag nie beskikbaar is nie, word die tekenlaag eerder gebruik.',
        "Jumpgate teken wiskundig gereelde hekse, wat 'n effens ander vorm as Legacy hekse is. As die hekkies nie in lyn is met 'n bladsy se rooster nie, plak 'n teken na 'n heksasiemiddel, kies dit en klik Kalibreer. Kies twee tekens in naburige heks van dieselfde ry (Hex V) of kolom (Hex H) om die heksgrootte ook reg te stel.",
        "Wanneer 'n bladsy of speletjie gekopieer word, kry sy hekkies nuwe ID's. Begin Rescan op die bladsy om hulle weer op te tel, saam met hul naametikette en liggingtokens.",
      ],
    },
    upgrading: {
      heading: 'Opgradering vanaf weergawe 1',
      points: [
        "Weergawe 2 het nie meer PathMath, MatrixMath, Vector Math of HTML Builder nodig nie. Jy kan hulle verwyder tensy 'n ander mod dit gebruik.",
        'Bestaande hekskaarte, name, liggingtekens en instellings word outomaties opgegradeer met die eerste aanvang.',
        'Die weergawe 1-opdragte, insluitend die Hexploration_menu-makro, werk steeds.',
        "Weergawe 1 laat enige teken wat 'n karakter verteenwoordig, hekse openbaar. Stel tekens wat openbaar op karaktertekens om daardie gedrag te behou.",
      ],
      colV1: 'Weergawe 1 opdrag',
      colV2: 'Weergawe 2 opdrag',
    },
    troubleshooting: {
      heading: 'Probleemoplossing',
      points: [
        "Niks gebeur wanneer 'n teken beweeg nie: maak seker dat die teken op die tekenlaag is en ooreenstem met Tokens That Reveal, en dat die bladsy hekse het (!hexploration-status).",
        "Hekse is verreken van die rooster: gebruik Kalibreer, kyk dan met 'n teken op 'n paar hekse oor die kaart.",
        "Hexes het opgehou om te openbaar nadat 'n bladsy of speletjie gekopieer is: hardloop Rescan op die bladsy.",
        'Fill sê die area het geen hekselmiddels nie: die vorm moet die middelpunt van ten minste een hekshoek bevat.',
        'Vir enigiets anders, gaan die API-konsole-logboek na en sluit sy boodskappe in wanneer jy om hulp vra.',
      ],
    },
    languages: {
      heading: 'Tale',
      body: "Kies 'n taal met !hexploration stel taal. Beskikbare tale:",
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
