const TRANSLATION = {
  titles: {
    ready: 'Hexploratie is klaar.',
    settings: 'Hexploratie-instellingen',
    languages: 'Kies een taal',
    pageSettings: 'Pagina-instellingen: {page}',
    status: 'Hverkenningsstatus: {page}',
    help: 'Hexploratie-opdrachten',
    confirm: 'Bevestig alstublieft',
  },
  discovery: {
    title: 'Locatie ontdekt',
  },
  menu: {
    draw: 'Tekenen',
    reveal: 'Onthullen en verbergen',
    locations: 'Locaties',
    tools: 'Hulpmiddelen',
    layerInUse: 'Er worden nieuwe velden getekend op de {layer}.',
    pageSettingsHelp:
      'Deze instellingen zijn alleen van toepassing op deze pagina. Instellingen gemarkeerd met ★ overschrijven de algemene instellingen.',
  },
  buttons: {
    fill: 'Vullen',
    fillInverse: 'Omgekeerde vulling',
    undo: 'Vulling ongedaan maken',
    reveal: 'Onthullen',
    conceal: 'Maskeren',
    explore: 'Ontdekken',
    revealPage: 'Pagina onthullen',
    resetPage: 'Pagina opnieuw instellen',
    mark: 'Markeer locatie',
    unmark: 'Markering opheffen',
    name: 'Naam Hex',
    settings: 'Instellingen',
    pageSettings: 'Pagina-instellingen',
    status: 'Status',
    rescan: 'Opnieuw scannen',
    calibrate: 'Kalibreren',
    calibrateReset: 'Kalibratie opnieuw instellen',
    help: 'Hulp',
    change: 'Wijziging',
    menu: 'Menu',
    clearOverrides: 'Wis overschrijvingen',
    confirmReset: 'Ja, verwijder alle vakjes',
  },
  prompts: {
    name: 'Locatienaam (leeg laten om te wissen)',
  },
  values: {
    on: 'Op',
    off: 'Uit',
    none: 'Geen',
    hexLayer: {
      auto: 'Automatisch (voorgrond indien beschikbaar)',
      foreground: 'voorgrond laag',
      objects: 'token laag',
    },
    revealBy: {
      players: 'Spelerfiches',
      characters: 'Karakterfiches',
      all: 'Alle tokens',
    },
    revealMode: {
      clear: 'Duidelijk',
      glimpse: 'Glimp',
    },
    announce: {
      all: 'Iedereen',
      gm: 'Alleen GM',
      off: 'Uit',
    },
    orientation: {
      vertical: 'Zeskant (V)',
      horizontal: 'Zeskant (H)',
    },
    fillKind: {
      fill: 'Vullen',
      fillInverse: 'Omgekeerde vulling',
      conceal: 'Maskeren',
    },
  },
  settings: {
    language: {
      label: 'Taal',
      desc: "Taal voor menu's, berichten en hand-outs.",
    },
    hexLayer: {
      label: 'Hex-laag',
      desc: 'Waar nieuwe vakken worden getrokken. Auto probeert de voorgrondlaag (boven tokens) en valt terug naar de tokenlaag als het spel dit niet ondersteunt.',
    },
    fillColor: {
      label: 'Vulkleur',
      desc: 'Kleur van nieuwe vakjes. Gebruik rgba() voor doorzichtige hexen, bijvoorbeeld rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Randkleur',
      desc: 'Kleur van de omtrek van nieuwe vakjes.',
    },
    labelColor: {
      label: 'Etiketkleur',
      desc: 'Kleur van de GM-only naamlabels op benoemde vakjes.',
    },
    glimpseColor: {
      label: 'Glimp kleur',
      desc: 'Kleurvakken veranderen naar wanneer er een glimp van wordt opgevangen (Glimpse-onthullingsmodus). Gebruik een doorzichtige rgba()-kleur.',
    },
    strokeWidth: {
      label: 'Randbreedte',
      desc: 'Breedte van de omtrek van nieuwe vakken, in pixels (0 tot 20).',
    },
    maxDistance: {
      label: 'Hex onthullen afstand',
      desc: 'Toegepast op velden zoals ze worden getrokken: een token moet zich binnen zoveel velden bevinden om ze te onthullen, hoe ver hij ook kan kijken. Laat leeg voor geen limiet.',
    },
    revealDistance: {
      label: 'Zicht afstand',
      desc: 'Hoeveel vakjes rond een bewegend pion worden onthuld (0 tot 20). 0 onthult alleen de vakjes waar het fiche doorheen gaat.',
    },
    lineOfSight: {
      label: 'Zichtlijn',
      desc: 'Wanneer deze optie is ingeschakeld, wordt een vakje alleen onthuld als er geen afgedekt vakje tussen het vakje en het fiche ligt.',
    },
    revealPath: {
      label: 'Onthul langs het pad',
      desc: 'Wanneer deze optie is ingeschakeld, wordt elke vakje waar een token doorheen gaat tijdens het slepen (inclusief tussenpunten) onthuld, niet alleen waar het stopt.',
    },
    revealBy: {
      label: 'Tokens die onthullen',
      desc: 'Welke tokens op de tokenlaag onthullen hexen: tokens die door een speler worden beheerd, tokens die een willekeurig personage vertegenwoordigen, of elk token.',
    },
    revealMode: {
      label: 'Onthullingsmodus',
      desc: 'Clear verwijdert vakjes die in zicht zijn. Glimpse maakt ze in plaats daarvan doorzichtig; ze worden verwijderd wanneer er een token in komt.',
    },
    announce: {
      label: 'Ontdekkingen aankondigen',
      desc: 'Wie ziet het chatbericht wanneer een genoemde locatie wordt ontdekt?',
    },
    pingDiscoveries: {
      label: 'Ping-ontdekkingen',
      desc: 'Wanneer deze optie is ingeschakeld, worden spelers naar een genoemde locatie gepingd wanneer deze wordt ontdekt.',
    },
    hideCoveredTokens: {
      label: 'Verberg afgedekte tokens',
      desc: "Roll20 tekent namen, balken en aura's boven velden. Wanneer deze zijn ingeschakeld, zijn de voor de speler zichtbare naam, balken en aura's van tokens onder een afgedekt vakje uitgeschakeld, en weer ingeschakeld wanneer ze worden blootgelegd.",
    },
  },
  status: {
    engine: 'Game-engine',
    grid: 'Rooster',
    layer: 'Hex-laag',
    hexes: 'Hexen',
    named: 'Genoemde hexen',
    icons: 'Locatiefiches',
    glimpsed: 'Glimp van hexen',
    pending: 'Locaties die wachten op vulling',
    calibrated: 'Gekalibreerd',
    overrides: 'Pagina-overschrijvingen',
    undo: 'Ongedaan maken beschikbaar',
  },
  messages: {
    filled:
      'Vul compleet. Getekende vakjes: {created}. Gerestyled: {restyled}. Locaties verborgen: {icons}.',
    revealed: 'Hexen onthuld: {count}.',
    revealedPage: 'Elke zeshoek op de pagina wordt onthuld ({count}).',
    confirmReset:
      'Elke hex verwijderen uit "{page}" ({count})? Locatietokens keren terug naar de tokenlaag. Ongedaan maken kan dit niet ongedaan maken.',
    resetPage: 'Hexes verwijderd van de pagina: {count}.',
    undone:
      'Laatste vulling ongedaan gemaakt. Hexen verwijderd: {removed}. Gerestylede velden hersteld: {restored}.',
    named: 'Hexen met de naam "{name}": {count}.',
    unnamed: 'Namen gewist: {count}.',
    marked:
      'Locaties verborgen in bestaande vakjes: {attached}. Wachten op de volgende vulling die ze bedekt: {pending}.',
    unmarked: 'Tokens die niet langer locaties zijn: {count}.',
    settingChanged: '{setting} ingesteld op {value}.',
    rescanned:
      'Opnieuw scannen voltooid. Bewaarde: {kept}. Aangenomen: {adopted}. Opnieuw ingediend: {moved}. Vermist en vergeten: {dropped}. Labels opnieuw gekoppeld: {labels}. Locatietokens opnieuw gekoppeld: {icons}.',
    calibrated:
      'Raster gekalibreerd (kolomstap {colStep}px, rijstap {rowStep}px). Opnieuw scannen: {kept} behouden, opnieuw gearchiveerd {moved}, {adopted} overgenomen.',
    calibrationReset:
      'Kalibratie verwijderd. Opnieuw scannen: {kept} behouden, opnieuw gearchiveerd {moved}, {adopted} overgenomen.',
    journalRebuilt: 'De hand-outs "{help}" en "{deck}" zijn opnieuw opgebouwd.',
    migrated:
      'Je Hexploration 1.x hex-kaarten zijn geüpgraded. Als dit spel is gekopieerd van een Legacy-spel, voert u Rescan uit op elke hex-kaartpagina.',
    pruned:
      'Opgeslagen vakjes die niet meer bestaan ​​en vergeten zijn: {dropped}. Als dit spel of deze pagina is gekopieerd, voert u Opnieuw scannen uit op de pagina om de vakjes weer op te halen.',
    readyHint:
      'Typ !hexploration voor het menu, of open het hand-out "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Dit spel biedt geen ondersteuning voor tekenen op de voorgrondlaag, dus werden er vakjes op de tokenlaag getekend.',
    someFailed:
      'Velden die niet konden worden getekend: {count}. Controleer de API-console voor meer informatie.',
  },
  errors: {
    noPage: 'Kon de pagina niet vinden om aan te werken.',
    notHex: 'Deze pagina maakt geen gebruik van een hex-raster.',
    noPolygons: 'Selecteer een of meer getekende vormen om te vullen.',
    emptyArea: 'Het geselecteerde gebied bevat geen hex-centra.',
    tooMany: 'Dat zou te veel velden in één keer creëren ({count}).',
    nothingToConceal: 'Selecteer getekende vormen of tokens om te verbergen.',
    nothingToReveal: 'Selecteer vakjes, getekende vormen of tokens om te onthullen.',
    noTokens: 'Selecteer eerst een of meer tokens.',
    noHexes: 'Selecteer eerst een of meer vakjes (of fiches die op vakjes staan).',
    nothingToUndo: 'Er is geen vulling die ongedaan kan worden gemaakt.',
    unknownCommand: 'Onbekend commando: {command}',
    unknownSetting: 'Onbekende instelling: {key}',
    unknownPageSetting: 'Instellingen die per pagina kunnen worden ingesteld: {keys}',
    invalidValue: '"{value}" is geen geldige waarde voor {key}.',
    calibrateNeedsTokens:
      'Selecteer een of twee tokens die op de middelpunten van de zeshoeken zijn vastgemaakt.',
    calibrateFailed: 'Deze tokens kunnen niet worden gebruikt om te kalibreren.',
    unexpected: 'Er is iets misgegaan: {message}',
  },
  hints: {
    noPage: 'Open de pagina waaraan u wilt werken of selecteer er iets op.',
    notHex: 'Stel het paginaraster in op Hex (V) of Hex (H) in Pagina-instellingen.',
    noPolygons:
      'Teken een veelhoek, rechthoek, ellips of vorm uit de vrije hand rond het gebied, selecteer het en probeer het opnieuw.',
    emptyArea: 'Teken een grotere vorm of controleer de paginarasterinstellingen.',
    tooMany: 'Vul een kleiner gebied, of splits het gebied in verschillende vormen.',
    noHexes:
      'Hexes bevinden zich op de voorgrond of tokenlaag; ga naar die laag om ze te selecteren.',
    unknownCommand: 'Typ !hexploration help om de opdrachten weer te geven.',
    unknownSetting: 'Typ !hexploration set om elke instelling te bekijken.',
    calibrateNeedsTokens:
      'Plaats een token in het midden van een vakje en selecteer het. Selecteer een tweede token dat is vastgemaakt aan een aangrenzende hex in dezelfde rij (Hex V) of kolom (Hex H) om ook de hex-grootte te corrigeren.',
    calibrateFailed:
      'Twee fiches moeten zich in dezelfde rij (Hex V) of dezelfde kolom (Hex H) bevinden, met minstens één vakje uit elkaar.',
    unexpected: 'Details staan ​​in het API-consolelogboek.',
  },
  help: {
    menu: 'Laat de menukaart zien.',
    fill: 'Bedek de geselecteerde getekende vormen met vakjes.',
    fillInverse: 'Bedek de hele pagina, behalve binnen de geselecteerde vormen.',
    undo: 'Maak de laatste vulling ongedaan, keer de vulling om of verberg deze, en herstel de gebruikte vormen.',
    reveal: 'Onthul de geselecteerde velden en de velden onder de geselecteerde vormen en fiches.',
    revealPage: 'Onthul elke hex op de pagina zonder aankondigingen.',
    conceal: 'Bedek het gebied onder de geselecteerde vormen en fiches opnieuw met vakjes.',
    explore: 'Onthul de geselecteerde tokens alsof ze er net naartoe zijn verhuisd.',
    resetPage: 'Verwijder elk vakje op de pagina (eerst gevraagd).',
    name: 'Geef de geselecteerde velden een naam, of de velden onder de geselecteerde tokens. Laat de naam leeg om deze te wissen.',
    mark: 'Verander de geselecteerde tokens in verborgen locaties.',
    unmark: 'Voorkom dat de geselecteerde tokens verborgen locaties zijn.',
    set: 'Wijzig een instelling of toon alle instellingen.',
    pageSet: 'Overschrijf een instelling voor onthullen alleen op de huidige pagina.',
    pageClear: 'Verwijder de overschrijvingen van de huidige pagina.',
    rescan:
      'Bouw de hexadecimale lijst van de pagina opnieuw op, bijvoorbeeld na het kopiëren van een pagina of spel.',
    calibrate:
      'Lijn het hex-raster uit met een of twee geselecteerde tokens die op de hexadecimale middelpunten zijn vastgeklikt.',
    calibrateReset: 'Verwijder de kalibratie van de huidige pagina.',
    status: 'Laat zien wat Hexploration weet over de huidige pagina.',
    journal: 'Herbouw de Help- en Command Deck-hand-outs.',
    help: 'Laat deze lijst zien.',
    handout: 'Volledige instructies vindt u in de hand-out "{name}".',
  },
  deck: {
    subtitle: 'Commandodek',
    drawDesc:
      'Teken vormen rond een gebied, selecteer ze en vul ze. Met Ongedaan maken wordt de laatste vulling ongedaan gemaakt.',
    revealDesc:
      'Selecteer vakjes, vormen of tokens om ze weer te onthullen of te bedekken. Ontdek onthullingen rond geselecteerde tokens alsof ze zijn verplaatst.',
    locationsDesc:
      'Selecteer tokens om ze te verbergen als locaties onder vakjes. Selecteer vakken of tokens om een ​​vak een naam te geven.',
    toolsDesc:
      "Instellingen, paginaoverschrijvingen, status, gekopieerde pagina's opnieuw scannen en het raster kalibreren.",
    footer: 'Zie de hand-out "{help}" voor volledige instructies.',
  },
  handout: {
    versionLabel: 'Versie',
    subtitle: 'Hex-voor-hex verkenning voor Roll20',
    footer: 'Gebruik de hand-out "{deck}" voor bediening met één klik.',
    overview: {
      heading: 'Overzicht',
      body: 'Hexploration beslaat een hex-kaart met ondoorzichtige vakjes. Terwijl het gezelschap beweegt, worden de vakken waar ze doorheen gaan (en, als je wilt, de vakken eromheen) verwijderd, zodat de kaart vakje voor vakje wordt blootgelegd. Verborgen locaties kunnen onder vakjes worden geplaatst en worden aangekondigd wanneer ze worden gevonden. Het werkt in Jumpgate- en Legacy-spellen, op Hex (V) en Hex (H) rasters van elke grootte.',
      demo: 'Bekijk een korte demo (vanaf versie 1)',
    },
    quickStart: {
      heading: 'Snel beginnen',
      steps: [
        'Open een pagina waarvan het raster is ingesteld op Hex (V) of Hex (H).',
        'Teken een of meer vormen (veelhoek, rechthoek, ellips of uit de vrije hand) rond het gebied dat u wilt verbergen.',
        'Selecteer de vormen en klik op Invullen in het Command Deck (of typ !hexploration fill). De vormen worden vervangen door zeshoeken.',
        'Optioneel: selecteer vóór het vullen tokens voor belangrijke plaatsen en klik op Locatie markeren. Ze zijn verborgen onder de vakken en worden aangekondigd wanneer ze worden ontdekt.',
        'Verplaats een spelersfiche. Elke vakje waar hij doorheen gaat, en de vakjes binnen zijn zichtafstand, worden onthuld.',
      ],
    },
    commands: {
      heading: "Commando's",
      intro:
        "Alleen GM's kunnen deze commando's gebruiken. De meeste werken op de geselecteerde objecten; de rest handelt op de pagina die u bekijkt.",
      colCommand: 'Commando',
      colDesc: 'Wat het doet',
    },
    revealing: {
      heading: 'Hoe onthullen werkt',
      points: [
        'Alleen tokens op de tokenlaag onthullen hexen. Welke tokens tellen wordt bepaald door Tokens That Reveal: standaard spelertokens, zodat de GM monsters kan verplaatsen zonder de kaart bloot te leggen.',
        "Een fiche onthult elk vak dat het bestrijkt (grote fiches bestrijken er meerdere) en, als 'Onthullen langs pad' is ingeschakeld, elk vakje op de route waarlangs het is gesleept, inclusief tussenpunten.",
        'Zichtafstand onthult de velden rond elk van deze velden. Als de zichtlijn is ingeschakeld, wordt een vakje alleen onthuld als er geen bedekt vakje tussen ligt.',
        'Hex Reveal Distance wordt op de velden opgeslagen terwijl ze worden getrokken. Deze vakjes worden alleen onthuld vanuit dat aantal vakjes, hoe ver een token ook kan kijken. Gebruik het voor bergen of bossen die verbergen wat erachter ligt.',
        'In de Glimpse-modus worden vakjes die zichtbaar zijn, doorzichtig in plaats van te verdwijnen, en worden ze verwijderd wanneer er een token in komt.',
        'De API rapporteert geen bewegingen van andere mods. TokenMod-bewegingen worden automatisch opgepikt; voor andere mods selecteert u de tokens en klikt u op Ontdekken, of roept u Hexploration.revealAround(token) aan vanuit uw eigen mod.',
        'De API rapporteert geen bewegingen van andere mods. TokenMod-bewegingen worden automatisch opgepikt; voor andere mods selecteert u de tokens en klikt u op Ontdekken, of roept u Hexploration.revealAround(token) aan vanuit uw eigen mod.',
      ],
    },
    locations: {
      heading: 'Genoemde velden en locaties',
      points: [
        'Locatie markeren verandert de geselecteerde tokens in verborgen locaties. Een pion dat zich al onder een vakje bevindt, wordt meteen verborgen; anders wordt het verborgen door de volgende vulling die het bedekt.',
        'Tokens met de statusmarkering van de witte toren worden bij het vullen ook behandeld als locaties, zoals in versie 1.',
        'Verborgen locatiefiches worden verplaatst naar de GM-laag. Wanneer hun hex wordt onthuld, keren ze terug naar de tokenlaag met hun naam weergegeven, en wordt hun ontdekking aangekondigd.',
        'Naam Hex geeft een hex een naam zonder token. De naam wordt aan de GM getoond als een label op de GM-laag en aangekondigd wanneer de hex wordt onthuld.',
        'Announce Discoveries kiest of iedereen, alleen de GM, of niemand de aankondiging ziet. Ping Discoveries verplaatst ook het zicht van de speler naar de locatie.',
      ],
    },
    settings: {
      heading: 'Instellingen',
      intro:
        'Wijzig de instellingen met !hexploration set (of de knop Instellingen). Hex Layer, Tokens That Reveal en Language kunnen ook worden ingesteld op de instellingenpagina van de Mod.',
      colKey: 'Sleutel',
      colName: 'Instelling',
      colDesc: 'Beschrijving',
      perPage: '(Kan per pagina worden ingesteld.)',
    },
    jumpgate: {
      heading: 'Jumpgate en erfenis',
      points: [
        'Hexploration zoekt uit welke engine het spel gebruikt en tekent de bijpassende vorm. Vormen die in beide editors zijn getekend, kunnen worden gevuld.',
        'Als Hex Layer is ingesteld op Auto, worden hexen op de voorgrondlaag getekend, boven de tokens, zodat spelers niet kunnen zien wat eronder zit. Als de voorgrondlaag niet beschikbaar is, wordt in plaats daarvan de tokenlaag gebruikt.',
        'Jumpgate tekent wiskundig regelmatige vakken, die een iets andere vorm hebben dan Legacy-vakken. Als de vakjes niet op één lijn liggen met het raster van een pagina, plaats dan een token op het midden van een vakje, selecteer het en klik op Kalibreren. Selecteer twee tokens in aangrenzende vakjes van dezelfde rij (Hex V) of kolom (Hex H) om ook de hexadecimale grootte te corrigeren.',
        "Wanneer een pagina of spel wordt gekopieerd, krijgen de vakjes nieuwe ID's. Voer Rescan uit op de pagina om ze weer op te halen, samen met hun naamlabels en locatietokens.",
      ],
    },
    upgrading: {
      heading: 'Upgraden vanaf versie 1',
      points: [
        'Versie 2 heeft niet langer PathMath, MatrixMath, Vector Math of HTML Builder nodig. Je kunt ze verwijderen, tenzij een andere mod ze gebruikt.',
        'Bestaande hexadecimale kaarten, namen, locatietokens en instellingen worden bij de eerste start automatisch geüpgraded.',
        'De opdrachten van versie 1, inclusief de macro Hexploration_menu, werken nog steeds.',
        'Versie 1 liet elk token dat een personage vertegenwoordigde, vakjes onthullen. Stel tokens die onthullen in op karaktertokens om dat gedrag te behouden.',
      ],
      colV1: 'Versie 1-opdracht',
      colV2: 'Versie 2-opdracht',
    },
    troubleshooting: {
      heading: 'Problemen oplossen',
      points: [
        'Er gebeurt niets wanneer een token beweegt: controleer of het token zich op de tokenlaag bevindt en overeenkomt met Tokens That Reveal, en of de pagina hexes heeft (!hexploration-status).',
        'Hexes zijn verschoven ten opzichte van het raster: gebruik Kalibreren en controleer vervolgens met een token op een paar velden op de kaart.',
        'Hexes zijn niet meer zichtbaar na het kopiëren van een pagina of game: voer Rescan uit op de pagina.',
        'Fill geeft aan dat het gebied geen middelpunten van zeshoeken heeft: de vorm moet het midden van ten minste één zeshoek bevatten.',
        'Voor al het andere kunt u het logboek van de API-console raadplegen en de berichten erbij vermelden als u om hulp vraagt.',
      ],
    },
    languages: {
      heading: 'Talen',
      body: 'Kies een taal met de door !hexploration ingestelde taal. Beschikbare talen:',
      colLanguage: 'Taal',
      colNative: 'Inheemse naam',
      colCode: 'Code',
    },
    credits: {
      heading: 'Kredieten',
      original: 'Originele mod door',
      maintainer: 'Versie 2 onderhouden door',
      marketplace: "Ada's kunstpakketten op de Roll20 Marketplace",
      support:
        'Als je een bug vindt of een idee hebt, plaats dan een bericht op het Roll20 Mod-forum of open een probleem op GitHub, en voeg eventuele berichten uit het API-consolelogboek toe.',
    },
  },
};

export default TRANSLATION;
