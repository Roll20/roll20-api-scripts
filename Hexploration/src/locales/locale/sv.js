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
      desc: 'Var nya hexar ritas. Auto provar förgrundslagret (ovanför tokens) och faller tillbaka till tokenlagret om spelet inte stöder det.',
    },
    fillColor: {
      label: 'Fyllningsfärg',
      desc: 'Färg på nya hexar. Använd rgba() för genomskinliga hexar, till exempel rgba(0,0,0,0.8).',
    },
    strokeColor: {
      label: 'Kantfärg',
      desc: 'Färg på konturerna av nya hexar.',
    },
    labelColor: {
      label: 'Etikettfärg',
      desc: 'Färgen på namnetiketterna endast för GM på namngivna hexar.',
    },
    glimpseColor: {
      label: 'Glimtfärg',
      desc: 'Färgen som hexar byter till när de skymtas (avslöjandeläget Glimt). Använd en genomskinlig rgba()-färg.',
    },
    strokeWidth: {
      label: 'Kantbredd',
      desc: 'Bredden på konturerna av nya hexar, i pixlar (0 till 20).',
    },
    maxDistance: {
      label: 'Avslöjandeavstånd för hexar',
      desc: 'Lagras på hexarna när de fylls, så ställ in det innan du fyller: att ändra det senare påverkar inte hexar som redan finns på kartan. En token måste vara inom så många hexar för att avslöja dem, hur långt den än kan se; med 0 avslöjas de bara när man går in i dem. Använd det för berg eller skogar. Lämna tomt för ingen gräns.',
    },
    revealDistance: {
      label: 'Siktavstånd',
      desc: 'Hur många hexar runt en rörlig token som avslöjas (0 till 20). 0 avslöjar endast de hexar som token passerar igenom.',
    },
    lineOfSight: {
      label: 'Siktlinje',
      desc: 'När den är på döljer hexar som förblir täckta, till exempel berg som fyllts med ett Avslöjandeavstånd för hexar, hexarna bakom dem. Det gör bara skillnad med ett Siktavstånd på 2 eller mer.',
    },
    revealPath: {
      label: 'Avslöja längs vägen',
      desc: 'När den är på avslöjas varje hex som en token passerar genom medan den dras (inklusive mellanpunkter), inte bara där den stannar.',
    },
    revealBy: {
      label: 'Tokens som avslöjar',
      desc: 'Vilka tokens på tokenlagret som avslöjar hexar: tokens som kontrolleras av en spelare, tokens som representerar vilken rollperson som helst eller alla tokens.',
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
      desc: 'Roll20 ritar namn, staplar och auror ovanför hexarna. När den är på stängs det namn, de staplar och de auror som spelarna kan se av för tokens under en täckt hex, och slås på igen när de avtäcks.',
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
    filled:
      'Fyllning klar. Ritade hexar: {created}. Omformaterade: {restyled}. Gömda platser: {icons}.',
    revealed: 'Avslöjade hexar: {count}.',
    revealedPage: 'Alla hexar på sidan avslöjade ({count}).',
    confirmReset:
      'Ta bort alla hexar från "{page}" ({count})? Platstokens återgår till tokenlagret. Ångra kan inte ångra detta.',
    resetPage: 'Hexar som tagits bort från sidan: {count}.',
    undone:
      'Senaste fyllningen ångrad. Borttagna hexar: {removed}. Omformaterade hexar som återställts: {restored}.',
    named: 'Hexar med namnet "{name}": {count}.',
    unnamed: 'Namn raderade: {count}.',
    marked:
      'Platser dolda i befintliga hexar: {attached}. Väntar på nästa fyllning som täcker dem: {pending}.',
    unmarked: 'Tokens som inte längre är platser: {count}.',
    settingChanged: '{setting} inställd på {value}.',
    rescanned:
      'Omsökningen är klar. Behållna: {kept}. Övertagna: {adopted}. Omplacerade: {moved}. Saknade och glömda: {dropped}. Etiketter återlänkade: {labels}. Platstokens återlänkade: {icons}.',
    calibrated:
      'Rutnät kalibrerat (kolumnsteg {colStep}px, radsteg {rowStep}px). Skanna om: behöll {kept}, omplacerade {moved}, tog över {adopted}.',
    calibrationReset:
      'Kalibrering har tagits bort. Skanna om: behöll {kept}, omplacerade {moved}, tog över {adopted}.',
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
      'Det här spelet stöder inte ritning på förgrundslagret, så hexarna ritades på tokenlagret.',
    someFailed: 'Hexar som inte kunde ritas: {count}. Kontrollera API-konsolen för detaljer.',
  },
  errors: {
    noPage: 'Kunde inte hitta sidan att arbeta på.',
    notHex: 'Den här sidan använder inte ett hex-rutnät.',
    noPolygons: 'Välj en eller flera ritade former att fylla.',
    emptyArea: 'Det valda området innehåller inga hexmittpunkter.',
    tooMany: 'Det skulle skapa för många hexar på en gång ({count}).',
    nothingToConceal: 'Välj ritade former eller tokens att dölja.',
    nothingToReveal: 'Välj hexar, ritade former eller tokens att avslöja.',
    noTokens: 'Välj först en eller flera tokens.',
    noHexes: 'Välj en eller flera hexar (eller tokens som står på hexar) först.',
    nothingToUndo: 'Det finns ingen fyllning att ångra.',
    unknownCommand: 'Okänt kommando: {command}',
    unknownSetting: 'Okänd inställning: {key}',
    unknownPageSetting: 'Inställningar som kan ställas in per sida: {keys}',
    invalidValue: '"{value}" är inte ett giltigt värde för {key}.',
    calibrateNeedsTokens: 'Välj en eller två tokens som är fästa i hexmittpunkter.',
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
    noHexes:
      'Hexarna ligger på förgrundslagret eller tokenlagret; växla till det lagret för att välja dem.',
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
    fill: 'Täck de valda ritade formerna med hexar.',
    fillInverse: 'Täck hela sidan utom inuti de valda formerna.',
    undo: 'Ångra den senaste fyllningen, omvända fyllningen eller döljningen och återställ formerna den använde.',
    reveal: 'Avslöja de valda hexarna och hexarna under de valda formerna och tokens.',
    revealPage: 'Avslöja alla hexar på sidan utan tillkännagivanden.',
    conceal: 'Täck området under de valda formerna och tokens med hexar igen.',
    explore: 'Avslöja runt de valda tokens som om de precis hade flyttat dit.',
    resetPage: 'Ta bort alla hexar på sidan (frågar först).',
    name: 'Namnge de valda hexarna, eller hexarna under de valda tokens. Lämna namnet tomt för att rensa det.',
    mark: 'Förvandla de valda tokens till dolda platser.',
    unmark: 'Stoppa de valda tokens från att vara dolda platser.',
    set: 'Ändra en inställning eller visa alla inställningar.',
    pageSet: 'Åsidosätt en avslöjningsinställning endast på den aktuella sidan.',
    pageClear: 'Ta bort den aktuella sidans åsidosättningar.',
    rescan: 'Bygg om sidans hex-lista, till exempel efter att du kopierat en sida eller ett spel.',
    calibrate:
      'Rikta in hex-rutnätet efter en eller två valda tokens som är fästa i hexmittpunkter.',
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
      'Välj tokens för att dölja dem som platser under hexar. Välj hexar eller tokens för att namnge en hex.',
    toolsDesc:
      'Inställningar, sidöverstyrningar, status, skanna om kopierade sidor och kalibrering av rutnätet.',
    footer: 'Se "{help}"-handouten för fullständiga instruktioner.',
  },
  handout: {
    versionLabel: 'Version',
    subtitle: 'Utforskning hex för hex i Roll20',
    footer: 'Använd "{deck}"-handouten för kontroller med ett klick.',
    overview: {
      heading: 'Översikt',
      body: 'Hexploration täcker en hexkarta med ogenomskinliga hexar. När sällskapet rör sig tas hexarna det passerar igenom (och, om du vill, hexarna runt det) bort, så att kartan avslöjas en hex i taget. Dolda platser kan placeras under hexar och tillkännages när de hittas. Det fungerar i Jumpgate- och Legacy-spel, på Hex (V)- och Hex (H)-rutnät av alla storlekar.',
      demo: 'Se en kort demo (från version 1)',
    },
    quickStart: {
      heading: 'Snabbstart',
      steps: [
        'Öppna en sida vars rutnät är inställt på Hex (V) eller Hex (H).',
        'Rita en eller flera former (polygon, rektangel, ellips eller frihand) runt området för att dölja.',
        'Markera formerna och klicka på Fyll i Command Deck (eller skriv !hexploration fill). Formerna ersätts av hexar.',
        'Valfritt: innan du fyller, välj tokens för viktiga platser och klicka på Markera plats. De göms under hexarna och tillkännages när de upptäcks.',
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
        'Siktavstånd avslöjar hexarna runt var och en av dessa hexar, de närmaste först. Med Siktlinje på avslöjas en hex inte så länge en täckt hex ligger mellan den och token. Närmare hexar avslöjas oftast först, så i öppen terräng ändrar Siktlinje ingenting: den spelar bara roll med ett Siktavstånd på 2 eller mer och hexar som förblir täckta, till exempel terräng som fyllts med ett Avslöjandeavstånd för hexar.',
        'Avslöjandeavstånd för hexar lagras på varje hex när den fylls, så ställ in det innan du fyller; att ändra det senare påverkar inte hexar som redan finns på kartan. En token måste vara inom så många hexar för att avslöja dem, hur långt den än kan se, och med 0 avslöjas de bara när man går in i dem. För en bergskedja: ställ in Avslöjandeavstånd för hexar på 0, fyll bergen, återställ det till inget och fyll sedan landet bortom. Med Siktavstånd 3 och Siktlinje på ser gruppen den öppna marken runt sig, men inte bergen eller det som ligger bakom dem. Varje berghex avslöjas när en token går in i den.',
        'I läget Glimt blir hexar inom synhåll genomskinliga i stället för att försvinna, och de tas bort när en token går in i dem. Genomskinliga Glimt-hexar blockerar inte Siktlinje.',
        'Roll20 ritar tokennamn, staplar och auror ovanpå hexarna. Med Dölj täckta tokens på stängs det namn, de staplar och de auror som spelarna kan se av för en token under en täckt hex tills den avtäcks, så att dolda monster inte avslöjar sig. Om du slår på något av dem medan token är täckt förblir det dolt och slås på när token avtäcks.',
        'API:et rapporterar inte förflyttningar som görs av andra moddar. TokenMod-förflyttningar fångas upp automatiskt; för andra moddar markerar du tokens och klickar på Utforska, eller anropar Hexploration.revealAround(token) från din egen mod.',
      ],
    },
    locations: {
      heading: 'Namngivna hexar och platser',
      points: [
        'Markera plats förvandlar de valda tokens till dolda platser. En token redan under en hex döljs direkt; annars döljs den av nästa fyllning som täcker den.',
        'Tokens med statusmarkören för det vita tornet behandlas också som platser när du fyller, som i version 1.',
        'Dolda platstokens flyttas till GM-lagret. När deras hex avslöjas återvänder de till tokenlagret med sitt namn visat, och deras upptäckt tillkännages.',
        'Namnge hex ger en hex ett namn utan en token. Namnet visas för GM som en etikett på GM-lagret och tillkännages när hexen avslöjas. Jumpgate ritar GM-lagret under förgrundslagret, så i Jumpgate syns etiketterna bara när Lager för hexar är inställt på tokenlagret.',
        'Tillkännage upptäckter väljer om alla, bara GM eller ingen ser tillkännagivandet. Pinga upptäckter flyttar också spelarnas vy till platsen.',
      ],
    },
    settings: {
      heading: 'Inställningar',
      intro:
        'Ändra inställningar med !hexploration set (eller knappen Inställningar). Lager för hexar, Tokens som avslöjar och Språk kan också ställas in på modens inställningssida.',
      colKey: 'Nyckel',
      colName: 'Inställning',
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
        'Hexarna är förskjutna från rutnätet: använd Kalibrera och kontrollera sedan med en token på några hexar över kartan.',
        'Hexar slutade avslöjas efter att en sida eller ett spel kopierats: kör Skanna igen på sidan.',
        'Fyll säger att området inte innehåller några hexmittpunkter: formen måste innehålla mittpunkten på minst en hex.',
        'För allt annat, kontrollera API-konsolloggen och inkludera dess meddelanden när du ber om hjälp.',
      ],
    },
    languages: {
      heading: 'Språk',
      body: 'Välj ett språk med !hexploration set language. Tillgängliga språk:',
      colLanguage: 'Språk',
      colNative: 'Eget namn',
      colCode: 'Kod',
    },
    credits: {
      heading: 'Medverkande',
      original: 'Originalmod av',
      maintainer: 'Version 2 underhålls av',
      marketplace: 'Adas konstpaket på Roll20 Marketplace',
      support:
        'Om du hittar en bugg eller har en idé, posta i Roll20 Mod-forumet eller öppna ett problem på GitHub och inkludera eventuella meddelanden från API-konsolloggen.',
    },
  },
};

export default TRANSLATION;
