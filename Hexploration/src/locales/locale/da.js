const TRANSLATION = {
  titles: {
    ready: 'Hexploration er klar.',
    settings: 'Indstillinger for Hexploration',
    languages: 'Vælg et sprog',
    pageSettings: 'Sideindstillinger: {page}',
    status: 'Hexploration-status: {page}',
    help: 'Hexploration-kommandoer',
    confirm: 'Bekræft venligst',
  },
  discovery: {
    title: 'Sted opdaget',
  },
  menu: {
    draw: 'Tegn',
    reveal: 'Afslør og skjul',
    locations: 'Steder',
    tools: 'Værktøjer',
    layerInUse: 'Nye hexfelter tegnes på {layer}.',
    pageSettingsHelp:
      'Disse indstillinger gælder kun for denne side. Indstillinger markeret ★ tilsidesætter de globale indstillinger.',
  },
  buttons: {
    fill: 'Fyld',
    fillInverse: 'Omvendt fyld',
    undo: 'Fortryd fyld',
    reveal: 'Afslør',
    conceal: 'Skjul',
    explore: 'Udforsk',
    revealPage: 'Afslør side',
    resetPage: 'Nulstil side',
    mark: 'Marker sted',
    unmark: 'Fjern markering',
    name: 'Navngiv hexfelt',
    settings: 'Indstillinger',
    pageSettings: 'Sideindstillinger',
    status: 'Status',
    rescan: 'Scan igen',
    calibrate: 'Kalibrer',
    calibrateReset: 'Nulstil kalibrering',
    help: 'Hjælp',
    change: 'Skift',
    menu: 'Menu',
    clearOverrides: 'Ryd tilsidesættelser',
    confirmReset: 'Ja, fjern alle hexfelter',
  },
  prompts: {
    name: 'Stednavn (lad feltet være tomt for at rydde)',
  },
  values: {
    on: 'Til',
    off: 'Fra',
    none: 'Ingen',
    hexLayer: {
      auto: 'Auto (forgrund, hvis tilgængelig)',
      foreground: 'forgrundslaget',
      objects: 'tokenlaget',
    },
    revealBy: {
      players: 'Spillertokens',
      characters: 'Karaktertokens',
      all: 'Alle tokens',
    },
    revealMode: {
      clear: 'Fjern',
      glimpse: 'Glimt',
    },
    announce: {
      all: 'Alle',
      gm: 'Kun GM',
      off: 'Fra',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Fyld',
      fillInverse: 'Omvendt fyld',
      conceal: 'Skjul',
    },
  },
  settings: {
    language: {
      label: 'Sprog',
      desc: 'Sprog til menuer, beskeder og uddelingskopier.',
    },
    hexLayer: {
      label: 'Lag for hexfelter',
      desc: 'Hvor nye hexfelter tegnes. Auto prøver forgrundslaget (over tokens) og falder tilbage til tokenlaget, hvis spillet ikke understøtter det.',
    },
    fillColor: {
      label: 'Fyldfarve',
      desc: 'Farve på nye sekskanter. Brug rgba() til gennemsigtige hexes, for eksempel rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Kantfarve',
      desc: 'Farve på omridset af nye sekskanter.',
    },
    labelColor: {
      label: 'Etiketfarve',
      desc: 'Farven på GM-only navneetiketter på navngivne sekskanter.',
    },
    glimpseColor: {
      label: 'Glimtfarve',
      desc: 'Den farve, hexfelter skifter til, når de skimtes (afsløringstilstanden Glimt). Brug en gennemsigtig rgba()-farve.',
    },
    strokeWidth: {
      label: 'Kantbredde',
      desc: 'Bredden af ​​omridset af nye sekskanter, i pixels (0 til 20).',
    },
    maxDistance: {
      label: 'Afsløringsafstand for hexfelter',
      desc: 'Anvendes på hexes, efterhånden som de tegnes: Et symbol skal være inden for så mange hexes for at afsløre dem, uanset hvor langt det kan se. Lad være tomt uden grænse.',
    },
    revealDistance: {
      label: 'Synsafstand',
      desc: 'Hvor mange sekskanter omkring et bevægeligt token afsløres (0 til 20). 0 afslører kun de sekskanter, som tokenet passerer igennem.',
    },
    lineOfSight: {
      label: 'Synslinje',
      desc: 'Når den er aktiveret, afsløres en hex kun, hvis der ikke er nogen dækket hex mellem den og tokenet.',
    },
    revealPath: {
      label: 'Afslør langs ruten',
      desc: 'Når den er tændt, afsløres hver hex, et token passerer igennem, mens det trækkes (inklusive waypoints), ikke kun hvor det stopper.',
    },
    revealBy: {
      label: 'Afslørende tokens',
      desc: 'Hvilke tokens på tokenlaget afslører hexes: tokens kontrolleret af en spiller, tokens, der repræsenterer en hvilken som helst karakter, eller hver token.',
    },
    revealMode: {
      label: 'Afsløringstilstand',
      desc: 'Fjern fjerner hexfelter inden for synsvidde. Glimt gør dem i stedet gennemsigtige; de fjernes, når et token går ind i dem.',
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
    engine: 'Spilmotor',
    grid: 'Gitter',
    layer: 'Lag for hexfelter',
    hexes: 'Hexfelter',
    named: 'Navngivne hexfelter',
    icons: 'Stedtokens',
    glimpsed: 'Gennemsigtige hexfelter',
    pending: 'Steder, der venter på fyld',
    calibrated: 'Kalibreret',
    overrides: 'Sidetilsidesættelser',
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
      'Dine Hexploration 1.x-hexkort er blevet opgraderet. Hvis dette spil blev kopieret fra et Legacy-spil, skal du køre Scan igen på hver side med et hexkort.',
    pruned:
      'Gemte hexfelter, der ikke længere findes og er blevet glemt: {dropped}. Hvis dette spil eller denne side blev kopieret, skal du køre Scan igen på siden for at finde dens hexfelter igen.',
    readyHint:
      'Skriv !hexploration for at åbne menuen, eller åbn uddelingsarket "Hexploration - Command Deck".',
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
    journal: 'Genopbyg uddelingsarkene Help og Command Deck.',
    help: 'Vis denne liste.',
    handout: 'Fuldstændige instruktioner findes i "{name}" uddelingsark.',
  },
  deck: {
    drawDesc:
      'Tegn figurer rundt om et område, vælg dem, og fyld derefter. Fortryd fyld annullerer den sidste fyldning.',
    revealDesc:
      'Vælg hexfelter, figurer eller tokens for at afsløre dem eller dække dem igen. Udforsk afslører omkring valgte tokens, som om de var flyttet.',
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
        'Vælg figurerne, og klik på Fyld i Command Deck (eller skriv !hexploration fill). Figurerne erstattes af hexfelter.',
        'Valgfrit: Før du fylder, kan du vælge tokens for vigtige steder og klikke på Marker sted. De skjules under hexfelterne og annonceres, når de opdages.',
        'Flyt et spillertoken. Hvert hexfelt, det passerer igennem, og hexfelterne inden for dets Synsafstand afsløres.',
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
        'Kun tokens på tokenlaget afslører hexfelter. Hvilke tokens der tæller, bestemmes af Afslørende tokens: som standard spillertokens, så GM kan flytte monstre uden at afdække kortet.',
        'Et token afslører hvert hexfelt, det dækker (store tokens dækker flere), og med Afslør langs ruten slået til hvert hexfelt på den rute, det blev trukket langs, inklusive mellempunkter.',
        'Synsafstand afslører hexfelterne omkring hvert af disse hexfelter. Med Synslinje slået til afsløres et hexfelt kun, hvis der ikke ligger noget dækket hexfelt imellem.',
        'Afsløringsafstand for hexfelter gemmes på hexfelterne, når de tegnes. Disse hexfelter afsløres kun inden for så mange hexfelters afstand, uanset hvor langt et token kan se. Brug det til bjerge eller skove, der skjuler, hvad der ligger bag dem.',
        'I tilstanden Glimt bliver hexfelter inden for synsvidde gennemsigtige i stedet for at forsvinde og fjernes, når et token går ind i dem.',
        'Roll20 tegner tokennavne, bjælker og auraer oven over hexfelterne. Med Skjul dækkede tokens slået til får et token under et dækket hexfelt sit navn, sine bjælker og auraer, som spillerne kan se, slået fra, indtil det afdækkes, så skjulte monstre ikke afslører sig selv. Hvis du slår en af dem til, mens tokenet er dækket, forbliver den skjult og slås til, når tokenet afdækkes.',
        'API’en rapporterer ikke flytninger foretaget af andre mods. Flytninger med TokenMod opfanges automatisk; for andre mods skal du vælge tokens og klikke på Udforsk eller kalde Hexploration.revealAround(token) fra din egen mod.',
      ],
    },
    locations: {
      heading: 'Navngivne Hekser og Steder',
      points: [
        'Marker sted forvandler de valgte tokens til skjulte steder. Et token, der allerede ligger under et hexfelt, skjules med det samme; ellers skjules det af den næste fyldning, der dækker det.',
        'Tokens med det hvide tårns statusmarkør behandles også som placeringer, når du udfylder, som i version 1.',
        'Skjulte placeringstokens flyttes til GM-laget. Når deres hex afsløres, vender de tilbage til token-laget med deres navn vist, og deres opdagelse annonceres.',
        'Navngiv hexfelt giver et hexfelt et navn uden et token. Navnet vises for GM som en etiket på GM-laget og annonceres, når hexfeltet afsløres.',
        'Annoncer opdagelser bestemmer, om alle, kun GM eller ingen ser meddelelsen. Ping opdagelser flytter desuden spillernes visning hen til stedet.',
      ],
    },
    settings: {
      heading: 'Indstillinger',
      intro:
        'Skift indstillinger med !hexploration set (eller knappen Indstillinger). Lag for hexfelter, Afslørende tokens og Sprog kan også indstilles på modens indstillingsside.',
      colKey: 'Nøgle',
      colName: 'Indstilling',
      colDesc: 'Beskrivelse',
      perPage: '(Kan indstilles pr. side.)',
    },
    jumpgate: {
      heading: 'Jumpgate og Legacy',
      points: [
        'Hexploration finder ud af, hvilken motor spillet bruger, og tegner den matchende form. Figurer tegnet i begge editorer kan udfyldes.',
        'Når Lag for hexfelter er sat til Auto, tegnes hexfelter på forgrundslaget over tokens, så spillerne ikke kan se, hvad der er nedenunder. Hvis forgrundslaget ikke er tilgængeligt, bruges tokenlaget i stedet.',
        'Jumpgate tegner matematisk regulære hexfelter, som har en lidt anden form end Legacy-hexfelter. Hvis hexfelterne ikke flugter med en sides gitter, så fastgør et token til midten af et hexfelt, vælg det, og klik på Kalibrer. Vælg to tokens i nabohexfelter i samme række (Hex V) eller kolonne (Hex H) for også at rette hexfeltstørrelsen.',
        'Når en side eller et spil kopieres, får hexfelterne nye id’er. Kør Scan igen på siden for at finde dem igen sammen med deres navneetiketter og stedtokens.',
      ],
    },
    upgrading: {
      heading: 'Opgradering fra version 1',
      points: [
        'Version 2 behøver ikke længere PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan fjerne dem, medmindre en anden mod bruger dem.',
        'Eksisterende hex-kort, navne, placeringstokens og indstillinger opgraderes automatisk ved første start.',
        'Version 1-kommandoerne, inklusive makroen Hexploration_menu, virker stadig.',
        'I version 1 kunne ethvert token, der repræsenterede en karakter, afsløre hexfelter. Sæt Afslørende tokens til Karaktertokens for at bevare den adfærd.',
      ],
      colV1: 'Version 1 kommando',
      colV2: 'Version 2 kommando',
    },
    troubleshooting: {
      heading: 'Fejlfinding',
      points: [
        'Der sker ikke noget, når et token flytter sig: Kontroller, at tokenet ligger på tokenlaget og matcher Afslørende tokens, og at siden har hexfelter (!hexploration status).',
        'Hexfelterne er forskudt i forhold til gitteret: Brug Kalibrer, og kontroller derefter med et token på nogle få hexfelter rundt om på kortet.',
        'Hexfelterne holdt op med at blive afsløret efter kopiering af en side eller et spil: Kør Scan igen på siden.',
        'Fyld siger, at området ikke har nogen hexfeltcentre: Figuren skal indeholde midten af mindst ét hexfelt.',
        'For alt andet skal du tjekke API-konsolloggen og inkludere dens meddelelser, når du beder om hjælp.',
      ],
    },
    languages: {
      heading: 'Sprog',
      body: 'Vælg et sprog med !hexploration set sprog. Tilgængelige sprog:',
      colLanguage: 'Sprog',
      colNative: 'Eget navn',
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
