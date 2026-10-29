const TRANSLATION = {
  titles: {
    ready: 'Hexploration är redo.',
    settings: 'Heexploration Inställningar',
    languages: 'Välj ett språk',
    pageSettings: 'Sidinställningar: {page}',
    status: 'Hexploration Status: {page}',
    help: 'Hexploration kommandon',
    confirm: 'Vänligen bekräfta',
  },
  discovery: {
    title: 'Plats upptäckt',
  },
  menu: {
    draw: 'Dra',
    reveal: 'Avslöja och göm',
    locations: 'Platser',
    tools: 'Verktyg',
    layerInUse: 'Nya sexkanter ritas på {layer}.',
    pageSettingsHelp:
      'Dessa inställningar gäller endast för denna sida. Inställningar markerade ★ åsidosätter de globala inställningarna.',
  },
  buttons: {
    fill: 'Fylla',
    fillInverse: 'Omvänd fyllning',
    undo: 'Ångra Fyll',
    reveal: 'Avslöja',
    conceal: 'Dölja',
    explore: 'Utforska',
    revealPage: 'Avslöja sidan',
    resetPage: 'Återställ sida',
    mark: 'Markera plats',
    unmark: 'Avmarkera',
    name: 'Namn Hex',
    settings: 'Inställningar',
    pageSettings: 'Sidinställningar',
    status: 'Status',
    rescan: 'Skanna igen',
    calibrate: 'Kalibrera',
    calibrateReset: 'Återställ kalibrering',
    help: 'Hjälp',
    change: 'Ändra',
    menu: 'Meny',
    clearOverrides: 'Rensa åsidosättningar',
    confirmReset: 'Ja, ta bort alla hexar',
  },
  prompts: {
    name: 'Platsnamn (låt vara tomt för att rensa)',
  },
  values: {
    on: 'På',
    off: 'Av',
    none: 'Ingen',
    hexLayer: {
      auto: 'Auto (förgrund om tillgängligt)',
      foreground: 'förgrundsskikt',
      objects: 'symbollager',
    },
    revealBy: {
      players: 'Spelarpoletter',
      characters: 'Karaktärspoletter',
      all: 'Alla tokens',
    },
    revealMode: {
      clear: 'Rensa',
      glimpse: 'Glimt',
    },
    announce: {
      all: 'Alla',
      gm: 'Endast GM',
      off: 'Av',
    },
    orientation: {
      vertical: 'Hex (V)',
      horizontal: 'Hex (H)',
    },
    fillKind: {
      fill: 'Fylla',
      fillInverse: 'Omvänd fyllning',
      conceal: 'Dölja',
    },
  },
  settings: {
    language: {
      label: 'Språk',
      desc: 'Språk för menyer, meddelanden och åhörarkopior.',
    },
    hexLayer: {
      label: 'Hexlager',
      desc: 'Där nya hexar ritas. Auto provar förgrundslagret (ovanför tokens) och faller tillbaka till tokenlagret om spelet inte stöder det.',
    },
    fillColor: {
      label: 'Fyllningsfärg',
      desc: 'Färg på nya sexkanter. Använd rgba() för genomskinliga hexadecimaler, till exempel rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Kantfärg',
      desc: 'Färg på konturerna av nya sexkanter.',
    },
    labelColor: {
      label: 'Etikettfärg',
      desc: 'Färgen på namnetiketterna endast för GM på namngivna sexkanter.',
    },
    glimpseColor: {
      label: 'Glimt färg',
      desc: 'Hexfärgade färger ändras till när de skymtas (Glimpse-avslöjningsläge). Använd en genomskinlig rgba()-färg.',
    },
    strokeWidth: {
      label: 'Kantbredd',
      desc: 'Bredden på konturerna av nya hex, i pixlar (0 till 20).',
    },
    maxDistance: {
      label: 'Hexavslöjande avstånd',
      desc: 'Tillämpas på hexar när de ritas: en token måste finnas inom så många hexes för att avslöja dem, hur långt den än kan se. Lämna tomt utan gräns.',
    },
    revealDistance: {
      label: 'Siktavstånd',
      desc: 'Hur många hexar runt en rörlig token som avslöjas (0 till 20). 0 avslöjar endast de hexar som token passerar igenom.',
    },
    lineOfSight: {
      label: 'Synlinje',
      desc: 'När den är på avslöjas en hex endast om ingen täckt hex ligger mellan den och token.',
    },
    revealPath: {
      label: 'Avslöja längs vägen',
      desc: 'När den är på avslöjas varje hex som en token passerar genom medan den dras (inklusive waypoints), inte bara där den stannar.',
    },
    revealBy: {
      label: 'Tokens som avslöjar',
      desc: 'Vilka tokens på tokenlagret avslöjar hexes: tokens som kontrolleras av en spelare, tokens som representerar vilken karaktär som helst eller varje token.',
    },
    revealMode: {
      label: 'Avslöjande läge',
      desc: 'Clear tar bort sexkanter inom synhåll. Glimpse gör dem genomskinliga istället; de tas bort när en token kommer in i dem.',
    },
    announce: {
      label: 'Tillkännage upptäckter',
      desc: 'Vem ser chattmeddelandet när en namngiven plats upptäcks.',
    },
    pingDiscoveries: {
      label: 'Ping upptäckter',
      desc: 'När den är på pingas spelare till en namngiven plats när den upptäcks.',
    },
    hideCoveredTokens: {
      label: 'Dölj täckta polletter',
      desc: 'Roll20 ritar namn, staplar och auror ovanför hexen. När de är på, har tokens under en täckt sexkant sitt spelare-synliga namn, staplar och auror avstängda och påslagna igen när de avslöjas.',
    },
  },
  status: {
    engine: 'Spelmotor',
    grid: 'Rutnät',
    layer: 'Hexskikt',
    hexes: 'Hex',
    named: 'Namngivna hexar',
    icons: 'Platsskyltar',
    glimpsed: 'Glimmade hexar',
    pending: 'Platser som väntar på fyllning',
    calibrated: 'Kalibrerad',
    overrides: 'Sida åsidosätter',
    undo: 'Ångra tillgängligt',
  },
  messages: {
    filled: 'Fyllning klar. Hex ritade: {created}. Omstylad: {restyled}. Gömda platser: {icons}.',
    revealed: 'Hexen avslöjade: {count}.',
    revealedPage: 'Varje hex på sidan avslöjas ({count}).',
    confirmReset:
      'Ta bort varje hex från "{page}" ({count})? Platssymboler återgår till tokenlagret. Ångra kan inte ångra detta.',
    resetPage: 'Hexen har tagits bort från sidan: {count}.',
    undone:
      'Senaste fyllningen har ångrats. Hex borttagna: {removed}. Återställda hexadecimaler: {restored}.',
    named: 'Hex med namnet "{name}": {count}.',
    unnamed: 'Namn raderade: {count}.',
    marked:
      'Platser dolda i befintliga hexadecimaler: {attached}. Väntar på nästa fyllning som täcker dem: {pending}.',
    unmarked: 'Tokens som inte längre är platser: {count}.',
    settingChanged: '{setting} inställd på {value}.',
    rescanned:
      'Omsökningen är klar. Sparade: {kept}. Antagen: {adopted}. Återarkiverad: {moved}. Saknas och glöms: {dropped}. Etiketter återlänkade: {labels}. Platstokens återlänkade: {icons}.',
    calibrated:
      'Rutnät kalibrerat (kolumnsteg {colStep}px, radsteg {rowStep}px). Skanna om: behöll {kept}, arkiverade på nytt {moved}, antog {adopted}.',
    calibrationReset:
      'Kalibrering har tagits bort. Skanna om: behöll {kept}, arkiverade på nytt {moved}, antog {adopted}.',
    journalRebuilt: '"{help}" och "{deck}" har byggts om.',
    migrated:
      'Dina Hexploration 1.x hex-kartor har uppgraderats. Om det här spelet kopierades från ett Legacy-spel, kör Rescan på varje hex-kartasida.',
    pruned:
      'Sparade hexar som inte längre finns och glömdes bort: {dropped}. Om det här spelet eller sidan kopierades, kör Rescan på sidan för att plocka upp dess hexes igen.',
    readyHint:
      'Skriv !hexploration för menyn, eller öppna utdelningen "Hexploration - Command Deck".',
  },
  warnings: {
    foregroundUnavailable:
      'Det här spelet stöder inte ritning på förgrundslagret, så hexadecken ritades på tokenlagret.',
    someFailed: 'Hex som inte kunde ritas: {count}. Kontrollera API-konsolen för detaljer.',
  },
  errors: {
    noPage: 'Kunde inte hitta sidan att arbeta på.',
    notHex: 'Den här sidan använder inte ett hex-rutnät.',
    noPolygons: 'Välj en eller flera ritade former att fylla.',
    emptyArea: 'Det valda området innehåller inga hexa-center.',
    tooMany: 'Det skulle skapa för många hexar på en gång ({count}).',
    nothingToConceal: 'Välj ritade former eller tokens att dölja.',
    nothingToReveal: 'Välj hex, ritade former eller polletter att avslöja.',
    noTokens: 'Välj först en eller flera tokens.',
    noHexes: 'Välj en eller flera hexes (eller polletter som står på hexes) först.',
    nothingToUndo: 'Det finns ingen fyllning att ångra.',
    unknownCommand: 'Okänt kommando: {command}',
    unknownSetting: 'Okänd inställning: {key}',
    unknownPageSetting: 'Inställningar som kan ställas in per sida: {keys}',
    invalidValue: '"{value}" är inte ett giltigt värde för {key}.',
    calibrateNeedsTokens: 'Välj en eller två polletter som knäpps till hexade centra.',
    calibrateFailed: 'Dessa tokens kan inte användas för att kalibrera.',
    unexpected: 'Något gick fel: {message}',
  },
  hints: {
    noPage: 'Öppna sidan du vill arbeta på eller välj något på den.',
    notHex: 'Ställ in sidrutnätet på Hex (V) eller Hex (H) i Sidinställningar.',
    noPolygons:
      'Rita en polygon, rektangel, ellips eller frihandsform runt området, markera det och försök sedan igen.',
    emptyArea: 'Rita en större form eller kontrollera inställningarna för sidrutnätet.',
    tooMany: 'Fyll ett mindre område, eller dela området i flera former.',
    noHexes: 'Hex är på förgrunden eller symbollagret; växla till det lagret för att välja dem.',
    unknownCommand: 'Skriv !hexploration help för att lista kommandona.',
    unknownSetting: 'Skriv !hexploration set för att se alla inställningar.',
    calibrateNeedsTokens:
      'Fäst en token i mitten av en hex och välj den. Välj en andra token som fästs på en intilliggande hex i samma rad (Hex V) eller kolumn (Hex H) för att korrigera hexstorleken också.',
    calibrateFailed:
      'Två tokens måste vara i samma rad (Hex V) eller samma kolumn (Hex H), med minst en hexadecimal isär.',
    unexpected: 'Detaljer finns i API-konsolloggen.',
  },
  help: {
    menu: 'Visa menyn.',
    fill: 'Täck de utvalda ritade formerna med hex.',
    fillInverse: 'Täck hela sidan utom inuti de valda formerna.',
    undo: 'Ångra den sista fyllningen, inverterad fyllning eller dölj och återställ formerna den använde.',
    reveal: 'Avslöja de valda hexen och hexen under de valda formerna och symbolerna.',
    revealPage: 'Avslöja varje hex på sidan utan tillkännagivanden.',
    conceal: 'Täck området under de valda formerna och polletterna med hexar igen.',
    explore: 'Avslöja runt de valda tokens som om de precis hade flyttat dit.',
    resetPage: 'Ta bort varje hex på sidan (frågar först).',
    name: 'Namnge de valda hexorna, eller hexarna under de valda polletterna. Lämna namnet tomt för att rensa det.',
    mark: 'Förvandla de valda tokens till dolda platser.',
    unmark: 'Stoppa de valda tokens från att vara dolda platser.',
    set: 'Ändra en inställning eller visa alla inställningar.',
    pageSet: 'Åsidosätt en avslöjningsinställning endast på den aktuella sidan.',
    pageClear: 'Ta bort den aktuella sidans åsidosättningar.',
    rescan: 'Bygg om sidans hex-lista, till exempel efter att du kopierat en sida eller ett spel.',
    calibrate: 'Rada hex-rutnätet med en eller två utvalda tokens fästa till hex-centrum.',
    calibrateReset: 'Ta bort den aktuella sidans kalibrering.',
    status: 'Visa vad Hexploration vet om den aktuella sidan.',
    journal: 'Bygg om hjälp- och kommandodäcken.',
    help: 'Visa den här listan.',
    handout: 'Fullständiga instruktioner finns i "{name}" handout.',
  },
  deck: {
    subtitle: 'Kommandodäck',
    drawDesc:
      'Rita former runt ett område, markera dem och fyll sedan. Ångra vänder den senaste fyllningen.',
    revealDesc:
      'Välj hex, former eller tokens för att avslöja eller täcka dem igen. Utforska avslöjar runt utvalda tokens som om de hade rört sig.',
    locationsDesc:
      'Välj tokens för att dölja dem som platser under hex. Välj hex eller token för att namnge en hex.',
    toolsDesc:
      'Inställningar, sidöverstyrningar, status, skanna om kopierade sidor och kalibrering av rutnätet.',
    footer: 'Se "{help}"-handouten för fullständiga instruktioner.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Hex-by-hex-utforskning för Roll20',
    footer: 'Använd "{deck}"-handouten för kontroller med ett klick.',
    overview: {
      heading: 'Översikt',
      body: 'Hexploration täcker en hex-karta med ogenomskinliga hexes. När sällskapet rör sig tas hexen de passerar igenom (och, om du vill, hexen runt dem) bort, så kartan avslöjas en hex i taget. Dolda platser kan placeras under hex och meddelas när de hittas. Det fungerar i Jumpgate och Legacy-spel, på Hex (V) och Hex (H) rutnät av alla storlekar.',
      demo: 'Se en kort demo (från version 1)',
    },
    quickStart: {
      heading: 'Snabbstart',
      steps: [
        'Öppna en sida vars rutnät är inställt på Hex (V) eller Hex (H).',
        'Rita en eller flera former (polygon, rektangel, ellips eller frihand) runt området för att dölja.',
        'Välj formerna och klicka på Fyll i kommandodäcket (eller skriv !hexploration fill). Formerna ersätts av hexar.',
        'Valfritt: innan du fyller, välj tokens för viktiga platser och klicka på Markera plats. De är gömda under hexen och tillkännages när de upptäcks.',
        'Flytta en spelartoken. Varje hex den passerar igenom, och hexen inom dess siktavstånd, avslöjas.',
      ],
    },
    commands: {
      heading: 'Kommandon',
      intro:
        'Endast GM:er kan använda dessa kommandon. De flesta agerar på de valda objekten; resten agerar på sidan du tittar på.',
      colCommand: 'Kommando',
      colDesc: 'Vad den gör',
    },
    revealing: {
      heading: 'Hur avslöjande fungerar',
      points: [
        'Endast polletter på tokenlagret avslöjar sexkanter. Vilket antal tokens bestäms av Tokens That Reveal: spelartokens som standard, så GM kan flytta monster utan att avslöja kartan.',
        'En token avslöjar varje hex den täcker (stora tokens täcker flera) och, med Reveal Along Path på, varje hex på rutten den släpades längs, inklusive waypoints.',
        'Sight Distance avslöjar hexen runt var och en av dessa hexes. Med Line of Sight på avslöjas en hex endast om ingen täckt hex ligger emellan.',
        'Hexavslöjande avstånd lagras på hexar när de ritas. Dessa hexes avslöjas bara inifrån så många hexes, hur långt en token än kan se. Använd den för berg eller skogar som döljer vad som finns bakom dem.',
        'I Glimpse-läget blir hexar inom synhåll genomskinliga istället för att försvinna och tas bort när en token kommer in i dem.',
        'The API does not report moves made by other mods. TokenMod moves are picked up automatically; for other mods, select the tokens and click Explore, or call Hexploration.revealAround(token) from your own mod.',
        'API:et rapporterar inte rörelser gjorda av andra mods. TokenMod-drag plockas upp automatiskt; för andra moddar, välj tokens och klicka på Utforska, eller ring Hexploration.revealAround(token) från din egen mod.',
      ],
    },
    locations: {
      heading: 'Namngivna Hex och platser',
      points: [
        'Markera plats förvandlar de valda tokens till dolda platser. En token redan under en hex döljs direkt; annars döljs den av nästa fyllning som täcker den.',
        'Tokens med statusmarkören för det vita tornet behandlas också som platser när du fyller, som i version 1.',
        'Dolda platssymboler flyttas till GM-lagret. När deras hex avslöjas återvänder de till tokenlagret med deras namn visat, och deras upptäckt tillkännages.',
        'Namn Hex ger en hex ett namn utan en token. Namnet visas för GM som en etikett på GM-lagret och meddelas när hexen avslöjas.',
        'Announce Discoveries väljer om alla, bara GM, eller ingen ser tillkännagivandet. Ping Discoveries flyttar också spelarnas vy till platsen.',
      ],
    },
    settings: {
      heading: 'Inställningar',
      intro:
        'Ändra inställningar med !hexploration set (eller knappen Inställningar). Hexlager, Tokens That Reveal och Language kan också ställas in på modens inställningssida.',
      colKey: 'Nyckel',
      colName: 'Miljö',
      colDesc: 'Beskrivning',
      perPage: '(Kan ställas in per sida.)',
    },
    jumpgate: {
      heading: 'Jumpgate och Legacy',
      points: [
        'Hexploration tar reda på vilken motor spelet använder och ritar den matchande formen. Former ritade i någon av editorerna kan fyllas.',
        'Med Hex Layer inställt på Auto, ritas hex på förgrundslagret, ovanför tokens, så att spelare inte kan se vad som finns under. Om förgrundslagret inte är tillgängligt används tokenlagret istället.',
        'Jumpgate ritar matematiskt regelbundna hexes, som är en något annorlunda form från Legacy hexes. Om hexadelarna inte stämmer överens med en sidas rutnät, fäster du en token till en hex-centrum, markerar den och klickar på Kalibrera. Välj två tokens i angränsande hexadecimaler i samma rad (Hex V) eller kolumn (Hex H) för att även korrigera hexstorleken.',
        'När en sida eller ett spel kopieras får dess hexar nya ID. Kör Rescan på sidan för att plocka upp dem igen, tillsammans med deras namnetiketter och platssymboler.',
      ],
    },
    upgrading: {
      heading: 'Uppgraderar från version 1',
      points: [
        'Version 2 behöver inte längre PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan ta bort dem om inte en annan mod använder dem.',
        'Befintliga hexadecimala kartor, namn, platssymboler och inställningar uppgraderas automatiskt vid första starten.',
        'Version 1-kommandona, inklusive makrot Hexploration_menu, fungerar fortfarande.',
        'Version 1 låter vilken token som helst som representerade en karaktär avslöja hexes. Ställ in Tokens That Reveal till Character-tokens för att behålla det beteendet.',
      ],
      colV1: 'Kommandot version 1',
      colV2: 'Kommandot version 2',
    },
    troubleshooting: {
      heading: 'Felsökning',
      points: [
        'Ingenting händer när en token rör sig: kontrollera att token finns på tokenlagret och matchar Tokens That Reveal, och att sidan har hexes (!hexploration-status).',
        'Hexen är förskjutna från rutnätet: använd Kalibrera och kontrollera sedan med en token på några hexar över kartan.',
        'Hexes slutade avslöjas efter att ha kopierat en sida eller ett spel: kör Rescan på sidan.',
        'Fill säger att området inte har några sexkantscentrum: formen måste innehålla mitten av minst en sexkant.',
        'För allt annat, kontrollera API-konsolloggen och inkludera dess meddelanden när du ber om hjälp.',
      ],
    },
    languages: {
      heading: 'Språk',
      body: 'Välj ett språk med !hexploration set språk. Tillgängliga språk:',
      colLanguage: 'Språk',
      colNative: 'Inhemskt namn',
      colCode: 'Koda',
    },
    credits: {
      heading: 'Krediter',
      original: 'Originalmod av',
      maintainer: 'Version 2 underhålls av',
      marketplace: 'Adas konstpaket på Roll20 Marketplace',
      support:
        'Om du hittar en bugg eller har en idé, posta i Roll20 Mod-forumet eller öppna ett problem på GitHub och inkludera eventuella meddelanden från API-konsolloggen.',
    },
  },
};

export default TRANSLATION;
