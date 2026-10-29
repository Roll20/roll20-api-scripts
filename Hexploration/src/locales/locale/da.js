const TRANSLATION = {
  titles: {
    ready: 'Hexploration er klar.',
    settings: 'Indstillinger for Hexploration',
    languages: 'Vælg et sprog',
    pageSettings: 'Sideindstillinger: {page}',
    status: 'Hexploration Status: {page}',
    help: 'Hexploration kommandoer',
    confirm: 'Bekræft venligst',
  },
  discovery: {
    title: 'Sted opdaget',
  },
  menu: {
    draw: 'Tegne',
    reveal: 'Afsløre og skjul',
    locations: 'Steder',
    tools: 'Værktøjer',
    layerInUse: 'Nye sekskanter bliver tegnet på {layer}.',
    pageSettingsHelp:
      'Disse indstillinger gælder kun for denne side. Indstillinger markeret ★ tilsidesætter de globale indstillinger.',
  },
  buttons: {
    fill: 'Fylde',
    fillInverse: 'Omvendt fyld',
    undo: 'Fortryd Fyld',
    reveal: 'Afsløre',
    conceal: 'Skjule',
    explore: 'Udforske',
    revealPage: 'Afsløre side',
    resetPage: 'Nulstil side',
    mark: 'Marker placering',
    unmark: 'Fjern markering',
    name: 'Navn Hex',
    settings: 'Indstillinger',
    pageSettings: 'Sideindstillinger',
    status: 'Status',
    rescan: 'Scan igen',
    calibrate: 'Kalibrer',
    calibrateReset: 'Nulstil kalibrering',
    help: 'Hjælp',
    change: 'Forandring',
    menu: 'Menu',
    clearOverrides: 'Ryd tilsidesættelser',
    confirmReset: 'Ja, Fjern alle Hexes',
  },
  prompts: {
    name: 'Placeringsnavn (lad tom for at rydde)',
  },
  values: {
    on: 'På',
    off: 'Slukket',
    none: 'Ingen',
    hexLayer: {
      auto: 'Auto (forgrund, hvis tilgængelig)',
      foreground: 'forgrundslaget',
      objects: 'symbollag',
    },
    revealBy: {
      players: 'Spillerpoletter',
      characters: 'Karakter tokens',
      all: 'Alle tokens',
    },
    revealMode: {
      clear: 'Klar',
      glimpse: 'Glimt',
    },
    announce: {
      all: 'Alle sammen',
      gm: 'Kun GM',
      off: 'Slukket',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Fylde',
      fillInverse: 'Omvendt fyld',
      conceal: 'Skjule',
    },
  },
  settings: {
    language: {
      label: 'Sprog',
      desc: 'Sprog til menuer, beskeder og uddelingskopier.',
    },
    hexLayer: {
      label: 'Hex lag',
      desc: 'Hvor nye sekskanter tegnes. Auto prøver forgrundslaget (over tokens) og falder tilbage til tokenlaget, hvis spillet ikke understøtter det.',
    },
    fillColor: {
      label: 'Fyld farve',
      desc: 'Farve på nye sekskanter. Brug rgba() til gennemsigtige hexes, for eksempel rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Kantfarve',
      desc: 'Farve på omridset af nye sekskanter.',
    },
    labelColor: {
      label: 'Etiket farve',
      desc: 'Farven på GM-only navneetiketter på navngivne sekskanter.',
    },
    glimpseColor: {
      label: 'Glimt farve',
      desc: 'Farvehexer ændres til, når de skimtes (Glimpse-afsløringstilstand). Brug en gennemsigtig rgba()-farve.',
    },
    strokeWidth: {
      label: 'Border Bredde',
      desc: 'Bredden af ​​omridset af nye sekskanter, i pixels (0 til 20).',
    },
    maxDistance: {
      label: 'Hex afsløre afstand',
      desc: 'Anvendes på hexes, efterhånden som de tegnes: Et symbol skal være inden for så mange hexes for at afsløre dem, uanset hvor langt det kan se. Lad være tomt uden grænse.',
    },
    revealDistance: {
      label: 'Synsafstand',
      desc: 'Hvor mange sekskanter omkring et bevægeligt token afsløres (0 til 20). 0 afslører kun de sekskanter, som tokenet passerer igennem.',
    },
    lineOfSight: {
      label: 'Synslinie',
      desc: 'Når den er aktiveret, afsløres en hex kun, hvis der ikke er nogen dækket hex mellem den og tokenet.',
    },
    revealPath: {
      label: 'Afsløre langs stien',
      desc: 'Når den er tændt, afsløres hver hex, et token passerer igennem, mens det trækkes (inklusive waypoints), ikke kun hvor det stopper.',
    },
    revealBy: {
      label: 'Tokens, der afslører',
      desc: 'Hvilke tokens på tokenlaget afslører hexes: tokens kontrolleret af en spiller, tokens, der repræsenterer en hvilken som helst karakter, eller hver token.',
    },
    revealMode: {
      label: 'Afsløringstilstand',
      desc: 'Clear fjerner sekskanter inden for syne. Glimt gør dem gennemsigtige i stedet; de fjernes, når et token kommer ind i dem.',
    },
    announce: {
      label: 'Annoncer opdagelser',
      desc: 'Hvem ser chatbeskeden, når en navngivet placering opdages.',
    },
    pingDiscoveries: {
      label: 'Ping opdagelser',
      desc: 'Når den er aktiveret, bliver spillere pinget til en navngiven placering, når den opdages.',
    },
    hideCoveredTokens: {
      label: 'Skjul dækkede tokens',
      desc: 'Roll20 tegner navne, streger og auraer over sekskanter. Når den er tændt, har tokens under en dækket sekskant deres spillersynlige navn, bjælker og auraer slået fra og tændt igen, når de afsløres.',
    },
  },
  status: {
    engine: 'Spil motor',
    grid: 'Gitter',
    layer: 'Hex lag',
    hexes: 'Hekser',
    named: 'Navngivne hexes',
    icons: 'Placeringstokens',
    glimpsed: 'Glimpede sekskanter',
    pending: 'Steder, der venter på udfyldning',
    calibrated: 'Kalibreret',
    overrides: 'Side tilsidesætter',
    undo: 'Fortryd tilgængelig',
  },
  messages: {
    filled: 'Fyld færdig. Hexer tegnede: {created}. Omstilet: {restyled}. Steder skjult: {icons}.',
    revealed: 'Hexer afsløret: {count}.',
    revealedPage: 'Hver hex på siden afsløret ({count}).',
    confirmReset:
      'Vil du fjerne hver hex fra "{page}" ({count})? Placeringstokens vender tilbage til tokenlaget. Fortryd kan ikke fortryde dette.',
    resetPage: 'Hexer fjernet fra siden: {count}.',
    undone:
      'Sidste udfyldning fortrydet. Hekser fjernet: {removed}. Restyled hexes gendannet: {restored}.',
    named: 'Hexer med navnet "{name}": {count}.',
    unnamed: 'Navne ryddet: {count}.',
    marked:
      'Placeringer skjult i eksisterende hexes: {attached}. Venter på den næste fyldning, der dækker dem: {pending}.',
    unmarked: 'Tokens, der ikke længere er placeringer: {count}.',
    settingChanged: '{setting} indstillet til {value}.',
    rescanned:
      'Genscanning fuldført. Gemt: {kept}. Vedtaget: {adopted}. Genindgivet: {moved}. Manglende og glemt: {dropped}. Etiketter genlinket: {labels}. Placeringstokens genlinket: {icons}.',
    calibrated:
      'Gitter kalibreret (kolonnetrin {colStep}px, rækketrin {rowStep}px). Genscan: beholdt {kept}, genindsendt {moved}, adopteret {adopted}.',
    calibrationReset:
      'Kalibrering fjernet. Genscan: beholdt {kept}, genindleveret {moved}, adopteret {adopted}.',
    journalRebuilt: 'Uddelingsarkene "{help}" og "{deck}" er blevet genopbygget.',
    migrated:
      'Dine Hexploration 1.x hex-kort er blevet opgraderet. Hvis dette spil blev kopieret fra et Legacy-spil, skal du køre Rescan på hver hex-kortside.',
    pruned:
      'Gemte hexes, der ikke længere eksisterer og blev glemt: {dropped}. Hvis dette spil eller denne side blev kopieret, skal du køre Rescan på siden for at samle dens hexes op igen.',
    readyHint:
      'Skriv !hexploration for menuen, eller åbn "Hexploration - Command Deck"-uddelingsark.',
  },
  warnings: {
    foregroundUnavailable:
      'Dette spil understøtter ikke tegning på forgrundslaget, så der blev tegnet sekskanter på tokenlaget.',
    someFailed: 'Hexer, der ikke kunne tegnes: {count}. Tjek API-konsollen for detaljer.',
  },
  errors: {
    noPage: 'Kunne ikke finde siden at arbejde på.',
    notHex: 'Denne side bruger ikke et hex-gitter.',
    noPolygons: 'Vælg en eller flere tegnede figurer, der skal udfyldes.',
    emptyArea: 'Det valgte område indeholder ingen hex-centre.',
    tooMany: 'Det ville skabe for mange hexes på én gang ({count}).',
    nothingToConceal: 'Vælg tegnede figurer eller tokens til at skjule.',
    nothingToReveal: 'Vælg sekskanter, tegnede figurer eller tokens for at afsløre.',
    noTokens: 'Vælg først et eller flere tokens.',
    noHexes: 'Vælg først en eller flere hexes (eller poletter stående på hexes).',
    nothingToUndo: 'Der er ingen udfyldning at fortryde.',
    unknownCommand: 'Ukendt kommando: {command}',
    unknownSetting: 'Ukendt indstilling: {key}',
    unknownPageSetting: 'Indstillinger, der kan indstilles pr. side: {keys}',
    invalidValue: '"{value}" er ikke en gyldig værdi for {key}.',
    calibrateNeedsTokens: 'Vælg et eller to tokens fastgjort til hex-centre.',
    calibrateFailed: 'Disse tokens kan ikke bruges til at kalibrere.',
    unexpected: 'Noget gik galt: {message}',
  },
  hints: {
    noPage: 'Åbn den side, du vil arbejde på, eller vælg noget på den.',
    notHex: 'Indstil sidegitteret til Hex (V) eller Hex (H) i Sideindstillinger.',
    noPolygons:
      'Tegn en polygon, et rektangel, en ellipse eller en frihåndsform rundt om området, vælg det, og prøv derefter igen.',
    emptyArea: 'Tegn en større form, eller kontroller indstillingerne for sidegitteret.',
    tooMany: 'Udfyld et mindre område, eller opdel området i flere former.',
    noHexes: 'Hekser er på forgrunden eller symbollaget; skift til det lag for at vælge dem.',
    unknownCommand: 'Skriv !hexploration help for at vise kommandoerne.',
    unknownSetting: 'Skriv !hexploration set for at se alle indstillinger.',
    calibrateNeedsTokens:
      'Snap et token til midten af ​​en sekskant, og vælg det. Vælg en anden token, der er snappet til en tilstødende hex i samme række (Hex V) eller kolonne (Hex H) for også at rette hex-størrelsen.',
    calibrateFailed:
      'To tokens skal være i samme række (Hex V) eller den samme kolonne (Hex H), med mindst én hex fra hinanden.',
    unexpected: 'Detaljer er i API-konsolloggen.',
  },
  help: {
    menu: 'Vis menuen.',
    fill: 'Dæk de valgte tegnede figurer med sekskanter.',
    fillInverse: 'Dæk hele siden undtagen inde i de valgte former.',
    undo: 'Fortryd den sidste fyldning, omvendt fyld eller skjul, og gendan de former, den brugte.',
    reveal: 'Afslør de valgte hexes og hexes under de valgte former og tokens.',
    revealPage: 'Afslør hver hex på siden uden meddelelser.',
    conceal: 'Dæk området under de valgte former og tokens med sekskanter igen.',
    explore: 'Afslør omkring de valgte tokens, som om de lige var flyttet dertil.',
    resetPage: 'Fjern hver hex på siden (spørg først).',
    name: 'Navngiv de valgte hexes, eller hexes under de valgte tokens. Lad navnet stå tomt for at rydde det.',
    mark: 'Gør de valgte tokens til skjulte placeringer.',
    unmark: 'Stop de valgte tokens med at være skjulte placeringer.',
    set: 'Skift en indstilling, eller vis alle indstillinger.',
    pageSet: 'Tilsidesæt kun en afsløringsindstilling på den aktuelle side.',
    pageClear: 'Fjern den aktuelle sides tilsidesættelser.',
    rescan: 'Genopbyg sidens hex-liste, for eksempel efter at have kopieret en side eller et spil.',
    calibrate:
      'Sæt hex-gitteret på linje med et eller to udvalgte tokens, der er fastgjort til hex-centre.',
    calibrateReset: 'Fjern den aktuelle sides kalibrering.',
    status: 'Vis, hvad Hexploration ved om den aktuelle side.',
    journal: 'Genopbyg hjælpe- og kommandodækket-uddelingsarkene.',
    help: 'Vis denne liste.',
    handout: 'Fuldstændige instruktioner findes i "{name}" uddelingsark.',
  },
  deck: {
    subtitle: 'Kommandodæk',
    drawDesc:
      'Tegn figurer rundt om et område, vælg dem, og udfyld derefter. Fortryd vender den sidste udfyldning.',
    revealDesc:
      'Vælg sekskanter, former eller tokens for at afsløre eller dække dem igen. Udforsk afsløringer omkring udvalgte tokens, som om de havde flyttet sig.',
    locationsDesc:
      'Vælg tokens for at skjule dem som placeringer under hexes. Vælg hexes eller tokens for at navngive en hex.',
    toolsDesc:
      'Indstillinger, sidetilsidesættelser, status, genscanning af kopierede sider og kalibrering af gitteret.',
    footer: 'Se "{help}"-uddelingsark for fuldstændige instruktioner.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Hex-by-hex-udforskning for Roll20',
    footer: 'Brug "{deck}"-uddelingsark til kontrolelementer med et enkelt klik.',
    overview: {
      heading: 'Oversigt',
      body: 'Hexploration dækker et hex-kort med uigennemsigtige hexes. Efterhånden som partiet bevæger sig, fjernes de hexes, de passerer igennem (og, hvis du vil, hexes omkring dem), så kortet afsløres en hex ad gangen. Skjulte placeringer kan placeres under hexes og annonceres, når de findes. Det fungerer i Jumpgate og Legacy-spil, på Hex (V) og Hex (H) gitter af enhver størrelse.',
      demo: 'Se en kort demo (fra version 1)',
    },
    quickStart: {
      heading: 'Hurtig start',
      steps: [
        'Åbn en side, hvis gitter er indstillet til Hex (V) eller Hex (H).',
        'Tegn en eller flere figurer (polygon, rektangel, ellipse eller frihånd) rundt om området for at skjule.',
        'Vælg figurerne, og klik på Fyld i kommandodækket (eller skriv !hexploration fill). Formerne erstattes af sekskanter.',
        'Valgfrit: Inden du udfylder, skal du vælge tokens for vigtige steder og klikke på Marker placering. De er gemt under hexes og annonceret, når de opdages.',
        'Flyt et spillertoken. Hver hex, den passerer igennem, og hexes inden for dens synsafstand, afsløres.',
      ],
    },
    commands: {
      heading: 'Kommandoer',
      intro:
        "Kun GM'er kan bruge disse kommandoer. De fleste handler på de valgte objekter; resten handler på den side, du ser.",
      colCommand: 'Kommando',
      colDesc: 'Hvad den gør',
    },
    revealing: {
      heading: 'Sådan fungerer afsløring',
      points: [
        'Kun tokens på tokenlaget afslører sekskanter. Hvilket antal tokens er angivet af Tokens That Reveal: spillerpoletter som standard, så GM kan flytte monstre uden at afdække kortet.',
        'Et token afslører hver hex, den dækker (store tokens dækker flere), og med Reveal Along Path aktiveret, hver hex på den rute, den blev trukket langs, inklusive waypoints.',
        'Sight Distance afslører sekskanterne omkring hver af disse sekskanter. Med Line of Sight slået til, afsløres en hex kun, hvis der ikke ligger nogen dækket hex imellem.',
        'Hex Reveal Distance gemmes på hexes, efterhånden som de tegnes. Disse hexes afsløres kun indefra så mange hexes, uanset hvor langt et token kan se. Brug den til bjerge eller skove, der skjuler, hvad der er bag dem.',
        'I Glimpse-tilstand bliver sekskanter inden for synsvidde gennemsigtige i stedet for at forsvinde, og fjernes, når et token kommer ind i dem.',
        "API'en rapporterer ikke bevægelser foretaget af andre mods. TokenMod-træk opfanges automatisk; for andre mods, vælg tokens og klik på Udforsk, eller ring til Hexploration.revealAround(token) fra din egen mod.",
        "API'en rapporterer ikke bevægelser foretaget af andre mods. TokenMod-træk opfanges automatisk; for andre mods, vælg tokens og klik på Udforsk, eller ring til Hexploration.revealAround(token) fra din egen mod.",
      ],
    },
    locations: {
      heading: 'Navngivne Hekser og Steder',
      points: [
        'Mark Location forvandler de valgte tokens til skjulte placeringer. Et token, der allerede er under en hex, gemmes med det samme; ellers er det skjult af det næste fyld, der dækker det.',
        'Tokens med det hvide tårns statusmarkør behandles også som placeringer, når du udfylder, som i version 1.',
        'Skjulte placeringstokens flyttes til GM-laget. Når deres hex afsløres, vender de tilbage til token-laget med deres navn vist, og deres opdagelse annonceres.',
        'Navn Hex giver en hex et navn uden token. Navnet vises til GM som en etiket på GM-laget og annonceres, når hexen afsløres.',
        'Announce Discoveries vælger, om alle, kun GM, eller ingen ser meddelelsen. Ping Discoveries flytter også spillernes udsigt til placeringen.',
      ],
    },
    settings: {
      heading: 'Indstillinger',
      intro:
        "Skift indstillinger med !hexploration set (eller knappen Indstillinger). Hex Layer, Tokens That Reveal og Language kan også indstilles på Mod'ens indstillingsside.",
      colKey: 'Nøgle',
      colName: 'Indstilling',
      colDesc: 'Beskrivelse',
      perPage: '(Kan indstilles pr. side.)',
    },
    jumpgate: {
      heading: 'Jumpgate og Legacy',
      points: [
        'Hexploration finder ud af, hvilken motor spillet bruger, og tegner den matchende form. Figurer tegnet i begge editorer kan udfyldes.',
        'Med Hex Layer sat til Auto, tegnes hexes på forgrundslaget, over tokens, så spillere ikke kan se, hvad der er nedenunder. Hvis forgrundslaget ikke er tilgængeligt, bruges tokenlaget i stedet.',
        'Jumpgate tegner matematisk regulære hexes, som er en lidt anderledes form end Legacy hexes. Hvis hexene ikke stemmer overens med en sides gitter, skal du sætte et token til et hex-center, vælge det og klikke på Kalibrer. Vælg to tokens i tilstødende hexes i samme række (Hex V) eller kolonne (Hex H) for også at rette hex-størrelsen.',
        "Når en side eller et spil kopieres, får dets hexes nye id'er. Kør Rescan på siden for at samle dem op igen, sammen med deres navneetiketter og placeringstokens.",
      ],
    },
    upgrading: {
      heading: 'Opgradering fra version 1',
      points: [
        'Version 2 behøver ikke længere PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan fjerne dem, medmindre en anden mod bruger dem.',
        'Eksisterende hex-kort, navne, placeringstokens og indstillinger opgraderes automatisk ved første start.',
        'Version 1-kommandoerne, inklusive makroen Hexploration_menu, virker stadig.',
        'Version 1 lader enhver token, der repræsenterede en karakter, afsløre hexes. Indstil Tokens That Reveal til Character-tokens for at bevare denne adfærd.',
      ],
      colV1: 'Version 1 kommando',
      colV2: 'Version 2 kommando',
    },
    troubleshooting: {
      heading: 'Fejlfinding',
      points: [
        'Der sker ikke noget, når et token bevæger sig: Kontroller, at tokenet er på tokenlaget og matcher Tokens That Reveal, og at siden har hexes (!hexploration-status).',
        'Hexes er forskudt fra gitteret: Brug Kalibrer, og tjek derefter med et token på et par hexes på tværs af kortet.',
        'Hexes stoppede med at afsløre efter kopiering af en side eller et spil: kør Rescan på siden.',
        'Fill siger, at området ikke har nogen hex-centre: Formen skal indeholde midten af ​​mindst én hex-centre.',
        'For alt andet skal du tjekke API-konsolloggen og inkludere dens meddelelser, når du beder om hjælp.',
      ],
    },
    languages: {
      heading: 'Sprog',
      body: 'Vælg et sprog med !hexploration set sprog. Tilgængelige sprog:',
      colLanguage: 'Sprog',
      colNative: 'Indfødt navn',
      colCode: 'Kode',
    },
    credits: {
      heading: 'Kreditter',
      original: 'Original mod af',
      maintainer: 'Version 2 vedligeholdes af',
      marketplace: 'Adas kunstpakker på Roll20 Marketplace',
      support:
        'Hvis du finder en fejl eller har en idé, skal du skrive i Roll20 Mod-forummet eller åbne et problem på GitHub og inkludere eventuelle meddelelser fra API-konsollens log.',
    },
  },
};

export default TRANSLATION;
