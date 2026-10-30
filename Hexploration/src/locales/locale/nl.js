const TRANSLATION = {
  titles: {
    ready: 'Hexploration is klaar.',
    settings: 'Hexploration-instellingen',
    languages: 'Kies een taal',
    pageSettings: 'Pagina-instellingen: {page}',
    status: 'Hexploration-status: {page}',
    help: 'Hexploration-opdrachten',
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
    layerInUse: 'Nieuwe zeshoeken worden getekend op de {layer}.',
    pageSettingsHelp:
      'Deze instellingen zijn alleen van toepassing op deze pagina. Instellingen gemarkeerd met ★ overschrijven de algemene instellingen.',
  },
  buttons: {
    fill: 'Vullen',
    fillInverse: 'Omgekeerde vulling',
    undo: 'Vulling ongedaan maken',
    reveal: 'Onthullen',
    conceal: 'Verbergen',
    explore: 'Verkennen',
    revealPage: 'Pagina onthullen',
    resetPage: 'Pagina opnieuw instellen',
    mark: 'Locatie markeren',
    unmark: 'Markering opheffen',
    name: 'Zeshoek benoemen',
    settings: 'Instellingen',
    pageSettings: 'Pagina-instellingen',
    status: 'Status',
    rescan: 'Opnieuw scannen',
    calibrate: 'Kalibreren',
    calibrateReset: 'Kalibratie opnieuw instellen',
    help: 'Help',
    change: 'Wijzigen',
    menu: 'Menu',
    clearOverrides: 'Overschrijvingen wissen',
    confirmReset: 'Ja, verwijder alle zeshoeken',
  },
  prompts: {
    name: 'Locatienaam (leeg laten om te wissen)',
  },
  values: {
    on: 'Aan',
    off: 'Uit',
    none: 'Geen',
    hexLayer: {
      auto: 'Automatisch (voorgrond indien beschikbaar)',
      foreground: 'voorgrondlaag',
      objects: 'tokenlaag',
    },
    revealBy: {
      players: 'Spelertokens',
      characters: 'Personagetokens',
      all: 'Alle tokens',
    },
    revealMode: {
      clear: 'Wissen',
      glimpse: 'Glimp',
    },
    announce: {
      all: 'Iedereen',
      gm: 'Alleen GM',
      off: 'Uit',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Vullen',
      fillInverse: 'Omgekeerde vulling',
      conceal: 'Verbergen',
    },
  },
  settings: {
    language: {
      label: 'Taal',
      desc: "Taal voor menu's, berichten en hand-outs.",
    },
    hexLayer: {
      label: 'Laag voor zeshoeken',
      desc: 'Waar nieuwe zeshoeken worden getekend. Automatisch probeert de voorgrondlaag (boven tokens) en valt terug op de tokenlaag als het spel die niet ondersteunt.',
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
      label: 'Labelkleur',
      desc: 'Kleur van de GM-only naamlabels op benoemde vakjes.',
    },
    glimpseColor: {
      label: 'Glimpkleur',
      desc: 'Kleur die zeshoeken krijgen wanneer er een glimp van wordt opgevangen (onthullingsmodus Glimp). Gebruik een doorzichtige rgba()-kleur.',
    },
    strokeWidth: {
      label: 'Randbreedte',
      desc: 'Breedte van de omtrek van nieuwe vakken, in pixels (0 tot 20).',
    },
    maxDistance: {
      label: 'Onthullingsafstand van zeshoeken',
      desc: 'Wordt bij het vullen in de zeshoeken opgeslagen, dus stel dit in vóór het vullen: later wijzigen heeft geen effect op zeshoeken die al op de kaart staan. Een token moet zich binnen zoveel zeshoeken bevinden om ze te onthullen, hoe ver het ook kan kijken; bij 0 worden ze alleen onthuld door ze te betreden. Gebruik dit voor bergen of bossen. Laat leeg voor geen limiet.',
    },
    revealDistance: {
      label: 'Zichtafstand',
      desc: 'Hoeveel vakjes rond een bewegend pion worden onthuld (0 tot 20). 0 onthult alleen de vakjes waar het fiche doorheen gaat.',
    },
    lineOfSight: {
      label: 'Zichtlijn',
      desc: 'Wanneer deze optie aan staat, verbergen zeshoeken die bedekt blijven, zoals bergen die zijn gevuld met een Onthullingsafstand van zeshoeken, de zeshoeken erachter. Het maakt alleen verschil bij een Zichtafstand van 2 of meer.',
    },
    revealPath: {
      label: 'Onthullen langs pad',
      desc: 'Wanneer deze optie is ingeschakeld, wordt elke vakje waar een token doorheen gaat tijdens het slepen (inclusief tussenpunten) onthuld, niet alleen waar het stopt.',
    },
    revealBy: {
      label: 'Tokens die onthullen',
      desc: 'Welke tokens op de tokenlaag onthullen hexen: tokens die door een speler worden beheerd, tokens die een willekeurig personage vertegenwoordigen, of elk token.',
    },
    revealMode: {
      label: 'Onthullingsmodus',
      desc: 'Wissen verwijdert zeshoeken binnen het zicht. Glimp maakt ze in plaats daarvan doorzichtig; ze worden verwijderd wanneer een token ze betreedt.',
    },
    announce: {
      label: 'Ontdekkingen aankondigen',
      desc: 'Wie ziet het chatbericht wanneer een genoemde locatie wordt ontdekt?',
    },
    pingDiscoveries: {
      label: 'Ontdekkingen pingen',
      desc: 'Wanneer deze optie is ingeschakeld, worden spelers naar een genoemde locatie gepingd wanneer deze wordt ontdekt.',
    },
    hideCoveredTokens: {
      label: 'Bedekte tokens verbergen',
      desc: "Roll20 tekent namen, balken en aura's boven velden. Wanneer deze zijn ingeschakeld, zijn de voor de speler zichtbare naam, balken en aura's van tokens onder een afgedekt vakje uitgeschakeld, en weer ingeschakeld wanneer ze worden blootgelegd.",
    },
  },
  status: {
    engine: 'Game-engine',
    grid: 'Rooster',
    layer: 'Laag voor zeshoeken',
    hexes: 'Zeshoeken',
    named: 'Benoemde zeshoeken',
    icons: 'Locatietokens',
    glimpsed: 'Doorzichtige zeshoeken',
    pending: 'Locaties die op een vulling wachten',
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
      'Uw Hexploration 1.x-zeshoekkaarten zijn bijgewerkt. Als dit spel is gekopieerd uit een Legacy-spel, voer dan Opnieuw scannen uit op elke pagina met een zeshoekkaart.',
    pruned:
      'Opgeslagen zeshoeken die niet meer bestaan en zijn vergeten: {dropped}. Als dit spel of deze pagina is gekopieerd, voer dan Opnieuw scannen uit op de pagina om de zeshoeken weer op te pikken.',
    readyHint:
      'Typ !hexploration voor het menu, of open de hand-out "Hexploration - Command Deck".',
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
      'Bouw de hexlijst van de pagina opnieuw op, bijvoorbeeld na het kopiëren van een pagina of spel.',
    calibrate:
      'Lijn het hexraster uit met een of twee geselecteerde tokens die op het midden van een hex zijn vastgeklikt.',
    calibrateReset: 'Verwijder de kalibratie van de huidige pagina.',
    status: 'Laat zien wat Hexploration weet over de huidige pagina.',
    journal: 'Bouw de hand-outs Help en Command Deck opnieuw op.',
    help: 'Laat deze lijst zien.',
    handout: 'Volledige instructies vindt u in de hand-out "{name}".',
  },
  deck: {
    drawDesc:
      'Teken vormen rond een gebied, selecteer ze en vul ze dan. Vulling ongedaan maken draait de laatste vulling terug.',
    revealDesc:
      'Selecteer zeshoeken, vormen of tokens om ze te onthullen of weer te bedekken. Verkennen onthult de omgeving van geselecteerde tokens alsof ze daarheen zijn verplaatst.',
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
        'Selecteer de vormen en klik in het Command Deck op Vullen (of typ !hexploration fill). De vormen worden vervangen door zeshoeken.',
        'Optioneel: selecteer vóór het vullen tokens voor belangrijke plaatsen en klik op Locatie markeren. Ze worden verborgen onder de zeshoeken en aangekondigd wanneer ze worden ontdekt.',
        'Verplaats een spelertoken. Elke zeshoek waar het doorheen gaat, en de zeshoeken binnen zijn Zichtafstand, worden onthuld.',
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
        'Alleen tokens op de tokenlaag onthullen zeshoeken. Welke tokens meetellen, bepaalt Tokens die onthullen: standaard spelertokens, zodat de GM monsters kan verplaatsen zonder de kaart bloot te leggen.',
        'Een token onthult elke zeshoek die het bedekt (grote tokens bedekken er meerdere) en, als Onthullen langs pad aan staat, elke zeshoek op de route waarlangs het is gesleept, inclusief tussenpunten.',
        'Zichtafstand onthult de zeshoeken rond elk van die zeshoeken, de dichtstbijzijnde eerst. Als Zichtlijn aan staat, wordt een zeshoek niet onthuld zolang er een bedekte zeshoek tussen die zeshoek en het token ligt. Dichterbij gelegen zeshoeken worden meestal eerst onthuld, dus in open terrein verandert Zichtlijn niets: het telt alleen bij een Zichtafstand van 2 of meer en zeshoeken die bedekt blijven, zoals terrein dat is gevuld met een Onthullingsafstand van zeshoeken.',
        'Onthullingsafstand van zeshoeken wordt bij het vullen in elke zeshoek opgeslagen, dus stel dit in vóór het vullen; later wijzigen heeft geen effect op zeshoeken die al op de kaart staan. Een token moet zich binnen zoveel zeshoeken bevinden om ze te onthullen, hoe ver het ook kan kijken, en bij 0 worden ze alleen onthuld door ze te betreden. Voor een bergketen: stel Onthullingsafstand van zeshoeken in op 0, vul de bergen, zet de waarde terug op geen en vul daarna het land erachter. Met Zichtafstand 3 en Zichtlijn aan ziet de groep het open terrein om zich heen, maar niet de bergen of wat erachter ligt. Elke bergzeshoek wordt onthuld wanneer een token erin stapt.',
        'In de modus Glimp worden zeshoeken binnen het zicht doorzichtig in plaats van te verdwijnen, en ze worden verwijderd wanneer een token ze betreedt. Doorzichtige Glimp-zeshoeken blokkeren de Zichtlijn niet.',
        'Roll20 tekent tokennamen, balken en aura’s boven de zeshoeken. Als Bedekte tokens verbergen aan staat, worden bij een token onder een bedekte zeshoek de voor spelers zichtbare naam, balken en aura’s uitgeschakeld totdat het wordt onthuld, zodat verborgen monsters zichzelf niet verraden. Als u een ervan inschakelt terwijl het token bedekt is, blijft het verborgen en wordt het ingeschakeld zodra het token wordt onthuld.',
        'De API meldt geen verplaatsingen door andere mods. Verplaatsingen door TokenMod worden automatisch opgepikt; voor andere mods selecteert u de tokens en klikt u op Verkennen, of roept u Hexploration.revealAround(token) aan vanuit uw eigen mod.',
      ],
    },
    locations: {
      heading: 'Genoemde velden en locaties',
      points: [
        'Locatie markeren verandert de geselecteerde tokens in verborgen locaties. Een token dat al onder een zeshoek ligt, wordt meteen verborgen; anders wordt het verborgen door de volgende vulling die het bedekt.',
        'Tokens met de statusmarkering van de witte toren worden bij het vullen ook behandeld als locaties, zoals in versie 1.',
        'Verborgen locatiefiches worden verplaatst naar de GM-laag. Wanneer hun hex wordt onthuld, keren ze terug naar de tokenlaag met hun naam weergegeven, en wordt hun ontdekking aangekondigd.',
        'Zeshoek benoemen geeft een zeshoek een naam zonder token. De naam wordt aan de GM getoond als label op de GM-laag en aangekondigd wanneer de zeshoek wordt onthuld.',
        'Ontdekkingen aankondigen bepaalt of iedereen, alleen de GM of niemand de aankondiging ziet. Ontdekkingen pingen verplaatst bovendien het beeld van de spelers naar de locatie.',
      ],
    },
    settings: {
      heading: 'Instellingen',
      intro:
        'Wijzig de instellingen met !hexploration set (of de knop Instellingen). Laag voor zeshoeken, Tokens die onthullen en Taal kunnen ook worden ingesteld op de instellingenpagina van de mod.',
      colKey: 'Sleutel',
      colName: 'Instelling',
      colDesc: 'Beschrijving',
      perPage: '(Kan per pagina worden ingesteld.)',
    },
    jumpgate: {
      heading: 'Jumpgate en erfenis',
      points: [
        'Hexploration zoekt uit welke engine het spel gebruikt en tekent de bijpassende vorm. Vormen die in beide editors zijn getekend, kunnen worden gevuld.',
        'Als Laag voor zeshoeken op Automatisch staat, worden zeshoeken op de voorgrondlaag getekend, boven de tokens, zodat spelers niet kunnen zien wat eronder ligt. Als de voorgrondlaag niet beschikbaar is, wordt in plaats daarvan de tokenlaag gebruikt.',
        'Jumpgate tekent wiskundig regelmatige zeshoeken, die een iets andere vorm hebben dan Legacy-zeshoeken. Als de zeshoeken niet samenvallen met het raster van een pagina, zet dan een token vast op het midden van een zeshoek, selecteer het en klik op Kalibreren. Selecteer twee tokens in aangrenzende zeshoeken van dezelfde rij (Hex V) of kolom (Hex H) om ook de grootte van de zeshoeken te corrigeren.',
        'Wanneer een pagina of spel wordt gekopieerd, krijgen de zeshoeken nieuwe ID’s. Voer Opnieuw scannen uit op de pagina om ze weer op te pikken, samen met hun naamlabels en locatietokens.',
      ],
    },
    upgrading: {
      heading: 'Upgraden vanaf versie 1',
      points: [
        'Versie 2 heeft niet langer PathMath, MatrixMath, Vector Math of HTML Builder nodig. Je kunt ze verwijderen, tenzij een andere mod ze gebruikt.',
        'Bestaande hexkaarten, namen, locatietokens en instellingen worden bij de eerste start automatisch bijgewerkt.',
        'De opdrachten van versie 1, inclusief de macro Hexploration_menu, werken nog steeds.',
        'In versie 1 kon elk token dat een personage voorstelde zeshoeken onthullen. Stel Tokens die onthullen in op Personagetokens om dat gedrag te behouden.',
      ],
      colV1: 'Versie 1-opdracht',
      colV2: 'Versie 2-opdracht',
    },
    troubleshooting: {
      heading: 'Problemen oplossen',
      points: [
        'Er gebeurt niets wanneer een token beweegt: controleer of het token op de tokenlaag staat en overeenkomt met Tokens die onthullen, en of de pagina zeshoeken heeft (!hexploration status).',
        'Zeshoeken zijn verschoven ten opzichte van het raster: gebruik Kalibreren en controleer daarna met een token op een paar zeshoeken verspreid over de kaart.',
        'Zeshoeken worden niet meer onthuld na het kopiëren van een pagina of spel: voer Opnieuw scannen uit op de pagina.',
        'Vullen meldt dat het gebied geen middelpunten van zeshoeken bevat: de vorm moet het middelpunt van ten minste één zeshoek bevatten.',
        'Voor al het andere kunt u het logboek van de API-console raadplegen en de berichten erbij vermelden als u om hulp vraagt.',
      ],
    },
    languages: {
      heading: 'Talen',
      body: 'Kies een taal met de door !hexploration ingestelde taal. Beschikbare talen:',
      colLanguage: 'Taal',
      colNative: 'Eigen naam',
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
