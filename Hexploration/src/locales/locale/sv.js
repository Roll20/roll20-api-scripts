const TRANSLATION = {
  titles: {
    ready: 'Hexploration är redo.',
    settings: 'Hexploration-inställningar',
    languages: 'Välj ett språk',
    pageSettings: 'Sidinställningar: {page}',
    status: 'Hexploration-status: {page}',
    help: 'Hexploration-kommandon',
    confirm: 'Vänligen bekräfta',
  },
  discovery: {
    title: 'Plats upptäckt',
  },
  menu: {
    draw: 'Rita',
    reveal: 'Avslöja och dölj',
    locations: 'Platser',
    tools: 'Verktyg',
    layerInUse: 'Nya hexar ritas på {layer}.',
    pageSettingsHelp:
      'Dessa inställningar gäller endast för denna sida. Inställningar markerade ★ åsidosätter de globala inställningarna.',
  },
  buttons: {
    fill: 'Fyll',
    fillInverse: 'Omvänd fyllning',
    undo: 'Ångra fyllning',
    reveal: 'Avslöja',
    conceal: 'Dölj',
    explore: 'Utforska',
    revealPage: 'Avslöja sida',
    resetPage: 'Återställ sida',
    mark: 'Markera plats',
    unmark: 'Avmarkera',
    name: 'Namnge hex',
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
      foreground: 'förgrundslagret',
      objects: 'tokenlagret',
    },
    revealBy: {
      players: 'Spelartokens',
      characters: 'Rollpersonstokens',
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
      fill: 'Fyll',
      fillInverse: 'Omvänd fyllning',
      conceal: 'Dölj',
    },
  },
  settings: {
    language: {
      label: 'Språk',
      desc: 'Språk för menyer, meddelanden och åhörarkopior.',
    },
    hexLayer: {
      label: 'Lager för hexar',
      desc: 'Där nya hexar ritas. Auto provar förgrundslagret (ovanför tokens) och faller tillbaka till tokenlagret om spelet inte stöder det.',
    },
    fillColor: {
      label: 'Fyllningsfärg',
      desc: 'Färg på nya hexar. Använd rgba() för genomskinliga hexar, till exempel rgba(0,0,0,0.8).',
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
      label: 'Glimtfärg',
      desc: 'Färgen som hexar byter till när de skymtas (avslöjandeläget Glimt). Använd en genomskinlig rgba()-färg.',
    },
    strokeWidth: {
      label: 'Kantbredd',
      desc: 'Bredden på konturerna av nya hex, i pixlar (0 till 20).',
    },
    maxDistance: {
      label: 'Avslöjandeavstånd för hexar',
      desc: 'Tillämpas på hexar när de ritas: en token måste finnas inom så många hexes för att avslöja dem, hur långt den än kan se. Lämna tomt utan gräns.',
    },
    revealDistance: {
      label: 'Siktavstånd',
      desc: 'Hur många hexar runt en rörlig token som avslöjas (0 till 20). 0 avslöjar endast de hexar som token passerar igenom.',
    },
    lineOfSight: {
      label: 'Siktlinje',
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
      label: 'Avslöjandeläge',
      desc: 'Rensa tar bort hexar inom synhåll. Glimt gör dem i stället genomskinliga; de tas bort när en token går in i dem.',
    },
    announce: {
      label: 'Tillkännage upptäckter',
      desc: 'Vem ser chattmeddelandet när en namngiven plats upptäcks.',
    },
    pingDiscoveries: {
      label: 'Pinga upptäckter',
      desc: 'När den är på pingas spelare till en namngiven plats när den upptäcks.',
    },
    hideCoveredTokens: {
      label: 'Dölj täckta tokens',
      desc: 'Roll20 ritar namn, staplar och auror ovanför hexen. När de är på, har tokens under en täckt sexkant sitt spelare-synliga namn, staplar och auror avstängda och påslagna igen när de avslöjas.',
    },
  },
  status: {
    engine: 'Spelmotor',
    grid: 'Rutnät',
    layer: 'Hexlager',
    hexes: 'Hexar',
    named: 'Namngivna hexar',
    icons: 'Platstokens',
    glimpsed: 'Genomskinliga hexar',
    pending: 'Platser som väntar på fyllning',
    calibrated: 'Kalibrerad',
    overrides: 'Sidåsidosättningar',
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
      'Senaste fyllningen ångrad. Borttagna hexar: {removed}. Omstylade hexar som återställts: {restored}.',
    named: 'Hex med namnet "{name}": {count}.',
    unnamed: 'Namn raderade: {count}.',
    marked:
      'Platser dolda i befintliga hexar: {attached}. Väntar på nästa fyllning som täcker dem: {pending}.',
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
      'Dina hexkartor från Hexploration 1.x har uppgraderats. Om det här spelet kopierades från ett Legacy-spel kör du Skanna igen på varje sida med en hexkarta.',
    pruned:
      'Sparade hexar som inte längre finns och har glömts bort: {dropped}. Om det här spelet eller sidan kopierades kör du Skanna igen på sidan för att hitta dess hexar igen.',
    readyHint:
      'Skriv !hexploration för menyn, eller öppna handouten "Hexploration - Command Deck".',
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
      'Två tokens måste ligga i samma rad (Hex V) eller samma kolumn (Hex H), minst en hex från varandra.',
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
    journal: 'Bygg om handouterna Help och Command Deck.',
    help: 'Visa den här listan.',
    handout: 'Fullständiga instruktioner finns i "{name}" handout.',
  },
  deck: {
    drawDesc:
      'Rita former runt ett område, markera dem och fyll sedan. Ångra fyllning tar bort den senaste fyllningen.',
    revealDesc:
      'Välj hexar, former eller tokens för att avslöja dem eller täcka dem igen. Utforska avslöjar runt valda tokens som om de hade flyttats dit.',
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
        'Markera formerna och klicka på Fyll i Command Deck (eller skriv !hexploration fill). Formerna ersätts av hexar.',
        'Valfritt: innan du fyller, välj tokens för viktiga platser och klicka på Markera plats. De är gömda under hexen och tillkännages när de upptäcks.',
        'Flytta en spelartoken. Varje hex den passerar, och hexarna inom dess Siktavstånd, avslöjas.',
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
        'Endast tokens på tokenlagret avslöjar hexar. Vilka tokens som räknas bestäms av Tokens som avslöjar: spelartokens som standard, så att GM kan flytta monster utan att avslöja kartan.',
        'En token avslöjar varje hex den täcker (stora tokens täcker flera) och, med Avslöja längs vägen på, varje hex på rutten den drogs längs, inklusive mellanpunkter.',
        'Siktavstånd avslöjar hexarna runt var och en av dessa hexar. Med Siktlinje på avslöjas en hex bara om ingen täckt hex ligger emellan.',
        'Avslöjandeavstånd för hexar lagras på hexarna när de ritas. Dessa hexar avslöjas bara inom så många hexars avstånd, hur långt en token än kan se. Använd det för berg eller skogar som döljer vad som finns bakom dem.',
        'I läget Glimt blir hexar inom synhåll genomskinliga i stället för att försvinna, och de tas bort när en token går in i dem.',
        'Roll20 ritar tokennamn, staplar och auror ovanpå hexarna. Med Dölj täckta tokens på stängs det namn, de staplar och de auror som spelarna kan se av för en token under en täckt hex tills den avtäcks, så att dolda monster inte avslöjar sig. Om du slår på något av dem medan token är täckt förblir det dolt och slås på när token avtäcks.',
        'API:et rapporterar inte förflyttningar som görs av andra moddar. TokenMod-förflyttningar fångas upp automatiskt; för andra moddar markerar du tokens och klickar på Utforska, eller anropar Hexploration.revealAround(token) från din egen mod.',
      ],
    },
    locations: {
      heading: 'Namngivna Hex och platser',
      points: [
        'Markera plats förvandlar de valda tokens till dolda platser. En token redan under en hex döljs direkt; annars döljs den av nästa fyllning som täcker den.',
        'Tokens med statusmarkören för det vita tornet behandlas också som platser när du fyller, som i version 1.',
        'Dolda platssymboler flyttas till GM-lagret. När deras hex avslöjas återvänder de till tokenlagret med deras namn visat, och deras upptäckt tillkännages.',
        'Namnge hex ger en hex ett namn utan en token. Namnet visas för GM som en etikett på GM-lagret och tillkännages när hexen avslöjas.',
        'Tillkännage upptäckter väljer om alla, bara GM eller ingen ser tillkännagivandet. Pinga upptäckter flyttar också spelarnas vy till platsen.',
      ],
    },
    settings: {
      heading: 'Inställningar',
      intro:
        'Ändra inställningar med !hexploration set (eller knappen Inställningar). Lager för hexar, Tokens som avslöjar och Språk kan också ställas in på modens inställningssida.',
      colKey: 'Nyckel',
      colName: 'Miljö',
      colDesc: 'Beskrivning',
      perPage: '(Kan ställas in per sida.)',
    },
    jumpgate: {
      heading: 'Jumpgate och Legacy',
      points: [
        'Hexploration tar reda på vilken motor spelet använder och ritar den matchande formen. Former ritade i någon av editorerna kan fyllas.',
        'När Lager för hexar är inställt på Auto ritas hexar på förgrundslagret, ovanför tokens, så att spelarna inte kan se vad som finns under. Om förgrundslagret inte är tillgängligt används tokenlagret i stället.',
        'Jumpgate ritar matematiskt regelbundna hexar, som har en något annan form än Legacy-hexar. Om hexarna inte stämmer med en sidas rutnät, fäst en token i mitten av en hex, markera den och klicka på Kalibrera. Markera två tokens i angränsande hexar i samma rad (Hex V) eller kolumn (Hex H) för att även korrigera hexstorleken.',
        'När en sida eller ett spel kopieras får dess hexar nya ID:n. Kör Skanna igen på sidan för att hitta dem igen, tillsammans med deras namnetiketter och platstokens.',
      ],
    },
    upgrading: {
      heading: 'Uppgraderar från version 1',
      points: [
        'Version 2 behöver inte längre PathMath, MatrixMath, Vector Math eller HTML Builder. Du kan ta bort dem om inte en annan mod använder dem.',
        'Befintliga hexkartor, namn, platstokens och inställningar uppgraderas automatiskt vid första starten.',
        'Version 1-kommandona, inklusive makrot Hexploration_menu, fungerar fortfarande.',
        'I version 1 kunde varje token som representerade en rollperson avslöja hexar. Ställ in Tokens som avslöjar på Rollpersonstokens för att behålla det beteendet.',
      ],
      colV1: 'Kommandot version 1',
      colV2: 'Kommandot version 2',
    },
    troubleshooting: {
      heading: 'Felsökning',
      points: [
        'Ingenting händer när en token flyttas: kontrollera att token ligger på tokenlagret och matchar Tokens som avslöjar, och att sidan har hexar (!hexploration status).',
        'Hexen är förskjutna från rutnätet: använd Kalibrera och kontrollera sedan med en token på några hexar över kartan.',
        'Hexar slutade avslöjas efter att en sida eller ett spel kopierats: kör Skanna igen på sidan.',
        'Fyll säger att området inte innehåller några hexmittpunkter: formen måste innehålla mittpunkten på minst en hex.',
        'För allt annat, kontrollera API-konsolloggen och inkludera dess meddelanden när du ber om hjälp.',
      ],
    },
    languages: {
      heading: 'Språk',
      body: 'Välj ett språk med !hexploration set språk. Tillgängliga språk:',
      colLanguage: 'Språk',
      colNative: 'Eget namn',
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
